import assert from "node:assert/strict";
import test from "node:test";
import {
  ACHIEVEMENT_KEY,
  KONAMI,
  createAchievementStore,
  konamiStep,
  parseAchievements,
  unlockAchievement,
} from "./achievements.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

test("stored achievements keep only catalogue ids, once each", () => {
  assert.deepEqual(
    parseAchievements('["nat20","made-up","nat20",7,"konami"]'),
    ["nat20", "konami"],
  );
  assert.deepEqual(parseAchievements("{not json"), []);
  assert.deepEqual(parseAchievements('{"nat20":true}'), []);
  assert.deepEqual(parseAchievements(null), []);
});

test("unlocking is idempotent and ignores unknown achievements", () => {
  const first = unlockAchievement([], "nat20");
  assert.deepEqual(first, ["nat20"]);
  assert.equal(unlockAchievement(first, "nat20"), first);
  assert.equal(unlockAchievement(first, "made-up"), first);
});

test("the store reports an unlock once and restores it on the next visit", () => {
  const storage = memoryStorage();
  const store = createAchievementStore(() => storage);
  let notified = 0;
  store.subscribe(() => notified++);
  assert.equal(store.unlock("first-case"), true);
  assert.equal(store.unlock("first-case"), false);
  assert.equal(notified, 1);

  const nextVisit = createAchievementStore(() => storage);
  nextVisit.subscribe(() => {});
  assert.deepEqual(nextVisit.getSnapshot().unlocked, ["first-case"]);
  assert.equal(nextVisit.unlock("first-case"), false);
});

test("achievements still unlock for the session when storage is blocked", () => {
  const store = createAchievementStore(() => {
    throw new Error("blocked");
  });
  store.subscribe(() => {});
  assert.equal(store.unlock("nat20"), true);
  assert.deepEqual(store.getSnapshot().unlocked, ["nat20"]);
  assert.equal(ACHIEVEMENT_KEY.length > 0, true);
});

test("the classic code completes in order and tolerates extra leading ups", () => {
  const run = (keys: readonly string[]) =>
    keys.reduce((position, key) => konamiStep(position, key), 0);
  assert.equal(run(KONAMI), KONAMI.length);
  assert.equal(run(["ArrowUp", ...KONAMI]), KONAMI.length);
  assert.equal(run([...KONAMI.slice(0, 8), "B", "A"]), KONAMI.length);
  assert.equal(run([...KONAMI.slice(0, 5), "x"]), 0);
});

test("new game achievements extend existing saves and notify only once", () => {
  const storage = memoryStorage({ [ACHIEVEMENT_KEY]: '["nat20"]' });
  const store = createAchievementStore(() => storage);
  let notifications = 0;
  store.subscribe(() => notifications++);
  const ids = [
    "mine-clear",
    "mine-expert",
    "sudoku-solved",
    "sudoku-clean",
    "color-five",
    "color-eye",
    "scale-five",
    "scale-eye",
  ];
  const before = notifications;
  for (const id of ids) {
    assert.equal(store.unlock(id), true);
    assert.equal(store.unlock(id), false);
  }
  assert.equal(notifications - before, ids.length);
  const reloaded = createAchievementStore(() => storage);
  reloaded.subscribe(() => {});
  assert.deepEqual(reloaded.getSnapshot().unlocked, ["nat20", ...ids]);
});
