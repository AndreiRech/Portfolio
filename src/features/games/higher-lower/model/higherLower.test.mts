import assert from "node:assert/strict";
import test from "node:test";
import {
  DAILY_HL_ROUNDS,
  DAILY_HL_TARGET,
  dailyChain,
  dailyHLCategory,
  dailyHLResult,
  hlShare,
  higherLowerReducer,
  parseDailyGuesses,
  initialHigherLower,
  isRightGuess,
  pickPages,
  type HLItem,
} from "./higherLower.ts";

const anime = (id: number, value: number): HLItem => ({
  id: String(id),
  title: `Anime ${id}`,
  value,
  subtitle: "TV · 2000",
  cover: null,
});

test("a guess is right when the next anime moves the guessed way, ties included", () => {
  assert.equal(isRightGuess(anime(1, 100), anime(2, 900), "higher"), true);
  assert.equal(isRightGuess(anime(1, 100), anime(2, 900), "lower"), false);
  assert.equal(isRightGuess(anime(1, 900), anime(2, 100), "lower"), true);
  assert.equal(isRightGuess(anime(1, 500), anime(2, 500), "lower"), true);
});

test("loading deals a pair, skipping duplicates and near ties", () => {
  const state = higherLowerReducer(initialHigherLower, {
    type: "load",
    media: [anime(1, 1000), anime(1, 1000), anime(2, 1010), anime(3, 5000)],
  });
  assert.equal(state.phase, "guess");
  assert.equal(state.current?.id, "1");
  assert.equal(state.next?.id, "3");
  assert.deepEqual(
    state.queue.map((media) => media.id),
    ["2"],
  );
});

test("a right guess grows the streak and the next anime becomes current", () => {
  let state = higherLowerReducer(initialHigherLower, {
    type: "load",
    media: [anime(1, 100), anime(2, 900), anime(3, 50)],
  });
  state = higherLowerReducer(state, { type: "guess", guess: "higher" });
  assert.equal(state.phase, "reveal");
  assert.equal(state.streak, 1);
  state = higherLowerReducer(state, { type: "advance" });
  assert.equal(state.current?.id, "2");
  assert.equal(state.next?.id, "3");
  assert.equal(state.phase, "guess");
});

test("a wrong guess ends the run but keeps the session best", () => {
  let state = higherLowerReducer(initialHigherLower, {
    type: "load",
    media: [
      anime(1, 100),
      anime(2, 900),
      anime(3, 50),
      anime(4, 7000),
      anime(5, 3),
    ],
  });
  state = higherLowerReducer(state, { type: "guess", guess: "higher" });
  state = higherLowerReducer(state, { type: "advance" });
  state = higherLowerReducer(state, { type: "guess", guess: "higher" });
  assert.equal(state.phase, "lost");
  assert.equal(state.best, 1);
  assert.equal(
    higherLowerReducer(state, { type: "guess", guess: "lower" }),
    state,
  );
  state = higherLowerReducer(state, { type: "restart" });
  assert.equal(state.phase, "guess");
  assert.equal(state.streak, 0);
  assert.equal(state.best, 1);
});

test("running out of anime waits for the next load", () => {
  let state = higherLowerReducer(initialHigherLower, {
    type: "load",
    media: [anime(1, 100), anime(2, 900)],
  });
  state = higherLowerReducer(state, { type: "guess", guess: "higher" });
  state = higherLowerReducer(state, { type: "advance" });
  assert.equal(state.phase, "loading");
  assert.equal(state.current?.id, "2");
  state = higherLowerReducer(state, { type: "load", media: [anime(3, 20)] });
  assert.equal(state.phase, "guess");
  assert.equal(state.next?.id, "3");
});

test("pages mix the top of the ranking with deeper ones", () => {
  assert.deepEqual(
    pickPages(() => 0),
    [1, 7],
  );
  const [top, deep] = pickPages(() => 0.999);
  assert.ok(top <= 6 && deep >= 7 && deep <= 76);
});

const bank = Array.from({ length: 40 }, (_, index) =>
  anime(index + 1, 1000 + ((index * 7919) % 40) * 250),
);

test("the daily chain is the same for a seed and never pairs near ties", () => {
  const chain = dailyChain(bank, 42);
  assert.equal(chain.length, DAILY_HL_ROUNDS + 1);
  assert.deepEqual(chain, dailyChain([...bank].reverse(), 42));
  assert.notDeepEqual(chain, dailyChain(bank, 43));
  assert.equal(new Set(chain.map((item) => item.id)).size, chain.length);
  for (let index = 1; index < chain.length; index++) {
    const [a, b] = [chain[index - 1].value, chain[index].value];
    assert.ok(Math.abs(a - b) / Math.max(a, b) > 0.04);
  }
});

test("daily categories alternate between the two snapshots", () => {
  assert.notEqual(dailyHLCategory(1), dailyHLCategory(2));
  assert.equal(dailyHLCategory(1), dailyHLCategory(3));
});

test("a daily run ends at the first miss or after the last pair", () => {
  const chain = [anime(1, 100), anime(2, 900), anime(3, 300), anime(4, 50)];
  assert.deepEqual(dailyHLResult(chain, ["higher"]), {
    streak: 1,
    missed: false,
    finished: false,
  });
  assert.deepEqual(dailyHLResult(chain, ["higher", "higher"]), {
    streak: 1,
    missed: true,
    finished: true,
  });
  assert.deepEqual(dailyHLResult(chain, ["higher", "lower", "lower"]), {
    streak: 3,
    missed: false,
    finished: true,
  });
  assert.ok(DAILY_HL_TARGET <= DAILY_HL_ROUNDS);
});

test("saved daily guesses are validated", () => {
  assert.deepEqual(parseDailyGuesses(["higher", "lower"]), ["higher", "lower"]);
  assert.equal(parseDailyGuesses(["up"]), null);
  assert.equal(parseDailyGuesses("higher"), null);
  assert.equal(
    parseDailyGuesses(Array(DAILY_HL_ROUNDS + 1).fill("higher")),
    null,
  );
});

test("the daily share marks each pair and the score", () => {
  const chain = [anime(1, 100), anime(2, 900), anime(3, 300)];
  assert.equal(hlShare(chain, ["higher", "higher"]), "🟩🟥 1/10");
});
