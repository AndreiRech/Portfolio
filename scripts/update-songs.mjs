// Resolves every song category into 30-second iTunes previews:
// - personal: Andrei's selection (personal.source.json, from his Spotify playlist)
// - classics: a hand-picked list of pop hits from 2000 to 2015 (classics.source.json)
// - global / brazil: the current top 30 of Spotify's daily charts (kworb.net)
// Run manually with `npm run refresh:songs` (or `-- global brazil` for some
// categories); the committed snapshots keep the static export independent of
// these services at build time.
import { readFile, writeFile } from "node:fs/promises";
import { cleanTitle, matchKey, parseKworbChart } from "./charts.mjs";
import { pause, resolveSong } from "./itunes.mjs";

const data = new URL("../src/features/games/songs/data/", import.meta.url);
const TOP = 30;

const fromSource = (name) => async () =>
  JSON.parse(await readFile(new URL(`${name}.source.json`, data), "utf8"));

const fromChart = (country) => async () => {
  const response = await fetch(
    `https://kworb.net/spotify/country/${country}_daily.html`,
    { signal: AbortSignal.timeout(20000) },
  );
  if (!response.ok) throw new Error(`kworb ${country} ${response.status}`);
  // Ask for spares: a few chart songs have no iTunes preview.
  const rows = parseKworbChart(await response.text(), TOP + 30).map((row) => ({
    ...row,
    title: cleanTitle(row.title),
  }));
  if (rows.length < TOP) throw new Error(`kworb ${country}: markup changed`);
  return rows;
};

const CATEGORIES = {
  personal: { load: fromSource("personal") },
  classics: { load: fromSource("classics"), limit: TOP },
  global: { load: fromChart("global"), limit: TOP },
  brazil: { load: fromChart("br"), limit: TOP },
};

const wanted = process.argv.slice(2);
for (const [name, { load, limit = Infinity }] of Object.entries(CATEGORIES)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const source = await load();
  const songs = [];
  const missing = [];
  for (const entry of source) {
    if (songs.length >= limit) break;
    try {
      const song = await resolveSong(entry);
      // One version per song: live and studio cuts count as the same.
      const same = (known) =>
        known.id === song.id ||
        (matchKey(known.title) === matchKey(song.title) &&
          matchKey(known.artist) === matchKey(song.artist));
      if (song && !songs.some(same)) songs.push(song);
      else if (!song) missing.push(entry);
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
    new URL(`${name}.json`, data),
    JSON.stringify(songs, null, 2) + "\n",
  );
  console.log(
    `${name}: ${songs.length} songs resolved, ${missing.length} missing.`,
  );
  for (const entry of missing)
    console.log(`  missing: ${entry.artist} - ${entry.title}`);
}
