/**
 * Raridade: five themes a day. For each theme the visitor names one answer;
 * a listed answer scores its rarity, from 1 (the one everyone says) to 10
 * (the one almost nobody remembers). An unlisted answer can be retried; a
 * passed theme scores zero.
 */
import { gameSeed, seededRandom, shuffled } from "../../daily/model/daily.ts";

export const THEMES_PER_DAY = 5;
export const MAX_POINTS = 10;

export type Answer = { name: string; keys: string[]; points: number };
export type Theme = { name: string; answers: Answer[] };

/** Case, accents, spaces and punctuation do not matter; + and # do (C++, C#). */
export const answerKey = (value: string) =>
  value
    .replace(/♀/g, " f ")
    .replace(/♂/g, " m ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

/** "Theme | a:1, b|b2:5" lines → themes. */
export function parseBank(bank: string): Theme[] {
  return bank
    .trim()
    .split("\n")
    .map((line) => {
      const split = line.indexOf(" | ");
      const name = line.slice(0, split).trim();
      const answers = line
        .slice(split + 3)
        .split(", ")
        .map((entry) => {
          const colon = entry.lastIndexOf(":");
          const spellings = entry
            .slice(0, colon)
            .split("|")
            .map((item) => item.trim());
          return {
            name: spellings[0],
            keys: [...new Set(spellings.map(answerKey))],
            points: Number(entry.slice(colon + 1)),
          };
        });
      return { name, answers };
    });
}

/** At most one edit apart: a typo, a missing or an extra letter. */
function oneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * The listed answer a guess names: exact first, then without a plural "s",
 * then (for words of six letters or more) one typo away.
 */
export function findAnswer(theme: Theme, guess: string): Answer | null {
  const key = answerKey(guess);
  if (!key || guess.length > 100) return null;
  const exact = (candidate: string) =>
    theme.answers.find((answer) => answer.keys.includes(candidate));
  const found =
    exact(key) ??
    (key.endsWith("s") ? exact(key.slice(0, -1)) : undefined) ??
    (key.length >= 6
      ? theme.answers.find((answer) =>
          answer.keys.some((item) => item.length >= 6 && oneEdit(item, key)),
        )
      : undefined);
  return found ?? null;
}

/** Edit distance for short, bounded answer keys, including swapped letters. */
function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array<number>(b.length).fill(0),
  ]);
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
    }
  return rows[a.length][b.length];
}

/** Suggestions never submit an answer or reveal its score. */
export function suggestAnswers(
  theme: Theme,
  guess: string,
  limit = 1,
): Answer[] {
  if (guess.length > 100) return [];
  const key = answerKey(guess);
  if (
    key.length < 3 ||
    theme.answers.some((answer) => answer.keys.includes(key))
  )
    return [];
  const candidates = theme.answers.flatMap((answer) => {
    let rank = Infinity;
    for (const spelling of answer.keys) {
      if (spelling.startsWith(key))
        rank = Math.min(rank, 0.5 + (spelling.length - key.length) / 100);
      else if (key.length >= 4 && Math.abs(spelling.length - key.length) <= 2) {
        const distance = editDistance(key, spelling);
        if (distance <= (key.length >= 8 ? 2 : 1))
          rank = Math.min(rank, distance);
      }
    }
    return Number.isFinite(rank) ? [{ answer, rank }] : [];
  });
  return candidates
    .sort(
      (a, b) =>
        a.rank - b.rank || a.answer.name.localeCompare(b.answer.name, "pt-BR"),
    )
    .slice(0, Math.max(0, Math.min(limit, 1)))
    .map(({ answer }) => answer);
}

/**
 * Today's five themes: consecutive slices of a seeded order of the bank, so
 * a theme returns only after the others had their turn.
 */
export function themesFor(bank: readonly Theme[], day: number): Theme[] {
  const perCycle = Math.floor(bank.length / THEMES_PER_DAY);
  const cycle = Math.floor((day - 1) / perCycle);
  const order = shuffled(bank, seededRandom(gameSeed("rarity", cycle)));
  const start = ((day - 1) % perCycle) * THEMES_PER_DAY;
  return order.slice(start, start + THEMES_PER_DAY);
}

export type Round = { answer: string | null; points: number };
export type RarityState = { rounds: Round[] };

export const initialRarity = (): RarityState => ({ rounds: [] });
export const isOver = (state: RarityState) =>
  state.rounds.length >= THEMES_PER_DAY;
export const totalPoints = (state: RarityState) =>
  state.rounds.reduce((sum, round) => sum + round.points, 0);

export type RarityResult =
  | { ok: true; state: RarityState; answer: Answer }
  | { ok: false; reason: "unknown" | "done" };

export function answerTheme(
  state: RarityState,
  themes: readonly Theme[],
  guess: string,
): RarityResult {
  if (isOver(state)) return { ok: false, reason: "done" };
  const answer = findAnswer(themes[state.rounds.length], guess);
  if (!answer) return { ok: false, reason: "unknown" };
  return {
    ok: true,
    answer,
    state: {
      rounds: [...state.rounds, { answer: answer.name, points: answer.points }],
    },
  };
}

export const passTheme = (state: RarityState): RarityState =>
  isOver(state)
    ? state
    : { rounds: [...state.rounds, { answer: null, points: 0 }] };

/** Rarity names for the score bands. */
export type Band = "common" | "uncommon" | "rare" | "legendary";
export const band = (points: number): Band =>
  points >= 10
    ? "legendary"
    : points >= 7
      ? "rare"
      : points >= 4
        ? "uncommon"
        : "common";

const EMOJI: Record<Band, string> = {
  common: "⬜",
  uncommon: "🟩",
  rare: "🟦",
  legendary: "🟪",
};

export function shareText(state: RarityState, day: number): string {
  const rows = state.rounds.map((round) =>
    round.answer ? `${EMOJI[band(round.points)]} ${round.points}` : "⬛ 0",
  );
  return [
    `Raridade #${day} · ${totalPoints(state)}/${THEMES_PER_DAY * MAX_POINTS}`,
    rows.join("  "),
  ].join("\n");
}

export function parseRarity(value: unknown): RarityState | null {
  if (!value || typeof value !== "object") return null;
  const { rounds } = value as Partial<RarityState>;
  if (
    !Array.isArray(rounds) ||
    rounds.length > THEMES_PER_DAY ||
    !rounds.every(
      (round) =>
        round &&
        (round.answer === null || typeof round.answer === "string") &&
        Number.isInteger(round.points) &&
        round.points >= 0 &&
        round.points <= MAX_POINTS,
    )
  )
    return null;
  return { rounds };
}
