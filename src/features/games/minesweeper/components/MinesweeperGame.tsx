"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { Flag, Bomb } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import GameHelp from "../../components/GameHelp";
import GameTimes from "../../records/components/GameTimes";
import {
  LEVELS,
  freshField,
  flagCell,
  openCell,
  nearbyMines,
  type Level,
} from "../model/minesweeper";
export default function MinesweeperGame() {
  const { language } = useSettings();
  const unlock = useUnlock();
  const pt = language === "pt";
  const [level, setLevel] = useState<Level>("easy");
  const [field, setField] = useState(() => freshField("easy"));
  const [flagging, setFlagging] = useState(false);
  useEffect(() => {
    if (field.status !== "won") return;
    unlock("mine-clear");
    if (level === "hard") unlock("mine-expert");
  }, [field.status, level, unlock]);
  const done = field.status === "won" || field.status === "lost";
  const reset = (next: Level) => {
    setLevel(next);
    setField(freshField(next));
  };
  return (
    <article className="daily-lab mines-lab" aria-labelledby="mines-title">
      <h2 id="mines-title">{pt ? "Campo minado" : "Minesweeper"}</h2>
      <GameHelp>
        {pt
          ? "Abra todas as casas sem minas. Os números indicam quantas minas estão nas oito casas vizinhas. A primeira abertura é segura. Use o botão Bandeiras ou o botão direito para marcar uma mina."
          : "Open every safe cell. Numbers count mines in the eight neighboring cells. The first opening is safe. Use Flag mode or right-click to mark a mine."}
      </GameHelp>
      <div
        className="level-picker"
        role="group"
        aria-label={pt ? "Dificuldade" : "Difficulty"}
      >
        {(Object.keys(LEVELS) as Level[]).map((id) => (
          <button
            key={id}
            aria-pressed={id === level}
            onClick={() => reset(id)}
          >
            {
              {
                easy: pt ? "Fácil" : "Easy",
                normal: "Normal",
                hard: pt ? "Difícil" : "Hard",
              }[id]
            }
          </button>
        ))}
      </div>
      <GameTimes
        game="minesweeper"
        level={level}
        clock={field.clock}
        won={field.status === "won"}
      />
      <div className="mine-controls">
        <span>
          <Flag size={16} aria-hidden="true" />{" "}
          {LEVELS[level].mines - field.flags.length}
        </span>
        <button
          className="memory-replay"
          aria-pressed={flagging}
          onClick={() => setFlagging((value) => !value)}
        >
          {pt ? "Bandeiras" : "Flag mode"}
        </button>
        <button className="memory-replay" onClick={() => reset(level)}>
          {pt ? "Nova partida" : "New game"}
        </button>
      </div>
      <div className="mine-scroll">
        <div
          className="mine-grid"
          role="group"
          aria-label={pt ? "Campo minado" : "Minefield"}
          style={{ "--side": field.side } as CSSProperties}
        >
          {Array.from({ length: field.side ** 2 }, (_, index) => {
            const opened = field.opened.includes(index),
              flagged = field.flags.includes(index),
              mine = done && field.mines.includes(index),
              count = opened ? nearbyMines(field, index) : 0;
            return (
              <button
                key={index}
                className="mine-cell"
                data-open={opened}
                data-mine={mine}
                data-number={count}
                disabled={done || opened}
                aria-label={`${pt ? "Linha" : "Row"} ${Math.floor(index / field.side) + 1}, ${pt ? "coluna" : "column"} ${(index % field.side) + 1}: ${mine ? (pt ? "mina" : "mine") : flagged ? (pt ? "bandeira" : "flag") : opened ? count : pt ? "fechada" : "covered"}`}
                onClick={() => {
                  const seed = Date.now();
                  setField((current) =>
                    flagging
                      ? flagCell(current, index)
                      : openCell(current, index, LEVELS[level].mines, seed),
                  );
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setField((current) => flagCell(current, index));
                }}
              >
                {mine ? (
                  <Bomb size={18} aria-hidden="true" />
                ) : flagged ? (
                  <Flag size={16} aria-hidden="true" />
                ) : opened && count ? (
                  count
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" aria-live="polite">
        {field.status === "won"
          ? pt
            ? "Você encontrou todas as casas seguras!"
            : "You found every safe cell!"
          : field.status === "lost"
            ? pt
              ? "Você encontrou uma mina. Tente uma nova partida."
              : "You hit a mine. Try a new game."
            : ""}
      </p>
    </article>
  );
}
