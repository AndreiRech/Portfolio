import assert from "node:assert/strict";
import test from "node:test";
import {
  countdown,
  dailyPick,
  dayKey,
  dayNumber,
  msUntilTomorrow,
} from "./daily.ts";

test("puzzle numbers follow the local calendar day, starting at 1", () => {
  assert.equal(dayNumber(new Date(2026, 10, 12, 0, 1)), 1);
  assert.equal(dayNumber(new Date(2026, 10, 12, 23, 59)), 1);
  assert.equal(dayNumber(new Date(2026, 10, 13, 0, 0)), 2);
  assert.equal(dayNumber(new Date(2027, 10, 12)), 366);
  assert.equal(dayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("a daily list shows every item once before repeating", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"];
  const cycle = Array.from({ length: items.length }, (_, day) =>
    dailyPick(items, "test", day + 1),
  );
  assert.deepEqual([...cycle].sort(), items);
  assert.equal(dailyPick(items, "test", 3), dailyPick(items, "test", 3));
});

test("the countdown reaches the next midnight", () => {
  assert.equal(msUntilTomorrow(new Date(2026, 10, 12, 23, 59, 30)), 30_000);
  assert.equal(countdown(3_725_000), "1:02:05");
  assert.equal(countdown(-5), "0:00:00");
});
