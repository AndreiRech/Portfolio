"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
  anime: dynamic(() => import("../anime/components/AnimeGame"), {
    loading: LoadingGame,
  }),
  duel: dynamic(() => import("../duel/components/DuelGame"), {
    loading: LoadingGame,
  }),
  companions: dynamic(
    () => import("../../companions/components/CompanionLab"),
    { loading: LoadingGame },
  ),
};

export default function Playground() {
  const params = useSearchParams();
  // ASVS 2.2.1: URL input can only select a known activity.
  const requested = params.get("activity");
  const activity: GameActivity =
    GAME_ACTIVITIES.find((id) => id === requested) ?? "memory";
  const Game = GAMES[activity];
  return (
    <section id="playground" className="playground games-page">
      <ArcadeHeading page={activity} />
      <div className="game-panel" key={activity}>
        <Game />
      </div>
    </section>
  );
}
