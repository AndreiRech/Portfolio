"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { CornerDownLeft, Delete, LockKeyhole } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";
import words from "../data/words.json";
import GameHelp from "../../components/GameHelp";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import { useRecordDailyResult } from "@/features/games/daily/hooks/useHistory";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import { buildDictionary, stripAccents, type Mark } from "../model/termo";
import {
  CONFIG,
  betweenBounds,
  buildModePuzzle,
  colorCounts,
  cycleNote,
  feedback,
  freshMode,
  lockedLetters,
  missingLetters,
  modeShare,
  outsideInterval,
  parseMode,
  solvedBoard,
  submitMode,
  type TermoMode,
} from "../model/modes";

const DICTIONARY = buildDictionary(words.answers, words.valid);
const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
const RANK: Record<Mark, number> = { wrong: 0, place: 1, right: 2 };

export default function VariantTermoGame({
  mode,
}: {
  mode: Exclude<TermoMode, "classic">;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const reduced = useReducedMotion();
  const today = useToday();
  const puzzle = useMemo(
    () =>
      today
        ? buildModePuzzle(words.answers, DICTIONARY, mode, today.number)
        : null,
    [today, mode],
  );
  const [state, setState] = useDailyProgress(
    `termo-${mode}-v1`,
    today?.key ?? null,
    freshMode,
    (value) => (puzzle ? parseMode(value, puzzle, DICTIONARY) : null),
  );
  const [typed, setTyped] = useState<string[]>(Array(5).fill(""));
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [revealing, setRevealing] = useState<number | null>(null);
  useRecordDailyResult(
    `termo-${mode}`,
    today?.key ?? null,
    state && state.status !== "playing" ? state.status : null,
  );
  const locks = useMemo(
    () =>
      puzzle && state
        ? lockedLetters(puzzle, state)
        : Array<string>(5).fill(""),
    [puzzle, state],
  );
  const letters = locks.map((letter, index) => letter || typed[index]);
  useEffect(() => {
    if (revealing === null) return;
    const timer = setTimeout(() => setRevealing(null), reduced ? 0 : 280);
    return () => clearTimeout(timer);
  }, [revealing, reduced]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  const press = useCallback(
    (key: string) => {
      if (!puzzle || !state || state.status !== "playing" || revealing !== null)
        return;
      const editable = locks.flatMap((letter, index) =>
        !letter ? [index] : [],
      );
      if (!editable.length) return;
      const current = locks[cursor] ? editable[0] : cursor;
      if (key === "enter") {
        const word = letters.join("");
        const result = submitMode(state, word, puzzle, DICTIONARY);
        if (!result.ok) {
          sfx.wrong();
          setNotice(
            result.reason === "short"
              ? c.termoShort
              : result.reason === "unknown"
                ? c.termoUnknown
                : result.reason === "yellow"
                  ? fill(c.termoYellowError, {
                      letters: missingLetters(puzzle, state, word)
                        .map((letter) => letter.toUpperCase())
                        .join(", "),
                    })
                  : c.termoLockedError,
          );
          return;
        }
        const outside = outsideInterval(puzzle, state, word);
        setRevealing(state.guesses.length);
        setState(result.state);
        const nextLocks = lockedLetters(puzzle, result.state);
        setTyped(Array(5).fill(""));
        setCursor(
          Math.max(
            0,
            nextLocks.findIndex((letter) => !letter),
          ),
        );
        setNotice(
          outside && result.state.status === "playing"
            ? fill(c.termoRangeError, { word: word.toUpperCase() })
            : null,
        );
        if (result.state.status === "won") sfx.roundClear();
        else if (result.state.status === "lost") sfx.wrong();
        else sfx.tick();
        return;
      }
      if (key === "arrowleft" || key === "arrowright") {
        const next =
          key === "arrowleft"
            ? editable.filter((index) => index < current).at(-1)
            : editable.find((index) => index > current);
        if (next !== undefined) setCursor(next);
        return;
      }
      if (key === "backspace") {
        const index = typed[current]
          ? current
          : (editable.filter((index) => index < current).at(-1) ?? current);
        setTyped((previous) =>
          previous.map((letter, col) => (col === index ? "" : letter)),
        );
        setCursor(index);
      } else if (/^[a-zç]$/.test(key)) {
        setTyped((previous) =>
          previous.map((letter, col) =>
            col === current ? stripAccents(key) : letter,
          ),
        );
        setCursor(
          editable.find((index) => index > current && !letters[index]) ??
            editable.find((index) => index > current) ??
            current,
        );
        sfx.tick();
      }
    },
    [puzzle, state, revealing, locks, cursor, letters, typed, c, setState],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target as HTMLElement)?.closest(
          "input, textarea, select, [contenteditable]",
        )
      )
        return;
      const key = event.key.toLowerCase();
      if (
        /^[a-zç]$/.test(key) ||
        ["enter", "backspace", "arrowleft", "arrowright"].includes(key)
      ) {
        if (
          key === "enter" &&
          (event.target as HTMLElement)?.closest(
            "button:not(.termo-tile), .termo-count-row button",
          )
        )
          return;
        event.preventDefault();
        press(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  if (!today || !puzzle || !state)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );
  const done = state.status !== "playing";
  const active = done ? -1 : state.guesses.length;
  const config = CONFIG[mode];
  const label = c.termoModes[mode];
  const keys = puzzle.answers.map((answer) => {
    const marks = new Map<string, Mark>();
    if (mode === "counts" || mode === "between" || mode === "liar")
      return marks;
    state.guesses
      .slice(0, revealing === null ? undefined : revealing)
      .forEach((guess, row) => {
        feedback(puzzle, guess, answer, row).forEach((mark, index) => {
          const letter = stripAccents(guess)[index];
          if (!marks.has(letter) || RANK[mark] > RANK[marks.get(letter)!])
            marks.set(letter, mark);
        });
      });
    return marks;
  });
  const activeRow = (id: string) => (
    <div className="termo-row" data-active="true" role="row">
      {letters.map((letter, col) => (
        <button
          key={col}
          type="button"
          role="gridcell"
          className="termo-tile"
          data-filled={Boolean(letter)}
          data-cursor={cursor === col && !locks[col]}
          data-locked={Boolean(locks[col])}
          disabled={Boolean(locks[col])}
          aria-label={`${fill(c.termoSquare, { n: col + 1, letter: letter || c.cwBlank })}${locks[col] ? `, ${c.termoFixed}` : ""}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setCursor(col)}
          onFocus={() => setCursor(col)}
        >
          {letter}
          {locks[col] ? <LockKeyhole size={9} aria-hidden="true" /> : null}
        </button>
      ))}
      <span className="sr-only">{id}</span>
    </div>
  );
  const bounds = betweenBounds(puzzle, state);
  return (
    <article
      className="termo-lab daily-lab termo-variant"
      data-mode={mode}
      aria-labelledby="termo-variant-title"
    >
      <div className="play-panel-heading">
        <span className="pixel-label">
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.termoTries}{" "}
          <strong>
            {state.guesses.length}/{config.tries}
          </strong>
        </span>
      </div>
      <h2 id="termo-variant-title">{c.termoTaglines[mode]}</h2>
      <PortugueseOnly />
      <GameHelp>{c.termoRules[mode]}</GameHelp>
      {mode === "between" ? (
        <>
          <div className="termo-between" aria-label={c.termoInterval}>
            <div className="termo-between-meter" aria-hidden="true">
              <span>{bounds.lowDistance.toFixed(2)}%</span>
              <i
                style={
                  { "--position": `${bounds.position * 100}%` } as CSSProperties
                }
              />
              <span>{bounds.highDistance.toFixed(2)}%</span>
            </div>
            <div className="termo-between-words">
              <div className="termo-row termo-bound">
                {[...bounds.lower].map((letter, col) => (
                  <span className="termo-tile" key={col}>
                    {letter}
                  </span>
                ))}
              </div>
              {done ? (
                <div className="termo-row termo-bound-result">
                  {[...puzzle.answers[0]].map((letter, col) => (
                    <span
                      className="termo-tile"
                      data-mark={state.status === "won" ? "right" : "wrong"}
                      key={col}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              ) : (
                activeRow(c.termoInterval)
              )}
              <div className="termo-row termo-bound">
                {[...bounds.upper].map((letter, col) => (
                  <span className="termo-tile" key={col}>
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!done ? (
            <p className="termo-range-caption">
              {fill(c.termoRemaining, { n: bounds.remaining })}
            </p>
          ) : null}
        </>
      ) : (
        <div className="termo-multi" data-boards={config.boards}>
          {puzzle.answers.map((answer, board) => {
            const solved = solvedBoard(state, answer);
            return (
              <section
                className="termo-single-board"
                key={board}
                aria-label={`${label} ${board + 1}`}
              >
                {config.boards > 1 ? (
                  <h3>
                    {fill(c.termoBoardNumber, { n: board + 1 })}
                    {solved >= 0 ? ` · ${c.termoSolved}` : ""}
                  </h3>
                ) : null}
                <div
                  className="termo-board"
                  role="grid"
                  aria-label={`${c.termoBoard} ${board + 1}`}
                >
                  {Array.from({ length: config.tries }, (_, row) => {
                    const guess =
                      solved >= 0 && row > solved
                        ? undefined
                        : state.guesses[row];
                    if (row === active && solved < 0)
                      return (
                        <div className="termo-count-row" key={row}>
                          {activeRow(String(board + 1))}
                          {mode === "counts" ? (
                            <div className="termo-counts">
                              {(["right", "place", "wrong"] as const).map(
                                (mark) => (
                                  <span key={mark} data-mark={mark}>
                                    -
                                  </span>
                                ),
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    const marks = guess
                      ? feedback(puzzle, guess, answer, row)
                      : null;
                    const counts =
                      guess && mode === "counts"
                        ? colorCounts(guess, answer)
                        : null;
                    return (
                      <div className="termo-count-row" key={row}>
                        <div
                          role="row"
                          className="termo-row"
                          data-flip={
                            Boolean(guess) &&
                            row === revealing &&
                            !reduced &&
                            mode !== "counts"
                          }
                        >
                          {Array.from({ length: 5 }, (_, col) =>
                            mode === "counts" && guess ? (
                              <button
                                key={col}
                                role="gridcell"
                                className="termo-tile"
                                data-mark={state.notes[row]?.[col] ?? undefined}
                                onClick={() =>
                                  setState((current) =>
                                    cycleNote(current, row, col),
                                  )
                                }
                                aria-label={`${guess[col]}: ${state.notes[row]?.[col] ? c.termoMarks[state.notes[row][col]!] : c.termoUnmarked}. ${c.termoAnnotate}`}
                              >
                                {guess[col]}
                              </button>
                            ) : (
                              <span
                                key={col}
                                role="gridcell"
                                className="termo-tile"
                                data-mark={marks?.[col]}
                                data-filled={Boolean(guess)}
                                style={{ "--i": col } as CSSProperties}
                              >
                                {guess?.[col] ?? ""}
                              </span>
                            ),
                          )}
                        </div>
                        {mode === "counts" ? (
                          <div
                            className="termo-counts"
                            aria-label={c.termoColorCounts}
                          >
                            {(["right", "place", "wrong"] as const).map(
                              (mark) => (
                                <span
                                  key={mark}
                                  data-mark={mark}
                                  aria-label={`${counts?.[mark] ?? "—"} ${c.termoMarks[mark]}`}
                                >
                                  {counts?.[mark] ?? "—"}
                                </span>
                              ),
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <p className="song-status termo-notice" role="status" aria-live="polite">
        {notice ?? " "}
      </p>
      {done && revealing === null ? (
        <DailyFinish
          won={state.status === "won"}
          message={
            state.status === "won"
              ? fill(c.termoWon, { n: state.guesses.length })
              : fill(c.termoLost, {
                  word: puzzle.answers
                    .map((answer) => answer.toUpperCase())
                    .join(" · "),
                })
          }
          share={modeShare(state, puzzle, label)}
        />
      ) : (
        <div className="termo-keyboard" aria-label={c.termoKeyboard}>
          {KEYS.map((row, index) => (
            <div className="termo-keys" key={row}>
              {index === 2 ? (
                <button
                  className="termo-key termo-wide"
                  onClick={() => press("enter")}
                  aria-label={c.termoEnter}
                >
                  <CornerDownLeft size={18} />
                </button>
              ) : null}
              {[...row].map((letter) => (
                <button
                  className="termo-key"
                  key={letter}
                  onClick={() => press(letter)}
                  data-mark={
                    config.boards === 1 ? keys[0].get(letter) : undefined
                  }
                >
                  {letter}
                  {config.boards > 1 ? (
                    <span className="termo-key-hints" aria-hidden="true">
                      {keys.map((marks, board) => (
                        <i data-mark={marks.get(letter)} key={board} />
                      ))}
                    </span>
                  ) : null}
                </button>
              ))}
              {index === 1 ? (
                <button
                  className="termo-key"
                  onClick={() => press("backspace")}
                  aria-label={c.termoDelete}
                >
                  <Delete size={18} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
