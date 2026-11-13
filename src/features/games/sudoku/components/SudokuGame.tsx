"use client";
import { useEffect, useMemo, useState } from "react";
import { Eraser, Eye, Pencil, Lightbulb } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { useDailyProgress } from "@/features/games/daily/hooks/useDaily";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import GameHelp from "../../components/GameHelp";
import GameTimes from "../../records/components/GameTimes";
import { advanceClock } from "../../records/model/records";
import {
  LEVELS,
  PEERS,
  MAX_MISTAKES,
  MAX_HINTS,
  enterDigit,
  takeHint,
  sudokuOver,
  buildSudoku,
  conflicts,
  emptySudokuDay,
  isComplete,
  parseSudokuDay,
  type SudokuLevel,
  type SudokuState,
} from "@/features/games/sudoku/model/sudoku";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export default function SudokuGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const unlock = useUnlock();
  const [session, setSession] = useDailyProgress(
    "sudoku-infinite-v1",
    "current",
    () => ({ seed: Date.now() % 2147483647, boards: emptySudokuDay() }),
    (value) => {
      // ASVS V2.2: validate persisted seed and all boards before using them.
      if (
        !value ||
        typeof value !== "object" ||
        !("seed" in value) ||
        !("boards" in value) ||
        !Number.isSafeInteger(value.seed) ||
        Number(value.seed) < 0
      )
        return null;
      const boards = parseSudokuDay(value.boards);
      return boards ? { seed: Number(value.seed), boards } : null;
    },
  );
  const days = session?.boards;
  const setDays = (
    change: (
      current: ReturnType<typeof emptySudokuDay>,
    ) => ReturnType<typeof emptySudokuDay>,
  ) =>
    setSession((current) => ({ ...current, boards: change(current.boards) }));
  const nextGame = () => {
    setSession((current) => ({
      seed: current.seed + 1,
      boards: emptySudokuDay(),
    }));
    setSelected(null);
  };
  const [level, setLevel] = useState<SudokuLevel>("normal");
  const seed = session?.seed;
  const sudoku = useMemo(
    () => (seed !== undefined ? buildSudoku(seed, level) : null),
    [seed, level],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [pencil, setPencil] = useState(false);

  const state = days?.[level];
  const grid = useMemo(() => {
    if (!sudoku || !state) return null;
    if (state.revealed) return sudoku.solution;
    return sudoku.puzzle.map((given, index) => given || state.entries[index]);
  }, [sudoku, state]);
  const done = Boolean(sudoku && state && sudokuOver(sudoku, state));
  const won = Boolean(
    grid &&
    sudoku &&
    state &&
    !state.revealed &&
    state.mistakes < MAX_MISTAKES &&
    isComplete(grid, sudoku.solution),
  );
  const clean =
    won &&
    level === "hard" &&
    state?.mistakes === 0 &&
    state?.hints.length === 0;
  useEffect(() => {
    if (won) unlock("sudoku-solved");
    if (clean) unlock("sudoku-clean");
  }, [won, clean, unlock]);

  const update = (change: (current: SudokuState) => SudokuState) => {
    const now = Date.now();
    setDays((current) => {
      const next = change(current[level]);
      if (next === current[level] || !sudoku) return current;
      return {
        ...current,
        [level]: {
          ...next,
          clock: advanceClock(
            current[level].clock,
            now,
            sudokuOver(sudoku, next),
          ),
        },
      };
    });
  };

  function enter(digit: number) {
    if (selected === null || !sudoku || !grid || done) return;
    if (sudoku.puzzle[selected]) return;
    if (!state) return;
    const next = enterDigit(sudoku, state, selected, digit, pencil);
    if (next === state) return;
    if (next.mistakes > state.mistakes) sfx.wrong();
    else if (
      isComplete(
        sudoku.puzzle.map((given, index) => given || next.entries[index]),
        sudoku.solution,
      )
    )
      sfx.reveal(2);
    else sfx.tick();
    update((current) => enterDigit(sudoku, current, selected, digit, pencil));
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (selected === null) return;
      const moves: Record<string, number> = {
        ArrowUp: -9,
        ArrowDown: 9,
        ArrowLeft: -1,
        ArrowRight: 1,
      };
      if (moves[event.key] !== undefined) {
        event.preventDefault();
        const next = selected + moves[event.key];
        const sameRow =
          Math.abs(moves[event.key]) === 9 ||
          Math.floor(next / 9) === Math.floor(selected / 9);
        if (next >= 0 && next < 81 && sameRow) setSelected(next);
      } else if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        enter(Number(event.key));
      } else if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        event.preventDefault();
        enter(0);
      } else if (event.key.toLowerCase() === "n") {
        setPencil((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!sudoku || !state || !grid)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const clash = conflicts(grid);
  const focusDigit = selected !== null ? grid[selected] : 0;
  const peers = new Set(selected !== null ? PEERS[selected] : []);
  const left = grid.filter((digit) => !digit).length;

  return (
    <article className="sudoku-lab daily-lab" aria-labelledby="sudoku-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {language === "pt" ? "Jogo infinito" : "Unlimited play"}
        </span>
        <span className="memory-best">
          {c.sudokuLeft} <strong>{String(left).padStart(2, "0")}</strong>
        </span>
      </div>
      <h2 id="sudoku-title">{c.sudokuTab}</h2>
      <GameHelp>
        {language === "pt"
          ? "Complete linhas, colunas e blocos com os números de 1 a 9. Cada partida tem três vidas e três dicas. Comece outra partida quando quiser."
          : "Fill each row, column and box with digits 1 to 9. Each game has three lives and three hints. Start a new game anytime."}
      </GameHelp>
      <div className="level-picker" role="group" aria-label={c.level}>
        {LEVELS.map((id) => (
          <button
            key={id}
            aria-pressed={level === id}
            onClick={() => {
              setLevel(id);
              setSelected(null);
            }}
          >
            {c.levels[id]}
          </button>
        ))}
      </div>

      <GameTimes game="sudoku" level={level} clock={state.clock} won={won} />
      <div className="sudoku-toolbar">
        <p className="sudoku-resources" role="status" aria-live="polite">
          {fill(c.sudokuLives, { n: MAX_MISTAKES - state.mistakes })} ·{" "}
          {fill(c.sudokuHints, { n: MAX_HINTS - state.hints.length })}
        </p>
        <button className="memory-replay" onClick={nextGame}>
          {language === "pt" ? "Nova partida" : "New game"}
        </button>
      </div>
      <div className="sudoku-grid" role="grid" aria-label={c.sudokuGrid}>
        {grid.map((digit, index) => {
          const given = Boolean(sudoku.puzzle[index]);
          const notes = state.notes[index];
          return (
            <button
              key={index}
              role="gridcell"
              className="sudoku-cell"
              data-given={given || state.hints.includes(index)}
              data-selected={index === selected}
              data-peer={peers.has(index)}
              data-same={Boolean(digit) && digit === focusDigit}
              data-clash={
                !given &&
                Boolean(digit) &&
                (clash.has(index) || digit !== sudoku.solution[index])
              }
              onClick={() => setSelected(index)}
              aria-label={fill(c.sudokuCell, {
                row: Math.floor(index / 9) + 1,
                col: (index % 9) + 1,
                value: digit || c.cwBlank,
              })}
            >
              {digit ? (
                digit
              ) : notes ? (
                <span className="sudoku-notes" aria-hidden="true">
                  {Array.from({ length: 9 }, (_, n) => (
                    <i key={n}>{notes & (1 << n) ? n + 1 : ""}</i>
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {done ? (
        <p role="status">
          {state.mistakes >= MAX_MISTAKES
            ? c.sudokuLost
            : state.revealed
              ? c.sudokuRevealed
              : fill(c.sudokuWon, { level: c.levels[level] })}
        </p>
      ) : (
        <>
          <div className="sudoku-pad" role="group" aria-label={c.sudokuPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => enter(digit)}
                disabled={grid.filter((value) => value === digit).length >= 9}
              >
                {digit}
              </button>
            ))}
          </div>
          <div className="daily-actions">
            <button
              className="memory-replay"
              disabled={state.hints.length >= MAX_HINTS}
              onClick={() => {
                update((current) => takeHint(sudoku, current, selected));
                sfx.roundClear();
              }}
            >
              <Lightbulb size={15} aria-hidden="true" />
              {c.sudokuHint} ({MAX_HINTS - state.hints.length})
            </button>
            <button
              className="memory-replay"
              aria-pressed={pencil}
              onClick={() => setPencil((current) => !current)}
            >
              <Pencil size={15} aria-hidden="true" />
              {pencil ? c.sudokuNotesOn : c.sudokuNotesOff}
            </button>
            <button className="memory-replay" onClick={() => enter(0)}>
              <Eraser size={15} aria-hidden="true" />
              {c.sudokuErase}
            </button>
            <button
              className="memory-replay daily-giveup"
              onClick={() =>
                update((current) => ({ ...current, revealed: true }))
              }
            >
              <Eye size={15} aria-hidden="true" />
              {c.dailyReveal}
            </button>
          </div>
          <p className="memory-keyboard">{c.sudokuKeys}</p>
        </>
      )}
    </article>
  );
}
