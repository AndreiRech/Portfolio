"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, Shuffle } from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { sfx } from "@/shared/lib/sfx";
import { GROUPS } from "@/features/games/conexo/data/groups";
import { shuffled } from "@/features/games/daily/model/daily";
import {
  useDailyProgress,
  useToday,
} from "@/features/games/daily/hooks/useDaily";
import { useRecordDailyResult } from "@/features/games/daily/hooks/useHistory";
import DailyFinish from "@/features/games/daily/components/DailyFinish";
import PortugueseOnly from "@/features/games/daily/components/PortugueseOnly";
import {
  GROUP_SIZE,
  buildPuzzle,
  giveUp,
  guessGroup,
  initialConexo,
  isFinished,
  matchPuzzle,
  parseConexo,
  shareText,
} from "@/features/games/conexo/model/conexo";

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export default function ConexoGame() {
  const { language } = useSettings();
  const c = playCopy[language];
  const today = useToday();
  const puzzle = useMemo(
    () => (today ? buildPuzzle(GROUPS, today.number) : null),
    [today],
  );
  const [state, setState] = useDailyProgress(
    "conexo",
    today?.key ?? null,
    initialConexo,
    // Read once the day is known, so the puzzle is built by then.
    (value) => (puzzle ? matchPuzzle(parseConexo(value), puzzle) : null),
  );
  useRecordDailyResult(
    "conexo",
    today?.key ?? null,
    state && isFinished(state) ? (state.gaveUp ? "lost" : "won") : null,
  );
  const [selected, setSelected] = useState<string[]>([]);
  // Shuffling only rearranges the board for this visit.
  const [order, setOrder] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );
  const [justSolved, setJustSolved] = useState<number | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!today || !puzzle || !state)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  const done = isFinished(state);
  const solvedWords = new Set(
    state.solved.flatMap((index) => puzzle.groups[index].words),
  );
  const board = (order ?? puzzle.order).filter(
    (word) => !solvedWords.has(word),
  );

  function toggle(word: string) {
    sfx.tick();
    setSelected((current) =>
      current.includes(word)
        ? current.filter((item) => item !== word)
        : current.length < GROUP_SIZE
          ? [...current, word]
          : current,
    );
  }

  function submit() {
    if (!state || !puzzle) return;
    const result = guessGroup(state, puzzle, selected);
    if (result.verdict === "invalid") return;
    if (result.verdict === "repeat") {
      setNotice({ id: Date.now(), text: c.conexoRepeat });
      return;
    }
    setState(result.state);
    if (result.verdict === "solved") {
      setJustSolved(result.state.solved.at(-1) ?? null);
      setSelected([]);
      if (isFinished(result.state)) sfx.reveal(2);
      else sfx.roundClear();
      return;
    }
    sfx.wrong();
    setNotice({
      id: Date.now(),
      text: result.verdict === "one-away" ? c.conexoOneAway : c.conexoWrong,
    });
  }

  return (
    <article className="conexo-lab daily-lab" aria-labelledby="conexo-title">
      <div className="play-panel-heading">
        <span className="pixel-label">
          {fill(c.dailyLabel, { n: today.number })}
        </span>
        <span className="memory-best">
          {c.conexoAttempts} <strong>{state.attempts.length}</strong>
        </span>
      </div>
      <h2 id="conexo-title">{c.conexoTitle}</h2>
      <GameHelp>
        {language === "pt"
          ? "Encontre quatro grupos de quatro palavras relacionadas. Selecione quatro palavras e confirme. Você pode embaralhar as palavras ou revelar a resposta."
          : "Find four groups of four related Portuguese words. Select four words and confirm. You can shuffle the board or reveal the answer."}
      </GameHelp>
      <PortugueseOnly />

      <div className="conexo-board">
        {state.solved.map((index) => {
          const group = puzzle.groups[index];
          return (
            <div
              key={group.name}
              className="conexo-group"
              data-level={group.level}
              data-new={index === justSolved}
            >
              <strong>{group.name}</strong>
              <span>{group.words.join(", ")}</span>
            </div>
          );
        })}
        {board.length ? (
          <div
            className="conexo-grid"
            role="group"
            aria-label={c.conexoBoard}
            data-shake={notice ? notice.id : undefined}
            key={notice?.id ?? "grid"}
          >
            {board.map((word) => (
              <button
                key={word}
                className="conexo-word"
                aria-pressed={selected.includes(word)}
                disabled={done}
                onClick={() => toggle(word)}
                data-long={word.length > 9}
              >
                {word}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="song-status" role="status" aria-live="polite">
        {notice?.text ?? " "}
      </p>

      {done ? (
        <DailyFinish
          won={!state.gaveUp}
          message={
            state.gaveUp
              ? c.conexoGaveUp
              : state.attempts.length === 4
                ? c.conexoWonOne
                : fill(c.conexoWon, { n: state.attempts.length })
          }
          share={
            state.gaveUp
              ? undefined
              : shareText(state, puzzle, today.number, language)
          }
        />
      ) : (
        <div className="daily-actions">
          <button
            className="memory-replay"
            onClick={() => setOrder(shuffled(board, Math.random))}
          >
            <Shuffle size={15} aria-hidden="true" />
            {c.conexoShuffle}
          </button>
          <button
            className="memory-replay"
            onClick={() => setSelected([])}
            disabled={!selected.length}
          >
            {c.conexoClear}
          </button>
          <button
            className="button primary"
            onClick={submit}
            disabled={selected.length !== GROUP_SIZE}
          >
            {c.conexoSubmit}
          </button>
          <button
            className="memory-replay daily-giveup"
            onClick={() => {
              setSelected([]);
              setState(giveUp(state));
            }}
          >
            <Eye size={15} aria-hidden="true" />
            {c.dailyReveal}
          </button>
        </div>
      )}
    </article>
  );
}
