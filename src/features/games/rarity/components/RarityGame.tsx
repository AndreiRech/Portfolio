"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { THEMES } from "@/features/games/rarity/data/themes";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import {
  MAX_POINTS,
  THEMES_PER_DAY,
  answerTheme,
  band,
  initialRarity,
  isOver,
  parseRarity,
  passTheme,
  shareText,
  themesFor,
  totalPoints,
  type Answer,
  type Theme,
} from "@/features/games/rarity/model/rarity";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Ten pixel segments, lit up to the score. */
function Meter({ points }: { points: number }) {
  return (
    <span className="rarity-meter" data-band={band(points)} aria-hidden="true">
      {Array.from({ length: MAX_POINTS }, (_, index) => (
        <i key={index} data-on={index < points} />
      ))}
    </span>
  );
}

const rarest = (theme: Theme) =>
  [...theme.answers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((answer) => answer.name);

export default function RarityGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const today = useToday();
  const themes = useMemo(
    () => (today ? themesFor(THEMES, today.number) : []),
    [today],
  );
  const [state, setState] = useDailyProgress(
    "rarity",
    today?.key ?? null,
    initialRarity,
    parseRarity,
  );
  const [guess, setGuess] = useState("");
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );
  // The answer just given stays on screen until the visitor moves on.
  const [revealed, setRevealed] = useState<{
    theme: Theme;
    answer: Answer | null;
  } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

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
    const result = answerTheme(state, themes, guess);
    if (!result.ok) {
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
    if (!state) return;
    sfx.tick();
    setRevealed({ theme: themes[state.rounds.length], answer: null });
    setState(passTheme(state));
    setGuess("");
  }

  function next() {
    setRevealed(null);
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
          className="rarity-card rarity-reveal"
          data-band={revealed.answer ? band(revealed.answer.points) : undefined}
        >
          <span className="rarity-theme-label">{revealed.theme.name}</span>
          {revealed.answer ? (
            <>
              <strong className="rarity-answer">{revealed.answer.name}</strong>
              <Meter points={revealed.answer.points} />
              <p role="status">
                <b>+{revealed.answer.points}</b>{" "}
                {c.rarityBands[band(revealed.answer.points)]}
              </p>
            </>
          ) : (
            <p role="status">{c.rarityPassed}</p>
          )}
          <p className="rarity-rarest">
            {fill(c.rarityRarest, {
              list: rarest(revealed.theme).join(", "),
            })}
          </p>
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
                  <strong>{round.answer ?? c.rarityPassed}</strong>
                  <b>{round.points}</b>
                </li>
              );
            })}
          </ol>
          <DailyFinish
            won={totalPoints(state) > 0}
            message={fill(c.rarityDone, {
              n: totalPoints(state),
              max: THEMES_PER_DAY * MAX_POINTS,
            })}
            share={shareText(state, today.number)}
          />
        </>
      ) : (
        <form
          className="rarity-card"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
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
