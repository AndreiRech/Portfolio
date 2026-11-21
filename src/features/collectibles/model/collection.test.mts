import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { drawReward, RARITIES, REWARDS } from "../data/collectibles.ts";
import {
  COLLECTION_KEY,
  canUseCompanion,
  createCollectionStore,
  emptyCollection,
  equipReward,
  grantReward,
  parseCollection,
} from "./collection.ts";

test("companions remain locked until obtained, and other reward kinds cannot be activated", () => {
  const empty = emptyCollection();
  for (const id of ["chicken", "medallion", "d20", "dragon", "unknown"])
    assert.equal(canUseCompanion(empty, id), false);
  const owned = grantReward(grantReward(empty, "a", "chicken"), "b", "forest");
  assert.equal(canUseCompanion(owned, "chicken"), true);
  assert.equal(canUseCompanion(owned, "forest"), false);
  assert.equal(canUseCompanion(owned, "dragon"), false);
  const restored = parseCollection(JSON.stringify(owned));
  assert.equal(canUseCompanion(restored, "chicken"), true);
  assert.equal(canUseCompanion(restored, "medallion"), false);
});

test("seven approved ranges include their lower bound and exclude their upper bound", () => {
  const cases = [
    [0, "consumer"],
    [0.349999, "consumer"],
    [0.35, "industrial"],
    [0.599999, "industrial"],
    [0.6, "milspec"],
    [0.799999, "milspec"],
    [0.8, "restricted"],
    [0.9, "classified"],
    [0.96, "covert"],
    [0.99, "special"],
    [0.999999, "special"],
  ] as const;
  for (const [roll, expected] of cases) {
    let calls = 0;
    assert.equal(drawReward(() => (calls++ === 0 ? roll : 0)).rarity, expected);
    assert.equal(calls, 2);
  }
  assert.equal(
    RARITIES.reduce((sum, tier) => sum + tier.chance, 0),
    100,
  );
});
test("every catalogue item is reachable within its rarity without statistical tests", () => {
  let lowerBound = 0;
  for (const rarity of RARITIES) {
    const items = REWARDS.filter((item) => item.rarity === rarity.id);
    for (let index = 0; index < items.length; index++) {
      let calls = 0;
      assert.equal(
        drawReward(() =>
          calls++ === 0
            ? (lowerBound + rarity.chance / 2) / 100
            : (index + 0.5) / items.length,
        ).id,
        items[index].id,
      );
    }
    lowerBound += rarity.chance;
  }
  for (const invalid of [-1, 1, NaN, Infinity])
    assert.throws(() => drawReward(() => invalid), RangeError);
});
test("one opening grants once, while a new opening can add a duplicate", () => {
  const first = grantReward(emptyCollection(), "opening-a", "chicken");
  assert.equal(grantReward(first, "opening-a", "chicken"), first);
  const repeated = grantReward(first, "opening-b", "chicken");
  assert.equal(repeated.counts.chicken, 2);
  assert.equal(grantReward(repeated, "opening-c", "not-a-reward"), repeated);
  assert.equal(
    equipReward(emptyCollection(), "chicken").equipped.companion,
    null,
  );
  const equipped = equipReward(repeated, "chicken");
  assert.equal(equipped.equipped.companion, "chicken");
  assert.equal(equipped.counts.chicken, 2);
});
test("storage input is allowlisted, including quantities, ownership and slot compatibility", () => {
  const raw = JSON.stringify({
    version: 1,
    counts: { chicken: 2, forest: -1, knife: 1.5, unknown: 20, aurora: "9" },
    equipped: { companion: "chicken", palette: "chicken", cursor: "knife" },
    lastOpening: "a",
  });
  const parsed = parseCollection(raw);
  assert.deepEqual(parsed.counts, { chicken: 2 });
  assert.deepEqual(parsed.equipped, {
    palette: null,
    cursor: null,
    companion: "chicken",
    trail: null,
  });
  for (const invalid of [
    null,
    "{",
    "null",
    "[]",
    JSON.stringify({ version: 2 }),
    " ".repeat(16001),
  ])
    assert.deepEqual(parseCollection(invalid), emptyCollection());
});
test("reloading restores collection and equipment; reverting appearance preserves items", () => {
  const values = new Map<string, string>();
  const storage = () => ({
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  });
  const store = createCollectionStore(storage);
  const unsubscribe = store.subscribe(() => {});
  store.grant("first", "forest");
  store.equip("forest");
  const restored = createCollectionStore(storage);
  restored.subscribe(() => {});
  assert.equal(restored.getSnapshot().data.equipped.palette, "forest");
  assert.equal(restored.getSnapshot().data.counts.forest, 1);
  restored.resetAppearance();
  assert.equal(restored.getSnapshot().data.equipped.palette, null);
  assert.equal(restored.getSnapshot().data.counts.forest, 1);
  assert.ok(values.has(COLLECTION_KEY));
  unsubscribe();
});
test("every catalogue reward can be collected, equipped and restored in its own slot", () => {
  for (const reward of REWARDS) {
    const empty = emptyCollection();
    assert.equal(equipReward(empty, reward.id), empty);
    const collected = grantReward(empty, `opening-${reward.id}`, reward.id);
    const equipped = equipReward(collected, reward.id);
    const restored = parseCollection(JSON.stringify(equipped));
    assert.equal(restored.counts[reward.id], 1);
    assert.equal(restored.equipped[reward.kind], reward.id);
    // ASVS 2.2.1: a palette or cursor cannot activate the companion slot.
    assert.equal(
      canUseCompanion(restored, reward.id),
      reward.kind === "companion",
    );
  }
});
test("blocked reads and failed writes preserve a usable in-session collection", () => {
  const store = createCollectionStore(() => {
    throw new Error("blocked");
  });
  store.subscribe(() => {});
  store.grant("a", "medallion");
  store.equip("medallion");
  assert.equal(store.getSnapshot().saved, false);
  assert.equal(store.getSnapshot().data.equipped.companion, "medallion");
  assert.equal(store.getSnapshot().data.counts.medallion, 1);
  const quota = createCollectionStore(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error("quota");
    },
  }));
  quota.subscribe(() => {});
  quota.grant("a", "d20");
  quota.grant("a", "d20");
  assert.equal(quota.getSnapshot().data.counts.d20, 1);
  assert.equal(quota.getSnapshot().saved, false);
});

test("hiding an equipped companion preserves ownership after reloading", () => {
  const values = new Map<string, string>();
  const storage = () => ({
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  });
  const store = createCollectionStore(storage);
  store.subscribe(() => {});
  store.grant("first-companion", "chicken");
  store.grant("second-companion", "chicken");
  store.equip("chicken");
  store.remove("companion");
  const restored = createCollectionStore(storage);
  restored.subscribe(() => {});
  assert.equal(restored.getSnapshot().data.equipped.companion, null);
  assert.equal(restored.getSnapshot().data.counts.chicken, 2);
});

test("legacy wolves migrate to medallions without losing ownership or equipment", () => {
  const parsed = parseCollection(
    JSON.stringify({
      version: 1,
      counts: { wolf: 3, medallion: 2, chicken: 1 },
      equipped: { companion: "wolf" },
      lastOpening: "legacy-opening",
    }),
  );
  assert.deepEqual(parsed.counts, { chicken: 1, medallion: 5 });
  assert.equal(parsed.equipped.companion, "medallion");
  assert.equal(parsed.lastOpening, "legacy-opening");
  assert.deepEqual(parseCollection(JSON.stringify(parsed)), parsed);
  for (const invalid of [-1, 1.5, "2", null, 1_000_001]) {
    const clean = parseCollection(
      JSON.stringify({
        version: 1,
        counts: { wolf: invalid },
        equipped: { companion: "wolf" },
      }),
    );
    assert.deepEqual(clean, emptyCollection());
  }
  assert.equal(
    parseCollection(
      JSON.stringify({ version: 1, counts: { wolf: 999999, medallion: 2 } }),
    ).counts.medallion,
    1_000_000,
  );
});

test("legacy pool rewards become coral without losing quantities or equipped state", () => {
  const parsed = parseCollection(
    JSON.stringify({
      version: 1,
      counts: { pool: 2, coral: 3, cat: 1 },
      equipped: { palette: "pool", cursor: "pool", companion: "cat" },
      lastOpening: "before-default-change",
    }),
  );
  assert.deepEqual(parsed.counts, { coral: 5, cat: 1 });
  assert.deepEqual(parsed.equipped, {
    palette: "coral",
    cursor: null,
    companion: "cat",
    trail: null,
  });
  assert.equal(parsed.lastOpening, "before-default-change");
  assert.deepEqual(parseCollection(JSON.stringify(parsed)), parsed);
  for (const invalid of [-1, 1.5, "2", null, 1_000_001]) {
    assert.deepEqual(
      parseCollection(
        JSON.stringify({
          version: 1,
          counts: { pool: invalid },
          equipped: { palette: "pool" },
        }),
      ),
      emptyCollection(),
    );
  }
  assert.equal(
    parseCollection(
      JSON.stringify({ version: 1, counts: { pool: 999999, coral: 2 } }),
    ).counts.coral,
    1_000_000,
  );
});

test("every palette reward has its own colors in the stylesheet and nothing else does", () => {
  const css = readFileSync(
    new URL("../../../app/globals.css", import.meta.url),
    "utf8",
  );
  const styled = [...css.matchAll(/:root\[data-palette="([^"]+)"\]/g)].map(
    ([, id]) => id,
  );
  const palettes = REWARDS.filter((reward) => reward.kind === "palette").map(
    (reward) => reward.id,
  );
  assert.deepEqual(new Set(styled), new Set(palettes));
  // Restoring the default removes the palette, so the bare :root is the default.
  assert.match(css, /:root \{[^}]*--accent: #65d9df;/);
});

test("every rarity tier keeps at least one reward", () => {
  for (const rarity of RARITIES)
    assert.ok(
      REWARDS.some((item) => item.rarity === rarity.id),
      `${rarity.id} has no rewards`,
    );
});

test("the legendary tier holds the golden knife, the treasure palette and the dragon", () => {
  assert.deepEqual(
    REWARDS.filter((item) => item.rarity === "special")
      .map((item) => item.id)
      .sort(),
    ["dragon", "knife", "treasure"],
  );
});

test("removed rewards are dropped from saved counts and slots", () => {
  const parsed = parseCollection(
    JSON.stringify({
      version: 1,
      counts: { crystal: 2, "gold-d20": 1, cat: 1 },
      equipped: { cursor: "crystal", companion: "gold-d20" },
    }),
  );
  assert.deepEqual(parsed.counts, { cat: 1 });
  assert.equal(parsed.equipped.cursor, null);
  assert.equal(parsed.equipped.companion, null);
});

test("the trail slot accepts only owned trail rewards", () => {
  const parsed = parseCollection(
    JSON.stringify({
      version: 1,
      counts: { embers: 1, forest: 1 },
      equipped: { trail: "forest", palette: "embers" },
    }),
  );
  assert.equal(parsed.equipped.trail, null);
  assert.equal(parsed.equipped.palette, null);
  const owned = parseCollection(
    JSON.stringify({
      version: 1,
      counts: { embers: 1 },
      equipped: { trail: "embers" },
    }),
  );
  assert.equal(owned.equipped.trail, "embers");
  assert.equal(
    parseCollection(
      JSON.stringify({ version: 1, counts: {}, equipped: { trail: "embers" } }),
    ).equipped.trail,
    null,
  );
});
