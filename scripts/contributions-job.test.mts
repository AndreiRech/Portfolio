import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  copyFile,
  readFile,
  writeFile,
  rm,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function prepareJob() {
  const root = await mkdtemp(join(tmpdir(), "portfolio-contributions-"));
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "src/features/portfolio/data"), { recursive: true });
  for (const file of ["contributions.mjs", "update-contributions.mjs"])
    await copyFile(
      new URL(`./${file}`, import.meta.url),
      join(root, "scripts", file),
    );
  return root;
}
test("a failed refresh restores the last verified cached data, including its original update date", async () => {
  const root = await prepareJob();
  try {
    const previous = JSON.parse(
      await readFile(
        new URL(
          "../src/features/portfolio/data/contributions.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await mkdir(join(root, ".cache"));
    await writeFile(
      join(root, ".cache/contributions.json"),
      JSON.stringify(previous),
    );
    await writeFile(
      join(root, "src/features/portfolio/data/contributions.json"),
      "{broken",
    );
    execFileSync(
      process.execPath,
      [
        join(root, "scripts/update-contributions.mjs"),
        "--input",
        join(root, "missing.html"),
      ],
      { stdio: "pipe" },
    );
    const result = JSON.parse(
      await readFile(
        join(root, "src/features/portfolio/data/contributions.json"),
        "utf8",
      ),
    );
    assert.deepEqual(result, previous);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("a first failed refresh without usable history produces an unavailable state, not invented counts", async () => {
  const root = await prepareJob();
  try {
    await writeFile(
      join(root, "src/features/portfolio/data/contributions.json"),
      "{broken",
    );
    execFileSync(
      process.execPath,
      [
        join(root, "scripts/update-contributions.mjs"),
        "--input",
        join(root, "missing.html"),
      ],
      { stdio: "pipe" },
    );
    const result = JSON.parse(
      await readFile(
        join(root, "src/features/portfolio/data/contributions.json"),
        "utf8",
      ),
    );
    assert.deepEqual(result, {
      profile: "AndreiRech",
      updatedAt: null,
      days: [],
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
