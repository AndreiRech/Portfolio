// Snapshots for the higher-or-lower categories that have no browser-friendly
// API. Run manually with `npm run refresh:higher-lower` (or `-- streams` /
// `-- screen` for one category).
// - streams: all-time most streamed songs on Spotify (kworb.net), with iTunes artwork
// - screen: the most voted movies and series on IMDb, compared by their
//   average rating, from IMDb's non-commercial datasets
//   (https://developer.imdb.com/non-commercial-datasets/), with posters from
//   IMDb search suggestions
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";
import {
  parseImdbBasic,
  parseImdbRating,
  parseKworbAllTime,
} from "./charts.mjs";
import { pause, songArtwork } from "./itunes.mjs";
import { screenPosters } from "./posters.mjs";

const data = new URL(
  "../src/features/games/higher-lower/data/",
  import.meta.url,
);

async function save(name, items, minimum) {
  if (items.length < minimum) {
    console.error(`${name}: only ${items.length} items, kept the old file.`);
    return;
  }
  await writeFile(
    new URL(`${name}.json`, data),
    JSON.stringify(items, null, 2) + "\n",
  );
  console.log(`${name}: ${items.length} items.`);
}

/** Covers already found, so a refresh only searches for new titles. */
async function knownCovers(
  name,
  keyOf = (item) => `${item.title}|${item.subtitle}`,
) {
  try {
    const items = JSON.parse(
      await readFile(new URL(`${name}.json`, data), "utf8"),
    );
    return new Map(
      items
        .filter((item) => item.cover)
        .map((item) => [keyOf(item), item.cover]),
    );
  } catch {
    return new Map();
  }
}

async function streams() {
  const covers = await knownCovers("streams");
  const response = await fetch("https://kworb.net/spotify/songs.html", {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`kworb ${response.status}`);
  const rows = parseKworbAllTime(await response.text(), 250);
  const items = [];
  for (const [index, row] of rows.entries()) {
    let cover = covers.get(`${row.title}|${row.artist}`) ?? null;
    if (!cover) {
      cover = await songArtwork(row);
      await pause(1000);
    }
    items.push({
      id: `s${index + 1}`,
      title: row.title,
      subtitle: row.artist,
      value: row.value,
      cover,
    });
  }
  await save("streams", items, 150);
}

async function lines(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(600000) });
  if (!response.ok || !response.body)
    throw new Error(`IMDb ${response.status}`);
  return createInterface({
    input: Readable.fromWeb(response.body).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
}

/** Titles with at least this many ratings: a few hundred well-known ones. */
const MIN_VOTES = 250_000;

async function screen() {
  const covers = await knownCovers("screen", (item) => item.id);
  const ratings = new Map();
  for await (const line of await lines(
    "https://datasets.imdbws.com/title.ratings.tsv.gz",
  )) {
    const rating = parseImdbRating(line, MIN_VOTES);
    if (rating) ratings.set(...rating);
  }
  const titles = [];
  for await (const line of await lines(
    "https://datasets.imdbws.com/title.basics.tsv.gz",
  )) {
    const title = parseImdbBasic(line, ratings);
    if (title) titles.push(title);
  }
  // The most voted titles are the ones people know; the game compares
  // their ratings, which spread from the 6s to the 9s.
  titles.sort((a, b) => b.votes - a.votes);
  const top = titles.slice(0, 400);
  const posters = new Map(
    top.flatMap((title) =>
      covers.has(title.id) ? [[title.id, covers.get(title.id)]] : [],
    ),
  );
  const found = await screenPosters(
    top.map((title) => title.id).filter((id) => !posters.has(id)),
  );
  for (const [id, poster] of found) posters.set(id, poster);
  // A card without a poster is much harder to recognise; skip it.
  const items = top.flatMap((title) =>
    posters.has(title.id)
      ? [
          {
            id: title.id,
            title: title.title,
            subtitle: title.year ? String(title.year) : null,
            kind: title.kind,
            value: title.rating,
            cover: posters.get(title.id),
          },
        ]
      : [],
  );
  await save("screen", items, 150);
}

const wanted = process.argv.slice(2);
if (!wanted.length || wanted.includes("streams")) await streams();
if (!wanted.length || wanted.includes("screen")) await screen();
