import assert from "node:assert/strict";
import test from "node:test";
import { THEMES } from "../data/themes.ts";
import {
  THEMES_PER_DAY,
  answerTheme,
  findAnswer,
  initialRarity,
  isOver,
  parseBank,
  parseRarity,
  passTheme,
  shareText,
  themesFor,
  totalPoints,
} from "./rarity.ts";

test("every theme has enough answers, valid points and no duplicate spellings", () => {
  assert.ok(THEMES.length >= 40);
  assert.equal(new Set(THEMES.map((theme) => theme.name)).size, THEMES.length);
  for (const theme of THEMES) {
    assert.ok(theme.answers.length >= 20, theme.name);
    const keys = theme.answers.flatMap((answer) => answer.keys);
    assert.equal(new Set(keys).size, keys.length, `${theme.name}: ${keys}`);
    for (const answer of theme.answers) {
      assert.ok(
        Number.isInteger(answer.points) &&
          answer.points >= 1 &&
          answer.points <= 10,
        `${theme.name}: ${answer.name}`,
      );
      assert.ok(answer.keys.every(Boolean), `${theme.name}: ${answer.name}`);
    }
    assert.ok(
      theme.answers.some((answer) => answer.points === 1),
      theme.name,
    );
    assert.ok(
      theme.answers.some((answer) => answer.points >= 9),
      theme.name,
    );
  }
});

test("answers match regardless of case, accents, plurals, spacing and one typo", () => {
  const [theme] = parseBank(
    "Doces | Brigadeiro:1, Pé de moleque|Pé-de-moleque:4, Camafeu:9, C++:3, C:2",
  );
  assert.equal(findAnswer(theme, "BRIGADEIROS")?.points, 1);
  assert.equal(findAnswer(theme, "pe de moleque")?.name, "Pé de moleque");
  assert.equal(findAnswer(theme, "pedemoleque")?.points, 4);
  assert.equal(findAnswer(theme, "brigadero")?.points, 1);
  assert.equal(findAnswer(theme, "c++")?.points, 3);
  assert.equal(findAnswer(theme, "c")?.points, 2);
  assert.equal(findAnswer(theme, "bolo"), null);
  assert.equal(findAnswer(theme, "   "), null);
});

test("each day has five different themes and a theme waits for the others before returning", () => {
  const perCycle = Math.floor(THEMES.length / THEMES_PER_DAY);
  const seen: string[] = [];
  for (let day = 1; day <= perCycle; day++) {
    const themes = themesFor(THEMES, day);
    assert.equal(themes.length, THEMES_PER_DAY);
    seen.push(...themes.map((theme) => theme.name));
  }
  assert.equal(new Set(seen).size, seen.length);
});

test("a day scores the rarity of each answer, skips score zero", () => {
  const themes = themesFor(THEMES, 1);
  let state = initialRarity();
  assert.deepEqual(answerTheme(state, themes, "zzzz"), {
    ok: false,
    reason: "unknown",
  });
  const rare = [...themes[0].answers].sort((a, b) => b.points - a.points)[0];
  const result = answerTheme(state, themes, rare.name);
  assert.ok(result.ok);
  state = result.state;
  for (let i = 1; i < THEMES_PER_DAY; i++) state = passTheme(state);
  assert.ok(isOver(state));
  assert.equal(totalPoints(state), rare.points);
  assert.match(
    shareText(state, 1),
    new RegExp(`^Raridade #1 · ${rare.points}/50`),
  );
  assert.deepEqual(parseRarity(state), state);
  assert.equal(parseRarity({ rounds: [{ answer: "x", points: 11 }] }), null);
});
