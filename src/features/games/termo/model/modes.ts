import {
  dailyPick,
  gameSeed,
  seededRandom,
  shuffled,
} from "../../daily/model/daily.ts";
import {
  buildDictionary,
  scoreGuess,
  stripAccents,
  type Mark,
} from "./termo.ts";
export const MODES = [
  "classic",
  "dueto",
  "quarteto",
  "counts",
  "locked",
  "between",
  "liar",
] as const;
export type TermoMode = (typeof MODES)[number];
export const CONFIG: Record<TermoMode, { boards: number; tries: number }> = {
  classic: { boards: 1, tries: 6 },
  dueto: { boards: 2, tries: 7 },
  quarteto: { boards: 4, tries: 9 },
  counts: { boards: 1, tries: 8 },
  locked: { boards: 1, tries: 6 },
  between: { boards: 1, tries: 16 },
  liar: { boards: 1, tries: 7 },
};
export type ModeState = {
  guesses: string[];
  notes: (Mark | null)[][];
  status: "playing" | "won" | "lost";
};
export const freshMode = (): ModeState => ({
  guesses: [],
  notes: [],
  status: "playing",
});
export type ModePuzzle = {
  mode: TermoMode;
  answers: string[];
  lexicon: string[];
  day: number;
};
export function buildModePuzzle(
  answers: string[],
  dictionary: ReadonlyMap<string, string>,
  mode: TermoMode,
  day: number,
): ModePuzzle {
  const lexicon = [...dictionary.keys()].sort();
  const unique = [...buildDictionary(answers).values()].filter(
    (word) =>
      mode !== "between" ||
      (stripAccents(word) !== lexicon[0] &&
        stripAccents(word) !== lexicon.at(-1)),
  );
  const picked =
    mode === "classic"
      ? [dailyPick(answers, "termo", day)]
      : shuffled(unique, seededRandom(gameSeed(`termo-${mode}`, day))).slice(
          0,
          CONFIG[mode].boards,
        );
  return { mode, answers: picked, lexicon, day };
}
export const solvedBoard = (state: ModeState, answer: string) =>
  state.guesses.findIndex(
    (guess) => stripAccents(guess) === stripAccents(answer),
  );
export function colorCounts(guess: string, answer: string) {
  const marks = scoreGuess(guess, answer);
  return {
    right: marks.filter((mark) => mark === "right").length,
    place: marks.filter((mark) => mark === "place").length,
    wrong: marks.filter((mark) => mark === "wrong").length,
  };
}
/**
 * One false mark per unsuccessful guess. A solved word is always all green,
 * and only a solved word is: the lie never turns the last non-green tile green.
 */
export function feedback(
  puzzle: ModePuzzle,
  guess: string,
  answer: string,
  row: number,
): Mark[] {
  const marks = scoreGuess(guess, answer);
  if (puzzle.mode !== "liar" || stripAccents(guess) === stripAccents(answer))
    return marks;
  const random = seededRandom(gameSeed(`termo-liar-${puzzle.day}`, row));
  const index = Math.floor(random() * 5);
  const othersGreen = marks.every(
    (mark, col) => col === index || mark === "right",
  );
  const alternatives = (["right", "place", "wrong"] as const).filter(
    (mark) => mark !== marks[index] && !(mark === "right" && othersGreen),
  );
  marks[index] = alternatives[Math.floor(random() * alternatives.length)];
  return marks;
}
export function betweenBounds(puzzle: ModePuzzle, state: ModeState) {
  const target = stripAccents(puzzle.answers[0]);
  const rank = puzzle.lexicon.indexOf(target);
  let low = -1,
    high = puzzle.lexicon.length;
  for (const guess of state.guesses) {
    const key = stripAccents(guess);
    const index = puzzle.lexicon.indexOf(key);
    if (index < 0) continue;
    if (index < rank) low = Math.max(low, index);
    if (index > rank) high = Math.min(high, index);
  }
  const denominator = Math.max(1, puzzle.lexicon.length + 1);
  return {
    low,
    high,
    lower: puzzle.lexicon[low] ?? "aaaaa",
    upper: puzzle.lexicon[high] ?? "zzzzz",
    lowDistance: state.guesses.length ? ((rank - low) / denominator) * 100 : 50,
    highDistance: state.guesses.length
      ? ((high - rank) / denominator) * 100
      : 50,
    position: state.guesses.length
      ? (rank - low) / Math.max(1, high - low)
      : 0.5,
    remaining: Math.max(0, high - low - 1),
  };
}
/** A valid guess at or beyond the current best bounds cannot narrow them. */
export function outsideInterval(
  puzzle: ModePuzzle,
  state: ModeState,
  word: string,
): boolean {
  if (puzzle.mode !== "between") return false;
  const index = puzzle.lexicon.indexOf(stripAccents(word));
  const { low, high } = betweenBounds(puzzle, state);
  return index >= 0 && (index <= low || index >= high);
}
export function lockedLetters(puzzle: ModePuzzle, state: ModeState): string[] {
  const locks = Array<string>(5).fill("");
  if (puzzle.mode === "locked") {
    for (const guess of state.guesses)
      scoreGuess(guess, puzzle.answers[0]).forEach((mark, index) => {
        if (mark === "right")
          locks[index] = stripAccents(puzzle.answers[0])[index];
      });
  }
  return locks;
}
/**
 * Fixed mode: every letter revealed green or yellow must reappear in the next
 * guesses, as many times as it was revealed in a single guess.
 */
export function requiredLetters(
  puzzle: ModePuzzle,
  state: ModeState,
): Map<string, number> {
  const required = new Map<string, number>();
  if (puzzle.mode !== "locked") return required;
  for (const guess of state.guesses) {
    const key = stripAccents(guess);
    const found = new Map<string, number>();
    scoreGuess(guess, puzzle.answers[0]).forEach((mark, index) => {
      if (mark !== "wrong")
        found.set(key[index], (found.get(key[index]) ?? 0) + 1);
    });
    for (const [letter, count] of found)
      required.set(letter, Math.max(required.get(letter) ?? 0, count));
  }
  return required;
}
export function missingLetters(
  puzzle: ModePuzzle,
  state: ModeState,
  word: string,
): string[] {
  const key = [...stripAccents(word)];
  return [...requiredLetters(puzzle, state)].flatMap(([letter, count]) =>
    key.filter((used) => used === letter).length < count ? [letter] : [],
  );
}
export function submitMode(
  state: ModeState,
  typed: string,
  puzzle: ModePuzzle,
  dictionary: ReadonlyMap<string, string>,
) {
  if (state.status !== "playing")
    return { ok: false as const, reason: "done" as const };
  const key = stripAccents(typed);
  if (!/^[a-z]{5}$/.test(key))
    return { ok: false as const, reason: "short" as const };
  const word =
    puzzle.answers.find((answer) => stripAccents(answer) === key) ??
    dictionary.get(key);
  if (!word) return { ok: false as const, reason: "unknown" as const };
  if (
    lockedLetters(puzzle, state).some(
      (letter, index) => letter && key[index] !== letter,
    )
  )
    return { ok: false as const, reason: "locked" as const };
  if (missingLetters(puzzle, state, key).length)
    return { ok: false as const, reason: "yellow" as const };
  const guesses = [...state.guesses, word];
  const won = puzzle.answers.every((answer) =>
    guesses.some((guess) => stripAccents(guess) === stripAccents(answer)),
  );
  return {
    ok: true as const,
    state: {
      guesses,
      notes: [...state.notes, Array<Mark | null>(5).fill(null)],
      status: won
        ? ("won" as const)
        : guesses.length >= CONFIG[puzzle.mode].tries
          ? ("lost" as const)
          : ("playing" as const),
    },
  };
}
export function cycleNote(
  state: ModeState,
  row: number,
  col: number,
): ModeState {
  if (!state.guesses[row] || col < 0 || col > 4) return state;
  const order: (Mark | null)[] = [null, "right", "place", "wrong"];
  const notes = state.notes.map((items) => [...items]);
  notes[row][col] = order[(order.indexOf(notes[row][col]) + 1) % order.length];
  return { ...state, notes };
}
export function parseMode(
  value: unknown,
  puzzle: ModePuzzle,
  dictionary: ReadonlyMap<string, string>,
): ModeState | null {
  if (!value || typeof value !== "object") return null;
  const { guesses, notes, status } = value as Partial<ModeState>;
  if (
    !Array.isArray(guesses) ||
    guesses.length > CONFIG[puzzle.mode].tries ||
    !Array.isArray(notes) ||
    notes.length !== guesses.length ||
    !notes.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 5 &&
        row.every(
          (mark) =>
            mark === null ||
            mark === "right" ||
            mark === "place" ||
            mark === "wrong",
        ),
    )
  )
    return null;
  let restored = freshMode();
  for (const guess of guesses) {
    if (typeof guess !== "string") return null;
    const result = submitMode(restored, guess, puzzle, dictionary);
    if (!result.ok) return null;
    restored = result.state;
  }
  return restored.status === status ? { ...restored, notes } : null;
}
const EMOJI: Record<Mark, string> = { right: "🟩", place: "🟨", wrong: "🟥" };
export function modeShare(
  state: ModeState,
  puzzle: ModePuzzle,
  label: string,
): string {
  const header = `Termo · ${label} #${puzzle.day} ${state.status === "won" ? state.guesses.length : "X"}/${CONFIG[puzzle.mode].tries}`;
  const rows =
    puzzle.mode === "between"
      ? state.guesses.map((guess) =>
          stripAccents(guess) === stripAccents(puzzle.answers[0])
            ? "🎯"
            : stripAccents(guess) < stripAccents(puzzle.answers[0])
              ? "⬆️"
              : "⬇️",
        )
      : state.guesses.map((guess, row) =>
          puzzle.mode === "counts"
            ? Object.values(colorCounts(guess, puzzle.answers[0]))
                .map((count, index) => `${["🟩", "🟨", "🟥"][index]}${count}`)
                .join(" ")
            : puzzle.answers
                .map((answer) =>
                  feedback(puzzle, guess, answer, row)
                    .map((mark) => EMOJI[mark])
                    .join(""),
                )
                .join(" "),
        );
  return [header, ...rows].join("\n");
}
