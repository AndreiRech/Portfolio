"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { THEMES } from "@/features/games/rarity/data/themes";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import PixelRain from "./PixelRain";
import { useRecordDailyResult } from "@/features/games/daily/hooks/useHistory";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import {
  MAX_POINTS,
  THEMES_PER_DAY,
  band,
  isOver,
  shareText,
  themesFor,
  totalPoints,
  suggestAnswers,
  type Answer,
  type Theme,
} from "@/features/games/rarity/model/rarity";

import {
  ROUND_MS,
  beginRound,
  expired,
  expireRound,
  freshTimedRarity,
  parseTimedRarity,
  skipRound,
  submitTimed,
} from "../model/timed";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Ten pixel segments, lit up to the score. */
function Meter({ points }: { points: number }) {
  return (
    <span className="rarity-meter" data-band={band(points)} aria-hidden="true">
      {Array.from({ length: MAX_POINTS }, (_, index) => (
        <i
          key={index}
          data-on={index < points}
          style={{ animationDelay: `${index * 55}ms` }}
        />
      ))}
    </span>
  );
}

export default function RarityGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const today = useToday();
  const themes = useMemo(
    () => (today ? themesFor(THEMES, today.number) : []),
    [today],
  );
  const [state, setState] = useDailyProgress(
    "rarity-timed-v3",
    today?.key ?? null,
    freshTimedRarity,
    parseTimedRarity,
  );
  const [guess, setGuess] = useState("");
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );
  // The answer just given stays on screen until the visitor moves on.
  const [revealed, setRevealed] = useState<{
    theme: Theme;
    answer: Answer | null;
    timedOut?: boolean;
  } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!state?.deadline) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (expired(state, time)) {
        setRevealed({
          theme: themes[state.rounds.length],
          answer: null,
          timedOut: true,
        });
        setState((current) => expireRound(current, time));
        setGuess("");
      }
    };
    queueMicrotask(tick);
    const timer = window.setInterval(tick, 100);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [state, themes, setState]);
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  const won = Boolean(
    state &&
    isOver(state) &&
    state.rounds.every((round) => round.answer !== null),
  );
  useRecordDailyResult(
    "rarity",
    today?.key ?? null,
    state && isOver(state) ? (won ? "won" : "lost") : null,
  );

  const currentTheme =
    themes[Math.min(state?.rounds.length ?? 0, THEMES_PER_DAY - 1)];
  const suggestions = useMemo(
    () => (currentTheme ? suggestAnswers(currentTheme, guess, 1) : []),
    [currentTheme, guess],
  );

  if (!today || !state || !themes.length)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const index = state.rounds.length;
  const over = isOver(state);
  const theme = themes[Math.min(index, THEMES_PER_DAY - 1)];

  function submit() {
    if (!state) return;
    const result = submitTimed(
      state,
      themes,
      suggestions[0]?.name ?? guess,
      Date.now(),
    );
    if (!result.ok) {
      if (result.reason === "time") {
        if (expired(state, Date.now())) {
          setRevealed({
            theme: themes[state.rounds.length],
            answer: null,
            timedOut: true,
          });
          setState((current) => expireRound(current, Date.now()));
          setGuess("");
        }
        return;
      }
      if (result.reason === "unknown") {
        sfx.wrong();
        setNotice({ id: Date.now(), text: c.rarityUnknown });
      }
      return;
    }
    if (result.answer.points >= 10) sfx.reveal(3);
    else if (result.answer.points >= 7) sfx.reveal(1);
    else sfx.roundClear();
    setRevealed({ theme: themes[state.rounds.length], answer: result.answer });
    setState(result.state);
    setGuess("");
  }

  function pass() {
    if (!state || state.deadline === null) return;
    if (expired(state, Date.now())) {
      setRevealed({
        theme: themes[state.rounds.length],
        answer: null,
        timedOut: true,
      });
      setState((current) => expireRound(current, Date.now()));
      setGuess("");
      return;
    }
    sfx.tick();
    setRevealed({ theme: themes[state.rounds.length], answer: null });
    setState(skipRound(state));
    setGuess("");
  }

  function next() {
    setRevealed(null);
    setNotice(null);
    if (!over) {
      setNow(Date.now());
      setState((current) => beginRound(current, Date.now()));
    }
    queueMicrotask(() => input.current?.focus());
  }

  return (
    <article className="rarity-lab daily-lab" aria-labelledby="rarity-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.rarityPoints}{" "}
          <strong>
            {totalPoints(state)}/{THEMES_PER_DAY * MAX_POINTS}
          </strong>
        </span>
      </div>
      <h2 id="rarity-title">{c.rarityTitle}</h2>
      <GameHelp>{c.rarityTimedRules}</GameHelp>
      <PortugueseOnly />

      <ol className="rarity-track" aria-label={c.rarityProgress}>
        {themes.map((item, position) => {
          const round = state.rounds[position];
          return (
            <li
              key={item.name}
              data-current={position === index && !revealed}
              data-band={round?.answer ? band(round.points) : undefined}
              data-passed={round && !round.answer}
            >
              {round ? round.points : position + 1}
            </li>
          );
        })}
      </ol>

      {revealed ? (
        <div
          key={index}
          className="rarity-card rarity-reveal"
          data-band={revealed.answer ? band(revealed.answer.points) : undefined}
        >
          <span className="rarity-theme-label">{revealed.theme.name}</span>
          {revealed.answer ? (
            <>
              <PixelRain
                points={revealed.answer.points}
                seed={today.number * 31 + index}
              />
              <strong className="rarity-answer">{revealed.answer.name}</strong>
              <Meter points={revealed.answer.points} />
              <p role="status">
                <b>+{revealed.answer.points}</b>{" "}
                {c.rarityBands[band(revealed.answer.points)]}
              </p>
            </>
          ) : (
            <p role="status">
              {revealed.timedOut ? c.rarityTimeUp : c.rarityPassed}
            </p>
          )}
          <button className="button primary" onClick={next} autoFocus>
            {over ? c.rarityResults : c.rarityNext}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : over ? (
        <>
          <ol className="rarity-summary">
            {themes.map((item, position) => {
              const round = state.rounds[position];
              return (
                <li
                  key={item.name}
                  data-band={round.answer ? band(round.points) : undefined}
                >
                  <span>{item.name}</span>
                  <strong>{round.answer ?? c.rarityNoAnswer}</strong>
                  <b>{round.points}</b>
                </li>
              );
            })}
          </ol>
          <DailyFinish
            won={won}
            message={fill(c.rarityDone, {
              n: totalPoints(state),
              max: THEMES_PER_DAY * MAX_POINTS,
            })}
            share={shareText(state, today.number)}
          />
        </>
      ) : state.deadline === null ? (
        <div className="rarity-card rarity-start">
          <button
            className="button primary"
            onClick={() => {
              setNow(Date.now());
              setState((current) => beginRound(current, Date.now()));
            }}
          >
            {state.started ? c.rarityResume : c.rarityStart}
          </button>
        </div>
      ) : (
        <form
          className="rarity-card"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="rarity-clock">
            <div
              role="progressbar"
              aria-label={c.rarityTime}
              aria-valuemin={0}
              aria-valuemax={20}
              aria-valuenow={Math.ceil(
                Math.max(0, state.deadline - now) / 1000,
              )}
              className="rarity-clock-track"
              data-urgent={state.deadline - now < 5000}
            >
              <span
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, (state.deadline - now) / ROUND_MS))})`,
                }}
              />
            </div>
            <span aria-hidden="true">
              {Math.ceil(Math.max(0, state.deadline - now) / 1000)}s
            </span>
          </div>
          <span className="rarity-theme-label">
            {fill(c.rarityTheme, { n: index + 1, total: THEMES_PER_DAY })}
          </span>
          <strong className="rarity-theme" key={theme.name}>
            {theme.name}
          </strong>
          <label htmlFor={inputId} className="sr-only">
            {c.rarityInput}
          </label>
          <div
            className="rarity-input"
            key={notice?.id ?? "input"}
            data-shake={Boolean(notice)}
          >
            <input
              ref={input}
              id={inputId}
              value={guess}
              maxLength={100}
              onChange={(event) => setGuess(event.target.value)}
              placeholder={c.rarityPlaceholder}
              autoComplete="off"
              autoCapitalize="sentences"
              enterKeyHint="send"
              autoFocus
            />
            <button className="button primary" disabled={!guess.trim()}>
              {c.raritySubmit}
            </button>
          </div>
          {suggestions.length ? (
            <div
              className="rarity-suggestions"
              role="group"
              aria-label={c.raritySuggestions}
            >
              <span>{c.raritySuggestions}</span>
              {suggestions.map((answer) => (
                <button
                  type="button"
                  key={answer.name}
                  onClick={() => {
                    setGuess(answer.name);
                    setNotice(null);
                    input.current?.focus();
                  }}
                >
                  {answer.name}
                </button>
              ))}
            </div>
          ) : null}
          <p className="song-status" role="status" aria-live="polite">
            {notice?.text ?? " "}
          </p>
          <button
            type="button"
            className="memory-replay daily-giveup"
            onClick={pass}
          >
            <SkipForward size={15} aria-hidden="true" />
            {c.rarityPass}
          </button>
        </form>
      )}
    </article>
  );
}
