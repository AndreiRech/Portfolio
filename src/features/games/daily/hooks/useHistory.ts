"use client";
import { useEffect, useSyncExternalStore } from "react";
import { historyStore, emptyHistory } from "../services/historyStore";
import type { HistoryGame, Outcome } from "../model/history";
const subscribe = (listener: () => void) => historyStore().subscribe(listener);
const snapshot = () => historyStore().getSnapshot();
export function useHistory() {
  return useSyncExternalStore(subscribe, snapshot, emptyHistory);
}
export function useRecordDailyResult(
  game: HistoryGame,
  date: string | null,
  outcome: Outcome | null,
) {
  useEffect(() => {
    if (date && outcome) historyStore().record({ game, date, outcome });
  }, [game, date, outcome]);
}
