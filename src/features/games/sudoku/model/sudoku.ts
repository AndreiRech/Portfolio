/**
 * Daily sudoku in three difficulties. A seeded backtracking fill gives the
 * solution; clues are then removed one by one while the puzzle keeps a
 * single solution. Grids are 81 numbers, row-major, 0 for an empty cell.
 */
import { gameSeed, seededRandom, shuffled } from "../../daily/model/daily.ts";
import {
  freshClock,
  parseClock,
  type RunClock,
} from "../../records/model/records.ts";

export type Grid = number[];
export const LEVELS = ["easy", "normal", "hard"] as const;
export type SudokuLevel = (typeof LEVELS)[number];
/** Clues left on the board for each difficulty. */
const CLUES: Record<SudokuLevel, number> = { easy: 40, normal: 32, hard: 26 };

const row = (index: number) => Math.floor(index / 9);
const col = (index: number) => index % 9;
const box = (index: number) =>
  Math.floor(row(index) / 3) * 3 + Math.floor(col(index) / 3);

/** The 20 cells that share a row, column or box with each cell. */
export const PEERS: number[][] = Array.from({ length: 81 }, (_, index) =>
  Array.from({ length: 81 }, (_, other) => other).filter(
    (other) =>
      other !== index &&
      (row(other) === row(index) ||
        col(other) === col(index) ||
        box(other) === box(index)),
  ),
);

function candidates(grid: Grid, index: number): number[] {
  const taken = new Set(PEERS[index].map((peer) => grid[peer]));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((digit) => !taken.has(digit));
}

/** Empty cell with the fewest options, which keeps the search small. */
function mostConstrained(grid: Grid) {
  let best = -1;
  let options: number[] = [];
  for (let index = 0; index < 81; index++) {
    if (grid[index]) continue;
    const current = candidates(grid, index);
    if (best < 0 || current.length < options.length) {
      best = index;
      options = current;
      if (current.length <= 1) break;
    }
  }
  return { index: best, options };
}

/** Counts solutions, stopping at `limit`. */
export function countSolutions(grid: Grid, limit = 2): number {
  const work = [...grid];
  let found = 0;
  const search = (): boolean => {
    const { index, options } = mostConstrained(work);
    if (index < 0) return ++found >= limit;
    for (const digit of options) {
      work[index] = digit;
      if (search()) return true;
    }
    work[index] = 0;
    return false;
  };
  search();
  return found;
}

function solvedGrid(random: () => number): Grid {
  const grid: Grid = Array(81).fill(0);
  const fill = (): boolean => {
    const { index, options } = mostConstrained(grid);
    if (index < 0) return true;
    for (const digit of shuffled(options, random)) {
      grid[index] = digit;
      if (fill()) return true;
    }
    grid[index] = 0;
    return false;
  };
  fill();
  return grid;
}

export type Sudoku = { puzzle: Grid; solution: Grid };

export function buildSudoku(day: number, level: SudokuLevel): Sudoku {
  const random = seededRandom(gameSeed(`sudoku-${level}`, day));
  const solution = solvedGrid(random);
  const puzzle = [...solution];
  let clues = 81;
  for (const index of shuffled(
    Array.from({ length: 81 }, (_, cell) => cell),
    random,
  )) {
    if (clues <= CLUES[level]) break;
    const kept = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions(puzzle) !== 1) puzzle[index] = kept;
    else clues--;
  }
  return { puzzle, solution };
}

/** Cells whose digit repeats in their row, column or box. */
export function conflicts(grid: Grid): Set<number> {
  const clash = new Set<number>();
  grid.forEach((digit, index) => {
    if (digit && PEERS[index].some((peer) => grid[peer] === digit))
      clash.add(index);
  });
  return clash;
}

export const isComplete = (grid: Grid, solution: Grid) =>
  grid.every((digit, index) => digit === solution[index]);

export type SudokuState = {
  clock: RunClock | null;
  /** The visitor's digits, 0 where nothing was written. Givens stay 0. */
  entries: Grid;
  /** Pencil marks per cell as a 9-bit mask. */
  notes: number[];
  revealed: boolean;
  mistakes: number;
  hints: number[];
};

export const emptySudoku = (): SudokuState => ({
  clock: freshClock(),
  entries: Array(81).fill(0),
  notes: Array(81).fill(0),
  revealed: false,
  mistakes: 0,
  hints: [],
});

export function parseSudoku(value: unknown): SudokuState | null {
  if (!value || typeof value !== "object") return null;
  const {
    entries,
    notes,
    revealed,
    mistakes = 0,
    hints = [],
    clock,
  } = value as Partial<SudokuState>;
  const digits = (list: unknown, max: number) =>
    Array.isArray(list) &&
    list.length === 81 &&
    list.every((item) => Number.isInteger(item) && item >= 0 && item <= max);
  if (
    !digits(entries, 9) ||
    !digits(notes, 511) ||
    typeof revealed !== "boolean" ||
    !Number.isInteger(mistakes) ||
    mistakes < 0 ||
    mistakes > 3 ||
    !Array.isArray(hints) ||
    hints.length > 3 ||
    new Set(hints).size !== hints.length ||
    !hints.every((index) => Number.isInteger(index) && index >= 0 && index < 81)
  )
    return null;
  const legacyProgress =
    entries!.some(Boolean) ||
    notes!.some(Boolean) ||
    mistakes > 0 ||
    hints.length > 0 ||
    revealed;
  const parsedClock =
    clock === undefined
      ? legacyProgress
        ? null
        : freshClock()
      : clock === null
        ? null
        : parseClock(clock);
  if (clock !== undefined && clock !== null && !parsedClock) return null;
  return {
    entries: entries!,
    notes: notes!,
    revealed,
    mistakes,
    hints,
    clock: parsedClock,
  };
}

export const MAX_MISTAKES = 3;
export const MAX_HINTS = 3;

export function sudokuGrid(sudoku: Sudoku, state: SudokuState): Grid {
  return sudoku.puzzle.map((given, index) => given || state.entries[index]);
}

export function sudokuOver(sudoku: Sudoku, state: SudokuState): boolean {
  return (
    state.revealed ||
    state.mistakes >= MAX_MISTAKES ||
    isComplete(sudokuGrid(sudoku, state), sudoku.solution)
  );
}

/** Notes and erasing cost no lives. Replacing a digit checks the unique solution. */
export function enterDigit(
  sudoku: Sudoku,
  state: SudokuState,
  index: number,
  digit: number,
  pencil = false,
): SudokuState {
  if (
    sudokuOver(sudoku, state) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 81 ||
    !Number.isInteger(digit) ||
    digit < 0 ||
    digit > 9 ||
    sudoku.puzzle[index] ||
    state.hints.includes(index)
  )
    return state;
  const notes = [...state.notes];
  if (pencil && digit) {
    if (state.entries[index]) return state;
    notes[index] ^= 1 << (digit - 1);
    return { ...state, notes };
  }
  const entries = [...state.entries];
  const placed = entries[index] === digit ? 0 : digit;
  entries[index] = placed;
  notes[index] = 0;
  if (placed === sudoku.solution[index])
    for (const peer of PEERS[index]) notes[peer] &= ~(1 << (placed - 1));
  return {
    ...state,
    entries,
    notes,
    mistakes:
      state.mistakes + (placed && placed !== sudoku.solution[index] ? 1 : 0),
  };
}

/** Prefer the selected unsolved cell, otherwise the first unsolved cell. */
export function takeHint(
  sudoku: Sudoku,
  state: SudokuState,
  selected: number | null,
): SudokuState {
  if (sudokuOver(sudoku, state) || state.hints.length >= MAX_HINTS)
    return state;
  const eligible = (index: number) =>
    !sudoku.puzzle[index] && state.entries[index] !== sudoku.solution[index];
  const index =
    selected !== null && selected >= 0 && selected < 81 && eligible(selected)
      ? selected
      : sudoku.puzzle.findIndex((_, cell) => eligible(cell));
  if (index < 0) return state;
  const entries = [...state.entries];
  const notes = [...state.notes];
  entries[index] = sudoku.solution[index];
  notes[index] = 0;
  for (const peer of PEERS[index]) notes[peer] &= ~(1 << (entries[index] - 1));
  return { ...state, entries, notes, hints: [...state.hints, index] };
}

/** Saved progress for the three difficulties of one day. */
export type SudokuDay = Record<SudokuLevel, SudokuState>;
export const emptySudokuDay = (): SudokuDay => ({
  easy: emptySudoku(),
  normal: emptySudoku(),
  hard: emptySudoku(),
});
export function parseSudokuDay(value: unknown): SudokuDay | null {
  if (!value || typeof value !== "object") return null;
  const day = value as Record<string, unknown>;
  const parsed = LEVELS.map((level) => parseSudoku(day[level]));
  if (parsed.some((state) => !state)) return null;
  return { easy: parsed[0]!, normal: parsed[1]!, hard: parsed[2]! };
}
