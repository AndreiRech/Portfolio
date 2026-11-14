"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { useToday } from "../hooks/useDaily";
import { useHistory } from "../hooks/useHistory";
import {
  HISTORY_GAMES,
  DAILY_GAMES,
  completedDays,
  dayResults,
  gameStats,
  type HistoryGame,
} from "../model/history";

export default function DailyHistory() {
  const { language } = useSettings();
  const c = playCopy[language];
  const today = useToday();
  const history = useHistory();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  if (!today) return null;
  const locale = language === "pt" ? "pt-BR" : "en-US";
  const anchor = new Date(`${today.key}T12:00:00Z`);
  const month = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + offset, 1, 12),
  );
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const count = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const dateFor = (day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const chosen = selected ?? today.key;
  const names: Record<HistoryGame, string> = {
    termo: `${c.termoTab} · ${c.termoModes.classic}`,
    "termo-dueto": `${c.termoTab} · ${c.termoModes.dueto}`,
    "termo-quarteto": `${c.termoTab} · ${c.termoModes.quarteto}`,
    "termo-counts": `${c.termoTab} · ${c.termoModes.counts}`,
    "termo-locked": `${c.termoTab} · ${c.termoModes.locked}`,
    "termo-between": `${c.termoTab} · ${c.termoModes.between}`,
    "termo-liar": `${c.termoTab} · ${c.termoModes.liar}`,

    conexo: c.conexoTab,
    crossword: c.cwTab,
    rarity: c.rarityTab,
    color: language === "pt" ? "Cores" : "Color",
    scale: language === "pt" ? "Escala" : "Size it up",
    songs: c.songsTab,
    "higher-lower": c.animeTab,
    "sudoku-easy": `${c.sudokuTab} · ${c.levels.easy}`,
    "sudoku-normal": `${c.sudokuTab} · ${c.levels.normal}`,
    "sudoku-hard": `${c.sudokuTab} · ${c.levels.hard}`,
  };
  const outcomeText = (outcome: string | null) =>
    outcome === "won"
      ? c.historyWon
      : outcome === "lost"
        ? c.historyLost
        : c.historyUnplayed;
  const fullDays = completedDays(history);
  const recordedDays = new Set(history.map((record) => record.date)).size;
  return (
    <details className="daily-history">
      <summary>
        {c.historyTitle}
        <span>
          {recordedDays}{" "}
          {recordedDays === 1 ? c.historyRecordedDay : c.historyRecordedDays} ·{" "}
          {fullDays} {fullDays === 1 ? c.historyFullDay : c.historyFullDays}
        </span>
      </summary>
      <p className="daily-history-note">{c.historyNote}</p>
      <div className="daily-history-layout">
        <div className="daily-history-calendar">
          <div className="daily-history-month">
            <button
              onClick={() => setOffset((value) => value - 1)}
              aria-label={c.historyPrevious}
            >
              <ChevronLeft size={18} />
            </button>
            <h3>
              {new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(month)}
            </h3>
            <button
              onClick={() => setOffset((value) => Math.min(0, value + 1))}
              disabled={offset === 0}
              aria-label={c.historyNext}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="daily-history-days">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                className="daily-history-weekday"
                key={`weekday-${index}`}
                aria-hidden="true"
              >
                {new Intl.DateTimeFormat(locale, {
                  weekday: "narrow",
                  timeZone: "UTC",
                }).format(new Date(Date.UTC(2026, 10, 1 + index)))}
              </span>
            ))}
            {Array.from({ length: month.getUTCDay() }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {Array.from({ length: count }, (_, index) => {
              const date = dateFor(index + 1);
              const results = dayResults(history, date);
              const done = results.filter(Boolean).length;
              return (
                <button
                  key={date}
                  disabled={date > today.key}
                  aria-pressed={chosen === date}
                  aria-current={date === today.key ? "date" : undefined}
                  data-complete={done === DAILY_GAMES.length}
                  onClick={() => setSelected(date)}
                  aria-label={`${date}: ${done}/${DAILY_GAMES.length} ${c.historyCompleted}`}
                >
                  <b>{index + 1}</b>
                  <span className="daily-history-dots" aria-hidden="true">
                    {results.map((result, position) => (
                      <i key={position} data-outcome={result ?? "none"} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="daily-history-legend">
            <span data-outcome="won">{c.historyWon}</span>
            <span data-outcome="lost">{c.historyLost}</span>
            <span>{c.historyFiveGames}</span>
          </p>
          <h4 className="daily-history-date">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "long",
              timeZone: "UTC",
            }).format(new Date(`${chosen}T12:00:00Z`))}
          </h4>
          <ul className="daily-history-results" aria-live="polite">
            {HISTORY_GAMES.map((game) => {
              const outcome =
                history.find(
                  (record) => record.game === game && record.date === chosen,
                )?.outcome ?? null;
              return (
                <li key={game}>
                  <span>{names[game]}</span>
                  <span data-outcome={outcome ?? "none"}>
                    {outcomeText(outcome)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="daily-history-stats">
          <h3>{c.historyStats}</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">{c.historyGame}</th>
                <th scope="col">{c.historyCompleted}</th>
                <th scope="col">{c.historyWins}</th>
                <th scope="col">{c.historyRate}</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY_GAMES.map((game) => {
                const stats = gameStats(history, game);
                return (
                  <tr key={game}>
                    <th scope="row">{names[game]}</th>
                    <td>{stats.completed}</td>
                    <td>{stats.wins}</td>
                    <td>
                      {stats.winRate === null ? "—" : `${stats.winRate}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="daily-history-note">{c.historyRules}</p>
          {!history.length ? (
            <p className="daily-history-empty">{c.historyEmpty}</p>
          ) : null}
        </div>
      </div>
    </details>
  );
}
