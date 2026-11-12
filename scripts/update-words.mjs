// Regenerates the Termo word lists from fserb/pt-br. Run manually with
// `npm run refresh:words`; the committed snapshot is what the game uses.
import { writeFile } from "node:fs/promises";
import { buildWordLists } from "./words.mjs";

const BASE = "https://raw.githubusercontent.com/fserb/pt-br/master/";
async function download(name) {
  const response = await fetch(BASE + encodeURIComponent(name), {
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return response.text();
}

const [lexicon, conjugations, icf] = await Promise.all(
  ["lexico", "conjugações", "icf"].map(download),
);
const lists = buildWordLists({
  lexicon: lexicon.split("\n").map((word) => word.trim()),
  conjugations: conjugations.split(/[\s,]+/),
  frequency: new Map(
    icf
      .split("\n")
      .map((line) => line.split(","))
      .filter((pair) => pair.length === 2)
      .map(([word, score]) => [word, Number(score)]),
  ),
});
if (lists.answers.length < 500)
  throw new Error("Too few answers; upstream changed.");
await writeFile(
  new URL("../src/features/games/termo/data/words.json", import.meta.url),
  JSON.stringify(lists) + "\n",
);
console.log(
  `${lists.answers.length} answers, ${lists.valid.length} other valid guesses.`,
);
