import assert from "node:assert/strict";
import test from "node:test";
import { GROUPS } from "../data/groups.ts";
import {
  buildPuzzle,
  giveUp,
  guessGroup,
  initialConexo,
  isFinished,
  matchPuzzle,
  parseConexo,
  shareText,
} from "./conexo.ts";

const key = (word: string) =>
  word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

test("every group in the bank has at least four distinct words", () => {
  for (const group of GROUPS) {
    assert.ok(new Set(group.words.map(key)).size >= 4, group.name);
    assert.equal(
      new Set(group.words.map(key)).size,
      group.words.length,
      group.name,
    );
  }
});

test("two years of puzzles: one group per level, four themes, 16 different words, one solution", () => {
  for (let day = 1; day <= 730; day++) {
    const puzzle = buildPuzzle(GROUPS, day);
    assert.deepEqual(
      puzzle.groups.map((group) => group.level),
      [1, 2, 3, 4],
    );
    const words = puzzle.groups.flatMap((group) => group.words);
    assert.equal(new Set(words.map(key)).size, 16);
    assert.deepEqual([...puzzle.order].sort(), [...words].sort());
    const sources = puzzle.groups.map((group) =>
      GROUPS.find((item) => item.name === group.name)!,
    );
    assert.equal(new Set(sources.map((group) => group.theme)).size, 4);
    // No two groups can trade words in both directions.
    for (let a = 0; a < 4; a++)
      for (let b = a + 1; b < 4; b++) {
        const fitsB = puzzle.groups[a].words.some((word) =>
          sources[b].words.map(key).includes(key(word)),
        );
        const fitsA = puzzle.groups[b].words.some((word) =>
          sources[a].words.map(key).includes(key(word)),
        );
        assert.ok(!(fitsA && fitsB), `day ${day}`);
      }
  }
  assert.deepEqual(buildPuzzle(GROUPS, 9), buildPuzzle(GROUPS, 9));
});

test("guesses report solved groups, near misses and repeats", () => {
  const puzzle = buildPuzzle(GROUPS, 1);
  const [first, second] = puzzle.groups;
  let state = initialConexo();
  const near = [...first.words.slice(0, 3), second.words[0]];
  let result = guessGroup(state, puzzle, near);
  assert.equal(result.verdict, "one-away");
  state = result.state;
  assert.equal(
    guessGroup(state, puzzle, [...near].reverse()).verdict,
    "repeat",
  );
  result = guessGroup(state, puzzle, first.words);
  assert.equal(result.verdict, "solved");
  assert.deepEqual(result.state.solved, [0]);
  const done = giveUp(result.state);
  assert.ok(isFinished(done));
  assert.deepEqual(done.solved, [0, 1, 2, 3]);
  assert.match(shareText(result.state, puzzle, 1), /^Conexo #1 · 2 tentativas/);
});

test("saved progress is validated", () => {
  assert.equal(
    parseConexo({ solved: [0, 0], attempts: [], gaveUp: false }),
    null,
  );
  assert.equal(parseConexo({ solved: [5], attempts: [], gaveUp: false }), null);
  assert.deepEqual(parseConexo(initialConexo()), initialConexo());
});

test("progress saved for another puzzle is dropped instead of crashing", () => {
  const puzzle = buildPuzzle(GROUPS, 1);
  const [first, second] = puzzle.groups;
  const solved = guessGroup(initialConexo(), puzzle, first.words).state;
  assert.deepEqual(matchPuzzle(solved, puzzle), solved);
  assert.equal(matchPuzzle(null, puzzle), null);
  // A word from an older bank: the share text could not colour it.
  const stale = {
    ...solved,
    attempts: [...solved.attempts, ["Inexistente", ...second.words.slice(1)]],
  };
  assert.equal(matchPuzzle(stale, puzzle), null);
  // A group marked solved that no attempt found.
  assert.equal(matchPuzzle({ ...solved, solved: [0, 1] }, puzzle), null);
  // Revealing marks every group solved without attempts.
  const revealed = giveUp(initialConexo());
  assert.deepEqual(matchPuzzle(revealed, puzzle), revealed);
});

test("days before launch still get a puzzle", () => {
  for (let day = -3; day <= 0; day++)
    assert.equal(buildPuzzle(GROUPS, day).order.length, 16);
});
