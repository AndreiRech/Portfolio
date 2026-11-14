/** Permanent daily outcomes, separate from the disposable puzzle progress. */
export const HISTORY_GAMES = [
  "termo",
  "termo-dueto",
  "termo-quarteto",
  "termo-counts",
  "termo-locked",
  "termo-between",
  "termo-liar",
  "conexo",
  "crossword",
  "rarity",
  "color",
  "scale",
  "songs",
  "higher-lower",
  "sudoku-easy",
  "sudoku-normal",
  "sudoku-hard",
] as const;
export type HistoryGame = (typeof HISTORY_GAMES)[number];
export type Outcome = "won" | "lost";
export type DailyRecord = { date: string; game: HistoryGame; outcome: Outcome };
export type History = DailyRecord[];
export const MAX_RECORDS = 50000;

export function validDate(date: unknown): date is string {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

/** ASVS 2.2: saved data is untrusted; validate dates, games and outcomes. */
export function parseHistory(value: unknown): History | null {
  if (!Array.isArray(value) || value.length > MAX_RECORDS) return null;
  const seen = new Set<string>();
  const records: History = [];
  for (const record of value) {
    if (
      !record ||
      typeof record !== "object" ||
      !validDate(record.date) ||
      !HISTORY_GAMES.includes(record.game) ||
      (record.outcome !== "won" && record.outcome !== "lost")
    )
      return null;
    const key = `${record.date}:${record.game}`;
    if (seen.has(key)) return null;
    seen.add(key);
    records.push({
      date: record.date,
      game: record.game,
      outcome: record.outcome,
    });
  }
  return records;
}

/** First final result wins. Remounts, reloads and repeated clicks are idempotent. */
export function addRecord(history: History, record: DailyRecord): History {
  if (
    !parseHistory([record]) ||
    history.some(
      (item) => item.date === record.date && item.game === record.game,
    )
  )
    return history;
  return [...history, record]
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.game.localeCompare(b.game),
    )
    .slice(-MAX_RECORDS);
}

export function gameStats(history: History, game: HistoryGame) {
  const played = history.filter((record) => record.game === game);
  const wins = played.filter((record) => record.outcome === "won").length;
  return {
    completed: played.length,
    wins,
    winRate: played.length ? Math.round((wins / played.length) * 100) : null,
  };
}

export function dayResults(history: History, date: string) {
  const records = history.filter((record) => record.date === date);
  const result = (game: string): Outcome | null => {
    const matches = records.filter((record) =>
      game === "sudoku"
        ? record.game.startsWith("sudoku-")
        : game === "termo"
          ? record.game === "termo" || record.game.startsWith("termo-")
          : record.game === game,
    );
    return matches.some((record) => record.outcome === "won")
      ? "won"
      : matches.length
        ? "lost"
        : null;
  };
  return DAILY_GAMES.map(result);
}

export const DAILY_GAMES = [
  "termo",
  "conexo",
  "crossword",
  "rarity",
  "color",
  "scale",
] as const;
export function completedDays(history: History): number {
  return [...new Set(history.map((record) => record.date))].filter((date) =>
    dayResults(history, date).every(Boolean),
  ).length;
}
