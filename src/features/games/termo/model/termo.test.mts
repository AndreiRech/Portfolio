import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDictionary,
  keyboardMarks,
  parseTermo,
  scoreGuess,
  shareText,
  submitGuess,
} from "./termo.ts";

test("repeated letters only score as often as the answer has them", () => {
  assert.deepEqual(scoreGuess("arara", "carta"), [
    "place",
    "place",
    "wrong",
    "wrong",
    "right",
  ]);
  assert.deepEqual(scoreGuess("termo", "termo"), Array(5).fill("right"));
});

test("accents and ç are optional when typing and filled in from the list", () => {
  const dictionary = buildDictionary(["avião", "pódio"], ["termo"]);
  const answer = "pódio";
  let result = submitGuess(
    { guesses: [], status: "playing" },
    "aviao",
    answer,
    dictionary,
  );
  assert.ok(result.ok);
  assert.deepEqual(result.state.guesses, ["avião"]);
  result = submitGuess(result.state, "podio", answer, dictionary);
  assert.ok(result.ok);
  assert.equal(result.state.status, "won");
  assert.deepEqual(scoreGuess("cação", "cacao"), Array(5).fill("right"));
});

test("short and unknown words are rejected without costing a try", () => {
  const dictionary = buildDictionary(["termo"]);
  const state = { guesses: [], status: "playing" as const };
  assert.deepEqual(submitGuess(state, "ter", "termo", dictionary), {
    ok: false,
    reason: "short",
  });
  assert.deepEqual(submitGuess(state, "xxxxx", "termo", dictionary), {
    ok: false,
    reason: "unknown",
  });
});

test("the sixth miss ends the game", () => {
  const dictionary = buildDictionary(["sabor", "termo"]);
  let state = {
    guesses: [] as string[],
    status: "playing" as const,
  } as Parameters<typeof submitGuess>[0];
  for (let i = 0; i < 6; i++) {
    const result = submitGuess(state, "sabor", "termo", dictionary);
    assert.ok(result.ok);
    state = result.state;
  }
  assert.equal(state.status, "lost");
  assert.equal(shareText(state, "termo", 4).split("\n")[0], "Termo #4 X/6");
});

test("the keyboard keeps each letter's best mark", () => {
  const keys = keyboardMarks(["sabor", "termo"], "termo");
  assert.equal(keys.get("r"), "right");
  assert.equal(keys.get("s"), "wrong");
});

test("saved progress with the wrong shape starts fresh", () => {
  assert.equal(parseTermo({ guesses: ["abc"], status: "playing" }), null);
  assert.equal(parseTermo({ guesses: [], status: "done" }), null);
  assert.deepEqual(parseTermo({ guesses: ["termo"], status: "won" }), {
    guesses: ["termo"],
    status: "won",
  });
});

test("the expanded local dictionary has 700 answers and accepts its entire snapshot", async () => {
  const { readFile } = await import("node:fs/promises");
  const words = JSON.parse(
    await readFile(new URL("../data/words.json", import.meta.url), "utf8"),
  ) as { answers: string[]; valid: string[] };
  const dictionary = buildDictionary(words.answers, words.valid);
  assert.equal(words.answers.length, 700);
  assert.ok(dictionary.size >= 10000);
  for (const word of [...words.answers, ...words.valid]) {
    assert.match(word, /^[a-záàâãéêíóôõúç]{5}$/);
    assert.ok(
      submitGuess({ guesses: [], status: "playing" }, word, "termo", dictionary)
        .ok,
      word,
    );
  }
});
