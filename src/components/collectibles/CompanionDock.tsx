"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  Pause,
  Footprints,
  MousePointer2,
  Sparkles,
  Heart,
  Dices,
} from "lucide-react";
import { getReward, type Reward } from "@/data/collectibles";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
import { useCompanion } from "@/context/CompanionContext";
import { containPet, movePet, type Point } from "@/lib/companion";
import { playCopy } from "@/locales/play";
import { useReducedMotion } from "@/components/interactions/useReducedMotion";
import SignGlyph from "@/components/interactions/SignGlyph";
import RewardArt from "./RewardArt";
type Mode = "rest" | "roam" | "follow" | "fetch";
export default function CompanionDock() {
  const { data, remove } = useCollection();
  const { preview, visit } = useCompanion();
  const item = getReward(preview ?? data.equipped.companion ?? "");
  if (!item) return null;
  return (
    <ActiveCompanion
      key={`${item.id}-${preview ? "preview" : "equipped"}`}
      item={item}
      visiting={!!preview}
      hide={() => {
        if (preview) visit(null);
        else remove("companion");
      }}
    />
  );
}
function ActiveCompanion({
  item,
  visiting,
  hide,
}: {
  item: Reward;
  visiting: boolean;
  hide: () => void;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("rest");
  const [message, setMessage] = useState<keyof typeof c>("resting");
  const [pixels, setPixels] = useState(0);
  const [reaction, setReaction] = useState(0);
  const [roll, setRoll] = useState<number | null>(null);
  const [target, setTarget] = useState<Point | null>(null);
  const sprite = useRef<HTMLButtonElement>(null);
  const hud = useRef<HTMLElement>(null);
  const position = useRef<Point>({ x: 8, y: 120 });
  const destination = useRef<Point>({ x: 8, y: 120 });
  const focused = useRef(false);
  const special = item.id.includes("d20")
    ? "roll"
    : item.id === "medallion"
      ? "magic"
      : "pet";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.companion = "active";
    let frame = 0;
    let previous = 0;
    let direction = -1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let floor = hud.current?.offsetHeight ?? 150;
    const bounds = () => ({ width, height, floor });
    const paint = () => {
      if (sprite.current)
        sprite.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      floor = hud.current?.offsetHeight ?? 150;
      root.style.setProperty("--companion-floor", `${floor + 84}px`);
      position.current = containPet(position.current, bounds());
      destination.current = containPet(destination.current, bounds());
      paint();
    };
    const observer = new ResizeObserver(resize);
    if (hud.current) observer.observe(hud.current);
    resize();
    if (mode === "rest" || reduced) {
      position.current = containPet({ x: width - 100, y: height }, bounds());
      paint();
    }
    const follow = (event: PointerEvent) => {
      if (
        mode !== "follow" ||
        focused.current ||
        (event.target instanceof Element &&
          event.target.closest(".companion-hud"))
      )
        return;
      destination.current = containPet(
        { x: event.clientX - 92, y: event.clientY - 92 },
        bounds(),
      );
    };
    const animate = (time: number) => {
      const elapsed = previous ? Math.min(time - previous, 40) / 1000 : 0;
      previous = time;
      if (!focused.current && !document.hidden) {
        if (mode === "roam") {
          const edge = Math.max(8, width - 76);
          if (position.current.x <= 9) direction = 1;
          if (position.current.x >= edge - 1) direction = -1;
          destination.current = containPet(
            { x: direction === 1 ? edge : 8, y: height },
            bounds(),
          );
        } else if (mode === "fetch" && target) {
          destination.current = containPet(target, bounds());
        }
        const before = position.current;
        position.current = movePet(
          before,
          destination.current,
          elapsed * (mode === "fetch" ? 360 : 155),
        );
        if (sprite.current) {
          const moving =
            Math.hypot(
              position.current.x - before.x,
              position.current.y - before.y,
            ) > 0.05;
          sprite.current.dataset.moving = String(moving);
          sprite.current.style.setProperty(
            "--facing",
            position.current.x < before.x ? "-1" : "1",
          );
        }
        paint();
        if (
          mode === "fetch" &&
          target &&
          Math.hypot(
            position.current.x - destination.current.x,
            position.current.y - destination.current.y,
          ) < 2
        ) {
          setTarget(null);
          setPixels((count) => count + 1);
          setMessage("found");
          setMode("rest");
          setReaction((count) => count + 1);
          return;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    if (mode !== "rest" && !reduced) frame = requestAnimationFrame(animate);
    window.addEventListener("pointermove", follow, { passive: true });
    window.addEventListener("pointerdown", follow, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerdown", follow);
      window.removeEventListener("resize", resize);
      delete root.dataset.companion;
      root.style.removeProperty("--companion-floor");
    };
  }, [mode, reduced, target]);

  function changeMode(next: Mode) {
    setMode(next);
    setTarget(null);
    setMessage(
      next === "roam" ? "walking" : next === "follow" ? "following" : "resting",
    );
  }
  function fetchPixel() {
    setMessage("fetching");
    setRoll(null);
    if (reduced) {
      setPixels((count) => count + 1);
      setMessage("found");
      return;
    }
    const floor = hud.current?.offsetHeight ?? 150;
    setTarget(
      containPet(
        {
          x: Math.random() * (window.innerWidth - 100),
          y: window.innerHeight - floor - 140 - Math.random() * 120,
        },
        { width: window.innerWidth, height: window.innerHeight, floor },
      ),
    );
    setMode("fetch");
  }
  function interact() {
    setReaction((count) => count + 1);
    setRoll(special === "roll" ? Math.floor(Math.random() * 20) + 1 : null);
    setMessage(
      special === "roll"
        ? "rolled"
        : special === "magic"
          ? "conjured"
          : "affection",
    );
  }
  return (
    <>
      <div
        className={`companion-world pet-${item.id}`}
        data-motion={mode !== "rest" && !reduced ? "on" : "off"}
      >
        {target && (
          <span
            className="fetch-pixel"
            style={{
              transform: `translate3d(${target.x + 28}px, ${target.y + 28}px, 0)`,
            }}
            aria-hidden="true"
          />
        )}
        <button
          ref={sprite}
          className="world-pet"
          aria-label={`${c[special]}: ${item.name[language]}`}
          onClick={interact}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
          }}
        >
          <span className="pet-shadow" aria-hidden="true" />
          <span className="pet-sprite">
            <RewardArt reward={item} />
          </span>
          {reaction > 0 && (
            <span
              key={reaction}
              className={`pet-reaction reaction-${special}`}
              aria-hidden="true"
            >
              {special === "roll" ? (
                roll
              ) : special === "magic" ? (
                <SignGlyph id="quen" />
              ) : (
                "♥"
              )}
            </span>
          )}
        </button>
      </div>
      <aside
        ref={hud}
        className="companion-hud"
        aria-label={c.controls}
        onKeyDown={(event) => {
          if (event.key === "Escape") changeMode("rest");
        }}
      >
        <div className="companion-identity">
          <RewardArt reward={item} />
          <div>
            <span className="pixel-label">
              {visiting ? c.visiting : c.equipped}
            </span>
            <strong>{item.name[language]}</strong>
          </div>
        </div>
        <div
          className="companion-commands"
          role="group"
          aria-label={c.controls}
        >
          <button
            onClick={() => changeMode("roam")}
            aria-pressed={mode === "roam"}
            disabled={reduced}
          >
            <Footprints size={16} />
            {c.roam}
          </button>
          <button
            onClick={() => changeMode("follow")}
            aria-pressed={mode === "follow"}
            disabled={reduced}
          >
            <MousePointer2 size={16} />
            {c.follow}
          </button>
          <button onClick={fetchPixel}>
            <Sparkles size={16} />
            {c.fetch}
          </button>
          <button onClick={interact}>
            {special === "roll" ? (
              <Dices size={16} />
            ) : special === "magic" ? (
              <Sparkles size={16} />
            ) : (
              <Heart size={16} />
            )}
            {c[special]}
          </button>
          <button
            onClick={() => changeMode("rest")}
            aria-pressed={mode === "rest"}
          >
            <Pause size={16} />
            {c.rest}
          </button>
        </div>
        <div className="companion-readout">
          <p role="status">
            {c[message]}
            {roll !== null && message === "rolled" ? `: ${roll} / 20` : ""}
          </p>
          <span>
            {pixels} {c.pixels}
          </span>
          {reduced && <small>{c.reduced}</small>}
        </div>
        <Link href="/inventory" className="hud-inventory">
          {c.manage}
        </Link>
        <button
          className="companion-dismiss"
          aria-label={c.hide}
          onClick={hide}
        >
          <X size={16} />
        </button>
      </aside>
    </>
  );
}
