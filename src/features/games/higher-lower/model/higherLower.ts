/**
 * Higher or lower: the visitor sees one item's number (AniList users, IMDb
 * rating or Spotify streams) and guesses whether the next one is higher or
 * lower.
 */
export type HLItem = {
  id: string;
  title: string;
  value: number;
  /** Year, format or artist, shown under the title. */
  subtitle: string | null;
  cover: string | null;
  /** Movies and series are told apart by a translated tag. */
  kind?: "movie" | "series";
};
export const CATEGORIES = ["anime", "screen", "streams"] as const;
export type HLCategory = (typeof CATEGORIES)[number];
export type Guess = "higher" | "lower";
/** IMDb ratings have one decimal (8.7); the counts are whole numbers. */
export const DECIMALS: Record<HLCategory, number> = {
  anime: 0,
  screen: 1,
  streams: 0,
};

/** A tie counts as right for either guess. */
export function isRightGuess(
  current: HLItem,
  next: HLItem,
  guess: Guess,
): boolean {
  if (next.value === current.value) return true;
  return guess === "higher"
    ? next.value > current.value
    : next.value < current.value;
}

export type HigherLowerState = {
  phase: "loading" | "guess" | "reveal" | "lost";
  queue: HLItem[];
  current: HLItem | null;
  next: HLItem | null;
  streak: number;
  best: number;
  lastGuess: Guess | null;
};
export type HigherLowerAction =
  | { type: "load"; media: HLItem[] }
  | { type: "guess"; guess: Guess }
  | { type: "advance" }
  | { type: "restart" };

export const initialHigherLower: HigherLowerState = {
  phase: "loading",
  queue: [],
  current: null,
  next: null,
  streak: 0,
  best: 0,
  lastGuess: null,
};

/** Pairs too close to call make for a coin flip, so they are skipped. */
const TOO_CLOSE = 0.04;
function nextDistinct(current: HLItem, queue: HLItem[]) {
  const index = queue.findIndex(
    (media) =>
      media.id !== current.id &&
      Math.abs(media.value - current.value) /
        Math.max(media.value, current.value, 1) >
        TOO_CLOSE,
  );
  if (index < 0) return { next: null, queue };
  return {
    next: queue[index],
    queue: [...queue.slice(0, index), ...queue.slice(index + 1)],
  };
}

function deal(state: HigherLowerState, current: HLItem | null) {
  let queue = state.queue;
  if (!current) {
    [current, ...queue] = queue;
    if (!current) return { ...state, phase: "loading" as const };
  }
  const picked = nextDistinct(current, queue);
  if (!picked.next)
    return { ...state, current, queue, next: null, phase: "loading" as const };
  return {
    ...state,
    current,
    next: picked.next,
    queue: picked.queue,
    phase: "guess" as const,
    lastGuess: null,
  };
}

export function higherLowerReducer(
  state: HigherLowerState,
  action: HigherLowerAction,
): HigherLowerState {
  switch (action.type) {
    case "load": {
      const known = new Set(
        [state.current, state.next, ...state.queue]
          .filter(Boolean)
          .map((media) => media!.id),
      );
      const fresh = action.media.filter(
        (media) =>
          Number.isFinite(media.value) &&
          media.value >= 0 &&
          !known.has(media.id) &&
          known.add(media.id),
      );
      const loaded = { ...state, queue: [...state.queue, ...fresh] };
      return state.phase === "loading" ? deal(loaded, state.current) : loaded;
    }
    case "guess": {
      if (state.phase !== "guess" || !state.current || !state.next)
        return state;
      const right = isRightGuess(state.current, state.next, action.guess);
      const streak = right ? state.streak + 1 : state.streak;
      return {
        ...state,
        phase: right ? "reveal" : "lost",
        streak,
        best: Math.max(state.best, streak),
        lastGuess: action.guess,
      };
    }
    case "advance":
      return state.phase === "reveal" ? deal(state, state.next) : state;
    case "restart":
      return state.phase === "lost"
        ? deal({ ...state, streak: 0 }, null)
        : state;
  }
}

/** Fetch more anime once fewer than this many are waiting. */
export const LOW_QUEUE = 6;

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** Mixes the very popular with the half-forgotten: one page from the top of
    AniList's popularity ranking and one from far below it. */
export function pickPages(random = Math.random): [number, number] {
  return [1 + Math.floor(random() * 6), 7 + Math.floor(random() * 70)];
}
