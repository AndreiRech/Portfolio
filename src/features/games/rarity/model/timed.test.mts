import assert from "node:assert/strict";
import test from "node:test";
import { parseBank } from "./rarity.ts";
import {
  ROUND_MS,
  beginRound,
  expireRound,
  freshTimedRarity,
  parseTimedRarity,
  skipRound,
  submitTimed,
} from "./timed.ts";
const themes = Array.from(
  { length: 5 },
  (_, index) => parseBank(`Tema ${index} | Sri Lanka:7, Brasil:1`)[0],
);
test("the clock starts only after Start, is saved, and never resets on reload", () => {
  const initial = freshTimedRarity();
  assert.equal(initial.deadline, null);
  assert.equal(submitTimed(initial, themes, "Brasil", 0).ok, false);
  const state = beginRound(initial, 1000);
  assert.equal(state.deadline, 1000 + ROUND_MS);
  assert.deepEqual(parseTimedRarity(state), state);
  assert.equal(beginRound(state, 5000).deadline, state.deadline);
  assert.equal(expireRound(state, state.deadline! - 1), state);
  const expired = expireRound(state, state.deadline!);
  assert.equal(expired.rounds.length, 1);
  assert.deepEqual(expired.rounds[0], { answer: null, points: 0 });
  assert.equal(expireRound(expired, 9999999), expired);
});
test("invalid answers do not extend time, submitted or skipped rounds pause until Next", () => {
  const state = beginRound(freshTimedRarity(), 1000);
  assert.equal(submitTimed(state, themes, "zzzzz", 2000).ok, false);
  const result = submitTimed(state, themes, "Sri Lanka", 2000);
  assert.ok(result.ok);
  assert.equal(result.state.deadline, null);
  assert.equal(result.state.rounds[0].points, 7);
  const next = beginRound(result.state, 30000);
  assert.equal(next.deadline, 50000);
  assert.equal(submitTimed(next, themes, "Brasil", 50000).ok, false);
  assert.equal(skipRound(next).rounds.length, 2);
});
test("all five timeout outcomes end the day, malformed clocks are rejected", () => {
  let state = freshTimedRarity();
  for (let index = 0; index < 5; index++) {
    state = beginRound(state, 1000);
    state = expireRound(state, 1000 + ROUND_MS);
  }
  assert.equal(state.rounds.length, 5);
  assert.equal(beginRound(state, 99999), state);
  assert.deepEqual(parseTimedRarity(state), state);
  assert.equal(parseTimedRarity({ ...state, deadline: 123 }), null);
  assert.equal(
    parseTimedRarity({ ...freshTimedRarity(), started: false, deadline: 100 }),
    null,
  );
  assert.equal(
    parseTimedRarity({ ...freshTimedRarity(), deadline: "20000" }),
    null,
  );
});
