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

test("each mode has three lives, notes are free, and the third mistake ends play", async () => {
  const { enterDigit, takeHint, sudokuOver, sudokuGrid } =
    await import("./sudoku.ts");
  const sudoku = buildSudoku(30, "normal");
  const day = emptySudokuDay();
  const index = sudoku.puzzle.findIndex((n) => !n);
  const wrong = (sudoku.solution[index] % 9) + 1;
  let state = enterDigit(sudoku, day.normal, index, wrong, true);
  assert.equal(state.mistakes, 0);
  state = enterDigit(sudoku, state, index, wrong);
  assert.equal(state.mistakes, 1);
  state = enterDigit(sudoku, state, index, 0);
  assert.equal(state.mistakes, 1);
  state = enterDigit(sudoku, state, index, wrong);
  state = enterDigit(sudoku, state, index, 0);
  state = enterDigit(sudoku, state, index, wrong);
  assert.equal(state.mistakes, 3);
  assert.ok(sudokuOver(sudoku, state));
  assert.equal(enterDigit(sudoku, state, index, sudoku.solution[index]), state);
  assert.equal(takeHint(sudoku, state, index), state);
  assert.equal(day.easy.mistakes, 0);
  assert.equal(day.hard.mistakes, 0);
  assert.ok(!isComplete(sudokuGrid(sudoku, state), sudoku.solution));
  assert.deepEqual(parseSudokuDay({ ...day, normal: state })?.normal, state);
});

test("hints fill and protect a correct cell, stop at three, and survive reloading", async () => {
  const { enterDigit, takeHint, sudokuGrid } = await import("./sudoku.ts");
  const sudoku = buildSudoku(30, "hard");
  const day = emptySudokuDay();
  const index = sudoku.puzzle.findIndex((n) => !n);
  let state = takeHint(sudoku, day.hard, index);
  assert.equal(state.entries[index], sudoku.solution[index]);
  assert.equal(state.hints.length, 1);
  assert.equal(enterDigit(sudoku, state, index, 0), state);
  state = takeHint(sudoku, state, index); // Already correct: choose another cell.
  state = takeHint(sudoku, state, null);
  assert.equal(state.hints.length, 3);
  assert.equal(takeHint(sudoku, state, null), state);
  assert.equal(state.mistakes, 0);
  assert.deepEqual(parseSudokuDay({ ...day, hard: state })?.hard, state);
  assert.equal(sudokuGrid(sudoku, state)[index], sudoku.solution[index]);
  assert.equal(day.easy.hints.length, 0);
  assert.equal(day.normal.hints.length, 0);
  assert.equal(
    parseSudokuDay({ ...day, hard: { ...state, hints: [0, 0] } }),
    null,
  );
  assert.equal(
    parseSudokuDay({ ...day, hard: { ...state, mistakes: 4 } }),
    null,
  );
});

test("Sudoku preserves timing per level and accepts older progress without inventing a completion time", () => {
  const boards = emptySudokuDay();
  boards.normal.clock = { startedAt: 1000, finishedAt: 10000 };
  assert.deepEqual(parseSudokuDay(JSON.parse(JSON.stringify(boards))), boards);
  assert.equal(boards.easy.clock?.startedAt, null);
  const legacy = { ...boards.normal, clock: undefined };
  legacy.entries[0] = 2;
  assert.equal(
    parseSudokuDay({ ...boards, normal: legacy })?.normal.clock,
    null,
  );
  assert.equal(
    parseSudokuDay({
      ...boards,
      normal: { ...legacy, clock: { startedAt: 20, finishedAt: 10 } },
    }),
    null,
  );
});
