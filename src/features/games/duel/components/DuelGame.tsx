"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  FlaskConical,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import GameHelp from "../../components/GameHelp";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { canUseCompanion } from "@/features/collectibles/model/collection";
import { getReward } from "@/features/collectibles/data/collectibles";
import { ENEMIES, PET_STATS } from "@/features/games/duel/data/fighters";
import { playCopy } from "@/shared/i18n/play";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import { sfx } from "@/shared/lib/sfx";
import {
  canUse,
  chooseEnemyMove,
  formatDice,
  playTurn,
  previewTurn,
  thrownDice,
  rollD20,
  startBattle,
  type BattleState,
  type Fighter,
  type FighterStats,
  type Move,
  type Side,
  type TurnEvent,
  type DamageRoll,
} from "@/features/games/duel/model/battle";
import RewardArt from "@/features/collectibles/components/RewardArt";
import Die3D, { type DieRoll } from "../../../dice/components/Die3D";
import type { DieSides } from "@/features/dice/components/dice3d";
import EnemySprite from "./EnemySprite";
import { useDieThrow } from "../../../dice/hooks/useDieThrow";
import { useReducedMotion } from "../../../../shared/ui/useReducedMotion";
import { useDailyProgress } from "../../daily/hooks/useDaily";
import {
  beginStreak,
  finishStreak,
  freshStreak,
  parseStreak,
} from "../../records/model/records";

type Anim = "idle" | "attack" | "hurt" | "dodge" | "defend" | "heal" | "die";
type Step =
  | "choose"
  | "throw"
  | "rolling"
  | "verdict"
  | "damage"
  | "damage-rolling"
  | "acting"
  | "over";
type Verdict = {
  id: number;
  side: Side;
  kind: "success" | "fail" | "crit" | "fumble" | "damage" | "heal";
  title: string;
  detail: string;
};
/** A move waiting on its dice: the d20 is thrown, damage may follow. */
type Check = {
  id: number;
  side: Side;
  move: Move;
  d20: number[];
  event: TurnEvent;
  dice: DamageRoll | null;
};
type Float = { id: number; side: Side; text: string; kind: string };

const MOVES: Move[] = ["attack", "defend", "special", "heal"];
const MOVE_ICONS = {
  attack: Swords,
  defend: Shield,
  special: Sparkles,
  heal: FlaskConical,
};
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

function HealthBar({
  fighter,
  name,
  label,
}: {
  fighter: Fighter;
  name: string;
  label: string;
}) {
  const ratio = fighter.hp / fighter.stats.hp;
  return (
    <div
      className="duel-health"
      data-level={ratio > 0.5 ? "high" : ratio > 0.25 ? "mid" : "low"}
    >
      <span className="duel-health-name">
        <strong>{name}</strong>
        <small>
          {label} {fighter.hp}/{fighter.stats.hp}
        </small>
      </span>
      <span
        className="duel-health-bar"
        role="meter"
        aria-label={`${name} ${label}`}
        aria-valuemin={0}
        aria-valuemax={fighter.stats.hp}
        aria-valuenow={fighter.hp}
        style={{ "--hp": `${ratio * 100}%` } as CSSProperties}
      >
        <i />
      </span>
    </div>
  );
}

export default function DuelGame() {
  const { language, copy } = useSettings();
  const c = playCopy[language];
  const unlock = useUnlock();
  const reduced = useReducedMotion();
  const [streak, setStreak] = useDailyProgress(
    "duel-streak-v1",
    "alltime",
    freshStreak,
    parseStreak,
  );
  const { data, ready } = useCollection();
  const owned = Object.keys(PET_STATS).filter((id) =>
    canUseCompanion(data, id),
  );
  const [petId, setPetId] = useState<string | null>(null);
  const pet = PET_STATS[petId ?? owned[0] ?? ""] as FighterStats | undefined;
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [step, setStep] = useState<Step>("choose");
  const [pending, setPending] = useState<Move | null>(null);
  const [roll, setRoll] = useState<DieRoll | null>(null);
  const [anims, setAnims] = useState<Record<Side, [Anim, number]>>({
    player: ["idle", 0],
    enemy: ["idle", 0],
  });
  const [floats, setFloats] = useState<Float[]>([]);
  const [check, setCheck] = useState<Check | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [damage, setDamage] = useState<{
    values: number[];
    direction: number;
  } | null>(null);
  const diceLanded = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const counter = useRef(0);
  const sprites = useRef<Record<Side, HTMLDivElement | null>>({
    player: null,
    enemy: null,
  });

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, action: () => void) => {
    timers.current.push(setTimeout(action, reduced ? Math.min(ms, 150) : ms));
  };
  const animate = (side: Side, anim: Anim) =>
    setAnims((current) => ({ ...current, [side]: [anim, ++counter.current] }));
  const float = (side: Side, text: string, kind: string) => {
    const id = ++counter.current;
    setFloats((current) => [...current, { id, side, text, kind }]);
    later(1100, () =>
      setFloats((current) => current.filter((item) => item.id !== id)),
    );
  };

  function begin(stats: FighterStats) {
    if (!streak) return;
    setStreak(beginStreak);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    setBattle(startBattle(stats, enemy));
    setStep("choose");
    setPending(null);
    setRoll(null);
    setCheck(null);
    setVerdict(null);
    setDamage(null);
    setFloats([]);
    setAnims({ player: ["idle", 0], enemy: ["idle", 0] });
  }

  function choose(move: Move) {
    if (!battle || step !== "choose" || !canUse(battle.player, move)) return;
    sfx.pop();
    setPending(move);
    setStep("throw");
  }

  const {
    target: dieArt,
    dragging,
    handlers,
  } = useDieThrow({
    disabled: step !== "throw" && step !== "damage",
    reduced,
    onThrow(direction) {
      if (step === "throw") {
        setStep("rolling");
        setRoll({ value: rollD20(), id: ++counter.current, direction });
      } else if (step === "damage") throwDamage(direction);
    },
  });

  function throwDamage(direction: number) {
    if (!check?.dice) return;
    const { sides, count } = check.dice;
    diceLanded.current = 0;
    setStep("damage-rolling");
    setDamage({
      direction,
      values: Array.from(
        { length: count },
        () => 1 + Math.floor(Math.random() * sides),
      ),
    });
  }

  function enemyTurn(state: BattleState) {
    const move = chooseEnemyMove(state, Math.random);
    setPending(move);
    setStep("rolling");
    later(650, () => {
      sfx.whoosh();
      setRoll({ value: rollD20(), id: ++counter.current, direction: -1 });
    });
  }

  /** Reads the d20 like a table would: success, failure, critical or fumble. */
  function judge(side: Side, event: TurnEvent): Verdict {
    const stats = battle![side].stats;
    const id = ++counter.current;
    const d20 =
      event.d20.length > 1
        ? `${event.roll} (${event.d20.join(", ")})`
        : `${event.roll}`;
    if (event.move === "defend")
      return {
        id,
        side,
        kind:
          event.guard === "perfect"
            ? "crit"
            : event.guard === "strong"
              ? "success"
              : "fail",
        title:
          event.guard === "perfect"
            ? c.verdictPerfect
            : event.guard === "strong"
              ? c.verdictGuard
              : c.verdictShaky,
        detail: `${d20} ${event.roll >= 10 ? "≥" : "<"} 10`,
      };
    if (event.move === "heal")
      return {
        id,
        side,
        kind: event.fumble ? "fumble" : event.roll === 20 ? "crit" : "success",
        title: event.fumble
          ? c.verdictSpill
          : event.roll === 20
            ? c.verdictCrit
            : c.verdictHeal,
        detail: d20,
      };
    const bonus =
      stats.attack + (event.move === "special" ? stats.special.toHit : 0);
    return {
      id,
      side,
      kind: event.fumble
        ? "fumble"
        : event.hit && event.critical
          ? "crit"
          : event.hit
            ? "success"
            : "fail",
      title: event.fumble
        ? c.verdictFumble
        : event.hit && event.critical
          ? c.verdictCrit
          : event.hit
            ? c.verdictHit
            : event.blocked === "perfect"
              ? c.verdictBlocked
              : c.verdictMiss,
      detail: `${d20} + ${bonus} = ${event.total} vs ${c.ac} ${event.target}`,
    };
  }

  /** The d20 landed: show the verdict, then ask for damage dice if it hit. */
  function landed({ value }: DieRoll) {
    if (!battle || !pending || step !== "rolling") return;
    const side: Side = battle.phase === "enemy" ? "enemy" : "player";
    const stats = battle[side].stats;
    const advantage = pending === "special" && stats.special.advantage;
    const d20 = advantage ? [value, rollD20()] : [value];
    const preview = previewTurn(battle, pending, d20);
    if (!preview) return setStep("choose");
    const next: Check = {
      id: ++counter.current,
      side,
      move: pending,
      d20,
      ...preview,
    };
    const shown = judge(side, preview.event);
    setCheck(next);
    setVerdict(shown);
    setStep("verdict");
    if (shown.kind === "crit") sfx.reveal(3);
    else if (shown.kind === "success") sfx.roundClear();
    else sfx.wrong();
    const box = sprites.current[side]?.getBoundingClientRect();
    if (box && (shown.kind === "success" || shown.kind === "crit"))
      pixelBurst(box.left + box.width / 2, box.top + box.height / 3, {
        count: shown.kind === "crit" ? 26 : 14,
        colors:
          shown.kind === "crit"
            ? ["#ffd36e", "#fff4cf", "#eac67d"]
            : ["#8fc97f", "#c9f2b8", "var(--fg)"],
      });

    later(1400, () => {
      if (!next.dice) {
        setVerdict(null);
        resolve(
          next,
          playTurn(battle, next.move, d20, () => 0),
        );
        return;
      }
      setDamage(null);
      if (side === "player") setStep("damage");
      else {
        setStep("damage");
        later(600, () => {
          diceLanded.current = 0;
          setStep("damage-rolling");
          setDamage({
            direction: -1,
            values: Array.from(
              { length: next.dice!.count },
              () => 1 + Math.floor(Math.random() * next.dice!.sides),
            ),
          });
        });
      }
    });
  }

  /** Every damage die has landed: total them, then play the move. */
  function damageLanded() {
    if (!check?.dice || !damage || !battle) return;
    diceLanded.current += 1;
    if (diceLanded.current < damage.values.length) return;
    const { sides, bonus, kind } = check.dice;
    const final = playTurn(
      battle,
      check.move,
      check.d20,
      thrownDice(damage.values, sides),
    );
    const event = final.log[0];
    const total = damage.values.reduce((sum, value) => sum + value, 0) + bonus;
    const dealt = kind === "heal" ? (event.healed ?? 0) : (event.damage ?? 0);
    const sum = `${damage.values.join(" + ")}${bonus ? ` + ${bonus}` : ""} = ${total}`;
    setVerdict({
      id: ++counter.current,
      side: check.side,
      kind,
      title:
        kind === "heal"
          ? fill(c.verdictHealed, { n: dealt })
          : fill(c.verdictDamage, { n: dealt }),
      detail:
        dealt !== total
          ? `${sum} → ${dealt} ${kind === "heal" ? c.verdictCapped : c.verdictHalved}`
          : sum,
    });
    sfx.tick();
    later(1100, () => {
      setVerdict(null);
      resolve(check, final);
    });
  }

  /** Plays the move's animations and hands the turn over. */
  function resolve(done: Check, next: BattleState) {
    const { side, move } = done;
    const other: Side = side === "player" ? "enemy" : "player";
    const event = next.log[0];
    setStep("acting");

    if (move === "attack" || move === "special") {
      animate(side, "attack");
      sfx.sign(move === "special" ? "igni" : "aard");
      later(330, () => {
        setBattle(next);
        if (event.hit) {
          animate(other, "hurt");
          float(other, `-${event.damage}`, event.critical ? "crit" : "damage");
          const box = sprites.current[other]?.getBoundingClientRect();
          if (box)
            pixelBurst(box.left + box.width / 2, box.top + box.height / 2, {
              count: event.critical ? 24 : 12,
              colors: ["var(--accent)", "#ffd36e", "var(--fg)"],
            });
          if (event.healed) float(side, `+${event.healed}`, "heal");
        } else {
          animate(other, event.blocked ? "defend" : "dodge");
          float(
            other,
            event.blocked && event.blocked !== "weak"
              ? c.floatBlock
              : c.floatMiss,
            "miss",
          );
        }
      });
    } else if (move === "defend") {
      setBattle(next);
      animate(side, "defend");
      sfx.sign("quen");
    } else {
      setBattle(next);
      animate(side, event.fumble ? "hurt" : "heal");
      float(side, event.fumble ? "0" : `+${event.healed}`, "heal");
      sfx.sign(event.fumble ? "axii" : "yrden");
    }

    later(1000, () => {
      setPending(null);
      setCheck(null);
      setDamage(null);
      setAnims((current) => ({
        player: [
          current.player[0] === "die" ? "die" : "idle",
          current.player[1],
        ],
        enemy: [current.enemy[0] === "die" ? "die" : "idle", current.enemy[1]],
      }));
      if (next.phase === "won" || next.phase === "lost") {
        setStreak((current) => finishStreak(current, next.phase === "won"));
        const loser: Side = next.phase === "won" ? "enemy" : "player";
        animate(loser, "die");
        setStep("over");
        if (next.phase === "won") {
          unlock("mimic");
          sfx.reveal(4);
        } else sfx.wrong();
      } else if (next.phase === "enemy") enemyTurn(next);
      else setStep("choose");
    });
  }

  function describe(event: TurnEvent, state: BattleState) {
    const who = state[event.actor].stats.name[language];
    const stats = state[event.actor].stats;
    const d20 =
      event.d20.length > 1
        ? `${event.roll} (${event.d20.join(", ")})`
        : event.roll;
    if (event.move === "defend")
      return fill(c.logDefend, {
        who,
        d20,
        outcome:
          event.guard === "perfect"
            ? c.guardPerfect
            : event.guard === "strong"
              ? c.guardStrong
              : c.guardWeak,
      });
    if (event.move === "heal")
      return fill(c.logHeal, {
        who,
        d20,
        outcome: event.fumble
          ? c.spilled
          : fill(c.healed, { n: event.healed ?? 0 }),
      });
    const outcome = event.hit
      ? fill(event.critical ? c.outcomeCrit : c.outcomeHit, {
          n: event.damage ?? 0,
        }) +
        (event.healed ? `, ${fill(c.outcomeDrain, { n: event.healed })}` : "")
      : event.fumble
        ? c.outcomeFumble
        : event.blocked === "perfect"
          ? c.outcomeBlocked
          : c.outcomeMiss;
    return fill(c.logAttack, {
      who,
      move:
        event.move === "special"
          ? stats.special.name[language]
          : c.moves.attack,
      d20,
      bonus:
        stats.attack + (event.move === "special" ? stats.special.toHit : 0),
      total: event.total ?? 0,
      target: event.target ?? 0,
      outcome,
    });
  }

  /** Moves show the dice they throw, e.g. "1d6+1 damage" or "3× 1d4+1". */
  function moveDetail(stats: FighterStats, self: Fighter, move: Move) {
    if (move === "attack") return `${formatDice(stats.damage)} ${c.damage}`;
    if (move === "defend") return c.defendHint;
    if (move === "heal")
      return `${formatDice(stats.heal)} · ${fill(c.potions, { n: self.potions })}`;
    if (self.cooldown > 0) return fill(c.cooldown, { n: self.cooldown });
    const special = stats.special;
    const hits = special.hits ?? 1;
    const extras = [
      special.advantage ? c.advantageShort : null,
      special.critOn ? fill(c.critShort, { n: special.critOn }) : null,
      special.drain ? c.drainShort : null,
    ].filter(Boolean);
    const dice = `${hits > 1 ? `${hits}× ` : ""}${formatDice(special.damage)}`;
    return [`${dice} ${c.damage}`, ...extras].join(" · ");
  }

  if (!ready)
    return (
      <div className="game-loading" role="status">
        {c.loading}
      </div>
    );

  if (!pet)
    return (
      <article
        className="duel-lab companion-empty"
        aria-labelledby="duel-title"
      >
        <Image src="/collectibles/case.svg" width={220} height={165} alt="" />
        <h2 id="duel-title">{c.duelNeedPet}</h2>
        <GameHelp>
          {language === "pt"
            ? "Libere um companheiro nas caixas e selecione-o para enfrentar um monstro. Escolha atacar, defender, curar ou usar uma habilidade e role os dados para resolver o turno."
            : "Unlock a companion in Cases, then select it to face a monster. Choose attack, defend, heal or a special ability and roll the dice to resolve each turn."}
        </GameHelp>
        <p>{c.duelNeedPetHint}</p>
        <Link href="/cases" className="button primary">
          {copy.boxAction}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </article>
    );

  if (!battle)
    return (
      <article className="duel-lab" aria-labelledby="duel-title">
        <div className="play-panel-heading">
          <span className="pixel-label">{c.duelLabel}</span>
        </div>
        <h2 id="duel-title">{c.duelTitle}</h2>
        <GameHelp>{c.duelIntro}</GameHelp>
        <p className="duel-streak">
          {c.duelStreak} <b>{streak?.current ?? 0}</b>
          <span>
            {c.duelBestStreak} <b>{streak?.best ?? 0}</b>
          </span>
        </p>
        <div className="duel-roster" role="group" aria-label={c.duelTitle}>
          {owned.map((id) => {
            const stats = PET_STATS[id];
            const reward = getReward(id);
            return (
              <button
                key={id}
                className="duel-pick"
                aria-pressed={pet.id === id}
                onClick={() => setPetId(id)}
              >
                <span className="pet-idle" data-pet={id}>
                  {reward ? <RewardArt reward={reward} /> : null}
                </span>
                <strong>{stats.name[language]}</strong>
                <span className="duel-stats">
                  <span>
                    {c.hp} <b>{stats.hp}</b>
                  </span>
                  <span>
                    {c.ac} <b>{stats.ac}</b>
                  </span>
                  <span>
                    {c.atk} <b>+{stats.attack}</b>
                  </span>
                </span>
                <small>
                  {formatDice(stats.damage)} · {stats.special.name[language]}
                </small>
              </button>
            );
          })}
        </div>
        <div className="memory-actions">
          <button
            className="button primary"
            disabled={!streak}
            onClick={() => begin(pet)}
          >
            <Swords size={17} aria-hidden="true" />
            {c.duelStart}
          </button>
        </div>
      </article>
    );

  const player = battle.player;
  const enemy = battle.enemy;
  const enemyName = enemy.stats.name[language];
  const petName = player.stats.name[language];
  const petReward = getReward(player.stats.id);
  const status =
    step === "over"
      ? battle.phase === "won"
        ? fill(c.duelWon, { name: enemyName })
        : fill(c.duelLost, { name: petName })
      : battle.phase === "enemy" && pending
        ? fill(c.enemyMove, {
            name: enemyName,
            move:
              pending === "special"
                ? enemy.stats.special.name[language]
                : c.moves[pending].toLowerCase(),
          })
        : step === "throw"
          ? c.throwDie
          : step === "damage" && check?.dice && check.side === "player"
            ? fill(check.dice.kind === "heal" ? c.throwHeal : c.throwDamage, {
                dice: `${check.dice.count}d${check.dice.sides}${check.dice.bonus ? `+${check.dice.bonus}` : ""}`,
              })
            : (step === "rolling" || step === "damage-rolling") && !verdict
              ? c.rolling
              : step === "choose"
                ? c.chooseMove
                : "\u00a0";
  const damageMode =
    !!check?.dice &&
    (step === "damage" ||
      step === "damage-rolling" ||
      (step === "verdict" && !!damage));
  const canThrow =
    step === "throw" || (step === "damage" && check?.side === "player");

  const fighterView = (side: Side) => {
    const self = battle[side];
    const [anim, key] = anims[side];
    return (
      <div
        className="duel-fighter"
        data-side={side}
        data-guard={step === "over" ? undefined : (self.guard ?? undefined)}
        data-anim={anim}
      >
        <HealthBar
          fighter={self}
          name={self.stats.name[language]}
          label={c.hp}
        />
        <div
          ref={(node) => {
            sprites.current[side] = node;
          }}
          className="duel-sprite"
          key={key}
          data-anim={anim}
          data-kind={side === "enemy" ? self.stats.id : "pet"}
        >
          {side === "enemy" ? (
            <EnemySprite id={self.stats.id} />
          ) : petReward ? (
            <RewardArt reward={petReward} />
          ) : null}
        </div>
        <span className="duel-floor" aria-hidden="true" />
        {floats
          .filter((item) => item.side === side)
          .map((item) => (
            <span
              key={item.id}
              className="duel-float"
              data-kind={item.kind}
              aria-hidden="true"
            >
              {item.text}
            </span>
          ))}
      </div>
    );
  };

  return (
    <article className="duel-lab" aria-labelledby="duel-title">
      <div className="play-panel-heading">
        <span className="pixel-label">{c.duelLabel}</span>
        <span className="memory-best">
          {c.turn} <strong>{String(battle.turn).padStart(2, "0")}</strong>
        </span>
      </div>
      <h2 id="duel-title" className="sr-only">
        {petName} vs {enemyName}
      </h2>
      <GameHelp>{c.duelIntro}</GameHelp>
      <p className="duel-streak" role="status">
        {c.duelStreak} <b>{streak?.current ?? 0}</b>
        <span>
          {c.duelBestStreak} <b>{streak?.best ?? 0}</b>
        </span>
      </p>

      <div className="duel-arena" data-phase={battle.phase}>
        {fighterView("player")}
        <span className="duel-versus" aria-hidden="true">
          VS
        </span>
        {fighterView("enemy")}
        {verdict ? (
          <div
            key={verdict.id}
            className="duel-verdict"
            data-kind={verdict.kind}
            data-side={verdict.side}
            role="status"
          >
            <strong>{verdict.title}</strong>
            <span>{verdict.detail}</span>
          </div>
        ) : null}
      </div>

      <p className="duel-status" role="status" aria-live="polite">
        {status}
      </p>

      <div className="duel-controls">
        <div className="duel-moves" role="group" aria-label={c.chooseMove}>
          {MOVES.map((move) => {
            const Icon = MOVE_ICONS[move];
            return (
              <button
                key={move}
                className="duel-move"
                aria-pressed={pending === move && battle.phase === "player"}
                disabled={step !== "choose" || !canUse(player, move)}
                onClick={() => choose(move)}
              >
                <Icon size={18} aria-hidden="true" />
                <strong>
                  {move === "special"
                    ? player.stats.special.name[language]
                    : c.moves[move]}
                </strong>
                <small>{moveDetail(player.stats, player, move)}</small>
              </button>
            );
          })}
        </div>
        <button
          className="duel-die"
          data-ready={canThrow}
          data-dragging={dragging}
          data-result={step === "verdict" ? verdict?.kind : undefined}
          aria-disabled={!canThrow}
          aria-label={c.throwDie}
          {...handlers}
        >
          <span
            ref={dieArt}
            className="duel-die-art"
            data-count={damageMode ? check!.dice!.count : 1}
          >
            {damageMode ? (
              check!.dice!.count > 0 &&
              Array.from({ length: check!.dice!.count }, (_, index) => (
                <Die3D
                  key={`${check!.id}-${index}`}
                  sides={check!.dice!.sides as DieSides}
                  roll={
                    damage
                      ? {
                          value: damage.values[index],
                          id: check!.id,
                          direction: damage.direction,
                        }
                      : null
                  }
                  onLanded={damageLanded}
                  variant={check!.dice!.kind === "heal" ? "gold" : "purple"}
                  resolution={check!.dice!.count > 2 ? 36 : 48}
                />
              ))
            ) : (
              <Die3D roll={roll} onLanded={landed} resolution={56} />
            )}
          </span>
        </button>
      </div>

      {step === "over" ? (
        <div className="memory-actions">
          <button
            className="button primary"
            onClick={() => begin(player.stats)}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {c.duelAgain}
          </button>
          <button
            className="memory-replay"
            onClick={() => {
              timers.current.forEach(clearTimeout);
              setBattle(null);
            }}
          >
            <Users size={15} aria-hidden="true" />
            {c.duelChange}
          </button>
        </div>
      ) : null}

      <ol className="duel-log" aria-label={c.turn}>
        {battle.log.map((event, index) => (
          <li
            key={`${battle.turn}-${battle.log.length}-${index}`}
            data-actor={event.actor}
            data-hit={event.hit}
          >
            {describe(event, battle)}
          </li>
        ))}
      </ol>
    </article>
  );
}
