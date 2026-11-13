// node build.mjs [category...] [--emit]
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { normalize } from "./lib.mjs";

const REPO = new URL("../../../../", import.meta.url).pathname.replace(/\/$/, "");
const require = createRequire(REPO + "/package.json");
const sharp = require("sharp");
const OUT = new URL(".", import.meta.url).pathname;

const args = process.argv.slice(2);
const emit = args.includes("--emit");
const all = ["landmarks", "characters", "creatures", "objects"];
const cats = args.filter((a) => !a.startsWith("--"));
const chosen = cats.length ? cats : all;

const esc = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

for (const cat of chosen) {
  const list = (await import(`./${cat}.mjs?${Date.now()}`)).default.map(
    (x) => ({ ...x, art: normalize(x.art) }),
  );
  const ids = new Set();
  for (const x of list) {
    if (ids.has(x.shape)) throw new Error("dup " + x.shape);
    ids.add(x.shape);
  }
  // Contact sheet: every sprite fitted into a 150×150 cell.
  const cols = 6,
    cw = 190,
    ch = 230,
    rowsN = Math.ceil(list.length / cols);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rowsN * ch}"><rect width="100%" height="100%" fill="#eef1f4"/>`;
  list.forEach((x, k) => {
    const h = x.art.length,
      w = x.art[0].length;
    const px = Math.min(160 / h, 170 / w);
    const ox = (k % cols) * cw + (cw - w * px) / 2;
    const oy = Math.floor(k / cols) * ch + 10 + (160 - h * px);
    svg += `<rect x="${(k % cols) * cw + 4}" y="${Math.floor(k / cols) * ch + 4}" width="${cw - 8}" height="${ch - 8}" fill="#fff"/>`;
    x.art.forEach((r, j) =>
      [...r].forEach((c, i) => {
        if (c === "#")
          svg += `<rect x="${ox + i * px}" y="${oy + j * px}" width="${px + 0.3}" height="${px + 0.3}" fill="#17232d"/>`;
      }),
    );
    svg += `<text x="${(k % cols) * cw + cw / 2}" y="${Math.floor(k / cols) * ch + 190}" font-family="Helvetica" font-size="12" text-anchor="middle">${esc(x.pt)}</text>`;
    svg += `<text x="${(k % cols) * cw + cw / 2}" y="${Math.floor(k / cols) * ch + 208}" font-family="Helvetica" font-size="11" fill="#667" text-anchor="middle">${x.shape} · ${x.meters} m · ${w}×${h}</text>`;
  });
  svg += "</svg>";
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}${cat}.png`);
  console.log(cat, list.length);

  if (emit) {
    const name = cat === "objects" ? "EVERYDAY" : cat.toUpperCase();
    const body = list
      .map(
        (x) =>
          `  {\n    shape: ${JSON.stringify(x.shape)},\n    pt: ${JSON.stringify(x.pt)},\n    en: ${JSON.stringify(x.en)},\n    meters: ${x.meters},\n    art: [\n${x.art.map((r) => `      "${r}",`).join("\n")}\n    ],\n  },`,
      )
      .join("\n");
    writeFileSync(
      `${REPO}/src/features/games/perception/data/scale/${cat}.ts`,
      `import type { ScaleSprite } from "../../model/pixelSilhouette.ts";\n\n/** Original pixel art. "#" is filled, "." is empty; the bottom row stands on the ground. */\nexport const ${name}: readonly ScaleSprite[] = [\n${body}\n];\n`,
    );
  }
}
