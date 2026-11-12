/**
 * Higher or lower: the visitor sees one anime's AniList popularity (users
 * with it on their list) and guesses whether the next one has more or fewer.
 */
export type AnimeMedia = {
  id: number;
  title: string;
  popularity: number;
  seasonYear: number | null;
  format: string | null;
  cover: string | null;
};
export type Guess = "higher" | "lower";

/** A tie counts as right for either guess. */
export function isRightGuess(
  current: AnimeMedia,
  next: AnimeMedia,
  guess: Guess,
): boolean {
  if (next.popularity === current.popularity) return true;
  return guess === "higher"
    ? next.popularity > current.popularity
    : next.popularity < current.popularity;
}

export type HigherLowerState = {
  phase: "loading" | "guess" | "reveal" | "lost";
  queue: AnimeMedia[];
  current: AnimeMedia | null;
  next: AnimeMedia | null;
  streak: number;
  best: number;
  lastGuess: Guess | null;
};
export type HigherLowerAction =
  | { type: "load"; media: AnimeMedia[] }
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
function nextDistinct(current: AnimeMedia, queue: AnimeMedia[]) {
  const index = queue.findIndex(
    (media) =>
      media.id !== current.id &&
      Math.abs(media.popularity - current.popularity) /
        Math.max(media.popularity, current.popularity, 1) >
        TOO_CLOSE,
  );
  if (index < 0) return { next: null, queue };
  return {
    next: queue[index],
    queue: [...queue.slice(0, index), ...queue.slice(index + 1)],
  };
}

function deal(state: HigherLowerState, current: AnimeMedia | null) {
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
          Number.isFinite(media.popularity) &&
          media.popularity >= 0 &&
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
