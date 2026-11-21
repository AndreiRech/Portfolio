import test from "node:test";
import assert from "node:assert/strict";
import {
  ARCADE_GAMES,
  arcadeGames,
  arcadeHref,
  arcadeStatus,
  firstUnplayed,
} from "./arcade.ts";

const byId = (id: string) => ARCADE_GAMES.find((game) => game.id === id)!;

test("English visitors never see the Portuguese-only daily games", () => {
  const english = arcadeGames("en").map((game) => game.id);
  for (const id of ["termo", "conexo", "crossword", "rarity"])
    assert.ok(!english.includes(id), id);
  assert.deepEqual(english, [
    "sudoku",
    "color",
    "scale",
    "songs",
    "higher-lower",
  ]);
  assert.equal(arcadeGames("pt").length, ARCADE_GAMES.length);
});

test("links open each game in its daily mode", () => {
  assert.equal(arcadeHref(byId("termo")), "/games?activity=termo");
  assert.equal(arcadeHref(byId("songs")), "/games?activity=songs&mode=daily");
  assert.equal(
    arcadeHref(byId("higher-lower")),
    "/games?activity=higher-lower&mode=daily",
  );
  assert.equal(arcadeHref(byId("sudoku")), "/games?activity=sudoku");
});

test("today's status reads the history, preferring a win", () => {
  const history = [
    { date: "2026-11-21", game: "termo", outcome: "lost" },
    { date: "2026-11-20", game: "conexo", outcome: "won" },
    { date: "2026-11-21", game: "sudoku-easy", outcome: "lost" },
    { date: "2026-11-21", game: "sudoku-hard", outcome: "won" },
  ] as const;
  assert.equal(arcadeStatus(byId("termo"), history, "2026-11-21"), "lost");
  assert.equal(arcadeStatus(byId("conexo"), history, "2026-11-21"), null);
  assert.equal(arcadeStatus(byId("sudoku"), history, "2026-11-21"), "won");
});

test("the cabinet opens on the first game not played today", () => {
  assert.deepEqual(firstUnplayed(["won", null, "lost", null]), {
    index: 1,
    allDone: false,
  });
  assert.deepEqual(firstUnplayed([null]), { index: 0, allDone: false });
});

test("with everything played it shows the first game and says so", () => {
  assert.deepEqual(firstUnplayed(["won", "lost"]), { index: 0, allDone: true });
  assert.deepEqual(firstUnplayed([]), { index: 0, allDone: true });
});
