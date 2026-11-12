import assert from "node:assert/strict";
import test from "node:test";
import { CLUES } from "../data/clues.ts";
import {
  SIZE,
  buildCrossword,
  emptyEntries,
  isSolved,
  parseCrossword,
  wordCells,
  wrongCells,
} from "./crossword.ts";

test("the clue bank has unique, accent-free answers that fit the grid", () => {
  assert.equal(new Set(CLUES.map((entry) => entry.answer)).size, CLUES.length);
  for (const entry of CLUES) {
    assert.match(entry.answer, /^[A-Z]{3,11}$/, entry.answer);
    assert.ok(entry.clue.length > 3, entry.answer);
  }
});

/** Every run of two or more letters, across and down. */
function runs(cells: (string | null)[][]) {
  const found: string[] = [];
  const scan = (line: (string | null)[]) =>
    line
      .map((letter) => letter ?? " ")
      .join("")
      .split(" ")
      .filter((run) => run.length > 1);
  for (let index = 0; index < SIZE; index++) {
    found.push(...scan(cells[index]));
    found.push(...scan(cells.map((row) => row[index])));
  }
  return found;
}

test("sixty days of grids: every letter run is a clued word and the grid is connected", () => {
  for (let day = 1; day <= 60; day++) {
    const puzzle = buildCrossword(CLUES, day, 20);
    assert.ok(
      puzzle.words.length >= 15,
      `day ${day}: ${puzzle.words.length} words`,
    );
    const answers = puzzle.words.map((word) => word.answer).sort();
    assert.deepEqual(runs(puzzle.cells).sort(), answers, `day ${day}`);
    for (const word of puzzle.words)
      wordCells(word).forEach((cell, index) =>
        assert.equal(puzzle.cells[cell.row][cell.col], word.answer[index]),
      );
    const numbers = puzzle.words.map((word) => word.number);
    assert.equal(Math.min(...numbers), 1);
  }
});

test("checking marks only wrong letters, and a full grid is solved", () => {
  const puzzle = buildCrossword(CLUES, 3);
  const entries = emptyEntries();
  const [word] = puzzle.words;
  const [first, second] = wordCells(word);
  entries[first.row * SIZE + first.col] = word.answer[0];
  entries[second.row * SIZE + second.col] = word.answer[1] === "Z" ? "Y" : "Z";
  assert.deepEqual(
    [...wrongCells(puzzle, entries)],
    [second.row * SIZE + second.col],
  );
  const solved = puzzle.cells.flat().map((letter) => letter ?? "");
  assert.ok(isSolved(puzzle, solved));
  assert.equal(
    parseCrossword({ entries: ["a"], revealed: false, checks: 0 }),
    null,
  );
});
