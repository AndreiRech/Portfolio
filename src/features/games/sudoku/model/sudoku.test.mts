import assert from "node:assert/strict";
import test from "node:test";
import {
  LEVELS,
  buildSudoku,
  conflicts,
  countSolutions,
  isComplete,
  parseSudokuDay,
  emptySudokuDay,
} from "./sudoku.ts";

test("each day's puzzles have one solution that agrees with every clue", () => {
  for (const level of LEVELS)
    for (let day = 1; day <= 5; day++) {
      const { puzzle, solution } = buildSudoku(day, level);
      assert.equal(countSolutions(puzzle), 1, `${level} day ${day}`);
      assert.equal(conflicts(solution).size, 0);
      puzzle.forEach(
        (digit, index) => digit && assert.equal(digit, solution[index]),
      );
    }
  const easy = buildSudoku(1, "easy").puzzle.filter(Boolean).length;
  const hard = buildSudoku(1, "hard").puzzle.filter(Boolean).length;
  assert.ok(easy > hard);
});

test("conflicts flag repeated digits in a row, column or box", () => {
  const grid = Array(81).fill(0);
  grid[0] = 5;
  grid[8] = 5;
  grid[40] = 3;
  assert.deepEqual(
    [...conflicts(grid)].sort((a, b) => a - b),
    [0, 8],
  );
  const { solution } = buildSudoku(2, "normal");
  assert.ok(isComplete(solution, solution));
});

test("saved progress needs all three difficulties", () => {
  assert.deepEqual(parseSudokuDay(emptySudokuDay()), emptySudokuDay());
  assert.equal(parseSudokuDay({ easy: emptySudokuDay().easy }), null);
});
