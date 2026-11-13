import {
  answerTheme,
  isOver,
  parseRarity,
  passTheme,
  type RarityState,
  type Theme,
} from "./rarity.ts";
export const ROUND_MS = 20000;
export type TimedRarityState = RarityState & {
  started: boolean;
  deadline: number | null;
};
export const freshTimedRarity = (): TimedRarityState => ({
  rounds: [],
  started: false,
  deadline: null,
});
export function beginRound(
  state: TimedRarityState,
  now: number,
): TimedRarityState {
  return isOver(state) || state.deadline !== null
    ? state
    : { ...state, started: true, deadline: now + ROUND_MS };
}
export const expired = (state: TimedRarityState, now: number) =>
  state.deadline !== null && now >= state.deadline;
export function skipRound(state: TimedRarityState): TimedRarityState {
  return !state.started || state.deadline === null || isOver(state)
    ? state
    : { ...state, ...passTheme(state), deadline: null };
}
export function expireRound(
  state: TimedRarityState,
  now: number,
): TimedRarityState {
  return expired(state, now) ? skipRound(state) : state;
}
export function submitTimed(
  state: TimedRarityState,
  themes: readonly Theme[],
  guess: string,
  now: number,
) {
  if (!state.started || state.deadline === null || expired(state, now))
    return { ok: false as const, reason: "time" as const };
  const result = answerTheme(state, themes, guess);
  return result.ok
    ? { ...result, state: { ...state, ...result.state, deadline: null } }
    : result;
}
export function parseTimedRarity(value: unknown): TimedRarityState | null {
  const base = parseRarity(value);
  if (!base) return null;
  const { started, deadline } = value as Partial<TimedRarityState>;
  if (
    typeof started !== "boolean" ||
    (deadline !== null &&
      (!Number.isSafeInteger(deadline) || deadline! <= 0)) ||
    (!started && (base.rounds.length > 0 || deadline !== null)) ||
    (isOver(base) && deadline !== null)
  )
    return null;
  return { ...base, started, deadline: deadline! };
}
