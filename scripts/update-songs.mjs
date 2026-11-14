// Resolves every song category into 30-second iTunes previews:
// - personal: Andrei's selection (personal.source.json, from his Spotify playlist)
// - classics: a hand-picked list of pop hits from 2000 to 2015 (classics.source.json)
// - brazilClassics: hand-picked Brazilian hits from 2000 to 2015 — sertanejo,
//   funk, MPB, pagode and pop rock (brazil-classics.source.json)
// - global / brazil: the current top 50 of Spotify's daily charts (kworb.net)
// - allTime: the 50 most streamed songs ever on Spotify (kworb.net)
// - byYear: the three most streamed songs released in each year from 2010,
//   plus the top song of 2000–2004 and of 2005–2009 (kworb groups the 2000s)
// Run manually with `npm run refresh:songs` (or `-- global brazil` for some
// categories); the committed snapshots keep the static export independent of
// these services at build time.
import { readFile, writeFile } from "node:fs/promises";
import {
  cleanTitle,
  matchKey,
  parseKworbAllTime,
  parseKworbChart,
} from "./charts.mjs";
import { pause, resolveSong } from "./itunes.mjs";

const data = new URL("../src/features/games/songs/data/", import.meta.url);
const TOP = 50;
/** kworb pages behind the by-year list: [page, label shown, songs kept]. */
const YEAR_PAGES = [
  ["2000", "2000–2004", 1],
  ["2005", "2005–2009", 1],
  ...Array.from({ length: 16 }, (_, index) => {
    const year = String(2010 + index);
    return [year, year, 3];
  }),
];

const kworb = async (path) => {
  const response = await fetch(`https://kworb.net/${path}`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`kworb ${path} ${response.status}`);
  return response.text();
};

const fromSource = (name) => async () =>
  JSON.parse(await readFile(new URL(`${name}.source.json`, data), "utf8"));

const fromChart = (country) => async () => {
  const html = await kworb(`spotify/country/${country}_daily.html`);
  // Ask for spares: a few chart songs have no iTunes preview.
  const rows = parseKworbChart(html, TOP + 30).map((row) => ({
    ...row,
    title: cleanTitle(row.title),
  }));
  if (rows.length < TOP) throw new Error(`kworb ${country}: markup changed`);
  return rows;
};

const fromAllTime = async () =>
  parseKworbAllTime(await kworb("spotify/songs.html"), TOP + 30).map(
    ({ title, artist }) => ({ title: cleanTitle(title), artist }),
  );

/** Spares per page too; `keep` caps how many songs each page contributes. */
const fromYears = async () => {
  const rows = [];
  for (const [page, year, keep] of YEAR_PAGES) {
    const html = await kworb(`spotify/songs_${page}.html`);
    for (const { title, artist } of parseKworbAllTime(html, keep + 6))
      rows.push({ title: cleanTitle(title), artist, year, group: year, keep });
    await pause(500);
  }
  return rows;
};

const CATEGORIES = {
  personal: { load: fromSource("personal") },
  classics: { load: fromSource("classics"), limit: TOP },
  brazilClassics: {
    load: fromSource("brazil-classics"),
    file: "brazil-classics",
    limit: TOP,
  },
  global: { load: fromChart("global"), limit: TOP },
  brazil: { load: fromChart("br"), limit: TOP },
  allTime: { load: fromAllTime, file: "all-time", limit: TOP },
  byYear: {
    load: fromYears,
    file: "by-year",
    limit: YEAR_PAGES.reduce((total, [, , keep]) => total + keep, 0),
  },
};

const wanted = process.argv.slice(2);
for (const [name, category] of Object.entries(CATEGORIES)) {
  const { load, file = name, limit = Infinity } = category;
  if (wanted.length && !wanted.includes(name)) continue;
  const source = await load();
  const songs = [];
  const missing = [];
  const groups = new Map();
  for (const entry of source) {
    if (songs.length >= limit) break;
    if ((groups.get(entry.group) ?? 0) >= (entry.keep ?? Infinity)) continue;
    try {
      const song = await resolveSong(entry);
      // One version per song: live and studio cuts count as the same.
      const same = (known) =>
        known.id === song.id ||
        (matchKey(known.title) === matchKey(song.title) &&
          matchKey(known.artist) === matchKey(song.artist));
      if (song && !songs.some(same)) {
        songs.push(song);
        groups.set(entry.group, (groups.get(entry.group) ?? 0) + 1);
      } else if (!song) missing.push(entry);
    } catch (error) {
      missing.push({ ...entry, error: String(error) });
    }
    await pause(1000);
  }
  // A broken chart page must not replace a good snapshot with a short one.
  if (limit !== Infinity && songs.length < limit * 0.8) {
    console.error(
      `${name}: only ${songs.length} songs resolved, kept the old file.`,
    );
    continue;
  }
  await writeFile(
    new URL(`${file}.json`, data),
    JSON.stringify(songs, null, 2) + "\n",
  );
  console.log(
    `${name}: ${songs.length} songs resolved, ${missing.length} missing.`,
  );
  for (const entry of missing)
    console.log(`  missing: ${entry.artist} - ${entry.title}`);
}
