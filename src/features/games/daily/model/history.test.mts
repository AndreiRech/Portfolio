import assert from "node:assert/strict";
import test from "node:test";
import {
  addRecord,
  completedDays,
  dayResults,
  gameStats,
  parseHistory,
  type History,
} from "./history.ts";
import { createHistoryStore, HISTORY_KEY } from "../services/historyStore.ts";

test("one immutable result per game, day and sudoku difficulty", () => {
  let history: History = [];
  history = addRecord(history, {
    date: "2026-11-12",
    game: "termo",
    outcome: "won",
  });
  assert.equal(
    addRecord(history, { date: "2026-11-12", game: "termo", outcome: "lost" }),
    history,
  );
  history = addRecord(history, {
    date: "2026-11-13",
    game: "termo",
    outcome: "lost",
  });
  history = addRecord(history, {
    date: "2026-11-14",
    game: "termo",
    outcome: "won",
  });
  assert.deepEqual(gameStats(history, "termo"), {
    completed: 3,
    wins: 2,
    winRate: 67,
  });
  assert.deepEqual(gameStats(history, "conexo"), {
    completed: 0,
    wins: 0,
    winRate: null,
  });
  history = addRecord(history, {
    date: "2026-11-12",
    game: "sudoku-easy",
    outcome: "lost",
  });
  history = addRecord(history, {
    date: "2026-11-12",
    game: "sudoku-hard",
    outcome: "won",
  });
  assert.equal(gameStats(history, "sudoku-easy").winRate, 0);
  assert.equal(gameStats(history, "sudoku-hard").winRate, 100);
  assert.deepEqual(dayResults(history, "2026-11-12"), [
    "won",
    null,
    null,
    null,
    null,
    null,
  ]);
});

test("a complete day needs six daily games and excludes legacy sudoku", () => {
  let history: History = [];
  for (const game of [
    "termo",
    "conexo",
    "crossword",
    "rarity",
    "color",
  ] as const)
    history = addRecord(history, { date: "2026-11-12", game, outcome: "won" });
  history = addRecord(history, {
    date: "2026-11-12",
    game: "sudoku-normal",
    outcome: "won",
  });
  assert.equal(completedDays(history), 0);
  history = addRecord(history, {
    date: "2026-11-12",
    game: "scale",
    outcome: "lost",
  });
  assert.equal(completedDays(history), 1);
  assert.equal(dayResults(history, "2026-11-12").filter(Boolean).length, 6);
});

test("history rejects invalid dates, duplicate records, games and outcomes", () => {
  for (const date of ["2026-02-30", "2026-13-01", "not-a-date", "2026-2-1"])
    assert.equal(parseHistory([{ date, game: "termo", outcome: "won" }]), null);
  assert.equal(
    parseHistory([{ date: "2026-11-12", game: "memory", outcome: "won" }]),
    null,
  );
  assert.equal(
    parseHistory([{ date: "2026-11-12", game: "rarity", outcome: "playing" }]),
    null,
  );
  const record = { date: "2026-11-12", game: "conexo", outcome: "lost" };
  assert.equal(parseHistory([record, record]), null);
  assert.deepEqual(
    parseHistory([{ date: "2028-02-29", game: "termo", outcome: "won" }]),
    [{ date: "2028-02-29", game: "termo", outcome: "won" }],
  );
});

test("results persist through reloads and another tab, without double counting", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const first = createHistoryStore(storage);
  let updates = 0;
  first.subscribe(() => updates++);
  const result = { date: "2026-11-12", game: "termo", outcome: "won" } as const;
  first.record(result);
  first.record(result);
  assert.equal(updates, 1);
  assert.equal(first.getSnapshot(), first.getSnapshot());
  const reloaded = createHistoryStore(storage);
  assert.deepEqual(reloaded.getSnapshot(), [result]);
  reloaded.record({ date: "2026-11-13", game: "conexo", outcome: "lost" });
  first.refresh();
  assert.equal(first.getSnapshot().length, 2);
  first.record({ date: "2026-11-14", game: "sudoku-hard", outcome: "won" });
  assert.equal(JSON.parse(values.get(HISTORY_KEY)!).length, 3);
  assert.equal(createHistoryStore(storage).getSnapshot().length, 3);
});

test("corrupted or blocked browser storage does not stop results for this visit", () => {
  const storage = {
    getItem: () => "invalid JSON",
    setItem: () => {
      throw new Error("storage blocked");
    },
  };
  const store = createHistoryStore(storage);
  assert.deepEqual(store.getSnapshot(), []);
  store.record({ date: "2026-11-12", game: "rarity", outcome: "won" });
  store.record({ date: "2026-11-13", game: "rarity", outcome: "lost" });
  assert.equal(store.getSnapshot().length, 2);
});

test("Termo variants have separate rates and any variant counts toward a complete day", () => {
  let history: History = [];
  for (const game of [
    "termo-dueto",
    "conexo",
    "crossword",
    "rarity",
    "color",
    "scale",
  ] as const)
    history = addRecord(history, { date: "2026-11-12", game, outcome: "won" });
  assert.equal(completedDays(history), 1);
  assert.deepEqual(dayResults(history, "2026-11-12"), Array(6).fill("won"));
  assert.equal(gameStats(history, "termo-dueto").winRate, 100);
  assert.equal(gameStats(history, "termo").winRate, null);
  history = addRecord(history, {
    date: "2026-11-12",
    game: "termo-counts",
    outcome: "lost",
  });
  assert.equal(completedDays(history), 1);
  assert.equal(gameStats(history, "termo-counts").winRate, 0);
});
