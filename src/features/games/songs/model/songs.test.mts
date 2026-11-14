import test from "node:test";
import assert from "node:assert/strict";
import {
  CLIP_SECONDS,
  MAX_ATTEMPTS,
  clipLength,
  dailySongPool,
  guessSong,
  indexSongs,
  mergeSongNames,
  newRound,
  parseSongRound,
  pickSong,
  sameSong,
  searchSongs,
  skipSong,
  songPoints,
  songShare,
} from "./songs.ts";

const catalogue = [
  { id: "1", title: "Believer", artist: "Imagine Dragons" },
  { id: "2", title: "Counting Stars", artist: "OneRepublic" },
  { id: "3", title: "Thunder", artist: "Imagine Dragons" },
];

const believer = catalogue[0];
const counting = catalogue[1];
const thunder = catalogue[2];

test("each skip or wrong guess unlocks a longer clip", () => {
  let round = newRound("1");
  assert.equal(clipLength(round), CLIP_SECONDS[0]);
  round = skipSong(round);
  assert.equal(clipLength(round), CLIP_SECONDS[1]);
  round = guessSong(round, counting, believer);
  assert.equal(round.attempts.length, 2);
  assert.equal(clipLength(round), CLIP_SECONDS[2]);
  round = guessSong(round, believer, believer);
  assert.equal(round.status, "won");
  assert.equal(songPoints(round), MAX_ATTEMPTS - 2);
  assert.equal(clipLength(round), CLIP_SECONDS.at(-1));
});

test("a repeated wrong guess costs no attempt", () => {
  let round = guessSong(newRound("1"), counting, believer);
  assert.equal(guessSong(round, { ...counting }, believer), round);
  round = guessSong(round, thunder, believer);
  assert.equal(round.attempts.length, 2);
});

test("a guess outside the playlist wins when it names the same song", () => {
  const live = {
    title: "Believer (Live)",
    artist: "Imagine Dragons, Lil Wayne",
  };
  const round = guessSong(newRound("1"), live, believer);
  assert.equal(round.status, "won");
  const cover = { title: "Believer", artist: "Some Cover Band" };
  assert.equal(guessSong(newRound("1"), cover, believer).status, "playing");
});

test("songs match by title and lead artist, ignoring tags and accents", () => {
  assert.ok(
    sameSong(
      { title: "Habits (Stay High)", artist: "Tove Lo" },
      { title: "Habits", artist: "TOVE LO" },
    ),
  );
  assert.ok(
    sameSong(
      { title: "Pós", artist: "Felipe e Rodrigo" },
      { title: "Pos", artist: "Felipe & Rodrigo" },
    ),
  );
  assert.ok(
    !sameSong(
      { title: "Thunder", artist: "Imagine Dragons" },
      { title: "Thunder", artist: "AC/DC" },
    ),
  );
});

test("running out of attempts loses the round with no points and freezes it", () => {
  let round = newRound("1");
  for (let index = 0; index < MAX_ATTEMPTS; index++) round = skipSong(round);
  assert.equal(round.status, "lost");
  assert.equal(songPoints(round), 0);
  assert.equal(guessSong(round, believer, believer), round);
  assert.equal(skipSong(round), round);
});

test("a first-clip guess scores the most points", () => {
  assert.equal(
    songPoints(guessSong(newRound("3"), thunder, thunder)),
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

test("merging keeps the first copy of each song in bank order", () => {
  const merged = mergeSongNames(
    [
      { title: "Thunder", artist: "Imagine Dragons" },
      { title: "Thunder", artist: "AC/DC" },
    ],
    [{ title: "Thunder (Live)", artist: "Imagine Dragons" }, believer],
  );
  assert.deepEqual(
    merged.map((song) => `${song.title} — ${song.artist}`),
    [
      "Thunder — Imagine Dragons",
      "Thunder — AC/DC",
      "Believer — Imagine Dragons",
    ],
  );
});

test("search matches every word against title and artist, ignoring accents", () => {
  const index = indexSongs(catalogue);
  assert.deepEqual(
    searchSongs(index, "imagine thun").map((song) => song.id),
    ["3"],
  );
  assert.deepEqual(
    searchSongs(index, "BÉLIEVER").map((song) => song.id),
    ["1"],
  );
  assert.deepEqual(searchSongs(index, "   "), []);
});

test("search ranks titles that start with the query first, then bank order", () => {
  const index = indexSongs([
    { title: "Lose Yourself", artist: "Eminem" },
    { title: "Someone You Loved", artist: "Lewis Capaldi" },
    { title: "Love Story", artist: "Taylor Swift" },
    { title: "Glove", artist: "Lovers" },
  ]);
  assert.deepEqual(
    searchSongs(index, "lov").map((song) => song.title),
    ["Love Story", "Someone You Loved", "Glove"],
  );
  assert.equal(searchSongs(index, "o", 2).length, 2);
});

test("the daily pool drops repeats and does not depend on list order", () => {
  const a = dailySongPool([catalogue, [catalogue[0]]]);
  const b = dailySongPool([[...catalogue].reverse()]);
  assert.deepEqual(
    a.map((song) => song.id),
    ["1", "2", "3"],
  );
  assert.deepEqual(a, b);
});

test("a saved daily round is trusted only when it is valid for today's song", () => {
  let round = newRound("1");
  round = skipSong(round);
  round = guessSong(round, counting, believer);
  const saved = JSON.parse(JSON.stringify(round));
  assert.deepEqual(parseSongRound(saved, "1"), round);
  assert.equal(parseSongRound(saved, "2"), null);
  assert.equal(parseSongRound({ ...saved, attempts: "x" }, "1"), null);
  assert.equal(
    parseSongRound({ ...saved, attempts: [{ kind: "wrong" }] }, "1"),
    null,
  );
  // The status is recomputed, never read from storage.
  assert.equal(
    parseSongRound({ ...saved, status: "won" }, "1")?.status,
    "playing",
  );
  const won = guessSong(round, believer, believer);
  assert.equal(
    parseSongRound(JSON.parse(JSON.stringify(won)), "1")?.status,
    "won",
  );
});

test("the daily share shows each attempt without naming songs", () => {
  let round = skipSong(newRound("1"));
  round = guessSong(round, counting, believer);
  round = guessSong(round, believer, believer);
  assert.equal(songShare(round), "⬛🟥🟩⬜⬜⬜⬜⬜");
});
