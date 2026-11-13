/**
 * Conexo: sixteen words hide four groups of four. The visitor selects four
 * words at a time; a right guess reveals the group. There is no attempt
 * limit, only a counter, and the visitor may reveal the answer.
 */
import { gameSeed, seededRandom, shuffled } from "../../daily/model/daily.ts";

export type Level = 1 | 2 | 3 | 4;
export type ConexoGroup = {
  level: Level;
  theme: string;
  name: string;
  words: string[];
};
export type PuzzleGroup = { level: Level; name: string; words: string[] };
export type ConexoPuzzle = { groups: PuzzleGroup[]; order: string[] };
export type ConexoState = {
  solved: number[];
  attempts: string[][];
  gaveUp: boolean;
};

export const GROUP_SIZE = 4;
const normalized = new Map<string, string>();
const key = (word: string) => {
  let result = normalized.get(word);
  if (result === undefined) {
    result = word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    normalized.set(word, result);
  }
  return result;
};
const wordSets = new WeakMap<object, Set<string>>();
function wordSet(group: { words: string[] }) {
  let words = wordSets.get(group);
  if (!words) {
    words = new Set(group.words.map(key));
    wordSets.set(group, words);
  }
  return words;
}

/**
 * Words of `shown` that would also fit `other`'s category, by the bank's
 * lists. One-way overlaps are red herrings with a single solution; overlaps
 * both ways would let two groups swap words, so those puzzles are rejected.
 */
function crossings(shown: PuzzleGroup, other: ConexoGroup) {
  const fits = wordSet(other);
  return shown.words.filter((word) => fits.has(key(word))).length;
}

/**
 * Groups of one level in a seeded order that changes every cycle, so a
 * group returns only after the others of its level had their turn.
 */
function rotation(bank: readonly ConexoGroup[], level: Level, day: number) {
  const groups = bank.filter((group) => group.level === level);
  const cycle = Math.floor((day - 1) / groups.length);
  const order = shuffled(
    groups,
    seededRandom(gameSeed(`conexo-${level}`, cycle)),
  );
  // Fallbacks jump 7 places so a skipped group is not tomorrow's pick. The
  // double modulo keeps days before launch (clock skew) in range.
  const size = groups.length;
  return groups.map(
    (_, index) => order[(((day - 1 + index * 7) % size) + size) % size],
  );
}

/**
 * One group per level, from four different themes, four words each, with
 * no word shown twice. Seeded by the day, so the puzzle is the same for
 * everyone and after a reload.
 */
export function buildPuzzle(
  bank: readonly ConexoGroup[],
  day: number,
): ConexoPuzzle {
  const random = seededRandom(gameSeed("conexo", day));
  const levels = ([1, 2, 3, 4] as const).map((level) =>
    rotation(bank, level, day),
  );
  let best: { groups: PuzzleGroup[]; score: number } | null = null;
  // Walks each level's rotation from today's group until the set works.
  for (let tries = 0; tries < 150; tries++) {
    const themes = new Set<string>();
    const used = new Set<string>();
    const picked: { source: ConexoGroup; shown: PuzzleGroup }[] = [];
    for (const [index, options] of levels.entries()) {
      const offset =
        tries === 0
          ? 0
          : Math.floor(random() * Math.min(options.length, 4 + tries));
      const candidates = [
        ...options.slice(offset),
        ...options.slice(0, offset),
      ].filter((item) => !themes.has(item.theme));
      // Seek cross-category words rather than four unrelated subjects.
      const potential = (item: ConexoGroup) =>
        picked.reduce((sum, previous) => {
          const forward = crossings(previous.shown, item);
          const reverse = item.words.filter(
            (word) =>
              !used.has(key(word)) && wordSet(previous.source).has(key(word)),
          ).length;
          return sum + forward + Math.min(reverse, 2);
        }, 0);
      if (tries > 0 && tries % 5 !== 0) {
        const scores = new Map(
          candidates.map((candidate) => [candidate, potential(candidate)]),
        );
        candidates.sort((a, b) => scores.get(b)! - scores.get(a)!);
      }
      const group = candidates[0];
      if (!group) break;
      const pool = shuffled(group.words, random).filter(
        (word) => !used.has(key(word)),
      );
      if (tries > 0)
        pool.sort((a, b) => {
          const overlap = (word: string) =>
            picked.filter(
              (previous) =>
                !crossings(previous.shown, group) &&
                wordSet(previous.source).has(key(word)),
            ).length;
          return overlap(b) - overlap(a);
        });
      const words = pool.slice(0, GROUP_SIZE);
      if (words.length < GROUP_SIZE) break;
      words.forEach((word) => used.add(key(word)));
      themes.add(group.theme);
      picked.push({
        source: group,
        shown: { level: (index + 1) as Level, name: group.name, words },
      });
    }
    if (picked.length !== 4) continue;
    const ambiguous = picked.some((a, i) =>
      picked.some(
        (b, j) =>
          i < j &&
          crossings(a.shown, b.source) > 0 &&
          crossings(b.shown, a.source) > 0,
      ),
    );
    if (ambiguous) continue;
    // Reject longer swap cycles too: they can produce alternate partitions.
    const edges = picked.map((a, i) =>
      picked.flatMap((b, j) =>
        i !== j && crossings(a.shown, b.source) > 0 ? [j] : [],
      ),
    );
    const hasCycle = (node: number, path: Set<number>): boolean => {
      if (path.has(node)) return true;
      const next = new Set(path).add(node);
      return edges[node].some((other) => hasCycle(other, next));
    };
    if (edges.some((_, index) => hasCycle(index, new Set()))) continue;
    const score = picked.reduce(
      (sum, a, i) =>
        sum +
        picked.reduce(
          (total, b, j) => total + (i !== j ? crossings(a.shown, b.source) : 0),
          0,
        ),
      0,
    );
    if (!best || score > best.score)
      best = { groups: picked.map((item) => item.shown), score };
    if (score >= 3) break;
  }
  if (!best) throw new Error("No Conexo puzzle could be built from the bank.");
  return {
    groups: best.groups,
    order: shuffled(
      best.groups.flatMap((group) => group.words),
      random,
    ),
  };
}

export const initialConexo = (): ConexoState => ({
  solved: [],
  attempts: [],
  gaveUp: false,
});

export type ConexoResult = {
  state: ConexoState;
  verdict: "solved" | "one-away" | "wrong" | "repeat" | "invalid";
};

export function guessGroup(
  state: ConexoState,
  puzzle: ConexoPuzzle,
  selection: readonly string[],
): ConexoResult {
  if (selection.length !== GROUP_SIZE || isFinished(state))
    return { state, verdict: "invalid" };
  const chosen = [...selection].sort();
  const repeat = state.attempts.some(
    (attempt) => [...attempt].sort().join("|") === chosen.join("|"),
  );
  if (repeat) return { state, verdict: "repeat" };
  const attempts = [...state.attempts, chosen];
  const index = puzzle.groups.findIndex(
    (group, position) =>
      !state.solved.includes(position) &&
      group.words.every((word) => chosen.includes(word)),
  );
  if (index >= 0)
    return {
      state: { ...state, attempts, solved: [...state.solved, index] },
      verdict: "solved",
    };
  const best = Math.max(
    ...puzzle.groups.map(
      (group) => group.words.filter((word) => chosen.includes(word)).length,
    ),
  );
  return {
    state: { ...state, attempts },
    verdict: best === GROUP_SIZE - 1 ? "one-away" : "wrong",
  };
}

export const isFinished = (state: ConexoState) =>
  state.gaveUp || state.solved.length === 4;

/** Reveals the remaining groups, easiest first. */
export function giveUp(state: ConexoState): ConexoState {
  if (isFinished(state)) return state;
  const rest = [0, 1, 2, 3].filter((index) => !state.solved.includes(index));
  return { ...state, solved: [...state.solved, ...rest], gaveUp: true };
}

const EMOJI: Record<Level, string> = { 1: "🟨", 2: "🟩", 3: "🟦", 4: "🟪" };

export function shareText(
  state: ConexoState,
  puzzle: ConexoPuzzle,
  day: number,
  language: "pt" | "en" = "pt",
): string {
  const levelOf = (word: string) =>
    puzzle.groups.find((group) => group.words.includes(word))!.level;
  const rows = state.attempts.map((attempt) =>
    attempt.map((word) => EMOJI[levelOf(word)]).join(""),
  );
  const attempts =
    language === "pt"
      ? state.attempts.length === 1
        ? "tentativa"
        : "tentativas"
      : state.attempts.length === 1
        ? "attempt"
        : "attempts";
  const outcome = state.gaveUp ? "X" : `${state.attempts.length} ${attempts}`;
  return [
    `${language === "pt" ? "Conexo" : "Connected"} #${day} · ${outcome}`,
    ...rows,
  ].join("\n");
}

/**
 * Saved progress belongs to one puzzle. When the bank changes, a save from
 * the same day can name words the puzzle no longer has; such a save is
 * dropped so the visitor starts today's puzzle fresh.
 */
export function matchPuzzle(
  state: ConexoState | null,
  puzzle: ConexoPuzzle,
): ConexoState | null {
  if (!state) return null;
  const words = new Set(puzzle.order);
  if (!state.attempts.every((attempt) => attempt.every((w) => words.has(w))))
    return null;
  const found = (index: number) =>
    state.attempts.some((attempt) =>
      puzzle.groups[index].words.every((word) => attempt.includes(word)),
    );
  // Revealed groups have no attempt behind them.
  return state.gaveUp || state.solved.every(found) ? state : null;
}

export function parseConexo(value: unknown): ConexoState | null {
  if (!value || typeof value !== "object") return null;
  const { solved, attempts, gaveUp } = value as Partial<ConexoState>;
  if (
    !Array.isArray(solved) ||
    solved.length > 4 ||
    !solved.every(
      (index) => Number.isInteger(index) && index >= 0 && index < 4,
    ) ||
    new Set(solved).size !== solved.length ||
    !Array.isArray(attempts) ||
    attempts.length > 500 ||
    !attempts.every(
      (attempt) =>
        Array.isArray(attempt) &&
        attempt.length === GROUP_SIZE &&
        attempt.every((word) => typeof word === "string"),
    ) ||
    typeof gaveUp !== "boolean"
  )
    return null;
  return { solved, attempts, gaveUp };
}
