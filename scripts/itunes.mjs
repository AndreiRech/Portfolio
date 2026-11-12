// iTunes Search API helpers shared by the snapshot scripts. The API is
// public and keyless; requests are spaced out to stay polite.
import { matchKey } from "./charts.mjs";

export const pause = (ms = 350) => new Promise((done) => setTimeout(done, ms));

/** iTunes allows roughly 20 searches a minute; back off when it says no. */
async function search(params, retries = 4) {
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

/** Finds a song with a 30-second preview by lead artist and title. */
export async function findSong({ title, artist }) {
  const lead = artist.split(/,|&| x | e /i)[0].trim();
  const results = await search({ term: `${lead} ${title}`, entity: "song" });
  const wanted = matchKey(title);
  const artistKey = matchKey(lead);
  return results.find(
    (item) =>
      item.previewUrl &&
      matchKey(item.artistName).includes(artistKey) &&
      matchKey(item.trackName).startsWith(wanted),
  );
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
  };
}

/** Square artwork for a song, a little larger than the search default. */
export async function songArtwork(entry) {
  const match = await findSong(entry).catch(() => null);
  return match?.artworkUrl100?.replace("100x100bb", "300x300bb") ?? null;
}
