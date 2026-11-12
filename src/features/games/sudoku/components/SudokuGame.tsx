"use client";
import { useEffect, useMemo, useState } from "react";
import { Eraser, Eye, Pencil } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import {
  LEVELS,
  PEERS,
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
  const today = useToday();
  const [level, setLevel] = useState<SudokuLevel>("normal");
  const sudoku = useMemo(
    () => (today ? buildSudoku(today.number, level) : null),
    [today, level],
  );
  const [days, setDays] = useDailyProgress(
    "sudoku",
    today?.key ?? null,
    emptySudokuDay,
    parseSudokuDay,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [pencil, setPencil] = useState(false);

  const state = days?.[level];
  const grid = useMemo(() => {
    if (!sudoku || !state) return null;
    if (state.revealed) return sudoku.solution;
    return sudoku.puzzle.map((given, index) => given || state.entries[index]);
  }, [sudoku, state]);
  const solved = Boolean(grid && sudoku && isComplete(grid, sudoku.solution));
  const done = solved || Boolean(state?.revealed);

  const update = (change: (current: SudokuState) => SudokuState) =>
    setDays((current) => ({ ...current, [level]: change(current[level]) }));

  function enter(digit: number) {
    if (selected === null || !sudoku || !grid || done) return;
    if (sudoku.puzzle[selected]) return;
    if (pencil && digit) {
      sfx.tick();
      return update((current) => {
        const notes = [...current.notes];
        notes[selected] ^= 1 << (digit - 1);
        return { ...current, notes };
      });
    }
    const entries = [...(state?.entries ?? [])];
    entries[selected] = entries[selected] === digit ? 0 : digit;
    const next = sudoku.puzzle.map((given, index) => given || entries[index]);
    if (isComplete(next, sudoku.solution)) sfx.reveal(2);
    else if (digit && conflicts(next).has(selected)) sfx.wrong();
    else sfx.tick();
    update((current) => {
      const notes = [...current.notes];
      notes[selected] = 0;
      // A placed digit clears it from the pencil marks of its peers.
      if (entries[selected])
        for (const peer of PEERS[selected])
          notes[peer] &= ~(1 << (entries[selected] - 1));
      return { ...current, entries, notes };
    });
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

  if (!today || !sudoku || !state || !grid)
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
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.sudokuLeft} <strong>{String(left).padStart(2, "0")}</strong>
        </span>
      </div>
      <h2 id="sudoku-title">{c.sudokuTitle}</h2>
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

      <div className="sudoku-grid" role="grid" aria-label={c.sudokuGrid}>
        {grid.map((digit, index) => {
          const given = Boolean(sudoku.puzzle[index]);
          const notes = state.notes[index];
          return (
            <button
              key={index}
              role="gridcell"
              className="sudoku-cell"
              data-given={given}
              data-selected={index === selected}
              data-peer={peers.has(index)}
              data-same={Boolean(digit) && digit === focusDigit}
              data-clash={clash.has(index) && !given}
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
        <DailyFinish
          won={solved && !state.revealed}
          message={
            state.revealed
              ? c.sudokuRevealed
              : fill(c.sudokuWon, { level: c.levels[level] })
          }
          share={
            state.revealed
              ? undefined
              : fill(c.sudokuShare, { n: today.number, level: c.levels[level] })
          }
        />
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
