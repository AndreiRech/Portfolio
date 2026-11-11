import test from "node:test";
import assert from "node:assert/strict";
import { drawReward, RARITIES, REWARDS } from "../data/collectibles.ts";
import {
  COLLECTION_KEY,
  createCollectionStore,
  emptyCollection,
  equipReward,
  grantReward,
  parseCollection,
} from "./collection.ts";

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
test("blocked reads and failed writes preserve a usable in-session collection", () => {
  const store = createCollectionStore(() => {
    throw new Error("blocked");
  });
  store.subscribe(() => {});
  store.grant("a", "wolf");
  store.equip("wolf");
  assert.equal(store.getSnapshot().saved, false);
  assert.equal(store.getSnapshot().data.equipped.companion, "wolf");
  assert.equal(store.getSnapshot().data.counts.wolf, 1);
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
