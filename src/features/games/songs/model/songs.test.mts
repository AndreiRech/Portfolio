import test from "node:test";
import assert from "node:assert/strict";
import {
  CLIP_SECONDS,
  MAX_ATTEMPTS,
  clipLength,
  guessSong,
  newRound,
  pickSong,
  searchSongs,
  skipSong,
  songPoints,
} from "./songs.ts";

const catalogue = [
  { id: "1", title: "Believer", artist: "Imagine Dragons" },
  { id: "2", title: "Counting Stars", artist: "OneRepublic" },
  { id: "3", title: "Thunder", artist: "Imagine Dragons" },
];

test("each skip or wrong guess unlocks a longer clip", () => {
  let round = newRound("1");
  assert.equal(clipLength(round), CLIP_SECONDS[0]);
  round = skipSong(round);
  assert.equal(clipLength(round), CLIP_SECONDS[1]);
  round = guessSong(round, "2", catalogue);
  assert.equal(round.attempts.length, 2);
  assert.equal(clipLength(round), CLIP_SECONDS[2]);
  round = guessSong(round, "1", catalogue);
  assert.equal(round.status, "won");
  assert.equal(songPoints(round), MAX_ATTEMPTS - 2);
  assert.equal(clipLength(round), CLIP_SECONDS.at(-1));
});

test("unknown and repeated wrong guesses cost no attempt", () => {
  let round = guessSong(newRound("1"), "2", catalogue);
  assert.equal(guessSong(round, "2", catalogue), round);
  assert.equal(guessSong(round, "999", catalogue), round);
  round = guessSong(round, "3", catalogue);
  assert.equal(round.attempts.length, 2);
});

test("running out of attempts loses the round with no points and freezes it", () => {
  let round = newRound("1");
  for (let index = 0; index < MAX_ATTEMPTS; index++) round = skipSong(round);
  assert.equal(round.status, "lost");
  assert.equal(songPoints(round), 0);
  assert.equal(guessSong(round, "1", catalogue), round);
  assert.equal(skipSong(round), round);
});

test("a first-clip guess scores the most points", () => {
  assert.equal(
    songPoints(guessSong(newRound("3"), "3", catalogue)),
    MAX_ATTEMPTS,
  );
  assert.equal(CLIP_SECONDS[0], 0.1);
});

test("songs repeat only after the whole catalogue was heard", () => {
  assert.equal(
    pickSong(catalogue, ["1", "2"], () => 0.99),
    "3",
  );
  assert.equal(
    pickSong(catalogue, ["1", "2", "3"], () => 0),
    "1",
  );
});

test("search matches every word against title and artist, ignoring accents", () => {
  assert.deepEqual(
    searchSongs(catalogue, "imagine thun").map((song) => song.id),
    ["3"],
  );
  assert.deepEqual(
    searchSongs(catalogue, "BÉLIEVER").map((song) => song.id),
    ["1"],
  );
  assert.deepEqual(searchSongs(catalogue, "   "), []);
});
