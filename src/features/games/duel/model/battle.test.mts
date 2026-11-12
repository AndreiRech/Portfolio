import assert from "node:assert/strict";
import test from "node:test";
import { ENEMIES, PET_STATS } from "../data/fighters.ts";
import {
  canUse,
  chooseEnemyMove,
  diceRange,
  formatDice,
  playTurn,
  rollDice,
  startBattle,
  type BattleState,
  type FighterStats,
} from "./battle.ts";

/** Every die lands on its highest face. */
const max = () => 0.999;
/** Every die lands on 1. */
const min = () => 0;

const hero: FighterStats = {
  id: "hero",
  name: { en: "Hero", pt: "Herói" },
  hp: 20,
  ac: 12,
  attack: 4,
  damage: { count: 1, sides: 6, bonus: 1 },
  heal: { count: 1, sides: 8, bonus: 2 },
  potions: 1,
  special: {
    name: { en: "Flurry", pt: "Rajada" },
    damage: { count: 1, sides: 4, bonus: 1 },
    hits: 3,
    toHit: 2,
    cooldown: 2,
  },
};
const monster: FighterStats = {
  ...hero,
  id: "monster",
  ac: 13,
  special: {
    name: { en: "Drain", pt: "Drenar" },
    damage: { count: 1, sides: 6, bonus: 0 },
    drain: true,
    toHit: 0,
    cooldown: 2,
  },
};

test("dice ranges and notation follow the dice", () => {
  assert.deepEqual(diceRange({ count: 2, sides: 6, bonus: 3 }), [5, 15]);
  assert.equal(formatDice({ count: 1, sides: 8, bonus: 0 }), "1d8");
  assert.equal(rollDice({ count: 2, sides: 6, bonus: 3 }, max), 15);
  assert.equal(rollDice({ count: 2, sides: 6, bonus: 3 }, min, 2), 7);
});

test("an attack hits when d20 + bonus meets the AC and passes the turn", () => {
  const state = startBattle(hero, monster);
  const hit = playTurn(state, "attack", [9], max);
  assert.equal(hit.log[0].total, 13);
  assert.equal(hit.log[0].hit, true);
  assert.equal(hit.enemy.hp, 20 - 7);
  assert.equal(hit.phase, "enemy");
  const miss = playTurn(state, "attack", [8], max);
  assert.equal(miss.log[0].hit, false);
  assert.equal(miss.enemy.hp, 20);
});

test("a natural 20 doubles the damage dice and a natural 1 always misses", () => {
  const state = startBattle(hero, { ...monster, ac: 30 });
  const crit = playTurn(state, "attack", [20], max);
  assert.equal(crit.log[0].critical, true);
  assert.equal(crit.log[0].damage, 13);
  const fumble = playTurn(
    startBattle(hero, { ...monster, ac: 1 }),
    "attack",
    [1],
    max,
  );
  assert.equal(fumble.log[0].hit, false);
  assert.equal(fumble.log[0].fumble, true);
});

test("defending raises AC, a strong guard halves damage and a perfect one blocks", () => {
  let state = startBattle(hero, monster);
  state = playTurn(state, "defend", [12], max);
  assert.equal(state.player.guard, "strong");
  const blocked = playTurn(state, "attack", [11], max);
  // AC 12 + 5 = 17: 11 + 4 misses.
  assert.equal(blocked.log[0].hit, false);
  const halved = playTurn(state, "attack", [20], max);
  assert.equal(halved.log[0].damage, Math.ceil(14 / 2));
  const perfect = playTurn(
    playTurn(startBattle(hero, monster), "defend", [20], max),
    "attack",
    [20],
    max,
  );
  assert.equal(perfect.log[0].hit, false);
  assert.equal(perfect.log[0].blocked, "perfect");
  // The guard ends when its owner acts again.
  assert.equal(playTurn(halved, "attack", [2], max).player.guard, null);
});

test("healing spends a potion, caps at max HP and fumbles on a 1", () => {
  let state: BattleState = startBattle(hero, monster);
  assert.equal(
    canUse(state.player, "heal"),
    false,
    "nothing to heal at full HP",
  );
  state = { ...state, player: { ...state.player, hp: 5 } };
  const healed = playTurn(state, "heal", [10], max);
  assert.equal(healed.player.hp, 5 + 10);
  assert.equal(healed.player.potions, 0);
  assert.equal(canUse(healed.player, "heal"), false);
  const spilled = playTurn(state, "heal", [1], max);
  assert.equal(spilled.player.hp, 5);
  assert.equal(spilled.log[0].fumble, true);
});

test("specials hit several times, drain life and then cool down", () => {
  let state = startBattle(hero, monster);
  state = playTurn(state, "special", [10], max);
  assert.equal(state.log[0].damage, 15, "three hits of 1d4+1");
  assert.equal(state.player.cooldown, 2);
  const waiting = { ...state, phase: "player" as const };
  assert.equal(playTurn(waiting, "special", [10], max), waiting);
  const drained = playTurn(
    { ...state, enemy: { ...state.enemy, hp: 10 } },
    "special",
    [15],
    max,
  );
  assert.equal(drained.log[0].damage, 6);
  assert.equal(drained.enemy.hp, 16);
  // Cooldown ticks on each of the owner's other turns.
  let ticking: BattleState = { ...state, phase: "player" };
  ticking = playTurn(ticking, "defend", [5], max);
  ticking = playTurn(ticking, "defend", [5], max);
  ticking = playTurn(ticking, "defend", [5], max);
  assert.equal(ticking.player.cooldown, 0);
});

test("advantage keeps the higher of two d20 and needs both", () => {
  const lucky = {
    ...hero,
    special: { ...hero.special, hits: 1, advantage: true },
  };
  const state = startBattle(lucky, monster);
  assert.equal(playTurn(state, "special", [3], max), state);
  const rolled = playTurn(state, "special", [3, 17], max);
  assert.equal(rolled.log[0].roll, 17);
  assert.deepEqual(rolled.log[0].d20, [3, 17]);
});

test("dropping a fighter to 0 HP ends the duel; invalid rolls are ignored", () => {
  const state = startBattle(hero, { ...monster, hp: 3 });
  const won = playTurn(state, "attack", [15], max);
  assert.equal(won.enemy.hp, 0);
  assert.equal(won.phase, "won");
  assert.equal(playTurn(won, "attack", [15], max), won);
  assert.equal(playTurn(state, "attack", [0], max), state);
  assert.equal(playTurn(state, "attack", [21], max), state);
  const lost = playTurn(
    { ...state, phase: "enemy", player: { ...state.player, hp: 1 } },
    "attack",
    [15],
    max,
  );
  assert.equal(lost.phase, "lost");
  assert.equal(lost.turn, 1);
});

test("the monster heals when hurt and otherwise attacks or uses its special", () => {
  const state = startBattle(hero, monster);
  const hurt = {
    ...state,
    phase: "enemy" as const,
    enemy: { ...state.enemy, hp: 5 },
  };
  assert.equal(
    chooseEnemyMove(hurt, () => 0.1),
    "heal",
  );
  assert.equal(
    chooseEnemyMove(state, () => 0.1),
    "special",
  );
  assert.equal(
    chooseEnemyMove(state, () => 0.6),
    "attack",
  );
  assert.equal(
    chooseEnemyMove(state, () => 0.95),
    "defend",
  );
});

test("every companion and monster has sensible stats", () => {
  for (const stats of [...Object.values(PET_STATS), ...ENEMIES]) {
    assert.ok(stats.hp >= 15 && stats.hp <= 40, stats.id);
    assert.ok(stats.ac >= 10 && stats.ac <= 16, stats.id);
    assert.ok(stats.special.cooldown >= 1, stats.id);
  }
  assert.deepEqual(Object.keys(PET_STATS).sort(), [
    "chicken",
    "d20",
    "gold-d20",
    "medallion",
  ]);
});

test("the d20 verdict comes first, then the thrown damage dice decide the damage", async () => {
  const { previewTurn, thrownDice } = await import("./battle.ts");
  const state = startBattle(hero, monster);
  const miss = previewTurn(state, "attack", [3]);
  assert.equal(miss?.event.hit, false);
  assert.equal(miss?.dice, null);
  const hit = previewTurn(state, "attack", [12]);
  assert.deepEqual(hit?.dice, { kind: "damage", sides: 6, count: 1, bonus: 1 });
  const done = playTurn(state, "attack", [12], thrownDice([4], 6));
  assert.equal(done.log[0].damage, 5);
  // Three hits of 1d4+1, doubled on a natural 20: six d4 and +3.
  const flurry = previewTurn(state, "special", [20]);
  assert.deepEqual(flurry?.dice, {
    kind: "damage",
    sides: 4,
    count: 6,
    bonus: 3,
  });
  const rolled = playTurn(
    state,
    "special",
    [20],
    thrownDice([1, 2, 3, 4, 1, 2], 4),
  );
  assert.equal(rolled.log[0].damage, 16);
  const hurt = { ...state, player: { ...state.player, hp: 2 } };
  assert.deepEqual(previewTurn(hurt, "heal", [8])?.dice, {
    kind: "heal",
    sides: 8,
    count: 1,
    bonus: 2,
  });
  assert.equal(previewTurn(hurt, "heal", [1])?.dice, null);
  assert.equal(previewTurn(state, "heal", [8]), null, "full HP cannot heal");
});
