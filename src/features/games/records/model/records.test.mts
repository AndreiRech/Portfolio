import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceClock,
  elapsedTime,
  freshClock,
  parseClock,
  freshBestTimes,
  parseBestTimes,
  recordTime,
  freshStreak,
  parseStreak,
  beginStreak,
  finishStreak,
} from "./records.ts";
test("clocks start on an action, survive reload and stop at the final action", () => {
  assert.equal(elapsedTime(freshClock(), 5000), 0);
  const active = advanceClock(freshClock(), 1000, false)!;
  const restored = parseClock(JSON.parse(JSON.stringify(active)));
  assert.equal(elapsedTime(restored, 6000), 5000);
  const done = advanceClock(restored, 7000, true)!;
  assert.equal(elapsedTime(done, 50000), 6000);
  assert.equal(advanceClock(done, 60000, true), done);
  assert.equal(parseClock({ startedAt: 50, finishedAt: 20 }), null);
  assert.equal(parseClock({ startedAt: "1", finishedAt: null }), null);
  assert.equal(advanceClock(null, 7000, true), null);
});
test("only completed wins improve a difficulty's fastest time; slower runs and other levels preserve it", () => {
  const clock = { startedAt: 1000, finishedAt: 61000 };
  const fresh = freshBestTimes();
  assert.equal(recordTime(fresh, "easy", clock, false), fresh);
  assert.equal(
    recordTime(fresh, "easy", { ...clock, finishedAt: null }, true),
    fresh,
  );
  const first = recordTime(fresh, "easy", clock, true);
  assert.deepEqual(first, { easy: 60000, normal: null, hard: null });
  assert.equal(
    recordTime(first, "easy", { ...clock, finishedAt: 62000 }, true),
    first,
  );
  const faster = recordTime(
    first,
    "easy",
    { ...clock, finishedAt: 31000 },
    true,
  );
  assert.equal(faster.easy, 30000);
  assert.deepEqual(parseBestTimes(JSON.parse(JSON.stringify(faster))), faster);
  assert.equal(parseBestTimes({ ...faster, hard: -1 }), null);
  assert.equal(parseBestTimes({ easy: null }), null);
});
test("duel wins count once, losses reset the streak, and an abandoned battle cannot extend it", () => {
  let streak = finishStreak(beginStreak(freshStreak()), true);
  assert.deepEqual(streak, { current: 1, best: 1, pending: false });
  assert.equal(finishStreak(streak, true), streak);
  streak = finishStreak(beginStreak(streak), true);
  assert.equal(streak.best, 2);
  streak = finishStreak(beginStreak(streak), false);
  assert.deepEqual(streak, { current: 0, best: 2, pending: false });
  streak = finishStreak(beginStreak(streak), true);
  const restored = parseStreak(
    JSON.parse(JSON.stringify(beginStreak(streak))),
  )!;
  assert.equal(beginStreak(restored).current, 0);
  assert.equal(beginStreak(restored).best, 2);
  assert.equal(parseStreak({ current: 4, best: 2, pending: false }), null);
});
