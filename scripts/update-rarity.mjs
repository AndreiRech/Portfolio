// Manual snapshot refresh. No external service is contacted while playing.
import { writeFile } from "node:fs/promises";
const root = new URL("../src/features/games/rarity/data/", import.meta.url);
async function json(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`${response.status}: ${url}`);
      return await response.json();
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
}
const countries = await json(
  "https://servicodados.ibge.gov.br/api/v1/localidades/paises",
);
if (
  !Array.isArray(countries) ||
  countries.length < 190 ||
  !countries.every((c) => typeof c.nome === "string")
)
  throw new Error("Invalid country snapshot");
const pokemon = await json(
  "https://pokeapi.co/api/v2/pokemon-species?limit=2000",
);
if (
  !Array.isArray(pokemon.results) ||
  pokemon.results.length < 1000 ||
  !pokemon.results.every(
    (item) => typeof item.name === "string" && /^[a-z0-9-]+$/.test(item.name),
  )
)
  throw new Error("Invalid Pokémon snapshot");
const taxa = [];
const seen = new Set();
// 10,000 of the most observed species worldwide; keep only Portuguese names.
for (let page = 1; page <= 50; page++) {
  const url = new URL("https://api.inaturalist.org/v1/taxa");
  url.search = new URLSearchParams({
    taxon_id: "1",
    rank: "species",
    is_active: "true",
    locale: "pt-BR",
    all_names: "true",
    per_page: "200",
    page: String(page),
    order_by: "observations_count",
    order: "desc",
  }).toString();
  const data = await json(url);
  if (!Array.isArray(data.results)) throw new Error("Invalid taxa snapshot");
  for (const taxon of data.results) {
    if (
      !taxon.ancestor_ids?.includes(1) ||
      !taxon.is_active ||
      taxon.rank !== "species" ||
      seen.has(taxon.id)
    )
      continue;
    const names = [
      ...new Set(
        (taxon.names ?? [])
          .filter(
            (n) =>
              n.is_valid &&
              /^pt(?:-|$)/.test(n.locale) &&
              typeof n.name === "string",
          )
          .flatMap((n) => n.name.split(/[,;]/))
          .map((n) => n.trim())
          .filter(
            (n) =>
              n.length >= 3 && n.length <= 80 && /^[\p{L}\s'’().-]+$/u.test(n),
          ),
      ),
    ];
    if (!names.length) continue;
    seen.add(taxon.id);
    taxa.push({
      id: taxon.id,
      scientific: taxon.name,
      category: taxon.iconic_taxon_name,
      names,
    });
  }
  if (page % 10 === 0)
    console.log(
      `${page * 200} species checked; ${taxa.length} with Portuguese names`,
    );
  if (data.results.length < 200) break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
if (taxa.length < 500) throw new Error("Too few Portuguese animal names");
await writeFile(
  new URL("external.json", root),
  JSON.stringify({
    retrieved: new Date().toISOString().slice(0, 10),
    countries: countries.map((c) => c.nome),
    pokemon: pokemon.results.map((item) => item.name),
    taxa,
  }) + "\n",
);
console.log(`${countries.length} countries, ${taxa.length} animal taxa saved.`);
