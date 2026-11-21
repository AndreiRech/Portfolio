"use client";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import PixelFrame from "@/shared/ui/PixelFrame";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";
import {
  useToday,
  useUntilTomorrow,
} from "@/features/games/daily/hooks/useDaily";
import { useHistory } from "@/features/games/daily/hooks/useHistory";
import {
  arcadeGames,
  arcadeHref,
  arcadeStatus,
  firstUnplayed,
} from "@/features/portfolio/model/arcade";
import {
  ARCADE_PREVIEWS,
  PREVIEW_PALETTE,
} from "@/features/portfolio/data/arcadePreviews";

/** Seconds each game stays on screen while the cabinet runs its demo. */
const ATTRACT_MS = 4000;

const clock = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return [seconds / 3600, (seconds % 3600) / 60, seconds % 60]
    .map((part) => String(Math.floor(part)).padStart(2, "0"))
    .join(":");
};

/**
 * The hero's arcade cabinet: one daily game at a time on the screen, the
 * visitor's result for today, and START to play it. While idle it cycles
 * through the games like an arcade attract mode.
 */
export default function ArcadeCabinet() {
  const { copy: c, language } = useSettings();
  const play = playCopy[language];
  const reduced = useReducedMotion();
  const today = useToday();
  const history = useHistory();
  const left = useUntilTomorrow(today !== null);
  const games = useMemo(() => arcadeGames(language), [language]);
  const statuses = useMemo(
    () =>
      games.map((game) =>
        today ? arcadeStatus(game, history, today.key) : null,
      ),
    [games, history, today],
  );
  const start = firstUnplayed(statuses);
  // `null` until the visitor picks a game; until then the cabinet follows
  // the first unplayed one, so a finished game moves the screen along.
  const [picked, setPicked] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const [demo, setDemo] = useState(0);
  const index =
    ((picked ?? start.index) + demo + games.length * 4) % games.length;
  const game = games[index];
  const status = statuses[index];
  const labels: Record<string, string> = {
    termo: play.termoTab,
    conexo: play.conexoTab,
    crossword: play.cwTab,
    rarity: play.rarityTab,
    sudoku: play.sudokuTab,
    color: language === "pt" ? "Cores" : "Color",
    scale: language === "pt" ? "Escala" : "Size it up",
    songs: play.songsTab,
    "higher-lower": play.animeTab,
  };

  useEffect(() => {
    if (reduced || held || !today) return;
    const small = window.matchMedia("(max-width: 767px)");
    if (small.matches) return;
    const timer = window.setInterval(
      () => setDemo((value) => value + 1),
      ATTRACT_MS,
    );
    return () => clearInterval(timer);
  }, [reduced, held, today]);

  function move(step: number) {
    sfx.tick();
    setHeld(true);
    setPicked((index + step + games.length) % games.length);
    setDemo(0);
  }
  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }
  const statusText = !today
    ? c.arcadePressStart
    : start.allDone
      ? c.arcadeAllDone
      : status === "won"
        ? c.arcadeWon
        : status === "lost"
          ? c.arcadeLost
          : c.arcadeOpen;

  return (
    <div
      className="arcade"
      role="group"
      aria-roledescription={language === "pt" ? "fliperama" : "arcade"}
      aria-label={c.arcadeTitle}
      onKeyDown={keys}
      onPointerEnter={() => setHeld(true)}
      onFocus={() => setHeld(true)}
    >
      <div className="arcade-cabinet">
        <p className="arcade-marquee">{c.arcadeTitle}</p>
        <div className="arcade-bezel">
          <div className="arcade-screen" data-status={status ?? "open"}>
            <p className="arcade-game" aria-live={held ? "polite" : "off"}>
              <strong>{labels[game.id]}</strong>
              {today ? <span>#{today.number}</span> : null}
            </p>
            <svg
              key={game.id}
              className="arcade-preview"
              viewBox="0 0 20 12"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <PixelFrame
                rows={ARCADE_PREVIEWS[game.id]}
                palette={PREVIEW_PALETTE}
              />
            </svg>
            <p className="arcade-status">{statusText}</p>
            <ol className="arcade-dots" aria-hidden="true">
              {games.map((item, dot) => (
                <li
                  key={item.id}
                  data-current={dot === index}
                  data-status={statuses[dot] ?? "open"}
                />
              ))}
            </ol>
            <p className="arcade-blink" aria-hidden="true">
              {c.arcadeInsertCoin}
            </p>
          </div>
        </div>
        <div className="arcade-panel">
          <div className="arcade-stick">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={c.arcadePrevious}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="arcade-knob" aria-hidden="true" />
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={c.arcadeNext}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <Link
            href={arcadeHref(game)}
            className="arcade-start"
            aria-label={`${c.arcadePlay} ${labels[game.id]}`}
          >
            {c.arcadeStart}
          </Link>
        </div>
        <div className="arcade-base">
          <Link
            href={arcadeHref(game)}
            className="arcade-coin"
            onClick={() => sfx.coin()}
            aria-label={`${c.arcadeCoin}: ${c.arcadePlay} ${labels[game.id]}`}
          >
            <span aria-hidden="true" />
          </Link>
          {today ? (
            <p className="arcade-refresh">
              {c.arcadeRefresh} <time>{clock(left)}</time>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
