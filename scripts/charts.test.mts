import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanTitle,
  matchKey,
  parseImdbBasic,
  parseImdbRating,
  parseKworbAllTime,
  parseKworbChart,
} from "./charts.mjs";
import { EXCLUDED, buildWordLists } from "./words.mjs";

test("daily chart rows keep the lead artist and drop guests", () => {
  const html = `<tr><td class="text mp"><div><a href="../artist/1.html">KAROL G</a> - <a href="../track/2.html">BbY WOW</a> (w/ <a href="../artist/3.html">Judeline</a>)</div></td></tr>
<tr><td class="text mp"><div><a>Simon &amp; Garfunkel</a> - <a>Mrs. Robinson</a></div></td></tr>`;
  assert.deepEqual(parseKworbChart(html), [
    { title: "BbY WOW", artist: "KAROL G" },
    { title: "Mrs. Robinson", artist: "Simon & Garfunkel" },
  ]);
  assert.equal(parseKworbChart("<p>changed</p>").length, 0);
});

test("all-time rows read the stream count", () => {
  const html = `<tr><td class="text"><div>The Weeknd - Blinding Lights</div></td><td>5,677,813,793</td><td>1,551,782</td></tr>`;
  assert.deepEqual(parseKworbAllTime(html), [
    { title: "Blinding Lights", artist: "The Weeknd", value: 5_677_813_793 },
  ]);
});

test("IMDb rows keep popular movies and series with their rating, never adult titles", () => {
  assert.deepEqual(parseImdbRating("tt1375666\t8.8\t2700000", 250_000), [
    "tt1375666",
    { rating: 8.8, votes: 2_700_000 },
  ]);
  assert.equal(parseImdbRating("tt1\t8\t12", 250_000), null);
  assert.equal(parseImdbRating("tt2\t\\N\t300000", 250_000), null);
  const ratings = new Map([
    ["tt1375666", { rating: 8.8, votes: 2_700_000 }],
    ["tt0903747", { rating: 9.5, votes: 2_300_000 }],
    ["tt9", { rating: 7, votes: 300_000 }],
  ]);
  assert.deepEqual(
    parseImdbBasic(
      "tt1375666\tmovie\tInception\tInception\t0\t2010\t\\N\t148\tAction",
      ratings,
    ),
    {
      id: "tt1375666",
      title: "Inception",
      kind: "movie",
      year: 2010,
      rating: 8.8,
      votes: 2_700_000,
    },
  );
  assert.equal(
    parseImdbBasic(
      "tt0903747\ttvSeries\tBreaking Bad\tBreaking Bad\t0\t2008\t2013\t49\tDrama",
      ratings,
    )?.kind,
    "series",
  );
  assert.equal(
    parseImdbBasic("tt9\tmovie\tX\tX\t1\t2000\t\\N\t90\tAdult", ratings),
    null,
  );
  assert.equal(
    parseImdbBasic("tt9\ttvEpisode\tX\tX\t0\t2000\t\\N\t90\tDrama", ratings),
    null,
  );
});

test("chart titles lose live tags, guests and emoji", () => {
  assert.equal(cleanTitle("Cadeira Cativa - Ao Vivo"), "Cadeira Cativa");
  assert.equal(cleanTitle("Ignora (Ao Vivo)"), "Ignora");
  assert.equal(cleanTitle("Flash (Minha Mente) 💠"), "Flash (Minha Mente)");
  assert.equal(matchKey("Flash (Minha Mente)"), matchKey("Flash"));
});

test("Termo answers are common lexicon words, never verb forms, plurals or excluded words", () => {
  const lists = buildWordLists({
    lexicon: ["termo", "sabor", "carta", "cart", "carts", "maria", "ab"],
    conjugations: ["falam", "termo"],
    frequency: new Map([
      ["termo", 5],
      ["sabor", 6],
      ["carta", 7],
      ["carts", 4],
      ["maria", 1],
      ["falam", 3],
    ]),
  });
  assert.deepEqual(lists.answers, ["carta", "sabor"]);
  assert.ok(EXCLUDED.has("maria"));
  assert.ok(
    lists.valid.includes("falam") &&
      lists.valid.includes("termo") &&
      lists.valid.includes("carts"),
  );
  assert.ok(!lists.valid.includes("sabor"));
});
