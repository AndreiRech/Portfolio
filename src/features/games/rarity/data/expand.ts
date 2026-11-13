import external from "./external.json" with { type: "json" };
import snapshot from "./catalogs.json" with { type: "json" };
import {
  answerKey,
  parseBank,
  type Answer,
  type Theme,
} from "../model/rarity.ts";
import { CULTURE, ANIMAL_LETTERS } from "./culture.ts";
import { AWARD_THEMES } from "./awards.ts";
import { GEEK } from "./geek.ts";
import { REVIEWED } from "./reviewed.ts";
import { SUPPLEMENTAL } from "./supplemental.ts";

const ELEMENTS =
  `Hidrogênio Hélio Lítio Berílio Boro Carbono Nitrogênio Oxigênio Flúor Neônio Sódio Magnésio Alumínio Silício Fósforo Enxofre Cloro Argônio Potássio Cálcio Escândio Titânio Vanádio Cromo Manganês Ferro Cobalto Níquel Cobre Zinco Gálio Germânio Arsênio Selênio Bromo Criptônio Rubídio Estrôncio Ítrio Zircônio Nióbio Molibdênio Tecnécio Rutênio Ródio Paládio Prata Cádmio Índio Estanho Antimônio Telúrio Iodo Xenônio Césio Bário Lantânio Cério Praseodímio Neodímio Promécio Samário Európio Gadolínio Térbio Disprósio Hólmio Érbio Túlio Itérbio Lutécio Háfnio Tântalo Tungstênio Rênio Ósmio Irídio Platina Ouro Mercúrio Tálio Chumbo Bismuto Polônio Astato Radônio Frâncio Rádio Actínio Tório Protactínio Urânio Netúnio Plutônio Amerício Cúrio Berquélio Califórnio Einstênio Férmio Mendelévio Nobélio Laurêncio Rutherfórdio Dúbnio Seabórgio Bóhrio Hássio Meitnério Darmstádtio Roentgênio Copernício Nihônio Fleróvio Moscóvio Livermório Tenessino Oganessônio`.split(
    " ",
  );

const entry = (
  name: string,
  points: number,
  aliases: string[] = [],
): Answer => ({
  name,
  points,
  keys: [...new Set([name, ...aliases].map(answerKey))],
});

/** Merge aliases for the same answer; no alias can earn a different score. */
export function mergeAnswers(target: Theme, additions: readonly Answer[]) {
  const keys = new Map(
    target.answers.flatMap((answer) =>
      answer.keys.map((key) => [key, answer] as const),
    ),
  );
  for (const addition of additions) {
    const matches = [
      ...new Set(
        addition.keys.flatMap((key) => (keys.get(key) ? [keys.get(key)!] : [])),
      ),
    ];
    const canonical = matches[0] ?? { ...addition, keys: [] };
    if (!matches.length) target.answers.push(canonical);
    // A source can bridge two previously separate aliases of one answer.
    for (const duplicate of matches.slice(1)) {
      canonical.keys.push(...duplicate.keys);
      canonical.points = Math.min(canonical.points, duplicate.points);
      target.answers.splice(target.answers.indexOf(duplicate), 1);
    }
    canonical.keys = [...new Set([...canonical.keys, ...addition.keys])];
    for (const key of canonical.keys) keys.set(key, canonical);
  }
}

/** All data is bundled. Sources are refreshed manually, never during a round. */
export function expandThemes(bank: Theme[]): Theme[] {
  const themes = bank.map((theme) => ({
    ...theme,
    answers: theme.answers.map((answer) => ({
      ...answer,
      keys: [...answer.keys],
    })),
  }));
  const byName = new Map(themes.map((theme) => [theme.name, theme]));
  const add = (name: string, answers: readonly Answer[]) => {
    const target = byName.get(name);
    if (target) mergeAnswers(target, answers);
  };
  // The old top scores were too generous. Reserve 10 for specialist answers.
  const recalibrate = [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9];
  for (const theme of themes)
    for (const answer of theme.answers)
      answer.points = recalibrate[answer.points];
  for (const theme of [...SUPPLEMENTAL, ...REVIEWED])
    add(theme.name, theme.answers);

  // Names accidentally present in unrelated old categories.
  const remove: Record<string, string[]> = {
    Peixes: ["Peixe-boi"],
    Insetos: ["Carrapato"],
    "Cores de cabelo": ["Chanel", "Ombré", "Luzes", "Mechas", "Balayage"],
  };
  for (const [name, names] of Object.entries(remove)) {
    const theme = byName.get(name)!;
    const excluded = new Set(names.map(answerKey));
    theme.answers = theme.answers.filter(
      (answer) => !excluded.has(answerKey(answer.name)),
    );
  }
  add(
    "Países",
    external.countries.map((name) => entry(name, 8)),
  );
  add(
    "Elementos químicos",
    ELEMENTS.map((name) => entry(name, 9)),
  );
  add(
    "Pokémon",
    external.pokemon.map((slug) =>
      entry(
        slug
          .split("-")
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join("-"),
        7,
      ),
    ),
  );
  for (const theme of parseBank(`
Pokémon | Mr. Mime|Mr Mime:5, Mime Jr.|Mime Junior:7, Type: Null|Tipo Nulo:8, Nidoran♀|Nidoran f|Nidoran fêmea:5, Nidoran♂|Nidoran m|Nidoran macho:5, Farfetch'd|Farfetchd:5, Sirfetch'd|Sirfetchd:7, Flabébé|Flabebe:7, Ho-Oh|Ho Oh:5, Porygon-Z|Porygon Z:6, Jangmo-o:8, Hakamo-o:8, Kommo-o:8
Elementos químicos | Nitrogênio|Azoto:3, Tungstênio|Volfrâmio:7, Nihônio|Nipônio:9, Tenessino|Tenesso|Tenessíneo:9, Oganessônio|Oganésson|Oganesson:9, Darmstádtio|Darmstádio:9, Roentgênio|Roentgénio:9, Seabórgio|Seaborgio:9, Bóhrio|Bohrio:9
`))
    add(theme.name, theme.answers);

  // Category union fixes broad animal questions rejecting birds, fish or insects.
  for (const name of [
    "Aves",
    "Peixes",
    "Insetos",
    "Animais marinhos",
    "Animais da Amazônia",
    "Dinossauros",
  ])
    add(
      "Animais",
      byName.get(name)!.answers.map((answer) => ({
        ...answer,
        points: Math.min(9, answer.points + 1),
      })),
    );
  const imported: Record<string, Answer[]> = {
    Animais: [],
    Aves: [],
    Peixes: [],
    Insetos: [],
  };
  for (const taxon of external.taxa) {
    const names = taxon.names;
    const answer = entry(
      names[0],
      names[0].split(/[\s-]+/).length >= 3 ? 9 : 8,
      [...names.slice(1), taxon.scientific],
    );
    imported.Animais.push(answer);
    if (taxon.category === "Aves") imported.Aves.push(answer);
    if (taxon.category === "Actinopterygii") imported.Peixes.push(answer);
    if (taxon.category === "Insecta") imported.Insetos.push(answer);
  }
  for (const [name, answers] of Object.entries(imported)) add(name, answers);
  // Familiar countries must not inherit the generic score of an imported name.
  for (const theme of parseBank(`
Países | África do Sul:4, Áustria:5, Bélgica:5, Bolívia:4, Cuba:4, Dinamarca:5, Equador:5, Finlândia:6, Haiti:6, Indonésia:6, Irã:5, Iraque:5, Irlanda:5, Israel:4, Jamaica:5, Nova Zelândia:5, Polônia:5, Suécia:5, Venezuela:4, Coreia do Norte:5, República da Coreia:5, Reino Unido:4, Arábia Saudita:5, Catar:5, Croácia:5, Costa Rica:6, Sérvia:6, Ucrânia:4, Romênia:6, Hungria:6, Bulgária:6, Eslováquia:7, Eslovênia:7, Estônia:7, Letônia:7, Lituânia:7, Albânia:7, Malta:7, Chipre:7, Mônaco:6, Andorra:7, Liechtenstein:8, San Marino:8, Luxemburgo:7, Montenegro:7, Geórgia:7, Armênia:7, Azerbaijão:8, Afeganistão:6, Bangladesh:7, Paquistão:6, Malásia:6, Singapura:6, Filipinas:6, Vietnã:6, Tailândia:5, Camboja:7, Laos:8, Brunei:8, Maldivas:6, Sri Lanka:7, Butão:8, Timor-Leste:7, Uzbequistão:8, Quirguistão:9, Tadjiquistão:9, Turcomenistão:9, Cazaquistão:7, Iêmen:7, Síria:6, Líbano:6, Jordânia:7, Kuwait:7, Barein:8, Omã:8, Etiópia:6, Quênia:6, Senegal:6, Gana:6, Camarões:6, Costa do Marfim:6, Argélia:6, Tunísia:6, Líbia:6, Sudão:7, República Democrática do Congo:7, República do Congo:8, Madagascar:6, Zimbábue:7, Zâmbia:8, Namíbia:8, Botsuana:8, Ruanda:7, Uganda:8, Tanzânia:7, Benin:9, Togo:8, Burkina Faso:9, Burundi:9, Chade:8, Comores:9, Djibouti:9, Gabão:8, Gâmbia:9, Guiné:8, Guiné-Bissau:7, Guiné Equatorial:8, Libéria:8, Mali:8, Mauritânia:9, Malauí:9, Maurício:8, Niger:8, República Centro-Africana:9, São Tomé e Príncipe:8, Seichelles:8, Serra Leoa:8, Somália:7, Essuatíni:9, Eritreia:9, Lesoto:9, Nauru:9, Kiribati:9, Palau:9, Micronésia:9, Ilhas Marshall:9, Tuvalu:9, Tonga:8, Vanuatu:9, Samoa:8, Fiji:7, Ilhas Salomão:9, Papua Nova Guiné:8, Bahamas:6, Barbados:7, Belize:8, Dominica:9, Granada:9, Santa Lúcia:8, Antígua e Barbuda:9, São Cristóvão e Névis:9, São Vicente e Granadinas:9, Honduras:7, Guatemala:7, El Salvador:7, Nicarágua:7, Panamá:6, República Dominicana:6, Trinidad e Tobago:7, Guiana:7
Pokémon | Bidoof:5, Klefki:8, Luvdisc:8, Lucario:4, Greninja:4, Mudkip:5, Torchic:5, Treecko:5
`)) {
    const target = byName.get(theme.name)!;
    for (const revised of theme.answers) {
      const answer = target.answers.find((known) =>
        known.keys.some((key) => revised.keys.includes(key)),
      );
      if (answer) answer.points = revised.points;
    }
  }
  // Register new themes and extend existing ones without sharing mutable answers.
  for (const category of [...GEEK, ...CULTURE, ...AWARD_THEMES]) {
    if (!byName.has(category.name)) {
      const theme: Theme = { name: category.name, answers: [] };
      themes.push(theme);
      byName.set(theme.name, theme);
    }
    add(category.name, category.answers);
  }
  // Catalog snapshots only fill what the editorial lists are missing.
  const catalogs: Record<string, (string | number)[][]> = snapshot.catalogs;
  for (const [name, rows] of Object.entries(catalogs))
    add(
      name,
      rows.map(([label, points, ...aliases]) =>
        entry(String(label), Number(points), aliases.map(String)),
      ),
    );
  // Pokémon console/handheld releases also belong in Nintendo; mobile/PC-only
  // services are deliberately excluded from this platform category.
  const mobilePokemon = new Set([
    "Pokémon Go",
    "Pokémon Sleep",
    "Pokémon Masters EX",
    "Pokémon Rumble Rush",
    "Pokémon Trading Card Game Online",
    "Pokémon Trading Card Game Live",
    "Pokémon Trading Card Game Pocket",
  ]);
  add(
    "Jogos de Nintendo",
    byName
      .get("Jogos de Pokémon")!
      .answers.filter((answer) => !mobilePokemon.has(answer.name)),
  );
  // Every specialized game/movie title is also valid in the broad category.
  for (const name of [
    "Jogos FPS",
    "Jogos RPG",
    "Jogos de Pokémon",
    "Jogos de Nintendo",
    "Jogos de PlayStation",
    "Jogos de Xbox",
  ])
    add("Jogos de videogame", byName.get(name)!.answers);
  for (const name of ["Filmes da Pixar", "Filmes de animação"])
    add("Filmes", byName.get(name)!.answers);
  add("Séries", byName.get("Animes")!.answers);
  add("Desenhos animados", byName.get("Animes")!.answers);
  // Restore real dinosaur genera and remove fictional/misclassified old entries.
  const notDinosaurs = new Set(
    ["Pterodáctilo", "Mosassauro", "Plesiossauro", "Indominus"].map(answerKey),
  );
  byName.get("Dinossauros")!.answers = byName
    .get("Dinossauros")!
    .answers.filter((answer) => !notDinosaurs.has(answerKey(answer.name)));
  byName.get("Animais")!.answers = byName
    .get("Animais")!
    .answers.filter((answer) => !answer.keys.includes(answerKey("Indominus")));
  add("Animais", byName.get("Dinossauros")!.answers);
  add("Filmes", byName.get("Filmes premiados pelo Oscar")!.answers);
  // The winning bands are all rock bands, except electronic duo Daft Punk.
  add(
    "Bandas de rock",
    byName
      .get("Bandas que ganharam Grammy")!
      .answers.filter((answer) => answer.name !== "Daft Punk"),
  );

  // Letter questions use Portuguese labels, not the scientific aliases from taxa.
  const animals = byName.get("Animais")!;
  const labels = new Map(
    animals.answers.map((answer) => [answerKey(answer.name), answer.name]),
  );
  for (const taxon of external.taxa)
    for (const name of taxon.names) labels.set(answerKey(name), name);
  for (const name of [
    "Cão",
    "Asno",
    "Jumento",
    "Serpente",
    "Chita",
    "Suçuarana",
    "Onça-parda",
    "Anta",
    "Cervo",
    "Koala",
  ])
    labels.set(answerKey(name), name);
  const familiar: Record<string, string> = {
    A: "Abelha",
    B: "Borboleta",
    C: "Cachorro",
    F: "Formiga",
    G: "Gato",
    L: "Leão",
    M: "Macaco",
    P: "Porco",
    S: "Sapo",
    T: "Tigre",
  };
  for (const letter of ANIMAL_LETTERS) {
    const prefix = letter.toLowerCase();
    const theme: Theme = {
      name: `Animais que começam com ${letter}`,
      answers: animals.answers.flatMap((answer) => {
        const keys = answer.keys.filter(
          (key) => key.startsWith(prefix) && labels.has(key),
        );
        if (!keys.length) return [];
        return [
          {
            name: keys.includes(answerKey(answer.name))
              ? answer.name
              : labels.get(keys[0])!,
            keys: [...keys],
            points: keys.includes(answerKey(familiar[letter]))
              ? 1
              : answer.points,
          },
        ];
      }),
    };
    // Rebuilding the derived theme also makes repeated expansion safe.
    const existing = themes.findIndex((item) => item.name === theme.name);
    if (existing >= 0) themes[existing] = theme;
    else themes.push(theme);
    byName.set(theme.name, theme);
  }
  return themes;
}
