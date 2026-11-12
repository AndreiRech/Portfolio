import type { AnimeMedia } from "../model/anime.ts";

/** Reads AniList's public GraphQL API; it allows cross-origin requests. */
const QUERY = `query ($page: Int) {
  Page(page: $page, perPage: 50) {
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id
      title { romaji english }
      popularity
      seasonYear
      format
      coverImage { large }
    }
  }
}`;

type RawMedia = {
  id: number;
  title?: { romaji?: string | null; english?: string | null } | null;
  popularity?: number | null;
  seasonYear?: number | null;
  format?: string | null;
  coverImage?: { large?: string | null } | null;
};

export type AnimeFetch =
  | { ok: true; media: AnimeMedia[] }
  | { ok: false; reason: "rate-limit" | "unavailable" };

export async function fetchAnimePage(
  page: number,
  {
    signal,
    fetcher = fetch,
  }: { signal?: AbortSignal; fetcher?: typeof fetch } = {},
): Promise<AnimeFetch> {
  try {
    const response = await fetcher("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { page } }),
      signal,
    });
    if (response.status === 429) return { ok: false, reason: "rate-limit" };
    if (!response.ok) return { ok: false, reason: "unavailable" };
    const body = (await response.json()) as {
      data?: { Page?: { media?: RawMedia[] } };
    };
    const media = body.data?.Page?.media;
    if (!Array.isArray(media)) return { ok: false, reason: "unavailable" };
    return {
      ok: true,
      media: media.flatMap((item) => {
        const title = item.title?.english || item.title?.romaji;
        if (!title || typeof item.popularity !== "number") return [];
        return [
          {
            id: item.id,
            title,
            popularity: item.popularity,
            seasonYear: item.seasonYear ?? null,
            format: item.format ?? null,
            cover: item.coverImage?.large ?? null,
          },
        ];
      }),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    return { ok: false, reason: "unavailable" };
  }
}
