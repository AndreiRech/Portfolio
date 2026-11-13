"use client";
import { useMemo, useRef, useState } from "react";
import { Eye, SpellCheck } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { CLUES } from "@/features/games/crossword/data/clues";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import { useRecordDailyResult } from "@/features/games/daily/hooks/useHistory";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import {
  SIZE,
  buildCrossword,
  emptyEntries,
  isSolved,
  parseCrossword,
  wordCells,
  checkEntries,
  validateCrossword,
  type CrosswordState,
  type Direction,
  type Placed,
} from "@/features/games/crossword/model/crossword";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
const fresh = (): CrosswordState => ({
  entries: emptyEntries(),
  revealed: false,
  checks: 0,
  validated: false,
});
const at = (row: number, col: number) => row * SIZE + col;

export default function CrosswordGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const today = useToday();
  const puzzle = useMemo(
    () => (today ? buildCrossword(CLUES, today.number, 20) : null),
    [today],
  );
  const [state, setState] = useDailyProgress(
    "crossword-v2",
    today?.key ?? null,
    fresh,
    parseCrossword,
  );
  const [cursor, setCursor] = useState<{
    row: number;
    col: number;
    direction: Direction;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const input = useRef<HTMLInputElement>(null);

  // Which words pass through each cell, for highlighting and clue lookup.
  const owners = useMemo(() => {
    const map = new Map<number, Placed[]>();
    for (const word of puzzle?.words ?? [])
      for (const cell of wordCells(word)) {
        const key = at(cell.row, cell.col);
        map.set(key, [...(map.get(key) ?? []), word]);
      }
    return map;
  }, [puzzle]);

  useRecordDailyResult(
    "crossword",
    today?.key ?? null,
    state && puzzle
      ? state.revealed
        ? "lost"
        : state.validated !== false && isSolved(puzzle, state.entries)
          ? "won"
          : null
      : null,
  );

  if (!today || !puzzle || !state)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const solved = state.validated !== false && isSolved(puzzle, state.entries);
  const filled = checkEntries(puzzle, state.entries).empty === 0;
  const done = solved || state.revealed;
  const entries = state.revealed
    ? puzzle.cells.flat().map((letter) => letter ?? "")
    : state.entries;

  const activeWord = cursor
    ? (owners
        .get(at(cursor.row, cursor.col))
        ?.find((word) => word.direction === cursor.direction) ??
      owners.get(at(cursor.row, cursor.col))?.[0])
    : undefined;
  const activeCells = new Set(
    activeWord
      ? wordCells(activeWord).map((cell) => at(cell.row, cell.col))
      : [],
  );
  const numbers = new Map(
    puzzle.words.map((word) => [at(word.row, word.col), word.number]),
  );

  function select(word: Placed) {
    const firstEmpty =
      wordCells(word).find((cell) => !entries[at(cell.row, cell.col)]) ??
      wordCells(word)[0];
    setCursor({ ...firstEmpty, direction: word.direction });
    input.current?.focus({ preventScroll: true });
  }

  function clickCell(row: number, col: number) {
    const words = owners.get(at(row, col));
    if (!words) return;
    const same = cursor && cursor.row === row && cursor.col === col;
    // A second click on a crossing switches direction.
    const direction =
      same && words.length > 1
        ? cursor.direction === "across"
          ? "down"
          : "across"
        : (
            words.find((word) => word.direction === cursor?.direction) ??
            words[0]
          ).direction;
    setCursor({ row, col, direction });
    input.current?.focus({ preventScroll: true });
  }

  function moveWithin(step: 1 | -1) {
    if (!cursor || !activeWord) return;
    const cells = wordCells(activeWord);
    const index = cells.findIndex(
      (cell) => cell.row === cursor.row && cell.col === cursor.col,
    );
    const next = cells[index + step];
    if (next) setCursor({ ...next, direction: activeWord.direction });
  }

  function nextWord(step: 1 | -1) {
    if (!puzzle) return;
    const index = activeWord ? puzzle.words.indexOf(activeWord) : -1;
    const count = puzzle.words.length;
    select(puzzle.words[(index + step + count) % count]);
  }

  function arrow(dr: number, dc: number) {
    if (!cursor) return;
    const direction: Direction = dr ? "down" : "across";
    if (
      direction !== cursor.direction &&
      owners
        .get(at(cursor.row, cursor.col))
        ?.some((w) => w.direction === direction)
    )
      return setCursor({ ...cursor, direction });
    let row = cursor.row + dr;
    let col = cursor.col + dc;
    while (row >= 0 && col >= 0 && row < SIZE && col < SIZE) {
      const words = owners.get(at(row, col));
      if (words) {
        const keep = words.find((word) => word.direction === direction);
        return setCursor({
          row,
          col,
          direction: keep ? direction : words[0].direction,
        });
      }
      row += dr;
      col += dc;
    }
  }

  function write(letter: string) {
    if (!cursor || done || !state) return;
    const key = at(cursor.row, cursor.col);
    const next = [...state.entries];
    next[key] = letter;
    setState({ ...state, entries: next, validated: false });
    setFeedback(null);
    setChecked((current) => {
      if (!current.has(key)) return current;
      const copy = new Set(current);
      copy.delete(key);
      return copy;
    });
    if (letter) {
      sfx.tick();
      moveWithin(1);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const key = event.key;
    if (key === "Backspace") {
      event.preventDefault();
      if (!cursor || !state) return;
      if (state.entries[at(cursor.row, cursor.col)]) write("");
      else {
        moveWithin(-1);
        // Clears the previous letter once the cursor moved back.
        const cells = activeWord ? wordCells(activeWord) : [];
        const index = cells.findIndex(
          (cell) => cell.row === cursor.row && cell.col === cursor.col,
        );
        const previous = cells[index - 1];
        if (previous && !done) {
          const next = [...state.entries];
          next[at(previous.row, previous.col)] = "";
          setState({ ...state, entries: next, validated: false });
          setFeedback(null);
          setChecked((current) => {
            const copy = new Set(current);
            copy.delete(at(previous.row, previous.col));
            return copy;
          });
        }
      }
      return;
    }
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (moves[key]) {
      event.preventDefault();
      return arrow(...moves[key]);
    }
    if (key === "Tab") {
      event.preventDefault();
      return nextWord(event.shiftKey ? -1 : 1);
    }
    if (key === " ") {
      event.preventDefault();
      if (cursor && owners.get(at(cursor.row, cursor.col))!.length > 1)
        setCursor({
          ...cursor,
          direction: cursor.direction === "across" ? "down" : "across",
        });
    }
  }

  // Mobile keyboards send text through input events rather than keydown.
  function onInput(event: React.FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    event.currentTarget.value = "";
    const letter = value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(-1);
    if (letter) write(letter);
  }

  const across = puzzle.words.filter((word) => word.direction === "across");
  const down = puzzle.words.filter((word) => word.direction === "down");
  const clueList = (title: string, words: Placed[]) => (
    <div className="cw-clues">
      <h3>{title}</h3>
      <ol>
        {words.map((word) => (
          <li key={`${word.direction}-${word.number}`}>
            <button
              onClick={() => select(word)}
              aria-current={word === activeWord ? "true" : undefined}
              data-done={wordCells(word).every(
                (cell) => entries[at(cell.row, cell.col)],
              )}
            >
              <b>{word.number}</b>
              <span>
                {word.clue} <small>({word.answer.length})</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <article className="crossword-lab daily-lab" aria-labelledby="cw-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.cwWords} <strong>{puzzle.words.length}</strong>
        </span>
      </div>
      <h2 id="cw-title">{c.cwTitle}</h2>
      <GameHelp>
        {language === "pt"
          ? "Selecione uma pista e preencha a palavra na grade. Use as setas para navegar e Tab para trocar de pista. Conferir mostra as letras certas e erradas; revelar encerra o desafio."
          : "Select a clue and fill in the Portuguese word. Use arrows to navigate and Tab to change clues. Check marks correct and incorrect letters; revealing ends the puzzle."}
      </GameHelp>
      <PortugueseOnly />

      <div className="cw-layout">
        <div className="cw-play">
          <p
            className="cw-current"
            aria-live="polite"
            data-done={Boolean(
              activeWord &&
              wordCells(activeWord).every(
                (cell) => entries[at(cell.row, cell.col)],
              ),
            )}
          >
            {activeWord ? (
              <>
                <b>
                  {`${activeWord.number}\u00a0${
                    activeWord.direction === "across"
                      ? c.cwAcrossShort
                      : c.cwDownShort
                  }`}
                </b>
                <span>
                  {activeWord.clue} <small>({activeWord.answer.length})</small>
                </span>
              </>
            ) : (
              c.cwPick
            )}
          </p>
          <div
            className="cw-grid"
            role="grid"
            aria-label={c.cwGrid}
            style={{ "--size": SIZE } as React.CSSProperties}
          >
            {puzzle.cells.map((row, r) =>
              row.map((letter, col) => {
                const key = at(r, col);
                if (letter === null)
                  return (
                    <span
                      key={key}
                      className="cw-cell cw-empty"
                      aria-hidden="true"
                    />
                  );
                const current = cursor?.row === r && cursor.col === col;
                return (
                  <button
                    key={key}
                    role="gridcell"
                    className="cw-cell"
                    data-active={activeCells.has(key)}
                    data-cursor={current}
                    data-wrong={checked.has(key)}
                    data-revealed={state.revealed}
                    onClick={() => clickCell(r, col)}
                    aria-label={`${numbers.get(key) ? `${numbers.get(key)}, ` : ""}${entries[key] || c.cwBlank}`}
                    tabIndex={-1}
                  >
                    {numbers.get(key) ? <i>{numbers.get(key)}</i> : null}
                    {entries[key]}
                  </button>
                );
              }),
            )}
          </div>
          <input
            ref={input}
            className="cw-input"
            aria-label={c.cwType}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onKeyDown={onKeyDown}
            onInput={onInput}
            onFocus={() => {
              if (!cursor && puzzle.words[0]) select(puzzle.words[0]);
            }}
            disabled={done}
          />
          {done ? (
            <DailyFinish
              won={solved && !state.revealed}
              message={
                state.revealed
                  ? c.cwRevealed
                  : state.checks === 1
                    ? c.cwWonCheck
                    : state.checks
                      ? fill(c.cwWonChecks, { n: state.checks })
                      : c.cwWon
              }
              share={
                state.revealed
                  ? undefined
                  : fill(c.cwShare, { n: today.number, checks: state.checks })
              }
            />
          ) : (
            <div className="daily-actions">
              <button
                className={filled ? "button primary" : "memory-replay"}
                onClick={() => {
                  const { wrong, correct, empty } = checkEntries(
                    puzzle,
                    state.entries,
                  );
                  setFeedback(
                    fill(c.cwChecked, { correct, wrong: wrong.size, empty }),
                  );
                  setChecked(wrong);
                  const next = validateCrossword(puzzle, state);
                  setState(next);
                  if (wrong.size) sfx.wrong();
                  else if (next.validated) sfx.reveal(2);
                  else sfx.roundClear();
                }}
              >
                <SpellCheck size={15} aria-hidden="true" />
                {filled ? c.cwSubmit : c.cwCheck}
              </button>
              <button
                className="memory-replay daily-giveup"
                onClick={() => setState({ ...state, revealed: true })}
              >
                <Eye size={15} aria-hidden="true" />
                {c.dailyReveal}
              </button>
            </div>
          )}
          <p className="song-status" role="status" aria-live="polite">
            {feedback ?? " "}
          </p>
        </div>
        <div className="cw-lists">
          {clueList(c.cwAcross, across)}
          {clueList(c.cwDown, down)}
        </div>
      </div>
    </article>
  );
}
