import assert from "node:assert/strict";
import test from "node:test";
import { CULTURE, ANIMAL_LETTERS } from "../data/culture.ts";
import { AWARD_THEMES } from "../data/awards.ts";
import { GEEK } from "../data/geek.ts";
import { REVIEWED } from "../data/reviewed.ts";
import { THEMES } from "../data/themes.ts";
import { answerKey, findAnswer } from "./rarity.ts";

test("the editorial review covers every existing category and all additions reach the playable bank", () => {
  const covered = new Set(
    [...REVIEWED, ...GEEK, ...CULTURE, ...AWARD_THEMES]
      .map((theme) => theme.name)
      .concat(
        ANIMAL_LETTERS.map((letter) => `Animais que começam com ${letter}`),
      ),
  );
  assert.equal(covered.size, THEMES.length);
  assert.ok(THEMES.every((theme) => covered.has(theme.name)));
  for (const reviewed of REVIEWED) {
    const theme = THEMES.find((theme) => theme.name === reviewed.name);
    assert.ok(theme, reviewed.name);
    const keys = new Set(theme.answers.flatMap((answer) => answer.keys));
    for (const answer of reviewed.answers) {
      for (const key of answer.keys) {
        assert.ok(keys.has(key), `${reviewed.name}: ${answer.name} (${key})`);
      }
    }
  }
});

test("regional desserts and spellings are accepted with consistent scores", () => {
  const desserts = THEMES.find((theme) => theme.name === "Sobremesas")!;
  for (const name of [
    "Chico balanceado",
    "Torta de bolacha",
    "Sagu com creme",
    "Cuca de uva",
    "Grostoli",
    "Cueca virada",
    "Orelha de gato",
    "Crostoli",
    "Cartola",
  ]) {
    const answer = findAnswer(desserts, name);
    assert.ok(answer?.keys.includes(answerKey(name)), name);
  }
  assert.equal(findAnswer(desserts, "Chico balanceado")?.points, 5);
  assert.equal(
    findAnswer(desserts, "chico balançado"),
    findAnswer(desserts, "Chico balanceado"),
  );
  assert.equal(
    findAnswer(desserts, "Cueca virada"),
    findAnswer(desserts, "Grostoli"),
  );
  assert.equal(findAnswer(desserts, "Pudim")?.points, 1);
  assert.equal(
    findAnswer(
      THEMES.find((theme) => theme.name === "Animais")!,
      "Chico balanceado",
    ),
    null,
  );
});

test("finite categories retain their size and regional aliases retain one identity", () => {
  for (const [name, count] of [
    ["Estados brasileiros", 27],
    ["Pokémon", 1025],
    ["Elementos químicos", 118],
  ] as const) {
    assert.equal(
      THEMES.find((theme) => theme.name === name)!.answers.length,
      count,
    );
  }
  const fruits = THEMES.find((theme) => theme.name === "Frutas")!;
  assert.equal(
    findAnswer(fruits, "Bergamota"),
    findAnswer(fruits, "Tangerina"),
  );
  const bread = THEMES.find((theme) => theme.name === "Tipos de pão")!;
  assert.equal(
    findAnswer(bread, "Cacetinho"),
    findAnswer(bread, "Pão francês"),
  );
});
