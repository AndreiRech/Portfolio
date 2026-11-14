// Builds the song game's guess bank: every song name a visitor may type,
// not just the ~30 in the playing list, so the autocomplete no longer gives
// the answer away. Sources, most popular first (bank order breaks search ties):
// - kworb.net all-time most streamed songs on Spotify
// - kworb.net Spotify daily chart totals for Brazil and for the world
// - kworb.net most streamed songs of the 80s, the 90s, 2000–2004, 2005–2009
//   and each year since 2010
// - the iTunes catalogue of every artist in Andrei's playlist and in the
//   Brazil 2000–2015 list, whose songs rarely chart on Spotify; without them
//   those answers would stand out at the bottom of the suggestions
// Stored as [title, artist] pairs and loaded only when the song game opens.
// Run manually with `npm run refresh:song-guesses`.
import { readFile, writeFile } from "node:fs/promises";
import {
  cleanTitle,
  matchKey,
  parseKworbAllTime,
  parseKworbChart,
} from "./charts.mjs";
import { pause, search } from "./itunes.mjs";

const data = new URL("../src/features/games/songs/data/", import.meta.url);
const output = new URL("guesses.json", data);
const YEARS = [
  1980,
  1990,
  2000,
  2005,
  ...Array.from({ length: 16 }, (_, index) => 2010 + index),
];
const PER_YEAR = 300;
const SOURCES = [
  ["spotify/songs.html", parseKworbAllTime, Infinity],
  ["spotify/country/br_daily_totals.html", parseKworbChart, Infinity],
  ["spotify/country/global_daily_totals.html", parseKworbChart, Infinity],
  ...YEARS.map((year) => [
    `spotify/songs_${year}.html`,
    parseKworbAllTime,
    PER_YEAR,
  ]),
];
// A broken page must not replace a good bank with a short one.
const MINIMUM = 10000;

const lead = (artist) => matchKey(artist.split(/,|&| x | e | and /i)[0]);

const seen = new Set();
const bank = [];
/** Adds a song unless the bank already has it under any version. */
function add(title, artist) {
  const clean = cleanTitle(title);
  const key = `${matchKey(clean)}|${lead(artist)}`;
  if (!matchKey(clean) || seen.has(key)) return false;
  seen.add(key);
  bank.push([clean, artist]);
  return true;
}

for (const [path, parse, limit] of SOURCES) {
  const response = await fetch(`https://kworb.net/${path}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`kworb ${path} ${response.status}`);
  const rows = parse(await response.text(), limit);
  let added = 0;
  for (const row of rows) if (add(row.title, row.artist)) added++;
  console.log(`${path}: ${rows.length} rows, ${added} new songs.`);
}

// Remixes and alternate cuts would only crowd out the original title.
const ALTERNATE = /instrumental|karaoke|remix|sped up|slowed|acapella/i;
const sources = await Promise.all(
  ["personal", "brazil-classics"].map(async (name) =>
    JSON.parse(await readFile(new URL(`${name}.source.json`, data), "utf8")),
  ),
);
// Search by the full first credit ("Victor & Leo", not "victor"); iTunes may
// file it longer ("Grupo Revelação"), so those songs keep the list's name.
const artists = [
  ...new Set(sources.flat().map((song) => song.artist.split(",")[0].trim())),
];
let catalogue = 0;
for (const artist of artists) {
  const results = await search({
    term: artist,
    entity: "song",
    attribute: "artistTerm",
    limit: "200",
  });
  for (const item of results) {
    if (
      !matchKey(item.artistName).includes(matchKey(artist)) ||
      ALTERNATE.test(item.trackName)
    )
      continue;
    const credit =
      lead(item.artistName) === lead(artist) ? item.artistName : artist;
    if (add(item.trackName, credit)) catalogue++;
  }
  await pause(3000);
}
console.log(`iTunes: ${artists.length} artists, ${catalogue} new songs.`);

if (bank.length < MINIMUM) {
  console.error(`Only ${bank.length} songs found, kept the old guess bank.`);
  process.exit(1);
}
await writeFile(output, JSON.stringify(bank) + "\n");
console.log(`guesses: ${bank.length} songs.`);
