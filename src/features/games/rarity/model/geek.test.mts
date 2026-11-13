import assert from "node:assert/strict";
import test from "node:test";
import { GEEK } from "../data/geek.ts";
import { expandThemes } from "../data/expand.ts";
import { THEMES } from "../data/themes.ts";
import { answerKey, findAnswer, type Theme } from "./rarity.ts";

const theme = (name: string) => {
  const result = THEMES.find((theme) => theme.name === name);
  assert.ok(result, name);
  return result;
};
const exact = (category: Theme, name: string) => {
  const result = findAnswer(category, name);
  assert.ok(
    result?.keys.includes(answerKey(name)),
    `${category.name}: ${name}`,
  );
  return result;
};

test("Counter-Strike versions have exact aliases and remain different answers", () => {
  for (const category of [theme("Jogos de videogame"), theme("Jogos FPS")]) {
    const variants = [
      ["Counter-Strike 2", "cs2"],
      ["Counter-Strike Global Offensive", "csgo"],
      ["Counter-Strike Source", "cssource"],
      ["Counter-Strike 1.6", "cs1.6"],
      ["Counter-Strike Condition Zero", "cscz"],
    ];
    const answers = variants.map(([full, short]) => {
      const answer = exact(category, full);
      assert.equal(answer, exact(category, short));
      return answer;
    });
    assert.equal(new Set(answers).size, variants.length);
    for (const name of ["CS 1.5", "CS 1.3"]) exact(category, name);
  }
  exact(theme("Jogos de videogame"), "peak");
  assert.equal(findAnswer(theme("Jogos FPS"), "peak"), null);
});

test("Pokémon paired versions, remakes and spin-offs reach their appropriate categories", () => {
  for (const category of [
    theme("Jogos de videogame"),
    theme("Jogos de Pokémon"),
    theme("Jogos RPG"),
    theme("Jogos de Nintendo"),
  ]) {
    const ruby = exact(category, "Pokémon Omega Ruby");
    assert.equal(ruby, exact(category, "Omega Ruby"));
    const sapphire = exact(category, "Pokémon Alpha Sapphire");
    assert.notEqual(ruby, sapphire);
    assert.notEqual(ruby, exact(category, "Pokémon Ruby"));
    assert.notEqual(sapphire, exact(category, "Pokémon Sapphire"));
    assert.notEqual(
      exact(category, "Pokémon Black"),
      exact(category, "Pokémon Black 2"),
    );
  }
  exact(theme("Jogos de Pokémon"), "Pokémon Go");
  exact(theme("Jogos de videogame"), "Pokémon Go");
  assert.equal(findAnswer(theme("Jogos de Nintendo"), "Pokémon Go"), null);
  exact(theme("Pokémon iniciais"), "Chespin");
  exact(theme("Pokémon lendários"), "Rayquaza");
  assert.equal(findAnswer(theme("Pokémon lendários"), "Mew"), null);
});

test("localized titles and nicknames match without fuzzy guesses", () => {
  for (const [category, first, second] of [
    [
      "Filmes",
      "O Senhor dos Anéis A Sociedade do Anel",
      "The Fellowship of the Ring",
    ],
    [
      "Filmes",
      "Homem-Aranha no Aranhaverso",
      "Spider-Man Into the Spider-Verse",
    ],
    ["Séries", "Ruptura", "Severance"],
    ["Séries", "Round 6", "Squid Game"],
    ["Animes", "Cavaleiros do Zodíaco", "Saint Seiya"],
    ["Animes", "Attack on Titan", "Shingeki no Kyojin"],
    ["Jogadores profissionais de Counter-Strike", "fallen", "Gabriel Toledo"],
    [
      "Jogadores profissionais de Counter-Strike",
      "s1mple",
      "Oleksandr Kostyliev",
    ],
    ["Mapas de Counter-Strike", "de_dust2", "Dust II"],
    ["Consoles de videogame", "PS5", "PlayStation 5"],
  ]) {
    assert.equal(exact(theme(category), first), exact(theme(category), second));
  }
  const pros = theme("Jogadores profissionais de Counter-Strike");
  for (const nickname of [
    "donk",
    "coldzera",
    "KSCERATO",
    "cogu",
    "Gaules",
    "kennyS",
    "f0rest",
    "GeT_RiGhT",
  ])
    exact(pros, nickname);
  assert.notEqual(
    exact(theme("Filmes"), "Homem-Aranha"),
    exact(theme("Filmes"), "Homem-Aranha 2"),
  );
  assert.notEqual(
    exact(theme("Animes"), "Dragon Ball"),
    exact(theme("Animes"), "Dragon Ball Z"),
  );
});

test("every geek spelling is playable and broad themes include specialized titles", () => {
  for (const source of GEEK) {
    const keys = new Set(
      theme(source.name).answers.flatMap((answer) => answer.keys),
    );
    for (const answer of source.answers) {
      for (const key of answer.keys)
        assert.ok(keys.has(key), `${source.name}: ${answer.name}`);
    }
  }
  for (const [broad, specialized] of [
    [
      "Jogos de videogame",
      [
        "Jogos FPS",
        "Jogos RPG",
        "Jogos de Nintendo",
        "Jogos de PlayStation",
        "Jogos de Xbox",
        "Jogos de Pokémon",
      ],
    ],
    ["Filmes", ["Filmes da Pixar", "Filmes de animação"]],
    ["Séries", ["Animes"]],
  ] as const) {
    const broadKeys = new Set(
      theme(broad).answers.flatMap((answer) => answer.keys),
    );
    for (const name of specialized) {
      for (const answer of theme(name).answers) {
        for (const key of answer.keys)
          assert.ok(broadKeys.has(key), `${broad}: ${name}: ${key}`);
      }
    }
  }
});

test("expansion does not mutate source lists or share answers between categories", () => {
  const original = JSON.stringify(GEEK);
  const input = THEMES.filter(
    (theme) => !GEEK.some((source) => source.name === theme.name),
  );
  // Supply the broad game category as well; all other prerequisite themes are in input.
  const bank = [...input, { name: "Jogos de videogame", answers: [] }];
  const first = expandThemes(bank);
  const second = expandThemes(bank);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(GEEK), original);
  const fps = first.find((theme) => theme.name === "Jogos FPS")!;
  const games = first.find((theme) => theme.name === "Jogos de videogame")!;
  const fpsAnswer = fps.answers.find((answer) =>
    answer.keys.includes(answerKey("cs2")),
  )!;
  const gameAnswer = games.answers.find((answer) =>
    answer.keys.includes(answerKey("cs2")),
  )!;
  assert.notEqual(fpsAnswer, gameAnswer);
  assert.notEqual(fpsAnswer.keys, gameAnswer.keys);
  fpsAnswer.points = 10;
  assert.notEqual(gameAnswer.points, 10);
});

// Independently transcribed from the user's map table (all five games/versions).
test("every map in the supplied reference table is accepted, including retired operation maps", () => {
  const reference = `
Aztec;Cobblestone;Clan1 Mill;CPL Mill;Dust;Dust II;Inferno;Nuke;Mirage;Prodigy;Train;Tuscan;
Oilrig;747;Assault;Backalley;Estate;Havana;Italy;Militia;Office;Siege;Airstrip;Chateau;Piranesi;Storm;Survivor;Torn;Vertigo;
Corruption;Downed;Fastline;Sienna;Stadium;Tides;Truth;Vostok;
Contra;CPL Strike;Russka;Season;Compound;Port;
Ancient;Anubis;Overpass;Agency;Cache;Canals;Boyard;Chalice;Lake;Shortdust;Shortnuke;
Baggage;Bank;Dizzy;Lunacy;Monastery;Safehouse;Shoots;St Marc;Sugarcane;Blacksite;County;Sirocco;
Apollo;Elysion;Engage;Frostbite;Guard;Jungle;Studio;Austria;Black Gold;Insertion;Lite;Thrill;Shipped;
Coast;Cruise;Empire;Mikla;Royal;Santorini;Tulip;Crashsite;Log;Rails;Resort;Zoo;
Bazaar;Facade;Marquis;Workout;Castle;Mist;Overgrown;Rush;Ali;Downtown;Favela;Motel;Thunder;
Chinatown;Gwalior;Ruins;Library;Museum;Seaside;Abbey;Biome;Basalt;Breach;Chlorine;Grind;Insertion II;Mocha;Mutiny;Ruby;Subzero;Swamp;
Boulder;Fachwerk;Shelter;Pool Day;Debris;El Dorado;Alpine;Brewery;Dogtown;Edin;Golden;Grail;Jura;Mills;Palacio;Poseidon;Rooftop;Sanctum;Stronghold;Thera;Warden
`
    .trim()
    .split(/;|\n/)
    .map((name) => name.trim())
    .filter(Boolean);
  const maps = theme("Mapas de Counter-Strike");
  for (const name of reference) exact(maps, name);
  for (const [name, aliases] of [
    ["Pool Day", ["ar_pool_day", "fy_pool_day"]],
    ["Oilrig", ["as_oilrig"]],
    ["747", ["cs_747"]],
    ["CPL Mill", ["de_cpl_mill"]],
    ["Blacksite", ["dz_blacksite"]],
    ["Frostbite", ["dz_frostbite"]],
  ] as const) {
    for (const alias of aliases)
      assert.equal(exact(maps, name), exact(maps, alias));
  }
});
