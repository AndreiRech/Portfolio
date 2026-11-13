import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildDictionary, scoreGuess, stripAccents } from "./termo.ts";
import {
  CONFIG,
  MODES,
  betweenBounds,
  buildModePuzzle,
  colorCounts,
  cycleNote,
  feedback,
  freshMode,
  lockedLetters,
  modeShare,
  parseMode,
  solvedBoard,
  submitMode,
  type ModePuzzle,
  type ModeState,
} from "./modes.ts";
const words = JSON.parse(
  await readFile(new URL("../data/words.json", import.meta.url), "utf8"),
) as { answers: string[]; valid: string[] };
const dictionary = buildDictionary(words.answers, words.valid);

test("every mode has deterministic, distinct, valid daily answers", () => {
  for (const mode of MODES)
    for (let day = 1; day <= 30; day++) {
      const puzzle = buildModePuzzle(words.answers, dictionary, mode, day);
      assert.deepEqual(
        puzzle,
        buildModePuzzle(words.answers, dictionary, mode, day),
      );
      assert.equal(puzzle.answers.length, CONFIG[mode].boards);
      assert.equal(
        new Set(puzzle.answers.map(stripAccents)).size,
        CONFIG[mode].boards,
      );
      assert.ok(
        puzzle.answers.every((answer) => dictionary.has(stripAccents(answer))),
      );
    }
  assert.equal(CONFIG.dueto.tries, 7);
  assert.equal(CONFIG.quarteto.tries, 9);
});

test("shared guesses solve each Dueto and Quarteto board independently and survive reload", () => {
  for (const mode of ["dueto", "quarteto"] as const) {
    const puzzle = buildModePuzzle(words.answers, dictionary, mode, 1);
    let state = freshMode();
    for (const answer of puzzle.answers) {
      const result = submitMode(state, answer, puzzle, dictionary);
      assert.ok(result.ok);
      state = result.state;
      assert.ok(solvedBoard(state, answer) >= 0);
    }
    assert.equal(state.status, "won");
    assert.deepEqual(parseMode(state, puzzle, dictionary), state);
    assert.equal(submitMode(state, "termo", puzzle, dictionary).ok, false);
  }
});

test("counts do not label positions and handwritten notes persist without changing the verdict", () => {
  assert.deepEqual(colorCounts("tento", "conta"), {
    right: 2,
    place: 1,
    wrong: 2,
  });
  const puzzle: ModePuzzle = {
    mode: "counts",
    answers: ["conta"],
    lexicon: [...dictionary.keys()].sort(),
    day: 1,
  };
  const result = submitMode(freshMode(), "tento", puzzle, dictionary);
  assert.ok(result.ok);
  assert.deepEqual(result.state.notes[0], [null, null, null, null, null]);
  let state = cycleNote(result.state, 0, 0);
  assert.equal(state.notes[0][0], "right");
  assert.deepEqual(colorCounts(state.guesses[0], "conta"), {
    right: 2,
    place: 1,
    wrong: 2,
  });
  assert.deepEqual(parseMode(state, puzzle, dictionary), state);
  state = cycleNote(cycleNote(cycleNote(state, 0, 0), 0, 0), 0, 0);
  assert.equal(state.notes[0][0], null);
  assert.match(modeShare(state, puzzle, "Contagem"), /🟩2 🟨1 🟥2/);
});

test("green letters are mandatory in Fixed mode, including restored games", () => {
  const puzzle: ModePuzzle = {
    mode: "locked",
    answers: ["conta"],
    lexicon: [...dictionary.keys()].sort(),
    day: 1,
  };
  const result = submitMode(freshMode(), "tento", puzzle, dictionary);
  assert.ok(result.ok);
  assert.deepEqual(lockedLetters(puzzle, result.state), ["", "", "n", "t", ""]);
  assert.deepEqual(submitMode(result.state, "carta", puzzle, dictionary), {
    ok: false,
    reason: "locked",
  });
  assert.deepEqual(parseMode(result.state, puzzle, dictionary), result.state);
  const win = submitMode(result.state, "conta", puzzle, dictionary);
  assert.ok(win.ok);
  assert.equal(win.state.status, "won");
});

test("Between starts at AAAAA/ZZZZZ with 50 percent, accepts outside words and only narrows bounds", () => {
  const puzzle = buildModePuzzle(words.answers, dictionary, "between", 1);
  let state = freshMode();
  const start = betweenBounds(puzzle, state);
  assert.equal(start.lower, "aaaaa");
  assert.equal(start.upper, "zzzzz");
  assert.equal(start.position, 0.5);
  assert.equal(start.lowDistance, 50);
  assert.equal(start.highDistance, 50);
  const target = puzzle.lexicon.indexOf(stripAccents(puzzle.answers[0]));
  const firstIndex = target > 1 ? target - 1 : target + 1;
  const first = submitMode(
    state,
    puzzle.lexicon[firstIndex],
    puzzle,
    dictionary,
  );
  assert.ok(first.ok);
  state = first.state;
  const narrowed = betweenBounds(puzzle, state);
  assert.ok(narrowed.remaining < start.remaining);
  assert.ok(
    narrowed.lowDistance < start.lowDistance ||
      narrowed.highDistance < start.highDistance,
  );
  assert.deepEqual(parseMode(state, puzzle, dictionary), state);
  const win = submitMode(state, puzzle.answers[0], puzzle, dictionary);
  assert.ok(win.ok);
  assert.equal(win.state.status, "won");
});

test("Liar changes one mark on incorrect guesses and all winning letters stay green", () => {
  const puzzle = buildModePuzzle(words.answers, dictionary, "liar", 17);
  for (const guess of ["arara", "tento", "conta", puzzle.answers[0]])
    for (let row = 0; row < 6; row++) {
      const truth = scoreGuess(guess, puzzle.answers[0]);
      const shown = feedback(puzzle, guess, puzzle.answers[0], row);
      assert.equal(
        shown.filter((mark, index) => mark !== truth[index]).length,
        stripAccents(guess) === stripAccents(puzzle.answers[0]) ? 0 : 1,
      );
      assert.deepEqual(shown, feedback(puzzle, guess, puzzle.answers[0], row));
    }
  const win = submitMode(freshMode(), puzzle.answers[0], puzzle, dictionary);
  assert.ok(win.ok);
  assert.equal(win.state.status, "won");
});

test("tries, invalid guesses, corrupt notes and fabricated terminal saves are validated", () => {
  for (const mode of ["dueto", "quarteto", "counts", "liar"] as const) {
    const puzzle = buildModePuzzle(words.answers, dictionary, mode, 1);
    const wrong = words.answers.find(
      (word) => !puzzle.answers.map(stripAccents).includes(stripAccents(word)),
    )!;
    let state: ModeState = freshMode();
    assert.equal(submitMode(state, "zzzzz", puzzle, dictionary).ok, false);
    assert.equal(state.guesses.length, 0);
    for (let row = 0; row < CONFIG[mode].tries; row++) {
      const result = submitMode(state, wrong, puzzle, dictionary);
      assert.ok(result.ok);
      state = result.state;
    }
    assert.equal(state.status, "lost");
    assert.deepEqual(parseMode(state, puzzle, dictionary), state);
    assert.equal(
      parseMode({ ...state, status: "won" }, puzzle, dictionary),
      null,
    );
    assert.equal(
      parseMode({ ...state, notes: [["bogus"]] }, puzzle, dictionary),
      null,
    );
  }
});

test("Between accepts a guess across a current endpoint without widening its interval", () => {
  const lexicon = ["abrir", "antes", "carta", "termo", "zebra"];
  const puzzle: ModePuzzle = {
    mode: "between",
    answers: ["carta"],
    lexicon,
    day: 1,
  };
  const dictionary = buildDictionary(lexicon);
  let state = freshMode();
  for (const guess of ["antes", "abrir", "zebra", "termo"]) {
    const before = betweenBounds(puzzle, state);
    const result = submitMode(state, guess, puzzle, dictionary);
    assert.ok(result.ok);
    state = result.state;
    assert.ok(betweenBounds(puzzle, state).remaining <= before.remaining);
  }
  assert.equal(betweenBounds(puzzle, state).lower, "antes");
  assert.equal(betweenBounds(puzzle, state).upper, "termo");
  assert.deepEqual(lockedLetters(puzzle, state), ["", "", "", "", ""]);
});

test("Between keeps the closest word on both sides after worse and repeated guesses, including reload", () => {
  const lexicon = [
    "abrir",
    "antes",
    "banda",
    "corda",
    "manga",
    "tento",
    "verde",
    "zebra",
  ];
  const puzzle: ModePuzzle = {
    mode: "between",
    answers: ["manga"],
    lexicon,
    day: 1,
  };
  const dictionary = buildDictionary(lexicon);
  let state = freshMode();
  for (const guess of [
    "corda",
    "tento",
    "abrir",
    "zebra",
    "antes",
    "verde",
    "corda",
    "tento",
  ]) {
    const result = submitMode(state, guess, puzzle, dictionary);
    assert.ok(result.ok);
    state = parseMode(result.state, puzzle, dictionary)!;
    const bounds = betweenBounds(puzzle, state);
    assert.equal(bounds.lower, "corda");
    if (state.guesses.length > 1) assert.equal(bounds.upper, "tento");
  }
});
