/**
 * Daily puzzles: everyone gets the same puzzle on the same local calendar
 * day. The day number seeds a deterministic random source, so puzzles need
 * no server and stay the same after a reload.
 */

/** Day 1 of the daily games. */
const EPOCH = Date.UTC(2026, 10, 12);
const DAY_MS = 86_400_000;

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Puzzle number for a local date: 1 on launch day, counting up. */
export function dayNumber(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((local - EPOCH) / DAY_MS) + 1;
}

/** Milliseconds until the next local midnight. */
export function msUntilTomorrow(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** mulberry32: small, fast and good enough for shuffling puzzles. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Distinct seeds per game, so two games never share a shuffle. */
export function gameSeed(game: string, day: number): number {
  let hash = 2_166_136_261;
  for (const char of `${game}:${day}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/**
 * Item for a day from a fixed list: walks a seeded permutation so every item
 * appears once before any repeats, in an order that is not the list's.
 */
export function dailyPick<T>(
  items: readonly T[],
  game: string,
  day: number,
): T {
  const cycle = Math.floor((day - 1) / items.length);
  const order = shuffled(
    items.map((_, index) => index),
    seededRandom(gameSeed(game, cycle)),
  );
  const position = (((day - 1) % items.length) + items.length) % items.length;
  return items[order[position]];
}

/** "2:05:09" until the next puzzle. */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
