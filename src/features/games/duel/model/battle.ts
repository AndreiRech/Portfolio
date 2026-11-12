/**
 * Companion duel: a companion fights a random monster in D&D-style turns.
 * Every move is decided by a d20; damage and healing use dice ranges.
 * d20 results and the damage dice source are injected, so rules are testable.
 */
export type Dice = { count: number; sides: number; bonus: number };
export type Text = { en: string; pt: string };
export type Special = {
  name: Text;
  damage: Dice;
  /** Extra bonus on the attack roll. */
  toHit: number;
  /** Rolls two d20 and keeps the higher. */
  advantage?: boolean;
  /** Separate damage rolls on a single hit. */
  hits?: number;
  /** Heals the attacker by the damage dealt. */
  drain?: boolean;
  /** Lowest natural roll that counts as a critical. */
  critOn?: number;
  cooldown: number;
};
export type FighterStats = {
  id: string;
  name: Text;
  hp: number;
  ac: number;
  attack: number;
  damage: Dice;
  heal: Dice;
  potions: number;
  special: Special;
};
export type Move = "attack" | "defend" | "special" | "heal";
export type Guard = "weak" | "strong" | "perfect";
export type Fighter = {
  stats: FighterStats;
  hp: number;
  potions: number;
  cooldown: number;
  guard: Guard | null;
};
export type Side = "player" | "enemy";
export type TurnEvent = {
  actor: Side;
  move: Move;
  d20: number[];
  /** The natural roll that counted. */
  roll: number;
  total?: number;
  target?: number;
  hit?: boolean;
  critical?: boolean;
  fumble?: boolean;
  /** Damage dealt, after a guard halved it. */
  damage?: number;
  healed?: number;
  guard?: Guard;
  /** The defender's guard that changed this attack. */
  blocked?: Guard;
};
export type BattleState = {
  phase: "player" | "enemy" | "won" | "lost";
  turn: number;
  player: Fighter;
  enemy: Fighter;
  log: TurnEvent[];
};

export const GUARD_AC: Record<Guard, number> = {
  weak: 2,
  strong: 5,
  perfect: 0,
};
export const DEFEND_TARGET = 10;
export const LOG_SIZE = 6;

export const diceRange = ({ count, sides, bonus }: Dice) =>
  [count + bonus, count * sides + bonus] as const;
export const formatDice = ({ count, sides, bonus }: Dice) =>
  `${count}d${sides}${bonus ? `+${bonus}` : ""}`;

/** `random` returns [0, 1); each die is 1..sides. */
export function rollDice(dice: Dice, random: () => number, times = 1) {
  let sum = dice.bonus;
  for (let index = 0; index < dice.count * times; index++)
    sum += 1 + Math.floor(random() * dice.sides);
  return sum;
}

export const fighter = (stats: FighterStats): Fighter => ({
  stats,
  hp: stats.hp,
  potions: stats.potions,
  cooldown: 0,
  guard: null,
});

export function startBattle(
  player: FighterStats,
  enemy: FighterStats,
): BattleState {
  return {
    phase: "player",
    turn: 1,
    player: fighter(player),
    enemy: fighter(enemy),
    log: [],
  };
}

export function canUse(self: Fighter, move: Move) {
  if (move === "heal") return self.potions > 0 && self.hp < self.stats.hp;
  if (move === "special") return self.cooldown === 0;
  return true;
}

const validD20 = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 20;

/**
 * Plays one move for the side whose turn it is. `d20` holds the thrown die
 * first; a second value is used only when the move has advantage.
 */
export function playTurn(
  state: BattleState,
  move: Move,
  d20: number[],
  random: () => number,
): BattleState {
  if (state.phase !== "player" && state.phase !== "enemy") return state;
  const side: Side = state.phase;
  const other: Side = side === "player" ? "enemy" : "player";
  // A guard lasts until its owner's next turn.
  const self: Fighter = { ...state[side], guard: null };
  const foe: Fighter = { ...state[other] };
  if (!canUse(self, move) || !d20.length || !d20.every(validD20)) return state;

  const special = move === "special" ? self.stats.special : null;
  const rolls = special?.advantage ? d20.slice(0, 2) : d20.slice(0, 1);
  if (rolls.length < (special?.advantage ? 2 : 1)) return state;
  const roll = Math.max(...rolls);
  const event: TurnEvent = { actor: side, move, d20: rolls, roll };

  if (move === "defend") {
    event.guard =
      roll === 20 ? "perfect" : roll >= DEFEND_TARGET ? "strong" : "weak";
    self.guard = event.guard;
  } else if (move === "heal") {
    self.potions -= 1;
    if (roll === 1) {
      event.fumble = true;
      event.healed = 0;
    } else {
      const amount = rollDice(self.stats.heal, random, roll === 20 ? 2 : 1);
      const bonus = roll >= 15 ? Math.ceil(amount / 2) : 0;
      const healed = Math.min(self.stats.hp - self.hp, amount + bonus);
      self.hp += healed;
      event.healed = healed;
    }
  } else {
    const bonus = self.stats.attack + (special?.toHit ?? 0);
    const guard = foe.guard;
    const target = foe.stats.ac + (guard ? GUARD_AC[guard] : 0);
    const critical = roll >= (special?.critOn ?? 20);
    event.total = roll + bonus;
    event.target = target;
    event.critical = critical;
    event.fumble = roll === 1;
    const hit =
      roll !== 1 && guard !== "perfect" && (critical || roll + bonus >= target);
    event.hit = hit;
    if (guard) event.blocked = guard;
    if (special) self.cooldown = special.cooldown;
    if (hit) {
      const dice = special?.damage ?? self.stats.damage;
      let damage = 0;
      for (let strike = 0; strike < (special?.hits ?? 1); strike++)
        damage += rollDice(dice, random, critical ? 2 : 1);
      if (guard === "strong") damage = Math.ceil(damage / 2);
      damage = Math.min(foe.hp, damage);
      foe.hp -= damage;
      event.damage = damage;
      if (special?.drain) {
        const healed = Math.min(self.stats.hp - self.hp, damage);
        self.hp += healed;
        event.healed = healed;
      }
    }
  }

  // A special waits `cooldown` of its owner's turns before it is ready again.
  if (!special) self.cooldown = Math.max(0, self.cooldown - 1);
  const next: BattleState = {
    ...state,
    [side]: self,
    [other]: foe,
    log: [event, ...state.log].slice(0, LOG_SIZE),
  } as BattleState;
  if (foe.hp <= 0) next.phase = side === "player" ? "won" : "lost";
  else {
    next.phase = other;
    if (side === "enemy") next.turn = state.turn + 1;
  }
  return next;
}

/** The monster heals when hurt, uses its special now and then, rarely guards. */
export function chooseEnemyMove(
  state: BattleState,
  random: () => number,
): Move {
  const enemy = state.enemy;
  const chance = random();
  if (canUse(enemy, "heal") && enemy.hp <= enemy.stats.hp * 0.4 && chance < 0.7)
    return "heal";
  if (canUse(enemy, "special") && chance < 0.45) return "special";
  if (chance > 0.9) return "defend";
  return "attack";
}

export const rollD20 = (random: () => number = Math.random) =>
  1 + Math.floor(random() * 20);

/** The dice a move still needs after its d20, if any. */
export type DamageRoll = {
  kind: "damage" | "heal";
  sides: number;
  /** Physical dice to throw: dice count × hits, doubled on a critical. */
  count: number;
  /** Flat bonus added to the thrown total. */
  bonus: number;
};

/**
 * Plays the d20 part of a move without damage, so the visitor can see the
 * verdict first and then throw the damage (or healing) dice themselves.
 */
export function previewTurn(
  state: BattleState,
  move: Move,
  d20: number[],
): { event: TurnEvent; dice: DamageRoll | null } | null {
  const preview = playTurn(state, move, d20, () => 0);
  if (preview === state) return null;
  const event = preview.log[0];
  const stats = state[event.actor].stats;
  if (move === "heal") {
    if (event.fumble) return { event, dice: null };
    const { sides, count, bonus } = stats.heal;
    return {
      event,
      dice: {
        kind: "heal",
        sides,
        count: count * (event.roll === 20 ? 2 : 1),
        bonus,
      },
    };
  }
  if ((move === "attack" || move === "special") && event.hit) {
    const special = move === "special" ? stats.special : null;
    const dice = special?.damage ?? stats.damage;
    const hits = special?.hits ?? 1;
    return {
      event,
      dice: {
        kind: "damage",
        sides: dice.sides,
        count: dice.count * hits * (event.critical ? 2 : 1),
        bonus: dice.bonus * hits,
      },
    };
  }
  return { event, dice: null };
}

/** Feeds thrown dice to `playTurn` as its random source, in order. */
export function thrownDice(values: readonly number[], sides: number) {
  let index = 0;
  return () => {
    const value = values[index++] ?? 1;
    return (Math.min(Math.max(value, 1), sides) - 0.5) / sides;
  };
}
