import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  parseCalendar,
  validSnapshot,
  dateRange,
  PROFILE,
} from "./contributions.mjs";
const root = new URL("../", import.meta.url);
const target = new URL("src/data/contributions.json", root);
const cache = new URL(".cache/contributions.json", root);
let previous;
for (const path of [cache, target]) {
  try {
    const candidate = JSON.parse(await readFile(path, "utf8"));
    if (validSnapshot(candidate)) {
      previous = candidate;
      break;
    }
  } catch {
    /* Continue to the last committed snapshot. */
  }
}
let snapshot;
try {
  const input = process.argv.indexOf("--input");
  let html;
  if (input >= 0 && process.argv[input + 1])
    html = await readFile(process.argv[input + 1], "utf8");
  else {
    const { from, to } = dateRange();
    const response = await fetch(
      `https://github.com/users/${PROFILE}/contributions?from=${from}&to=${to}`,
      {
        headers: {
          "Accept-Language": "en-US",
          "User-Agent": "AndreiRech-Portfolio",
        },
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok) throw new Error("GitHub calendar request failed.");
    html = await response.text();
  }
  snapshot = parseCalendar(html);
  await mkdir(new URL(".cache/", root), { recursive: true });
  await writeFile(cache, JSON.stringify(snapshot));
  console.log(
    `Updated ${snapshot.days.length} days of public GitHub contributions.`,
  );
} catch {
  snapshot = previous ?? { profile: PROFILE, updatedAt: null, days: [] };
  console.warn(
    previous
      ? "GitHub refresh unavailable; keeping the last verified snapshot."
      : "GitHub refresh unavailable; calendar will show its unavailable state.",
  );
}
await writeFile(`${fileURLToPath(target)}.tmp`, JSON.stringify(snapshot));
await rename(`${fileURLToPath(target)}.tmp`, target);
