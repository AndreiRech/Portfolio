import {
  addRecord,
  parseHistory,
  type DailyRecord,
  type History,
  MAX_RECORDS,
} from "../model/history.ts";
export const HISTORY_KEY = "daily-history:v1";
const EMPTY: History = [];

export function createHistoryStore(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
) {
  let snapshot: History = EMPTY;
  let initialized = false;
  const listeners = new Set<() => void>();
  const read = () => {
    try {
      return (
        parseHistory(JSON.parse(storage?.getItem(HISTORY_KEY) ?? "[]")) ?? []
      );
    } catch {
      return [];
    }
  };
  const getSnapshot = () => {
    if (!initialized) {
      snapshot = read();
      initialized = true;
    }
    return snapshot;
  };
  const emit = () => listeners.forEach((listener) => listener());
  const refresh = () => {
    const fresh = read();
    // Keep in-memory progress if storage is unavailable or a second tab is behind.
    const current = getSnapshot();
    const known = new Set(
      current.map((record) => `${record.date}:${record.game}`),
    );
    const additions = fresh.filter(
      (record) => !known.has(`${record.date}:${record.game}`),
    );
    if (additions.length) {
      snapshot = [...current, ...additions]
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.game.localeCompare(b.game),
        )
        .slice(-MAX_RECORDS);
      emit();
    }
  };
  return {
    getSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh,
    record(record: DailyRecord) {
      refresh();
      const next = addRecord(getSnapshot(), record);
      if (next === snapshot) return;
      snapshot = next;
      try {
        storage?.setItem(HISTORY_KEY, JSON.stringify(snapshot));
      } catch {
        /* Keep the visit usable when storage is blocked. */
      }
      emit();
    },
  };
}

let browserStore: ReturnType<typeof createHistoryStore> | undefined;
export function historyStore() {
  if (!browserStore) {
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      /* Private browser mode. */
    }
    browserStore = createHistoryStore(storage);
    window.addEventListener("storage", (event) => {
      if (event.key === HISTORY_KEY) browserStore?.refresh();
    });
  }
  return browserStore;
}
export const emptyHistory = () => EMPTY;
