"use client";
import { useEffect, useState } from "react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { useDailyProgress } from "../../daily/hooks/useDaily";
import {
  LEVELS,
  elapsedTime,
  formatTime,
  freshBestTimes,
  parseBestTimes,
  recordTime,
  type Level,
  type RunClock,
} from "../model/records";

export default function GameTimes({
  game,
  level,
  clock,
  won,
}: {
  game: "sudoku" | "minesweeper";
  level: Level;
  clock: RunClock | null;
  won: boolean;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const [records, setRecords] = useDailyProgress(
    `${game}-best-times-v1`,
    "alltime",
    freshBestTimes,
    parseBestTimes,
  );
  const ready = records !== null;
  const start = clock?.startedAt,
    finish = clock?.finishedAt;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (start == null || finish != null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [start, finish]);
  useEffect(() => {
    if (ready && won && start != null && finish != null)
      setRecords((current) =>
        recordTime(
          current,
          level,
          { startedAt: start, finishedAt: finish },
          true,
        ),
      );
  }, [ready, won, start, finish, level, setRecords]);
  return (
    <div className="game-times">
      <p className="game-elapsed">
        {c.gameTime} <b>{clock ? formatTime(elapsedTime(clock, now)) : "—"}</b>
      </p>
      <div className="game-best-times">
        <span>{c.fastestTimes}</span>
        <dl>
          {LEVELS.map((id) => (
            <div key={id} data-active={id === level}>
              <dt>{c.levels[id]}</dt>
              <dd>{records?.[id] == null ? "—" : formatTime(records[id]!)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
