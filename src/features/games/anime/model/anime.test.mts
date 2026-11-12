import assert from "node:assert/strict";
import test from "node:test";
import {
  higherLowerReducer,
  initialHigherLower,
  isRightGuess,
  pickPages,
  type AnimeMedia,
} from "./anime.ts";

const anime = (id: number, popularity: number): AnimeMedia => ({
  id,
  title: `Anime ${id}`,
  popularity,
  seasonYear: 2000,
  format: "TV",
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
  assert.equal(state.current?.id, 1);
  assert.equal(state.next?.id, 3);
  assert.deepEqual(
    state.queue.map((media) => media.id),
    [2],
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
  assert.equal(state.current?.id, 2);
  assert.equal(state.next?.id, 3);
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
  assert.equal(state.current?.id, 2);
  state = higherLowerReducer(state, { type: "load", media: [anime(3, 20)] });
  assert.equal(state.phase, "guess");
  assert.equal(state.next?.id, 3);
});

test("pages mix the top of the ranking with deeper ones", () => {
  assert.deepEqual(
    pickPages(() => 0),
    [1, 7],
  );
  const [top, deep] = pickPages(() => 0.999);
  assert.ok(top <= 6 && deep >= 7 && deep <= 76);
});
