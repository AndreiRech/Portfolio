"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import {
  LOW_QUEUE,
  higherLowerReducer,
  initialHigherLower,
  pickPages,
  shuffle,
  type AnimeMedia,
} from "@/features/games/anime/model/anime";
import { fetchAnimePage } from "@/features/games/anime/services/anilist";

/** Time to read the revealed number before the next pair slides in. */
const REVEAL_MS = 2100;
const COUNT_MS = 700;
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Counts up to the revealed popularity so the answer lands with a beat. */
function useCountUp(target: number | null) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - started) / COUNT_MS, 1);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return target === null ? null : value;
}

function AnimeCard({
  media,
  users,
  label,
  children,
}: {
  media: AnimeMedia;
  users: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="hl-card">
      {media.cover ? (
        <Image
          src={media.cover}
          width={230}
          height={325}
          alt=""
          unoptimized
          className="hl-cover"
        />
      ) : (
        <span className="hl-cover" aria-hidden="true" />
      )}
      <div className="hl-info">
        <strong>{media.title}</strong>
        <small>
          {[media.format?.replace("_", " "), media.seasonYear]
            .filter(Boolean)
            .join(" · ")}
        </small>
        <span className="hl-users">
          <b>{users}</b> {label}
        </span>
        {children}
      </div>
    </div>
  );
}

export default function AnimeGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const unlock = useUnlock();
  const [game, dispatch] = useReducer(higherLowerReducer, initialHigherLower);
  const [error, setError] = useState<"rate-limit" | "unavailable" | null>(null);
  const fetching = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const numbers = new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US");
  const revealed = game.phase === "reveal" || game.phase === "lost";
  const counted = useCountUp(
    revealed && game.next ? game.next.popularity : null,
  );

  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    const own = new AbortController();
    controller.current = own;
    try {
      const results = await Promise.all(
        pickPages().map((page) => fetchAnimePage(page, { signal: own.signal })),
      );
      if (own.signal.aborted) return;
      const failure = results.find((result) => !result.ok);
      const media = results.flatMap((result) =>
        result.ok ? result.media : [],
      );
      if (media.length) {
        setError(null);
        dispatch({ type: "load", media: shuffle(media) });
      } else if (failure && !failure.ok) setError(failure.reason);
    } catch {
      /* Aborted on unmount. */
    } finally {
      if (controller.current === own) {
        fetching.current = false;
        controller.current = null;
      }
    }
  }, []);

  useEffect(
    () => () => {
      // A remount (or Strict Mode) must be able to start a fresh load.
      controller.current?.abort();
      controller.current = null;
      fetching.current = false;
    },
    [],
  );

  // Loads the first pairs, then keeps a few anime waiting so a run never
  // stalls. The fetch starts after the effect so its state updates are async.
  useEffect(() => {
    if (game.queue.length >= LOW_QUEUE || error) return;
    queueMicrotask(() => void load());
  }, [game.queue.length, error, load]);

  useEffect(() => {
    if (game.phase !== "reveal") return;
    const timer = setTimeout(() => dispatch({ type: "advance" }), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [game.phase, game.next?.id]);

  // Once the count lands, the verdict hits: sound, pixels and a big banner.
  const arena = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<{ id: number; right: boolean } | null>(
    null,
  );
  useEffect(() => {
    if (game.phase !== "reveal" && game.phase !== "lost") return;
    const right = game.phase === "reveal";
    const timer = setTimeout(() => {
      setBanner({ id: Date.now(), right });
      if (right) sfx.roundClear();
      else sfx.wrong();
      const card = arena.current?.lastElementChild?.getBoundingClientRect();
      if (card && right)
        pixelBurst(card.left + card.width / 2, card.top + card.height / 2, {
          count: 22,
          distance: 160,
          colors: ["#8fc97f", "#c9f2b8", "#ffd36e", "var(--fg)"],
        });
    }, COUNT_MS);
    return () => {
      clearTimeout(timer);
      setBanner(null);
    };
  }, [game.phase, game.next?.id]);

  useEffect(() => {
    if (game.streak >= 10) unlock("anime-streak");
  }, [game.streak, unlock]);

  const status =
    game.phase === "reveal"
      ? c.hlRight
      : game.phase === "lost" && game.next
        ? fill(c.hlLost, {
            title: game.next.title,
            users: numbers.format(game.next.popularity),
            n: game.streak,
          })
        : " ";

  return (
    <article className="anime-lab" aria-labelledby="anime-title">
      <div className="play-panel-heading">
        <span className="pixel-label">{c.animeLabel}</span>
        <span className="memory-best">
          {c.hlStreak}{" "}
          <strong key={game.streak} className="hl-streak">
            {String(game.streak).padStart(2, "0")}
          </strong>
          <small>
            {" "}
            · {c.hlBest} {game.best}
          </small>
        </span>
      </div>
      <h2 id="anime-title">{c.animeTitle}</h2>

      {game.current && game.next ? (
        <div
          ref={arena}
          className="hl-arena"
          data-phase={game.phase}
          data-verdict={banner ? (banner.right ? "right" : "wrong") : undefined}
        >
          {banner ? (
            <div
              key={banner.id}
              className="hl-banner"
              data-right={banner.right}
              aria-hidden="true"
            >
              {banner.right ? (
                <Check size={34} aria-hidden="true" />
              ) : (
                <X size={34} aria-hidden="true" />
              )}
              <strong>
                {banner.right ? c.hlBannerRight : c.hlBannerWrong}
              </strong>
              <span>
                {banner.right
                  ? fill(c.hlStreakUp, { n: game.streak })
                  : game.next && game.current
                    ? game.next.popularity > game.current.popularity
                      ? c.hlHadMore
                      : c.hlHadFewer
                    : ""}
              </span>
            </div>
          ) : null}
          <AnimeCard
            key={`current-${game.current.id}`}
            media={game.current}
            users={numbers.format(game.current.popularity)}
            label={c.animeUsers}
          />
          <span className="hl-versus" aria-hidden="true">
            VS
          </span>
          <AnimeCard
            key={`next-${game.next.id}`}
            media={game.next}
            users={revealed ? numbers.format(counted ?? 0) : "?"}
            label={c.animeUsers}
          >
            {game.phase === "guess" ? (
              <div
                className="hl-buttons"
                role="group"
                aria-label={fill(c.hlAsk, { title: game.current.title })}
              >
                <button
                  className="button primary"
                  onClick={() => {
                    sfx.pop();
                    dispatch({ type: "guess", guess: "higher" });
                  }}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                  {c.hlHigher}
                </button>
                <button
                  className="button"
                  onClick={() => {
                    sfx.pop();
                    dispatch({ type: "guess", guess: "lower" });
                  }}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                  {c.hlLower}
                </button>
              </div>
            ) : (
              <span className="hl-verdict" data-right={game.phase === "reveal"}>
                {game.phase === "reveal" ? (
                  <Check size={22} aria-hidden="true" />
                ) : (
                  <X size={22} aria-hidden="true" />
                )}
              </span>
            )}
          </AnimeCard>
        </div>
      ) : (
        <div className="game-loading hl-loading" role="status">
          {error === "rate-limit"
            ? c.animeRateLimit
            : error === "unavailable"
              ? c.animeUnavailable
              : c.hlLoading}
          {error ? (
            <button
              className="button"
              // Clearing the error lets the refill effect fetch again.
              onClick={() => setError(null)}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {c.hlRetry}
            </button>
          ) : null}
        </div>
      )}

      <p className="song-status" role="status" aria-live="polite">
        {status}
      </p>
      {game.phase === "lost" ? (
        <div className="memory-actions">
          <button
            className="button primary"
            onClick={() => dispatch({ type: "restart" })}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {c.animeRestart}
          </button>
        </div>
      ) : null}
    </article>
  );
}
