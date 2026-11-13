"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import ArcadeHeading, {
  GAME_ACTIVITIES,
  type GameActivity,
} from "@/features/games/components/ArcadeHeading";

function LoadingGame() {
  const { language } = useSettings();
  return (
    <div className="game-loading" role="status">
      {playCopy[language].loading}
    </div>
  );
}
const GAMES: Record<GameActivity, React.ComponentType> = {
  memory: dynamic(() => import("../memory/components/MemoryGame"), {
    loading: LoadingGame,
  }),
  songs: dynamic(() => import("../songs/components/SongGame"), {
    loading: LoadingGame,
  }),
  "higher-lower": dynamic(
    () => import("../higher-lower/components/HigherLowerGame"),
    { loading: LoadingGame },
  ),
  duel: dynamic(() => import("../duel/components/DuelGame"), {
    loading: LoadingGame,
  }),
  termo: dynamic(() => import("../termo/components/TermoGame"), {
    loading: LoadingGame,
  }),
  conexo: dynamic(() => import("../conexo/components/ConexoGame"), {
    loading: LoadingGame,
  }),
  crossword: dynamic(() => import("../crossword/components/CrosswordGame"), {
    loading: LoadingGame,
  }),
  rarity: dynamic(() => import("../rarity/components/RarityGame"), {
    loading: LoadingGame,
  }),
  sudoku: dynamic(() => import("../sudoku/components/SudokuGame"), {
    loading: LoadingGame,
  }),
  minesweeper: dynamic(
    () => import("../minesweeper/components/MinesweeperGame"),
    { loading: LoadingGame },
  ),
  color: dynamic(() => import("../perception/components/ColorGame"), {
    loading: LoadingGame,
  }),
  scale: dynamic(() => import("../perception/components/ScaleGame"), {
    loading: LoadingGame,
  }),
  companions: dynamic(
    () => import("../../companions/components/CompanionLab"),
    { loading: LoadingGame },
  ),
};

const DailyHistory = dynamic(() => import("../daily/components/DailyHistory"));
const DAILY_ACTIVITIES = new Set<GameActivity>([
  "termo",
  "conexo",
  "crossword",
  "rarity",
  "color",
  "scale",
]);

export default function Playground() {
  const params = useSearchParams();
  const router = useRouter();
  // ASVS 2.2.1: URL input can only select a known activity.
  // Old links used "anime" for Higher or lower.
  const raw = params.get("activity");
  useEffect(() => {
    if (!raw) router.replace("/cases");
  }, [raw, router]);
  const requested = raw === "anime" ? "higher-lower" : raw;
  const activity: GameActivity =
    GAME_ACTIVITIES.find((id) => id === requested) ?? "memory";
  const Game = GAMES[activity];
  if (!raw) return <LoadingGame />;
  return (
    <section id="playground" className="playground games-page">
      <ArcadeHeading page={activity} mode={params.get("mode") ?? "classic"} />
      <div className="game-panel" key={activity}>
        <Game />
      </div>
      {DAILY_ACTIVITIES.has(activity) ? <DailyHistory /> : null}
    </section>
  );
}
