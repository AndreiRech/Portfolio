// Manual snapshot refresh for Raridade catalogs. No service is contacted while playing.
// Sources: CBO 2002 (Ministério do Trabalho e Emprego) and Wikidata (CC0).
import { writeFile } from "node:fs/promises";

const target = new URL(
  "../src/features/games/rarity/data/catalogs.json",
  import.meta.url,
);
const UA = "rarity-bank-refresh/1.0 (portfolio word game)";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOk(url, init) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(90000),
      });
      if (response.ok) return response;
      // Wikidata asks clients to back off on 429.
      if (attempt === 4) throw new Error(`${response.status}: ${url}`);
    } catch (error) {
      if (attempt === 4) throw error;
    }
    await pause(15000 * (attempt + 1));
  }
}

// --- CBO: official occupation titles and their registered synonyms ---------
const CBO =
  "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/";
const titles = [];
for (const file of ["cbo2002-ocupacao.csv", "cbo2002-sinonimo.csv"]) {
  const response = await fetchOk(CBO + file, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const text = new TextDecoder("latin1").decode(await response.arrayBuffer());
  const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
  if (rows.length < 2000) throw new Error(`Invalid CBO snapshot: ${file}`);
  for (const row of rows) titles.push(row.slice(row.indexOf(";") + 1));
}
const occupations = new Map();
for (const raw of titles) {
  const title = raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = title.split(" ");
  // Long administrative titles are never typed in a round.
  if (words.length > 4 || title.length < 3 || /[/\d]/.test(title)) continue;
  const name = title[0].toUpperCase() + title.slice(1);
  occupations.set(name.toLowerCase(), [name, words.length === 1 ? 8 : 9]);
}

// --- Wikidata catalogs -------------------------------------------------------
const select = (where, min = 0) => `
SELECT ?item ?label (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) (SAMPLE(?n) AS ?links) WHERE {
  ${where}
  ?item wikibase:sitelinks ?n . FILTER(?n >= ${min})
  ?item rdfs:label ?label FILTER(LANG(?label) = "pt")
  OPTIONAL { ?item skos:altLabel ?alias FILTER(LANG(?alias) = "pt") }
} GROUP BY ?item ?label`;

const QUERIES = {
  "Capitais do mundo": select(`
    ?country wdt:P31 wd:Q3624078 . FILTER NOT EXISTS { ?country wdt:P576 [] }
    ?country p:P36 ?st . ?st ps:P36 ?item . FILTER NOT EXISTS { ?st pq:P582 [] }`),
  "Times de futebol do Brasil": select(
    `?item wdt:P31 wd:Q476028 ; wdt:P17 wd:Q155 .`,
    3,
  ),
  "Raças de cachorro": select(`?item wdt:P31 wd:Q39367 .`, 3),
  "Linguagens de programação": select(`?item wdt:P31/wdt:P279* wd:Q9143 .`, 12),
  "Pedras e minerais": select(
    `{ ?item wdt:P31 wd:Q12089225 } UNION { ?item wdt:P31/wdt:P279* wd:Q83437 }`,
    15,
  ),
  "Marcas de carro": select(
    `{ ?item wdt:P31 wd:Q786820 } UNION { ?item wdt:P31 wd:Q44294 }`,
    15,
  ),
  "Bandas de rock": select(`?item wdt:P31 wd:Q5741069 .`, 12),
  "Mitologia grega": select(
    `{ ?item wdt:P31/wdt:P279* wd:Q22989102 } UNION { ?item wdt:P31/wdt:P279* wd:Q22988604 } UNION { ?item wdt:P1080 wd:Q34726 }`,
    4,
  ),
  "Mitologia romana": select(
    `{ ?item wdt:P31/wdt:P279* wd:Q11688446 } UNION { ?item wdt:P1080 wd:Q122173 }`,
    3,
  ),
  "Mitologia nórdica": select(
    `{ ?item wdt:P31/wdt:P279* wd:Q16513881 } UNION { ?item wdt:P1080 wd:Q128285 }`,
    3,
  ),
  "Personagens bíblicos": select(
    `{ ?item wdt:P31 wd:Q20643955 } UNION { ?item wdt:P31 wd:Q5 . VALUES ?w { wd:Q1845 wd:Q18813 wd:Q19786 } ?item wdt:P1441 ?w }`,
    3,
  ),
};

// Wikidata rows that are scenes, groups or concepts rather than answers.
const EXCLUDED = new Set(
  [
    "Jesus curando o cego perto de Jericó",
    "Samaritana no poço",
    "Meretriz da Babilônia",
    "Menino Jesus",
    "discípulo amado",
    "Mau ladrão",
    "Adão e Eva",
    "Vida de Jesus",
    "Sacrifício de Isaac",
    "Susana e os anciãos",
    "Pilatos lava as mãos",
    "duas pessoas da Bíblia",
    "Guerra dos Deuses",
    "Anão",
    "Red Bull Futebol e Entretenimento Ltda.",
    "Waymo",
  ].map((name) => name.toLowerCase()),
);
const PREFIX = /^(São|Santo|Santa|Virgem|Apóstolo) /;
const LATIN = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ'’.,\- &]+$/;
// Aliases that would accept a different, better-known answer.
const MISLEADING = new Set(["salvador"]);
const stems = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3)
    .map((word) => word.slice(0, 3));
// Wikidata aliases sometimes name another item; keep the ones that share a word.
const related = (alias, label) => {
  const own = new Set(stems(label));
  return stems(alias).some((stem) => own.has(stem));
};
const clean = (value) =>
  value
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const capital = (value) => value[0].toUpperCase() + value.slice(1);
// "São Tomé" and "Joás de Judá" are also typed as "Tomé" and "Joás".
const bare = (value) =>
  value
    .replace(PREFIX, "")
    .replace(/,.*$/, "")
    .replace(/ (personagem bíblico|de Judá|de Israel)$/, "");
const points = (links) =>
  links >= 100 ? 6 : links >= 40 ? 7 : links >= 15 ? 8 : 9;

const catalogs = {
  Profissões: [...occupations.values()].sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR"),
  ),
};
for (const [theme, query] of Object.entries(QUERIES)) {
  const url = new URL("https://query.wikidata.org/sparql");
  url.search = new URLSearchParams({ query, format: "json" }).toString();
  const response = await fetchOk(url, { headers: { "User-Agent": UA } });
  const rows = (await response.json()).results.bindings;
  if (rows.length < 50) throw new Error(`Too few rows for ${theme}`);
  const entries = new Map();
  for (const row of rows) {
    const label = clean(row.label.value);
    if (!label || EXCLUDED.has(label.toLowerCase()) || !LATIN.test(label))
      continue;
    const spellings = [label, ...(row.aliases?.value.split("|") ?? [])]
      .map(clean)
      .filter(
        (name) =>
          name.length >= 2 &&
          name.length <= 40 &&
          name.split(" ").length <= 4 &&
          LATIN.test(name) &&
          related(name, label),
      )
      .flatMap((name) => [...new Set([bare(name), name])])
      // Checked after bare(): "São Salvador" would otherwise yield "Salvador".
      .filter((name) => !MISLEADING.has(name.toLowerCase()))
      .map(capital);
    const unique = [...new Set(spellings)];
    // Labels too long to type are not answers; their aliases go with them.
    if (unique[0] !== capital(bare(label))) continue;
    const key = unique[0].toLowerCase();
    const links = Number(row.links.value);
    const known = entries.get(key);
    if (known) known[2].push(...unique.slice(1));
    else entries.set(key, [unique[0], points(links), unique.slice(1)]);
  }
  catalogs[theme] = [...entries.values()]
    .map(([name, score, aliases]) => [
      name,
      score,
      ...new Set(aliases.filter((alias) => alias !== name)),
    ])
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  console.log(`${theme}: ${catalogs[theme].length}`);
  await pause(4000);
}
if (catalogs.Profissões.length < 3000)
  throw new Error("Too few CBO occupations");

await writeFile(
  target,
  JSON.stringify({
    retrieved: new Date().toISOString().slice(0, 10),
    sources: {
      Profissões: "CBO 2002, Ministério do Trabalho e Emprego",
      default: "Wikidata Query Service (CC0)",
    },
    catalogs,
  }) + "\n",
);
console.log("Rarity catalogs saved.");
