// iTunes Search API helpers shared by the snapshot scripts. The API is
// public and keyless; requests are spaced out to stay polite.
import { matchKey } from "./charts.mjs";

export const pause = (ms = 350) => new Promise((done) => setTimeout(done, ms));

/** iTunes allows roughly 20 searches a minute; back off when it says no. */
export async function search(params, retries = 4) {
  const query = new URLSearchParams({ country: "US", limit: "10", ...params });
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`https://itunes.apple.com/search?${query}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) return (await response.json()).results ?? [];
    if (
      (response.status !== 403 && response.status !== 429) ||
      attempt >= retries
    )
      throw new Error(`iTunes ${response.status}`);
    await pause(15000 * (attempt + 1));
  }
}

/** Never acceptable: these are not the song as released. */
const ALTERED =
  /remix|acoustic|ac[uú]stic|unplugged|stripped|cover|karaoke|instrumental|demo\b|sped up|slowed|reverb|nightcore|tiny desk|itunes session|radio (edit|mix)|rádio|taylor['’]s version|on vacation|clean ver|session|piano version|orchestral|reprise|extended|\bedit\b|\bmix\b/i;
/** Acceptable only when no studio cut exists (many sertanejo hits are live-only). */
const LIVE = /\(ao vivo|\[ao vivo|ao vivo\)|\(live|\[live|live\)|\blive (at|from|in)\b/i;

export const isAltered = (item) =>
  ALTERED.test(item.trackName) || ALTERED.test(item.collectionName ?? "");
export const isLive = (item) =>
  LIVE.test(item.trackName) || LIVE.test(item.collectionName ?? "");

/**
 * Finds a song with a 30-second preview by lead artist and title, preferring
 * the original studio recording over acoustic, remix, cover and live cuts.
 * Live cuts are the last resort; altered ones are never returned.
 */
export async function findSong({ title, artist }) {
  const lead = artist.split(/,|&| x | e /i)[0].trim();
  const results = await search({
    term: `${lead} ${title}`,
    entity: "song",
    limit: "25",
  });
  const wanted = matchKey(title);
  const artistKey = matchKey(lead);
  const matches = results.filter(
    (item) =>
      item.previewUrl &&
      matchKey(item.artistName).includes(artistKey) &&
      matchKey(item.trackName).startsWith(wanted) &&
      !isAltered(item),
  );
  return matches.find((item) => !isLive(item)) ?? matches[0];
}

/** Snapshot entry for the song game; null when iTunes has no preview. */
export async function resolveSong(entry) {
  const match = await findSong(entry);
  if (!match) return null;
  return {
    id: String(match.trackId),
    title: entry.title,
    artist: entry.artist,
    preview: match.previewUrl,
    artwork: match.artworkUrl100,
    link: match.trackViewUrl.replace(/[&?]uo=\d+/, ""),
    // Release year, shown on the reveal for the songs-by-year list.
    ...(entry.year ? { year: entry.year } : {}),
  };
}

/** Square artwork for a song, a little larger than the search default. */
export async function songArtwork(entry) {
  const match = await findSong(entry).catch(() => null);
  return match?.artworkUrl100?.replace("100x100bb", "300x300bb") ?? null;
}
