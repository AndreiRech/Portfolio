"use client";
import { sfx } from "@/shared/lib/sfx";
import { useEffect, useRef, useState } from "react";
import PixelPet from "../../companions/components/PixelPet";
import { Dices } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import { useReducedMotion } from "../../../shared/ui/useReducedMotion";
import { useDieThrow } from "../../dice/hooks/useDieThrow";
import Die3D, { type DieRoll } from "../../dice/components/Die3D";

type Result = { value: number; attempt: number };
const HISTORY = 6;
const GOLD = ["#eac67d", "#f3db9c", "#fff4cf"];
/** How long the 3D die stays on its result before the mascot returns. */
const HOLD_3D = 1400;
const critical = (value: number) =>
  value === 20 ? "high" : value === 1 ? "low" : undefined;

export default function HeroDice() {
  const { copy: c } = useSettings();
  const reduced = useReducedMotion();
  const unlock = useUnlock();
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState<DieRoll | null>(null);
  const [show3d, setShow3d] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempt = useRef(0);

  useEffect(
    () => () => {
      if (hold.current) clearTimeout(hold.current);
    },
    [],
  );

  const {
    target: art,
    dragging,
    handlers,
  } = useDieThrow({
    disabled: rolling,
    reduced,
    onThrow(direction) {
      if (hold.current) clearTimeout(hold.current);
      setRolling(true);
      setShow3d(true);
      setRoll({
        value: Math.floor(Math.random() * 20) + 1,
        id: ++attempt.current,
        direction,
      });
    },
  });

  function landed({ value, id }: DieRoll) {
    setRolling(false);
    const next = { value, attempt: id };
    setResult(next);
    setHistory((rolls) => [next, ...rolls].slice(0, HISTORY));
    hold.current = setTimeout(() => setShow3d(false), HOLD_3D);
    if (value === 20) {
      sfx.reveal(4);
      unlock("nat20");
      const box = art.current?.getBoundingClientRect();
      if (box)
        pixelBurst(box.x + box.width / 2, box.y + box.height / 2, {
          count: 28,
          distance: 220,
          colors: GOLD,
          duration: 950,
        });
    } else if (value === 1) {
      sfx.wrong();
      unlock("fumble");
      if (!reduced)
        scene.current?.animate(
          [0, -10, 9, -7, 5, -3, 0].map((x) => ({
            transform: `translateX(${x}px)`,
          })),
          { duration: 420, easing: "steps(7, end)" },
        );
    }
  }

  return (
    <div
      className="hero-dice-scene"
      ref={scene}
      data-critical={result ? critical(result.value) : undefined}
    >
      <h2>{c.diceTitle}</h2>
      <span className="hero-dice-pixel dice-pixel-one" aria-hidden="true" />
      <span className="hero-dice-pixel dice-pixel-two" aria-hidden="true" />
      <output
        className="hero-dice-result"
        aria-live="polite"
        data-critical={result ? critical(result.value) : undefined}
      >
        <span className="sr-only">{c.diceResult}: </span>
        <strong key={result?.attempt}>{result?.value ?? "?"}</strong>
        <span>/ 20</span>
        {result?.value === 20 && <small>{c.diceCritical}</small>}
        {result?.value === 1 && <small>{c.diceFumble}</small>}
      </output>
      <button
        className="hero-dice-trigger"
        data-dragging={dragging}
        aria-disabled={rolling}
        aria-busy={rolling}
        {...handlers}
      >
        <span
          ref={art}
          className="hero-dice-art"
          data-mode={show3d ? "3d" : "2d"}
        >
          <PixelPet
            id="d20"
            face={result?.value ?? 20}
            className="hero-dice-pet"
          />
          <Die3D roll={roll} onLanded={landed} resolution={84} />
        </span>
        <span className="hero-dice-action">
          <Dices size={19} aria-hidden="true" />
          {rolling ? c.rollingDice : c.rollDice}
        </span>
      </button>
      <div className="hero-dice-history" data-empty={history.length === 0}>
        <span>{c.diceHistory}</span>
        <ol aria-label={c.diceHistory}>
          {history.map((item, index) => (
            <li
              key={item.attempt}
              data-critical={critical(item.value)}
              data-latest={index === 0}
            >
              {item.value}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
