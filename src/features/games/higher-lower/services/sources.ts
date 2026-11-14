import {
  pickPages,
  shuffle,
  type DailyHLCategory,
  type HLCategory,
  type HLItem,
} from "../model/higherLower.ts";
import { fetchAnimePage, type AnimeFetch } from "./anilist.ts";

export type HLFetch = AnimeFetch;

/** Validates a committed snapshot before the game trusts it. */
const validItems = (items: unknown): HLItem[] =>
  Array.isArray(items)
    ? items.filter(
        (item): item is HLItem =>
          item &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          Number.isFinite(item.value),
      )
    : [];

function snapshot(items: unknown): HLFetch {
  const media = validItems(items);
  return media.length
    ? { ok: true, media: shuffle(media) }
    : { ok: false, reason: "unavailable" };
}

/** A whole snapshot in file order, for the daily chain to shuffle by seed. */
export async function loadSnapshot(
  category: DailyHLCategory,
): Promise<HLItem[]> {
  return validItems(
    category === "screen"
      ? (await import("../data/screen.json")).default
      : (await import("../data/streams.json")).default,
  );
}

/**
 * A batch of items for a category. Anime comes live from AniList; movies,
 * series and songs come from snapshots refreshed by
 * `npm run refresh:higher-lower`, loaded only when that category is played.
 */
export async function loadBatch(
  category: HLCategory,
  signal: AbortSignal,
): Promise<HLFetch> {
  if (category === "screen")
    return snapshot((await import("../data/screen.json")).default);
  if (category === "streams")
    return snapshot((await import("../data/streams.json")).default);
  const results = await Promise.all(
    pickPages().map((page) => fetchAnimePage(page, { signal })),
  );
  const media = results.flatMap((result) => (result.ok ? result.media : []));
  if (media.length) return { ok: true, media: shuffle(media) };
  return (
    results.find((result) => !result.ok) ?? { ok: false, reason: "unavailable" }
  );
}
