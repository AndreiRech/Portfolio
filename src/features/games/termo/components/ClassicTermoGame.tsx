"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Delete } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";
import words from "@/features/games/termo/data/words.json";
import { dailyPick } from "@/features/games/daily/model/daily";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import { useRecordDailyResult } from "@/features/games/daily/hooks/useHistory";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  buildDictionary,
  keyboardMarks,
  parseTermo,
  scoreGuess,
  shareText,
  stripAccents,
  submitGuess,
  type TermoState,
} from "@/features/games/termo/model/termo";

const DICTIONARY = buildDictionary(words.answers, words.valid);
const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
/** One tile turns after another; the verdict waits for the last one. */
const FLIP_MS = 260;
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
const fresh = (): TermoState => ({ guesses: [], status: "playing" });

export default function ClassicTermoGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const reduced = useReducedMotion();
  const today = useToday();
  const answer = today ? dailyPick(words.answers, "termo", today.number) : "";
  const [state, setState] = useDailyProgress(
    "termo-v2",
    today?.key ?? null,
    fresh,
    parseTermo,
  );
  useRecordDailyResult(
    "termo",
    today?.key ?? null,
    state && state.status !== "playing" ? state.status : null,
  );
  // Letters of the current row by position, so they can be typed in any order.
  const [typed, setTyped] = useState<string[]>(() =>
    Array(WORD_LENGTH).fill(""),
  );
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );
  // Only the row just submitted flips; reloaded rows appear already turned.
  const [revealing, setRevealing] = useState<number | null>(null);

  const keyMarks = useMemo(
    () =>
      state
        ? keyboardMarks(
            state.guesses.slice(0, revealing === null ? undefined : revealing),
            answer,
          )
        : new Map(),
    [state, answer, revealing],
  );

  useEffect(() => {
    if (revealing === null) return;
    const timer = setTimeout(
      () => setRevealing(null),
      reduced ? 0 : FLIP_MS + 20,
    );
    return () => clearTimeout(timer);
  }, [revealing, reduced]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(timer);
  }, [notice]);

  const press = useCallback(
    (key: string) => {
      if (!state || state.status !== "playing" || revealing !== null) return;
      if (key === "enter") {
        if (typed.some((letter) => !letter)) {
          sfx.wrong();
          setNotice({ id: Date.now(), text: c.termoShort });
          return;
        }
        const result = submitGuess(state, typed.join(""), answer, DICTIONARY);
        if (!result.ok) {
          if (result.reason === "done") return;
          sfx.wrong();
          setNotice({
            id: Date.now(),
            text: result.reason === "short" ? c.termoShort : c.termoUnknown,
          });
          return;
        }
        setRevealing(state.guesses.length);
        setState(result.state);
        setTyped(Array(WORD_LENGTH).fill(""));
        setCursor(0);
        const delay = reduced ? 0 : FLIP_MS;
        setTimeout(() => {
          if (result.state.status === "won") sfx.roundClear();
          else if (result.state.status === "lost") sfx.wrong();
          else sfx.tick();
        }, delay);
        return;
      }
      if (key === "arrowleft") return setCursor((at) => Math.max(0, at - 1));
      if (key === "arrowright")
        return setCursor((at) => Math.min(WORD_LENGTH - 1, at + 1));
      if (key === "backspace") {
        // Clears the square under the cursor, or the one before it if empty.
        const at = typed[cursor] ? cursor : Math.max(0, cursor - 1);
        setTyped((letters) =>
          letters.map((letter, index) => (index === at ? "" : letter)),
        );
        setCursor(at);
        return;
      }
      if (/^[a-zç]$/.test(key)) {
        sfx.tick();
        const next = typed.map((letter, index) =>
          index === cursor ? stripAccents(key) : letter,
        );
        setTyped(next);
        // Jumps to the next empty square after the cursor, if any.
        const empty = next.findIndex(
          (letter, index) => index > cursor && !letter,
        );
        setCursor(empty >= 0 ? empty : Math.min(WORD_LENGTH - 1, cursor + 1));
      }
    },
    [state, typed, cursor, answer, revealing, reduced, setState, c],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const key = event.key.toLowerCase();
      if (
        key === "enter" ||
        key === "backspace" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        /^[a-zç]$/.test(key)
      ) {
        // Enter always submits from the board or the on-screen keyboard; other
        // focused buttons (help, share) keep their own Enter behaviour.
        if (
          key === "enter" &&
          target?.closest("button") &&
          !target.closest(".termo-tile, .termo-key")
        )
          return;
        event.preventDefault();
        press(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  if (!today || !state)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const done = state.status !== "playing";
  const active = done ? -1 : state.guesses.length;
  return (
    <article className="termo-lab daily-lab" aria-labelledby="termo-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.termoTries}{" "}
          <strong>
            {state.guesses.length}/{MAX_GUESSES}
          </strong>
        </span>
      </div>
      <h2 id="termo-title">{c.termoTitle}</h2>
      <PortugueseOnly />
      <GameHelp>
        {language === "pt"
          ? "Descubra a palavra de cinco letras em seis tentativas. Verde indica a posição certa, amarelo indica outra posição e preto indica uma letra ausente. Acentos são opcionais."
          : "Find the five-letter Portuguese word in six tries. Green means the right position, yellow means another position, and black means an absent letter. Accents are optional."}
      </GameHelp>

      <div className="termo-board" role="grid" aria-label={c.termoBoard}>
        {Array.from({ length: MAX_GUESSES }, (_, row) => {
          const guess = state.guesses[row];
          const marks = guess ? scoreGuess(guess, answer) : null;
          const letters = guess ? [...guess] : row === active ? typed : [];
          return (
            <div
              // A new key restarts the shake for each rejected word.
              key={row === active && notice ? `${row}-${notice.id}` : row}
              role="row"
              className="termo-row"
              data-active={row === active}
              data-shake={row === active && Boolean(notice)}
              data-flip={row === revealing && !reduced}
              aria-label={
                guess
                  ? `${guess.toUpperCase()}: ${marks!
                      .map((mark) => c.termoMarks[mark])
                      .join(", ")}`
                  : undefined
              }
            >
              {Array.from({ length: WORD_LENGTH }, (_, col) =>
                row === active ? (
                  <button
                    key={col}
                    type="button"
                    role="gridcell"
                    className="termo-tile"
                    data-filled={Boolean(letters[col])}
                    data-cursor={col === cursor}
                    aria-label={fill(c.termoSquare, {
                      n: col + 1,
                      letter: letters[col]?.toUpperCase() || c.cwBlank,
                    })}
                    aria-current={col === cursor ? "true" : undefined}
                    // A click moves the cursor without leaving a focus ring behind.
                    onMouseDown={(event) => event.preventDefault()}
                    onFocus={() => setCursor(col)}
                    onClick={() => setCursor(col)}
                    style={{ "--i": col } as React.CSSProperties}
                  >
                    {letters[col] ?? ""}
                  </button>
                ) : (
                  <span
                    key={col}
                    role="gridcell"
                    className="termo-tile"
                    data-mark={marks?.[col]}
                    data-filled={Boolean(letters[col])}
                    style={{ "--i": col } as React.CSSProperties}
                  >
                    {letters[col] ?? ""}
                  </span>
                ),
              )}
            </div>
          );
        })}
      </div>

      <p className="song-status termo-notice" role="status" aria-live="polite">
        {notice?.text ?? " "}
      </p>

      {done && revealing === null ? (
        <DailyFinish
          won={state.status === "won"}
          message={
            state.status === "won"
              ? fill(c.termoWon, { n: state.guesses.length })
              : fill(c.termoLost, { word: answer.toUpperCase() })
          }
          share={shareText(state, answer, today.number)}
        />
      ) : (
        <div
          className="termo-keyboard"
          aria-label={c.termoKeyboard}
          // Clicked keys never keep focus, so a physical Enter can't re-press them.
          onMouseDown={(event) => event.preventDefault()}
        >
          {KEYS.map((row, index) => (
            <div key={row} className="termo-keys">
              {index === 2 ? (
                <button
                  className="termo-key termo-wide"
                  onClick={() => press("enter")}
                  aria-label={c.termoEnter}
                >
                  Enter
                </button>
              ) : null}
              {[...row].map((key) => (
                <button
                  key={key}
                  className="termo-key"
                  data-mark={keyMarks.get(key)}
                  onClick={() => press(key)}
                >
                  {key}
                </button>
              ))}
              {index === 1 ? (
                <button
                  className="termo-key"
                  onClick={() => press("backspace")}
                  aria-label={c.termoDelete}
                >
                  <Delete size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
