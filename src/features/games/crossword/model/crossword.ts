/**
 * Daily crossword: an 11×11 free-form grid built from a clue bank. The
 * day seeds the shuffle, so everyone gets the same grid. Words are placed
 * only where they cross an earlier word and never touch side by side.
 */
import { gameSeed, seededRandom, shuffled } from "../../daily/model/daily.ts";

export const SIZE = 11;
export type ClueEntry = { answer: string; clue: string };
export type Direction = "across" | "down";
export type Placed = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
  number: number;
};
export type Crossword = {
  size: number;
  /** Solution letters; null for black squares. */
  cells: (string | null)[][];
  words: Placed[];
};

type Cell = { letter: string; across: boolean; down: boolean } | null;
const step = (direction: Direction) =>
  direction === "across" ? [0, 1] : [1, 0];

function letterAt(grid: Cell[][], row: number, col: number) {
  if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) return null;
  return grid[row][col];
}

/** Number of crossings, or -1 when the word cannot go there. */
export function fit(
  grid: Cell[][],
  answer: string,
  row: number,
  col: number,
  direction: Direction,
): number {
  const [dr, dc] = step(direction);
  const endRow = row + dr * (answer.length - 1);
  const endCol = col + dc * (answer.length - 1);
  if (row < 0 || col < 0 || endRow >= SIZE || endCol >= SIZE) return -1;
  if (
    letterAt(grid, row - dr, col - dc) ||
    letterAt(grid, endRow + dr, endCol + dc)
  )
    return -1;
  let crossings = 0;
  for (let index = 0; index < answer.length; index++) {
    const r = row + dr * index;
    const c = col + dc * index;
    const cell = grid[r][c];
    if (cell) {
      if (cell.letter !== answer[index] || cell[direction]) return -1;
      crossings++;
      continue;
    }
    // A new letter must not sit beside another word's letters.
    const [sideA, sideB] =
      direction === "across"
        ? [letterAt(grid, r - 1, c), letterAt(grid, r + 1, c)]
        : [letterAt(grid, r, c - 1), letterAt(grid, r, c + 1)];
    if (sideA || sideB) return -1;
  }
  return crossings === answer.length ? -1 : crossings;
}

function place(
  grid: Cell[][],
  answer: string,
  row: number,
  col: number,
  direction: Direction,
) {
  const [dr, dc] = step(direction);
  for (let index = 0; index < answer.length; index++) {
    const r = row + dr * index;
    const c = col + dc * index;
    const cell = grid[r][c] ?? {
      letter: answer[index],
      across: false,
      down: false,
    };
    cell[direction] = true;
    grid[r][c] = cell;
  }
}

type Draft = Omit<Placed, "number">;

function attempt(
  bank: readonly ClueEntry[],
  random: () => number,
  target: number,
) {
  const grid: Cell[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null),
  );
  const pool = shuffled(
    bank.filter(
      (entry) => entry.answer.length >= 3 && entry.answer.length <= SIZE,
    ),
    random,
  );
  const first = pool.find((entry) => entry.answer.length >= 7);
  if (!first) return [];
  const words: Draft[] = [];
  const startCol = Math.floor((SIZE - first.answer.length) / 2);
  const middle = Math.floor(SIZE / 2);
  place(grid, first.answer, middle, startCol, "across");
  words.push({ ...first, row: middle, col: startCol, direction: "across" });
  const used = new Set([first.answer]);

  // Several passes: a word that fits nowhere now may fit after others land.
  for (let pass = 0; pass < 3 && words.length < target; pass++) {
    for (const entry of pool) {
      if (words.length >= target) break;
      if (used.has(entry.answer)) continue;
      let best: {
        row: number;
        col: number;
        direction: Direction;
        score: number;
      } | null = null;
      for (let row = 0; row < SIZE; row++)
        for (let col = 0; col < SIZE; col++)
          for (const direction of ["across", "down"] as const) {
            const crossings = fit(grid, entry.answer, row, col, direction);
            if (crossings < 1) continue;
            // Prefer more crossings; break ties at random for variety.
            const score = crossings + random() * 0.5;
            if (!best || score > best.score)
              best = { row, col, direction, score };
          }
      if (!best) continue;
      place(grid, entry.answer, best.row, best.col, best.direction);
      words.push({
        ...entry,
        row: best.row,
        col: best.col,
        direction: best.direction,
      });
      used.add(entry.answer);
    }
  }
  return words;
}

/** Clue numbers in reading order, shared by across and down starting together. */
function number(words: Draft[]): Placed[] {
  const starts = [
    ...new Set(words.map((word) => word.row * SIZE + word.col)),
  ].sort((a, b) => a - b);
  return words
    .map((word) => ({
      ...word,
      number: starts.indexOf(word.row * SIZE + word.col) + 1,
    }))
    .sort((a, b) => a.number - b.number || (a.direction === "across" ? -1 : 1));
}

export function solutionCells(words: readonly Draft[]): (string | null)[][] {
  const cells: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null),
  );
  for (const word of words) {
    const [dr, dc] = step(word.direction);
    [...word.answer].forEach((letter, index) => {
      cells[word.row + dr * index][word.col + dc * index] = letter;
    });
  }
  return cells;
}

/** Best of several seeded attempts, by the number of words placed. */
export function buildCrossword(
  bank: readonly ClueEntry[],
  day: number,
  target = 16,
): Crossword {
  const random = seededRandom(gameSeed("crossword", day));
  let best: Draft[] = [];
  for (let tries = 0; tries < 12 && best.length < target; tries++) {
    const words = attempt(bank, random, target);
    if (words.length > best.length) best = words;
  }
  return { size: SIZE, cells: solutionCells(best), words: number(best) };
}

/** Cells covered by a word, in order. */
export function wordCells(
  word: Pick<Placed, "row" | "col" | "direction" | "answer">,
) {
  const [dr, dc] = step(word.direction);
  return [...word.answer].map((_, index) => ({
    row: word.row + dr * index,
    col: word.col + dc * index,
  }));
}

/** The visitor's letters, row-major; "" for empty cells. */
export type Entries = string[];

export const emptyEntries = () => Array<string>(SIZE * SIZE).fill("");

export function isSolved(puzzle: Crossword, entries: Entries): boolean {
  return puzzle.cells.every((row, r) =>
    row.every(
      (letter, c) => letter === null || entries[r * SIZE + c] === letter,
    ),
  );
}

/** Positions of filled cells whose letter is wrong. */
export function wrongCells(puzzle: Crossword, entries: Entries): Set<number> {
  const wrong = new Set<number>();
  puzzle.cells.forEach((row, r) =>
    row.forEach((letter, c) => {
      const entry = entries[r * SIZE + c];
      if (letter !== null && entry && entry !== letter) wrong.add(r * SIZE + c);
    }),
  );
  return wrong;
}

/** Counts only playable cells, including blanks, for visible check feedback. */
export function checkEntries(puzzle: Crossword, entries: Entries) {
  const wrong = wrongCells(puzzle, entries);
  let correct = 0;
  let empty = 0;
  puzzle.cells.flat().forEach((letter, index) => {
    if (letter === null) return;
    if (!entries[index]) empty++;
    else if (entries[index] === letter) correct++;
  });
  return { wrong, correct, empty };
}

/** Checks allowed per day; the last one unsolved reveals the grid. */
export const MAX_CHECKS = 5;

export type CrosswordState = {
  entries: Entries;
  revealed: boolean;
  checks: number;
  validated?: boolean;
};

/** Filling the last square still requires the player's final check. */
export function validateCrossword(
  puzzle: Crossword,
  state: CrosswordState,
): CrosswordState {
  if (state.revealed || (state.validated && isSolved(puzzle, state.entries)))
    return state;
  const validated = isSolved(puzzle, state.entries);
  const checks = state.checks + 1;
  return {
    ...state,
    checks,
    validated,
    revealed: !validated && checks >= MAX_CHECKS,
  };
}

/** The grid was revealed because every check was spent. */
export const outOfChecks = (state: CrosswordState) =>
  state.revealed && state.checks >= MAX_CHECKS;

export function parseCrossword(value: unknown): CrosswordState | null {
  if (!value || typeof value !== "object") return null;
  const { entries, revealed, checks, validated } =
    value as Partial<CrosswordState>;
  if (
    !Array.isArray(entries) ||
    entries.length !== SIZE * SIZE ||
    !entries.every(
      (entry) => typeof entry === "string" && /^[A-Z]?$/.test(entry),
    ) ||
    typeof revealed !== "boolean" ||
    !Number.isSafeInteger(checks) ||
    Number(checks) < 0 ||
    (validated !== undefined && typeof validated !== "boolean")
  )
    return null;
  return {
    entries,
    revealed,
    checks: checks as number,
    ...(validated === undefined ? {} : { validated }),
  };
}
