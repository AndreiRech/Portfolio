/**
 * Termo: guess the day's five-letter Portuguese word in six tries. Accents
 * are optional when typing; the game fills them in from the word list.
 */
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type Mark = "right" | "place" | "wrong";
export type TermoState = {
  guesses: string[];
  status: "playing" | "won" | "lost";
};

export const stripAccents = (word: string) =>
  word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Green for the right letter in the right place, yellow for a letter that is
 * elsewhere. Repeated letters only score as many times as the answer has
 * them, greens first.
 */
export function scoreGuess(guess: string, answer: string): Mark[] {
  const g = [...stripAccents(guess)];
  const a = [...stripAccents(answer)];
  const marks: Mark[] = g.map((letter, index) =>
    letter === a[index] ? "right" : "wrong",
  );
  const left = new Map<string, number>();
  a.forEach((letter, index) => {
    if (marks[index] !== "right") left.set(letter, (left.get(letter) ?? 0) + 1);
  });
  g.forEach((letter, index) => {
    if (marks[index] === "right") return;
    const count = left.get(letter) ?? 0;
    if (count > 0) {
      marks[index] = "place";
      left.set(letter, count - 1);
    }
  });
  return marks;
}

/** Unaccented key → spelling shown in the tiles. */
export function buildDictionary(...lists: readonly string[][]) {
  const dictionary = new Map<string, string>();
  for (const list of lists)
    for (const word of list) {
      const key = stripAccents(word);
      if (!dictionary.has(key)) dictionary.set(key, word);
    }
  return dictionary;
}

export type GuessResult =
  | { ok: true; state: TermoState }
  | { ok: false; reason: "short" | "unknown" | "done" };

export function submitGuess(
  state: TermoState,
  typed: string,
  answer: string,
  dictionary: ReadonlyMap<string, string>,
): GuessResult {
  if (state.status !== "playing") return { ok: false, reason: "done" };
  const key = stripAccents(typed);
  if (key.length !== WORD_LENGTH) return { ok: false, reason: "short" };
  const word = key === stripAccents(answer) ? answer : dictionary.get(key);
  if (!word) return { ok: false, reason: "unknown" };
  const guesses = [...state.guesses, word];
  const status =
    key === stripAccents(answer)
      ? "won"
      : guesses.length >= MAX_GUESSES
        ? "lost"
        : "playing";
  return { ok: true, state: { guesses, status } };
}

const RANK: Record<Mark, number> = { wrong: 0, place: 1, right: 2 };

/** Best mark seen for each letter, to colour the on-screen keyboard. */
export function keyboardMarks(
  guesses: readonly string[],
  answer: string,
): Map<string, Mark> {
  const keys = new Map<string, Mark>();
  for (const guess of guesses) {
    const marks = scoreGuess(guess, answer);
    [...stripAccents(guess)].forEach((letter, index) => {
      const known = keys.get(letter);
      if (!known || RANK[marks[index]] > RANK[known])
        keys.set(letter, marks[index]);
    });
  }
  return keys;
}

const EMOJI: Record<Mark, string> = { right: "🟩", place: "🟨", wrong: "⬛" };

/** Spoiler-free summary to paste elsewhere. */
export function shareText(
  state: TermoState,
  answer: string,
  day: number,
): string {
  const score = state.status === "won" ? state.guesses.length : "X";
  const rows = state.guesses.map((guess) =>
    scoreGuess(guess, answer)
      .map((mark) => EMOJI[mark])
      .join(""),
  );
  return [`Termo #${day} ${score}/${MAX_GUESSES}`, ...rows].join("\n");
}

export function parseTermo(value: unknown): TermoState | null {
  if (!value || typeof value !== "object") return null;
  const { guesses, status } = value as Partial<TermoState>;
  if (
    !Array.isArray(guesses) ||
    guesses.length > MAX_GUESSES ||
    !guesses.every(
      (guess) =>
        typeof guess === "string" && stripAccents(guess).length === WORD_LENGTH,
    ) ||
    (status !== "playing" && status !== "won" && status !== "lost")
  )
    return null;
  return { guesses, status };
}
