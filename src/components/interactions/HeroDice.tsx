"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { Dices } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useReducedMotion } from "./useReducedMotion";

type Drag = { pointer: number; x: number; y: number; moved: boolean };
type Result = { value: number; attempt: number };
const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

export default function HeroDice() {
  const { copy: c } = useSettings();
  const reduced = useReducedMotion();
  const [result, setResult] = useState<Result | null>(null);
  const [rolling, setRolling] = useState(false);
  const art = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const drag = useRef<Drag | null>(null);
  const busy = useRef(false);
  const ignoreClick = useRef(false);
  const attempt = useRef(0);

  useEffect(
    () => () => {
      animation.current?.cancel();
    },
    [],
  );
  useEffect(() => {
    if (reduced) {
      animation.current?.finish();
      if (art.current) art.current.style.transform = "";
    }
  }, [reduced]);

  function roll(direction = 1) {
    if (busy.current || !art.current) return;
    const node = art.current;
    const from = node.style.transform || "translate(0, 0) rotate(0deg)";
    node.style.transform = "";
    const value = Math.floor(Math.random() * 20) + 1;
    const settle = () => {
      animation.current?.cancel();
      animation.current = null;
      busy.current = false;
      setRolling(false);
      setResult({ value, attempt: ++attempt.current });
    };
    if (reduced) {
      settle();
      return;
    }
    busy.current = true;
    setRolling(true);
    animation.current = node.animate(
      [
        { transform: from, offset: 0 },
        {
          transform: `translate(${direction * 58}px, -82px) rotate(${direction * 125}deg)`,
          offset: 0.32,
        },
        {
          transform: `translate(${-direction * 20}px, 9px) rotate(${direction * 290}deg)`,
          offset: 0.7,
        },
        {
          transform: `translate(${direction * 8}px, -20px) rotate(${direction * 335}deg)`,
          offset: 0.85,
        },
        {
          transform: `translate(0, 0) rotate(${direction * 360}deg)`,
          offset: 1,
        },
      ],
      { duration: 900, easing: "cubic-bezier(.25,.65,.35,1)" },
    );
    animation.current.onfinish = settle;
  }
  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (busy.current || !event.isPrimary || event.button !== 0) return;
    ignoreClick.current = false;
    drag.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId || !art.current) return;
    const x = clamp(event.clientX - start.x, 65);
    const y = clamp(event.clientY - start.y, 55);
    if (Math.hypot(x, y) > 8) start.moved = true;
    if (!reduced)
      art.current.style.transform = `translate(${x}px, ${y}px) rotate(${x / 4}deg)`;
  }
  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (start.moved) {
      ignoreClick.current = true;
      roll(event.clientX < start.x ? -1 : 1);
    } else if (art.current) art.current.style.transform = "";
  }
  function cancelDrag(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    if (art.current) art.current.style.transform = "";
  }
  return (
    <div className="hero-dice-scene">
      <h2>{c.diceTitle}</h2>
      <span className="hero-dice-pixel dice-pixel-one" aria-hidden="true" />
      <span className="hero-dice-pixel dice-pixel-two" aria-hidden="true" />
      <output
        className="hero-dice-result"
        aria-live="polite"
        data-critical={
          result?.value === 20
            ? "high"
            : result?.value === 1
              ? "low"
              : undefined
        }
      >
        <span className="sr-only">{c.diceResult}: </span>
        <strong key={result?.attempt}>{result?.value ?? "?"}</strong>
        <span>/ 20</span>
        {result?.value === 20 && <small>{c.diceCritical}</small>}
        {result?.value === 1 && <small>{c.diceFumble}</small>}
      </output>
      <button
        className="hero-dice-trigger"
        aria-describedby="hero-dice-hint"
        aria-disabled={rolling}
        aria-busy={rolling}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        onLostPointerCapture={cancelDrag}
        onClick={(event) => {
          if (event.detail > 0 && ignoreClick.current) {
            ignoreClick.current = false;
            return;
          }
          roll();
        }}
      >
        <span ref={art} className="hero-dice-art">
          <Image
            src="/collectibles/companions/d20.webp"
            alt=""
            width={256}
            height={256}
            priority
            fetchPriority="high"
            draggable={false}
          />
        </span>
        <span className="hero-dice-action">
          <Dices size={19} aria-hidden="true" />
          {rolling ? c.rollingDice : c.rollDice}
        </span>
      </button>
      <div className="hero-dice-ground" aria-hidden="true" />
      <p id="hero-dice-hint">{c.diceHint}</p>
    </div>
  );
}
