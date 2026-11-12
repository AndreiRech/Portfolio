import assert from "node:assert/strict";
import test from "node:test";
import { fetchAnimePage } from "./anilist.ts";

test("AniList responses are mapped and failures reported", async () => {
  const ok = (async () =>
    new Response(
      JSON.stringify({
        data: {
          Page: {
            media: [
              {
                id: 1,
                title: {
                  romaji: "Shingeki no Kyojin",
                  english: "Attack on Titan",
                },
                popularity: 1_000_000,
                seasonYear: 2013,
                format: "TV",
                coverImage: { large: "https://example.test/a.jpg" },
              },
              { id: 2, title: { romaji: null, english: null }, popularity: 3 },
            ],
          },
        },
      }),
    )) as typeof fetch;
  const result = await fetchAnimePage(1, { fetcher: ok });
  assert.ok(result.ok);
  assert.equal(result.media.length, 1);
  assert.equal(result.media[0].title, "Attack on Titan");
  const busy = (async () => new Response("", { status: 429 })) as typeof fetch;
  assert.deepEqual(await fetchAnimePage(1, { fetcher: busy }), {
    ok: false,
    reason: "rate-limit",
  });
  const down = (async () => {
    throw new TypeError("offline");
  }) as typeof fetch;
  assert.deepEqual(await fetchAnimePage(1, { fetcher: down }), {
    ok: false,
    reason: "unavailable",
  });
});
