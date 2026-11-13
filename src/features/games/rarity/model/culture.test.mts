import assert from "node:assert/strict";
import test from "node:test";
import awards from "../data/awards.json" with { type: "json" };
import { ANIMAL_LETTERS, CULTURE } from "../data/culture.ts";
import { AWARD_THEMES } from "../data/awards.ts";
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

test("every main-series first partner is present, including Pikachu and Eevee", () => {
  const generations = [
    "Bulbasaur Charmander Squirtle",
    "Chikorita Cyndaquil Totodile",
    "Treecko Torchic Mudkip",
    "Turtwig Chimchar Piplup",
    "Snivy Tepig Oshawott",
    "Chespin Fennekin Froakie",
    "Rowlet Litten Popplio",
    "Grookey Scorbunny Sobble",
    "Sprigatito Fuecoco Quaxly",
    "Pikachu Eevee",
  ];
  const expected = generations.join(" ").split(" ");
  assert.equal(theme("Pokémon iniciais").answers.length, 29);
  for (const name of expected) {
    exact("Pokémon iniciais", name);
    exact("Famílias dos Pokémon iniciais", name);
  }
  for (const name of [
    "Ivysaur",
    "Charizard",
    "Feraligatr",
    "Swampert",
    "Greninja",
    "Incineroar",
    "Rillaboom",
    "Meowscarada",
    "Skeledirge",
    "Quaquaval",
    "Pichu",
    "Raichu",
    "Umbreon",
    "Sylveon",
  ]) {
    exact("Famílias dos Pokémon iniciais", name);
  }
  // Evolution relatives do not silently redefine which species are first partners.
  assert.equal(findAnswer(theme("Pokémon iniciais"), "Charizard"), null);
  for (const answer of theme("Famílias dos Pokémon iniciais").answers)
    exact("Pokémon", answer.name);
});

test("letter categories use Portuguese labels and exclude scientific or cross-letter aliases", () => {
  for (const letter of ANIMAL_LETTERS) {
    const category = theme(`Animais que começam com ${letter}`);
    for (const answer of category.answers) {
      assert.ok(
        answerKey(answer.name).startsWith(letter.toLowerCase()),
        answer.name,
      );
      assert.ok(
        answer.keys.every((key) => key.startsWith(letter.toLowerCase())),
        answer.name,
      );
      exact("Animais", answer.name);
    }
  }
  for (const [letter, names] of [
    ["M", ["Macaco", "Morcego", "Mosquito"]],
    ["G", ["Gato", "Girafa", "Gorila"]],
    ["C", ["Cão", "Chita"]],
    ["A", ["Asno", "Abelha"]],
  ] as const) {
    for (const name of names) exact(`Animais que começam com ${letter}`, name);
  }
  assert.equal(findAnswer(theme("Animais que começam com M"), "Gato"), null);
  assert.equal(findAnswer(theme("Animais que começam com G"), "Macaco"), null);
  assert.equal(
    findAnswer(theme("Animais que começam com C"), "Canis lupus familiaris"),
    null,
  );
});

test("dinosaur names include Portuguese and scientific forms without marine reptiles or fictional hybrids", () => {
  for (const [first, alias] of [
    ["Tiranossauro", "Tyrannosaurus rex"],
    ["Braquiossauro", "Brachiosaurus"],
    ["Estauricossauro", "Staurikosaurus"],
    ["Argentinossauro", "Argentinosaurus"],
    ["Deinonico", "Deinonychus"],
  ]) {
    assert.equal(exact("Dinossauros", first), exact("Dinossauros", alias));
  }
  for (const name of [
    "Herrerasaurus",
    "Baryonyx",
    "Pachyrhinosaurus",
    "Nigersaurus",
    "Borealopelta",
  ]) {
    exact("Dinossauros", name);
    exact("Animais", name);
  }
  for (const name of [
    "Pterodáctilo",
    "Mosassauro",
    "Plesiossauro",
    "Indominus",
  ]) {
    assert.equal(findAnswer(theme("Dinossauros"), name), null, name);
  }
});

test("football aliases retain identities for different players with similar names", () => {
  for (const [first, alias] of [
    ["Ronaldinho", "Ronaldinho Gaúcho"],
    ["Ronaldo", "Ronaldo Fenômeno"],
    ["Neto", "Craque Neto"],
    ["Maldini", "Paolo Maldini"],
    ["Pretinha", "Delma Gonçalves"],
  ]) {
    assert.equal(
      exact("Jogadores de futebol", first),
      exact("Jogadores de futebol", alias),
    );
  }
  for (const name of [
    "Cruyff",
    "Batistuta",
    "Gerrard",
    "Rogério Ceni",
    "Mary Earps",
    "Kerolin",
    "Lauren James",
  ])
    exact("Jogadores de futebol", name);
  assert.notEqual(
    exact("Jogadores de futebol", "Falcão"),
    exact("Jogadores de futebol", "Radamel Falcao"),
  );
  assert.notEqual(
    exact("Jogadores de futebol", "Gérson"),
    exact("Jogadores de futebol", "Gerson do Flamengo"),
  );
  assert.notEqual(
    exact("Jogadores de futebol", "Müller"),
    exact("Jogadores de futebol", "Thomas Müller"),
  );
});

test("award entries retain provenance and include winners rather than only nominees", () => {
  assert.equal(
    theme("Bandas que ganharam Grammy").answers.length,
    awards.bands.length,
  );
  assert.equal(
    theme("Filmes premiados pelo Oscar").answers.length,
    awards.films.length,
  );
  for (const band of awards.bands) {
    exact("Bandas que ganharam Grammy", band.name);
    assert.ok(band.work.length > 0);
    assert.ok(band.year >= 1959);
    assert.equal(new URL(band.source).hostname, "www.grammy.com");
  }
  for (const film of awards.films) {
    assert.equal(
      exact("Filmes premiados pelo Oscar", film.name),
      exact("Filmes premiados pelo Oscar", film.english),
    );
    exact("Filmes", film.name);
    assert.ok(film.category.length > 0);
    assert.ok(film.year >= 1929);
    assert.equal(new URL(film.source).hostname, "www.oscars.org");
  }
  for (const band of ["Metallica", "Linkin Park", "Paramore", "Daft Punk"])
    exact("Bandas que ganharam Grammy", band);
  for (const band of ["Queen", "Rush", "Pantera"])
    assert.equal(
      findAnswer(theme("Bandas que ganharam Grammy"), band),
      null,
      band,
    );
  for (const film of [
    "Titanic",
    "Matrix",
    "Ainda Estou Aqui",
    "A Viagem de Chihiro",
  ])
    exact("Filmes premiados pelo Oscar", film);
  // These films were nominated but never won a competitive Oscar.
  for (const film of [
    "Cidade de Deus",
    "Um Sonho de Liberdade",
    "Central do Brasil",
  ])
    assert.equal(
      findAnswer(theme("Filmes premiados pelo Oscar"), film),
      null,
      film,
    );
});

test("mythologies, foods and all curated additions reach the playable bank", () => {
  for (const source of [...CULTURE, ...AWARD_THEMES]) {
    const keys = new Set(
      theme(source.name).answers.flatMap((answer) => answer.keys),
    );
    for (const answer of source.answers)
      for (const key of answer.keys)
        assert.ok(keys.has(key), `${source.name}: ${answer.name}`);
  }
  for (const [category, names] of [
    ["Mitologia nórdica", ["Odin", "Freyja", "Mjölnir", "Yggdrasil"]],
    ["Mitologia romana", ["Júpiter", "Jano", "Rômulo", "Vesta"]],
    ["Mitologia egípcia", ["Anúbis", "Ísis", "Osíris", "Rá"]],
    ["Mitologia japonesa", ["Amaterasu", "Susanoo", "Izanagi", "Kitsune"]],
    ["Comidas azedas", ["Limão", "Tamarindo", "Chucrute", "Bilimbi"]],
  ] as const)
    for (const name of names) exact(category, name);
  assert.equal(findAnswer(theme("Comidas azedas"), "Brigadeiro"), null);
});
