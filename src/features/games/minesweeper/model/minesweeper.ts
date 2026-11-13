import { seededRandom, shuffled } from "../../daily/model/daily.ts";
import {
  advanceClock,
  freshClock,
  type RunClock,
} from "../../records/model/records.ts";
export const LEVELS = {
  easy: { side: 9, mines: 10 },
  normal: { side: 12, mines: 24 },
  hard: { side: 16, mines: 40 },
} as const;
export type Level = keyof typeof LEVELS;
export type Minefield = {
  clock: RunClock;
  side: number;
  mines: number[];
  opened: number[];
  flags: number[];
  status: "ready" | "playing" | "won" | "lost";
};
export function neighbors(index: number, side: number): number[] {
  const row = Math.floor(index / side),
    col = index % side;
  const result: number[] = [];
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      const r = row + y,
        c = col + x;
      if ((x || y) && r >= 0 && r < side && c >= 0 && c < side)
        result.push(r * side + c);
    }
  return result;
}
export const freshField = (level: Level): Minefield => ({
  clock: freshClock(),
  side: LEVELS[level].side,
  mines: [],
  opened: [],
  flags: [],
  status: "ready",
});
export const nearbyMines = (field: Minefield, index: number) =>
  neighbors(index, field.side).filter((cell) => field.mines.includes(cell))
    .length;
export function flagCell(field: Minefield, index: number): Minefield {
  if (
    field.status === "won" ||
    field.status === "lost" ||
    field.opened.includes(index) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= field.side ** 2
  )
    return field;
  return {
    ...field,
    flags: field.flags.includes(index)
      ? field.flags.filter((cell) => cell !== index)
      : [...field.flags, index],
  };
}
export function openCell(
  field: Minefield,
  index: number,
  mineCount: number,
  seed: number,
): Minefield {
  // ASVS 2.2.1: only valid board coordinates may change the field.
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= field.side ** 2 ||
    field.flags.includes(index) ||
    field.opened.includes(index) ||
    field.status === "won" ||
    field.status === "lost"
  )
    return field;
  let current = field;
  if (current.status === "ready") {
    const safe = new Set([index, ...neighbors(index, field.side)]);
    const candidates = Array.from(
      { length: field.side ** 2 },
      (_, i) => i,
    ).filter((i) => !safe.has(i));
    current = {
      ...field,
      clock: advanceClock(field.clock, seed, false)!,
      mines: shuffled(candidates, seededRandom(seed)).slice(
        0,
        Math.min(mineCount, candidates.length),
      ),
      status: "playing",
    };
  }
  if (current.mines.includes(index))
    return {
      ...current,
      clock: advanceClock(current.clock, seed, true)!,
      opened: [...current.opened, index],
      status: "lost",
    };
  const opened = new Set(current.opened),
    pending = [index];
  while (pending.length) {
    const cell = pending.pop()!;
    if (
      opened.has(cell) ||
      current.flags.includes(cell) ||
      current.mines.includes(cell)
    )
      continue;
    opened.add(cell);
    if (!nearbyMines(current, cell))
      pending.push(
        ...neighbors(cell, current.side).filter((i) => !opened.has(i)),
      );
  }
  return {
    ...current,
    clock: advanceClock(
      current.clock,
      seed,
      opened.size === current.side ** 2 - current.mines.length,
    )!,
    opened: [...opened],
    status:
      opened.size === current.side ** 2 - current.mines.length
        ? "won"
        : "playing",
  };
}
