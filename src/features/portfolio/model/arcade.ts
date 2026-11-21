import type {
  DailyRecord,
  HistoryGame,
  Outcome,
} from "../../games/daily/model/history.ts";

/** One daily game shown on the hero's arcade cabinet. */
export type ArcadeGame = {
  id: string;
  /** `?activity=` on the games page. */
  activity: string;
  /** `?mode=` when the game also has an endless mode. */
  mode?: "daily";
  /** History entries that count as having played it today. */
  history: readonly HistoryGame[];
  portugueseOnly: boolean;
};

export const ARCADE_GAMES: readonly ArcadeGame[] = [
  { id: "termo", activity: "termo", history: ["termo"], portugueseOnly: true },
  {
    id: "conexo",
    activity: "conexo",
    history: ["conexo"],
    portugueseOnly: true,
  },
  {
    id: "crossword",
    activity: "crossword",
    history: ["crossword"],
    portugueseOnly: true,
  },
  {
    id: "rarity",
    activity: "rarity",
    history: ["rarity"],
    portugueseOnly: true,
  },
  {
    id: "sudoku",
    activity: "sudoku",
    history: ["sudoku-easy", "sudoku-normal", "sudoku-hard"],
    portugueseOnly: false,
  },
  { id: "color", activity: "color", history: ["color"], portugueseOnly: false },
  { id: "scale", activity: "scale", history: ["scale"], portugueseOnly: false },
  {
    id: "songs",
    activity: "songs",
    mode: "daily",
    history: ["songs"],
    portugueseOnly: false,
  },
  {
    id: "higher-lower",
    activity: "higher-lower",
    mode: "daily",
    history: ["higher-lower"],
    portugueseOnly: false,
  },
];

export const arcadeGames = (language: "pt" | "en") =>
  ARCADE_GAMES.filter((game) => language === "pt" || !game.portugueseOnly);

export const arcadeHref = (game: ArcadeGame) =>
  `/games?activity=${game.activity}${game.mode ? `&mode=${game.mode}` : ""}`;

/** Today's result for a game; a win on any of its variants counts first. */
export function arcadeStatus(
  game: ArcadeGame,
  history: readonly DailyRecord[],
  today: string,
): Outcome | null {
  let status: Outcome | null = null;
  for (const record of history)
    if (record.date === today && game.history.includes(record.game)) {
      if (record.outcome === "won") return "won";
      status = "lost";
    }
  return status;
}

export function firstUnplayed(statuses: readonly (Outcome | null)[]) {
  const index = statuses.indexOf(null);
  return index === -1 ? { index: 0, allDone: true } : { index, allDone: false };
}
