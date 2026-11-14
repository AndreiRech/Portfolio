"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import DailyFinish from "../../daily/components/DailyFinish";
import { useDailyProgress, useToday } from "../../daily/hooks/useDaily";
import { useRecordDailyResult } from "../../daily/hooks/useHistory";
import { gameSeed } from "../../daily/model/daily";
import { ArrowDown, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import {
  CATEGORIES,
  DAILY_HL_ROUNDS,
  DAILY_HL_TARGET,
  DECIMALS,
  LOW_QUEUE,
  dailyChain,
  dailyHLCategory,
  dailyHLResult,
  higherLowerReducer,
  hlShare,
  initialHigherLower,
  parseDailyGuesses,
  type Guess,
  type HLCategory,
  type HLItem,
} from "@/features/games/higher-lower/model/higherLower";
import {
  loadBatch,
  loadSnapshot,
} from "@/features/games/higher-lower/services/sources";

/** Time to read the revealed number before the next pair slides in. */
const REVEAL_MS = 2100;
const COUNT_MS = 700;
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Counts up to the revealed number so the answer lands with a beat. */
function useCountUp(target: number | null, decimals: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - started) / COUNT_MS, 1);
      const step = 10 ** decimals;
      setValue(Math.round(target * (1 - (1 - t) ** 3) * step) / step);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, decimals]);
  return target === null ? null : value;
}

function ItemCard({
  media,
  users,
  label,
  kind,
  children,
}: {
  media: HLItem;
  users: string;
  label: string;
  kind?: string;
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
        <small>{[kind, media.subtitle].filter(Boolean).join(" · ")}</small>
        <span className="hl-users">
          <b>{users}</b> {label}
        </span>
        {children}
      </div>
    </div>
  );
}

/**
 * Free runs by category, or the daily ten pairs (`?mode=daily`, linked from
 * the daily games strip).
 */
export default function HigherLowerGame() {
  const daily = useSearchParams().get("mode") === "daily";
  return daily ? <HigherLowerDaily /> : <HigherLowerFree />;
}

/** Category picker; each category plays its own run. */
function HigherLowerFree() {
  const { language } = useSettings();
  const c = playCopy[language];
  const [category, setCategory] = useState<HLCategory>("anime");
  return (
    <HigherLowerRun key={category} category={category}>
      <div className="level-picker" role="group" aria-label={c.hlCategory}>
        {CATEGORIES.map((id) => (
          <button
            key={id}
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {c.hlCategories[id].tab}
          </button>
        ))}
      </div>
    </HigherLowerRun>
  );
}

function HigherLowerRun({
  category,
  children,
}: {
  category: HLCategory;
  children: React.ReactNode;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const copy = c.hlCategories[category];
  const unlock = useUnlock();
  const [game, dispatch] = useReducer(higherLowerReducer, initialHigherLower);
  const [error, setError] = useState<"rate-limit" | "unavailable" | null>(null);
  const fetching = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const decimals = DECIMALS[category];
  const numbers = new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const revealed = game.phase === "reveal" || game.phase === "lost";
  const counted = useCountUp(
    revealed && game.next ? game.next.value : null,
    decimals,
  );

  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    const own = new AbortController();
    controller.current = own;
    try {
      const result = await loadBatch(category, own.signal);
      if (own.signal.aborted) return;
      if (result.ok) {
        setError(null);
        dispatch({ type: "load", media: result.media });
      } else setError(result.reason);
    } catch {
      /* Aborted on unmount. */
    } finally {
      if (controller.current === own) {
        fetching.current = false;
        controller.current = null;
      }
    }
  }, [category]);

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
        ? fill(copy.lost, {
            title: game.next.title,
            value: numbers.format(game.next.value),
            n: game.streak,
          })
        : " ";

  return (
    <article className="anime-lab" aria-labelledby="anime-title">
      <div className="play-panel-heading">
        <span className="pixel-label">{copy.label}</span>
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
      <h2 id="anime-title">{copy.title}</h2>
      <GameHelp>
        {language === "pt"
          ? "Compare o item seguinte com o valor mostrado. Escolha mais ou menos. Um erro encerra a sequência. Cada categoria mostra a métrica usada na comparação."
          : "Compare the next item with the value shown. Choose higher or lower. A wrong answer ends your streak. Each category shows the metric being compared."}
      </GameHelp>
      {children}

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
                    ? game.next.value > game.current.value
                      ? copy.hadMore
                      : copy.hadFewer
                    : ""}
              </span>
            </div>
          ) : null}
          <ItemCard
            key={`current-${game.current.id}`}
            media={game.current}
            users={numbers.format(game.current.value)}
            label={copy.unit}
            kind={game.current.kind && c.hlKinds[game.current.kind]}
          />
          <span className="hl-versus" aria-hidden="true">
            VS
          </span>
          <ItemCard
            key={`next-${game.next.id}`}
            media={game.next}
            users={revealed ? numbers.format(counted ?? 0) : "?"}
            label={copy.unit}
            kind={game.next.kind && c.hlKinds[game.next.kind]}
          >
            {game.phase === "guess" ? (
              <div
                className="hl-buttons"
                role="group"
                aria-label={fill(copy.ask, { title: game.current.title })}
              >
                <button
                  className="button primary"
                  onClick={() => {
                    sfx.pop();
                    dispatch({ type: "guess", guess: "higher" });
                  }}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                  {copy.higher}
                </button>
                <button
                  className="button"
                  onClick={() => {
                    sfx.pop();
                    dispatch({ type: "guess", guess: "lower" });
                  }}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                  {copy.lower}
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
          </ItemCard>
        </div>
      ) : (
        <div className="game-loading hl-loading" role="status">
          {error === "rate-limit"
            ? c.animeRateLimit
            : error === "unavailable"
              ? copy.unavailable
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

type DailyHLSave = { start: string; guesses: Guess[] };

/** The same chain for everyone on the same local day. */
function HigherLowerDaily() {
  const today = useToday();
  const { language } = useSettings();
  const c = playCopy[language];
  const [items, setItems] = useState<{ day: number; list: HLItem[] } | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const day = today?.number;
  useEffect(() => {
    if (!day) return;
    let live = true;
    loadSnapshot(dailyHLCategory(day))
      .then((list) => live && setItems({ day, list }))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [day]);
  const chain = useMemo(
    () =>
      items && items.day === day
        ? dailyChain(items.list, gameSeed("higher-lower", items.day))
        : null,
    [items, day],
  );
  if (!today || !chain || chain.length < 2)
    return (
      <div className="game-loading hl-loading" role="status">
        {failed || chain?.length === 1
          ? c.hlCategories[dailyHLCategory(today?.number ?? 1)].unavailable
          : c.hlLoading}
      </div>
    );
  return (
    <HigherLowerDailyRun
      key={today.key}
      day={today.number}
      date={today.key}
      chain={chain}
    />
  );
}

function HigherLowerDailyRun({
  day,
  date,
  chain,
}: {
  day: number;
  date: string;
  chain: HLItem[];
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const category = dailyHLCategory(day);
  const copy = c.hlCategories[category];
  const unlock = useUnlock();
  const decimals = DECIMALS[category];
  const numbers = new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const start = chain[0].id;
  // A refreshed snapshot changes the chain; its old guesses no longer apply.
  const [save, setSave] = useDailyProgress<DailyHLSave>(
    "higher-lower-v1",
    date,
    () => ({ start, guesses: [] }),
    (value) => {
      const saved = value as Partial<DailyHLSave> | null;
      const guesses = parseDailyGuesses(saved?.guesses);
      return saved?.start === start && guesses ? { start, guesses } : null;
    },
  );
  const [revealing, setRevealing] = useState(false);
  const guesses = save?.guesses ?? [];
  const result = dailyHLResult(chain, guesses);
  const rounds = Math.min(DAILY_HL_ROUNDS, chain.length - 1);
  const won = result.streak >= Math.min(DAILY_HL_TARGET, rounds);
  useRecordDailyResult(
    "higher-lower",
    date,
    save && result.finished ? (won ? "won" : "lost") : null,
  );
  useEffect(() => {
    if (result.streak >= 10) unlock("anime-streak");
  }, [result.streak, unlock]);
  useEffect(() => {
    if (!revealing) return;
    const timer = setTimeout(() => setRevealing(false), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [revealing, guesses.length]);

  // While a guess is revealed, and once the run ends, the last pair stays up.
  const shown =
    revealing || result.finished
      ? Math.max(guesses.length - 1, 0)
      : guesses.length;
  const current = chain[shown];
  const next = chain[shown + 1];
  const answered = shown < guesses.length;
  const right = answered && !(result.missed && shown === guesses.length - 1);
  const counted = useCountUp(answered && next ? next.value : null, decimals);

  if (!save || !current || !next)
    return (
      <div className="game-loading hl-loading" role="status">
        {c.hlLoading}
      </div>
    );

  function guess(choice: Guess) {
    if (revealing || result.finished) return;
    sfx.pop();
    const after = [...guesses, choice];
    const verdict = dailyHLResult(chain, after);
    setSave({ start, guesses: after });
    setRevealing(true);
    setTimeout(() => {
      if (verdict.missed) sfx.wrong();
      else sfx.roundClear();
    }, COUNT_MS);
  }

  return (
    <article className="anime-lab" aria-labelledby="anime-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {c.dailyLabel.replace("{n}", String(day))}
        </span>
        <span className="memory-best">
          {c.hlStreak}{" "}
          <strong key={result.streak} className="hl-streak">
            {result.streak}/{rounds}
          </strong>
        </span>
      </div>
      <h2 id="anime-title">{copy.title}</h2>
      <GameHelp>{fill(c.hlDailyIntro, { target: DAILY_HL_TARGET })}</GameHelp>
      <div
        className="hl-arena"
        data-phase={answered ? (right ? "reveal" : "lost") : "guess"}
      >
        <ItemCard
          key={`current-${current.id}`}
          media={current}
          users={numbers.format(current.value)}
          label={copy.unit}
          kind={current.kind && c.hlKinds[current.kind]}
        />
        <span className="hl-versus" aria-hidden="true">
          VS
        </span>
        <ItemCard
          key={`next-${next.id}`}
          media={next}
          users={answered ? numbers.format(counted ?? 0) : "?"}
          label={copy.unit}
          kind={next.kind && c.hlKinds[next.kind]}
        >
          {answered ? (
            <span className="hl-verdict" data-right={right}>
              {right ? (
                <Check size={22} aria-hidden="true" />
              ) : (
                <X size={22} aria-hidden="true" />
              )}
            </span>
          ) : (
            <div
              className="hl-buttons"
              role="group"
              aria-label={fill(copy.ask, { title: current.title })}
            >
              <button
                className="button primary"
                onClick={() => guess("higher")}
              >
                <ArrowUp size={17} aria-hidden="true" />
                {copy.higher}
              </button>
              <button className="button" onClick={() => guess("lower")}>
                <ArrowDown size={17} aria-hidden="true" />
                {copy.lower}
              </button>
            </div>
          )}
        </ItemCard>
      </div>
      <p className="song-status" role="status" aria-live="polite">
        {revealing && right ? c.hlRight : " "}
      </p>
      {result.finished && !revealing ? (
        <DailyFinish
          won={won}
          message={fill(c.hlDailyResult, { n: result.streak, total: rounds })}
          share={`${c.animeTab} #${day}\n${hlShare(chain, guesses)}`}
        />
      ) : null}
    </article>
  );
}
