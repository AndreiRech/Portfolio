// Posters for movies and series from IMDb's public search-suggestion
// endpoint (the one behind imdb.com's search box): keyless, one request per
// title, used only when refreshing the snapshot. The image URL is resized
// through Amazon's URL parameters to a card-sized width.
import { pause } from "./itunes.mjs";

export function posterFrom(body, id) {
  const match = body?.d?.find?.((item) => item.id === id);
  const url = match?.i?.imageUrl;
  if (typeof url !== "string" || !url.startsWith("https://")) return null;
  return url.replace(/\._V1_.*\.jpg$/, "._V1_UX300_.jpg");
}

/** IMDb ID → poster URL, for the IDs that have one. */
export async function screenPosters(ids) {
  const posters = new Map();
  for (const id of ids) {
    try {
      const response = await fetch(
        `https://v2.sg.media-imdb.com/suggestion/t/${id}.json`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (response.ok) {
        const poster = posterFrom(await response.json(), id);
        if (poster) posters.set(id, poster);
      }
    } catch {
      /* A missing poster only drops that title. */
    }
    await pause(300);
  }
  return posters;
}
