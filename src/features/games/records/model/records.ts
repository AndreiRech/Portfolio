export const LEVELS = ["easy", "normal", "hard"] as const;
export type Level = (typeof LEVELS)[number];
export type RunClock = { startedAt: number | null; finishedAt: number | null };
export const freshClock = (): RunClock => ({
  startedAt: null,
  finishedAt: null,
});
const timestamp = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 8.64e15;

export function parseClock(value: unknown): RunClock | null {
  if (!value || typeof value !== "object") return null;
  const { startedAt, finishedAt } = value as Partial<RunClock>;
  if (
    (startedAt !== null && !timestamp(startedAt)) ||
    (finishedAt !== null &&
      (!timestamp(finishedAt) || startedAt === null || finishedAt < startedAt!))
  )
    return null;
  return { startedAt: startedAt!, finishedAt: finishedAt! };
}

/** Absolute timestamps survive reloads and difficulty changes without resetting. */
export function advanceClock(
  clock: RunClock | null,
  now: number,
  finished: boolean,
): RunClock | null {
  if (!clock || clock.finishedAt !== null || !timestamp(now)) return clock;
  const startedAt = clock.startedAt ?? now;
  return { startedAt, finishedAt: finished ? Math.max(startedAt, now) : null };
}
export function elapsedTime(clock: RunClock | null, now: number): number {
  return clock?.startedAt === null || !clock
    ? 0
    : Math.max(0, (clock.finishedAt ?? now) - clock.startedAt);
}
export function formatTime(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export type BestTimes = Record<Level, number | null>;
export const freshBestTimes = (): BestTimes => ({
  easy: null,
  normal: null,
  hard: null,
});
export function parseBestTimes(value: unknown): BestTimes | null {
  if (!value || typeof value !== "object") return null;
  const times = value as BestTimes;
  // ASVS 2.2.1: persisted records accept only known levels and bounded durations.
  if (
    !LEVELS.every(
      (level) =>
        times[level] === null ||
        (Number.isSafeInteger(times[level]) &&
          times[level]! > 0 &&
          times[level]! <= 31_536_000_000),
    )
  )
    return null;
  return { easy: times.easy, normal: times.normal, hard: times.hard };
}
export function recordTime(
  times: BestTimes,
  level: Level,
  clock: RunClock | null,
  won: boolean,
): BestTimes {
  if (!won || !clock || clock.startedAt === null || clock.finishedAt === null)
    return times;
  const duration = elapsedTime(clock, clock.finishedAt);
  if (
    duration <= 0 ||
    duration > 31_536_000_000 ||
    (times[level] !== null && duration >= times[level]!)
  )
    return times;
  return { ...times, [level]: duration };
}
export type Streak = { current: number; best: number; pending: boolean };
export const freshStreak = (): Streak => ({
  current: 0,
  best: 0,
  pending: false,
});
export function parseStreak(value: unknown): Streak | null {
  if (!value || typeof value !== "object") return null;
  const { current, best, pending } = value as Partial<Streak>;
  if (
    ![current, best].every(
      (n) => Number.isSafeInteger(n) && n! >= 0 && n! <= 1_000_000,
    ) ||
    best! < current! ||
    typeof pending !== "boolean"
  )
    return null;
  return { current: current!, best: best!, pending };
}
export function beginStreak(streak: Streak): Streak {
  return {
    ...streak,
    current: streak.pending ? 0 : streak.current,
    pending: true,
  };
}
/** A battle can settle only once; a defeat ends the current streak. */
export function finishStreak(streak: Streak, won: boolean): Streak {
  if (!streak.pending) return streak;
  const current = won ? Math.min(1_000_000, streak.current + 1) : 0;
  return { current, best: Math.max(streak.best, current), pending: false };
}
