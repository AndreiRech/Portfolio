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
      theme.answers.some((answer) => answer.points >= 8),
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
  assert.match(shareText(state, 1), new RegExp(`\nAndar ${rare.points}\n`));
  assert.deepEqual(parseRarity(state), state);
  assert.equal(parseRarity({ rounds: [{ answer: "x", points: 11 }] }), null);
});

test("reported animals and countries are accepted in their broad themes", () => {
  const animals = THEMES.find((theme) => theme.name === "Animais")!;
  const countries = THEMES.find((theme) => theme.name === "Países")!;
  for (const name of [
    "nautillo",
    "náutilo",
    "penguim rei",
    "pinguim-rei",
    "polvo",
    "abelha",
  ])
    assert.ok(findAnswer(animals, name), name);
  for (const name of [
    "Sri Lanka",
    "Sudão do Sul",
    "Timor-Leste",
    "São Tomé e Príncipe",
  ])
    assert.ok(findAnswer(countries, name), name);
});

test("suggestions correct typos, match prefixes and keep guesses unsubmitted", async () => {
  const { suggestAnswers, answerKey } = await import("./rarity.ts");
  const countries = THEMES.find((theme) => theme.name === "Países")!;
  assert.equal(suggestAnswers(countries, "siri lanka")[0]?.name, "Sri Lanka");
  assert.equal(suggestAnswers(countries, "sri lan")[0]?.name, "Sri Lanka");
  assert.equal(suggestAnswers(countries, "Sri Lanka").length, 0);
  assert.equal(suggestAnswers(countries, "s").length, 0);
  assert.equal(suggestAnswers(countries, "z".repeat(101)).length, 0);
  assert.equal(suggestAnswers(countries, "zzzzz").length, 0);
  assert.ok(suggestAnswers(countries, "sao").length <= 1);
  assert.notEqual(answerKey("Nidoran♀"), answerKey("Nidoran♂"));
});

test("the local snapshots cover finite categories and thousands of animals", () => {
  const theme = (name: string) => THEMES.find((item) => item.name === name)!;
  assert.ok(theme("Animais").answers.length >= 4000);
  assert.ok(theme("Países").answers.length >= 195);
  assert.equal(theme("Elementos químicos").answers.length, 118);
  assert.equal(theme("Pokémon").answers.length, 1025);
  assert.equal(
    findAnswer(theme("Países"), "Estados Unidos da América"),
    findAnswer(theme("Países"), "EUA"),
  );
  assert.equal(findAnswer(theme("Animais"), "Cachorro")?.points, 1);
  assert.ok(
    findAnswer(theme("Animais"), "Náutilo")!.points >
      findAnswer(theme("Animais"), "Cachorro")!.points,
  );
  assert.equal(findAnswer(theme("Peixes"), "Trichechus manatus"), null);
  assert.equal(findAnswer(theme("Insetos"), "Carrapato"), null);
});
