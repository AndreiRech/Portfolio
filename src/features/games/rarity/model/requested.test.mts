import assert from "node:assert/strict";
import test from "node:test";
import snapshot from "../data/catalogs.json" with { type: "json" };
import { REQUESTED } from "../data/requested.ts";
import { THEMES } from "../data/themes.ts";
import { answerKey, findAnswer } from "./rarity.ts";

const theme = (name: string) => {
  const value = THEMES.find((theme) => theme.name === name);
  assert.ok(value, name);
  return value;
};
const exact = (category: string, name: string) => {
  const value = findAnswer(theme(category), name);
  assert.ok(value?.keys.includes(answerKey(name)), `${category}: ${name}`);
  return value;
};

test("player-reported gaps are accepted as common answers", () => {
  for (const [category, names] of [
    [
      "Profissões",
      ["Vendedor", "Mecânico", "Pintor", "Youtuber", "Babá", "Frentista"],
    ],
    [
      "Coisas que têm no zoológico",
      ["Pavão", "Ema", "Leão-marinho", "Arara-azul", "Tratador"],
    ],
    [
      "Personagens bíblicos",
      ["Lúcifer", "Gabriel", "Ló", "Nabucodonosor", "André", "Bartolomeu"],
    ],
  ] as const) {
    for (const name of names) {
      // Answers that many players give must not score as rarities.
      assert.ok(exact(category, name)!.points <= 5, `${category}: ${name}`);
    }
  }
});

test("every requested category exists and its additions reach the bank", () => {
  for (const requested of REQUESTED) {
    const keys = new Set(
      theme(requested.name).answers.flatMap((answer) => answer.keys),
    );
    for (const answer of requested.answers)
      for (const key of answer.keys)
        assert.ok(keys.has(key), `${requested.name}: ${answer.name}`);
  }
});

test("catalog snapshots fill their themes without overriding editorial scores", () => {
  const catalogs: Record<string, (string | number)[][]> = snapshot.catalogs;
  assert.ok(catalogs["Profissões"].length > 3000);
  for (const [name, rows] of Object.entries(catalogs)) {
    assert.ok(rows.length >= 50, name);
    for (const [label] of rows.slice(0, 20)) exact(name, String(label));
  }
  // Editorial scores win over the catalog default of 8 for one-word titles.
  assert.ok(exact("Profissões", "Pedreiro")!.points < 8);
  assert.equal(exact("Profissões", "Vendedor")!.points, 2);
  // "São Salvador" must not turn the Brazilian city into a world capital.
  assert.equal(findAnswer(theme("Capitais do mundo"), "Salvador"), null);
  exact("Capitais do mundo", "San Salvador");
});

test("derived zoo and flying answers follow the animal groups", () => {
  for (const name of ["Sabiá", "Bem-te-vi", "Morcego", "Borboleta"])
    exact("Coisas que voam", name);
  for (const name of ["Pinguim", "Avestruz", "Ema", "Formiga"])
    assert.equal(findAnswer(theme("Coisas que voam"), name), null, name);
  assert.equal(
    findAnswer(theme("Coisas que têm no zoológico"), "Barata"),
    null,
  );
  for (const name of ["Galo", "Rolinha"]) exact("Aves", name);
  for (const name of ["Hamster", "Bezerro", "Pintinho"]) exact("Animais", name);
});

test("narrow themes stay inside the broad themes that contain them", () => {
  const pairs = [
    ["Aves", "Animais"],
    ["Peixes", "Animais"],
    ["Insetos", "Animais"],
    ["Animais marinhos", "Animais"],
    ["Animais da Amazônia", "Animais"],
    ["Dinossauros", "Animais"],
    ["Jogos FPS", "Jogos de videogame"],
    ["Jogos RPG", "Jogos de videogame"],
    ["Jogos de Pokémon", "Jogos de videogame"],
    ["Jogos de Nintendo", "Jogos de videogame"],
    ["Jogos de PlayStation", "Jogos de videogame"],
    ["Jogos de Xbox", "Jogos de videogame"],
    ["Filmes da Pixar", "Filmes de animação"],
    ["Filmes de animação", "Filmes"],
    ["Filmes premiados pelo Oscar", "Filmes"],
    ["Animes", "Séries"],
    ["Animes", "Desenhos animados"],
    ["Esportes olímpicos", "Esportes"],
    ["Pokémon iniciais", "Pokémon"],
    ["Pokémon lendários", "Pokémon"],
  ] as const;
  for (const [narrow, broad] of pairs) {
    const keys = new Set(theme(broad).answers.flatMap((answer) => answer.keys));
    for (const answer of theme(narrow).answers)
      assert.ok(
        answer.keys.some((key) => keys.has(key)),
        `${narrow} → ${broad}: ${answer.name}`,
      );
  }
});

test("animals named in zoo, farm and flying themes are also animals", () => {
  for (const name of [
    "Lobo-guará",
    "Mico-leão-dourado",
    "Ararinha-azul",
    "Bonobo",
    "Iaque",
    "Chacal",
    "Gavial",
    "Égua",
    "Potro",
    "Cabrito",
    "Leitão",
    "Esquilo-voador",
  ])
    exact("Animais", name);
  exact("Animais que começam com M", "Mico-leão-dourado");
  exact("Animais que começam com L", "Lobo-guará");
  exact("Animais que começam com C", "Chacal");
  exact("Aves", "Ararinha-azul");
});
