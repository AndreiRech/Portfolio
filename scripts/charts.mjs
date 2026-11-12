// Pure parsers for the chart pages and datasets behind the song and
// higher-or-lower snapshots. They never touch the network so they can be
// tested against fixtures; the update-* scripts do the fetching.

const ENTITIES = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  "#39": "'",
};
const decode = (text) =>
  text.replace(/&(#?\w+);/g, (match, name) => ENTITIES[name] ?? match);
const stripTags = (html) => decode(html.replace(/<[^>]+>/g, "")).trim();

/**
 * kworb.net daily Spotify charts: each row has one `text mp` cell with
 * "Artist - Title (w/ Guest)". The guests are dropped; the lead artist and
 * the title are what the iTunes search needs.
 */
export function parseKworbChart(html, limit = 30) {
  const rows = [];
  for (const [, cell] of html.matchAll(
    /<td class="text mp"><div>([\s\S]*?)<\/div><\/td>/g,
  )) {
    const text = stripTags(cell).replace(
      /\s*\((?:w\/|feat\.?)[^)]*\)\s*$/i,
      "",
    );
    const split = text.indexOf(" - ");
    if (split < 1) continue;
    rows.push({
      title: text.slice(split + 3).trim(),
      artist: text.slice(0, split).trim(),
    });
    if (rows.length >= limit) break;
  }
  return rows;
}

/** kworb.net all-time Spotify ranking: "Artist - Title" then total streams. */
export function parseKworbAllTime(html, limit = 300) {
  const rows = [];
  for (const [, cell, streams] of html.matchAll(
    /<tr><td class="text"><div>([\s\S]*?)<\/div><\/td><td>([\d,]+)<\/td>/g,
  )) {
    const text = stripTags(cell);
    const split = text.indexOf(" - ");
    const value = Number(streams.replaceAll(",", ""));
    if (split < 1 || !Number.isSafeInteger(value)) continue;
    rows.push({
      title: text.slice(split + 3).trim(),
      artist: text.slice(0, split).trim(),
      value,
    });
    if (rows.length >= limit) break;
  }
  return rows;
}

/**
 * IMDb title.ratings.tsv line: tconst, averageRating, numVotes. Keeps titles
 * with at least `minVotes`, so only well-known ones make the game.
 */
export function parseImdbRating(line, minVotes) {
  const [id, average, count] = line.split("\t");
  const votes = Number(count);
  const rating = Number(average);
  return /^tt\d+$/.test(id) &&
    Number.isSafeInteger(votes) &&
    votes >= minVotes &&
    Number.isFinite(rating) &&
    rating > 0
    ? [id, { rating, votes }]
    : null;
}

/** Chart titles without live/acoustic tags, guests or emoji. */
export const cleanTitle = (title) =>
  title
    .replace(/\s*[-–]\s*(ao vivo|ac[uú]stico|live|remaster(ed)?)\b.*$/i, "")
    .replace(/\s*\((ao vivo|live|feat\.?[^)]*|with [^)]*|part\.?[^)]*)\)/gi, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .trim();

export const SCREEN_TYPES = {
  movie: "movie",
  tvSeries: "series",
  tvMiniSeries: "series",
};

/**
 * IMDb title.basics.tsv: tconst, titleType, primaryTitle, originalTitle,
 * isAdult, startYear, endYear, runtimeMinutes, genres. Keeps movies and
 * series that are in `ratings`, skipping adult titles.
 */
export function parseImdbBasic(line, ratings) {
  const [id, type, title, , adult, year] = line.split("\t");
  const kind = SCREEN_TYPES[type];
  const score = ratings.get(id);
  if (!kind || adult === "1" || !score) return null;
  return {
    id,
    title,
    kind,
    year: /^\d{4}$/.test(year) ? Number(year) : null,
    rating: score.rating,
    votes: score.votes,
  };
}

/** Accent- and case-insensitive key used to match titles across sources. */
export const matchKey = (value) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]|feat\..*$| - .*$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
