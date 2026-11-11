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
  ChevronUp,
} from "lucide-react";
import { getReward, type Reward } from "@/data/collectibles";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
import { useCompanion } from "@/context/CompanionContext";
import { containPet, movePet, petFacing, type Point } from "@/lib/companion";
import { playCopy } from "@/locales/play";
import { useReducedMotion } from "@/components/interactions/useReducedMotion";
import RewardArt from "./RewardArt";

type Mode = "rest" | "roam" | "follow" | "fetch" | "return";
const modeLabels = {
  rest: "resting",
  roam: "walking",
  follow: "follow",
  fetch: "fetching",
  return: "returning",
} as const;
const companionActions = {
  roll: { Icon: Dices, message: "rolled", art: null },
  shine: { Icon: Sparkles, message: "shining", art: "✦" },
  pet: { Icon: Heart, message: "affection", art: "♥" },
} as const;
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
  const [mode, setMode] = useState<Mode>("roam");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<keyof typeof c>("walking");
  const [pixels, setPixels] = useState(0);
  const [reaction, setReaction] = useState(0);
  const [roll, setRoll] = useState<number | null>(null);
  const [target, setTarget] = useState<Point | null>(null);
  const sprite = useRef<HTMLButtonElement>(null);
  const hud = useRef<HTMLElement>(null);
  const berth = useRef<HTMLButtonElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const position = useRef<Point>({ x: 8, y: 120 });
  const destination = useRef<Point>({ x: 8, y: 120 });
  const initialized = useRef(false);
  const focused = useRef(false);
  const returnTo = useRef<"rest" | "roam" | "hide">("rest");
  const hideAction = useRef(hide);
  useEffect(() => {
    hideAction.current = hide;
  }, [hide]);
  const special = item.id.includes("d20")
    ? "roll"
    : item.id === "medallion"
      ? "shine"
      : "pet";
  const docked = mode === "rest" || reduced;
  const action = companionActions[special];
  const ActionIcon = action.Icon;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.companion = "active";
    let frame = 0;
    let previous = 0;
    let direction = -1;
    let facing = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let floor = 90;
    let home: Point = { x: width - 84, y: height - 84 };
    const bounds = () => ({ width, height, floor });
    const paint = () => {
      if (sprite.current)
        sprite.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    };
    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      floor = (hud.current?.offsetHeight ?? 70) + 16;
      root.style.setProperty("--companion-floor", `${floor + 84}px`);
      const rect = berth.current?.getBoundingClientRect();
      if (rect)
        home = {
          x: rect.x + rect.width / 2 - 34,
          y: rect.y + rect.height / 2 - 34,
        };
      if (!initialized.current) {
        initialized.current = true;
        position.current = home;
      }
      if (reduced || mode === "rest") position.current = home;
      destination.current =
        mode === "return" ? home : containPet(destination.current, bounds());
      paint();
    };
    const resize = () => {
      measure();
      position.current = containPet(position.current, {
        width,
        height,
        floor: 8,
      });
      paint();
    };
    const observer = new ResizeObserver(measure);
    if (hud.current) observer.observe(hud.current);
    measure();
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
    const finishReturn = () => {
      if (returnTo.current === "hide") {
        hideAction.current();
        return;
      }
      setMode(returnTo.current);
      if (returnTo.current === "rest") setMessage("resting");
    };
    const collectPixel = () => {
      setTarget(null);
      setPixels((count) => count + 1);
      setMessage("found");
      setReaction((count) => count + 1);
      returnTo.current = "roam";
      setMode(reduced ? "rest" : "return");
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
        } else if (mode === "fetch" && target)
          destination.current = containPet(target, bounds());
        else if (mode === "return") destination.current = home;
        const before = position.current;
        position.current = movePet(
          before,
          destination.current,
          elapsed * (mode === "fetch" ? 320 : 155),
        );
        if (sprite.current) {
          sprite.current.dataset.moving = String(
            Math.hypot(
              position.current.x - before.x,
              position.current.y - before.y,
            ) > 0.05,
          );
          facing = petFacing(before, position.current, facing);
          sprite.current.style.setProperty("--facing", String(facing));
          sprite.current.style.setProperty("--roll-direction", String(-facing));
        }
        paint();
        const arrived =
          Math.hypot(
            position.current.x - destination.current.x,
            position.current.y - destination.current.y,
          ) < 1;
        if (mode === "fetch" && target && arrived) {
          collectPixel();
          return;
        }
        if (mode === "return" && arrived) {
          finishReturn();
          return;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    if (!reduced && mode !== "rest") frame = requestAnimationFrame(animate);
    else if (mode === "fetch" && target)
      frame = requestAnimationFrame(collectPixel);
    else if (mode === "return") frame = requestAnimationFrame(finishReturn);
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

  function goHome(next: "rest" | "hide") {
    setTarget(null);
    returnTo.current = next;
    if (reduced || mode === "rest") {
      if (next === "hide") hide();
      else {
        setMode("rest");
        setMessage("resting");
      }
      return;
    }
    setMode("return");
    setMessage("returning");
  }
  function changeMode(next: "roam" | "follow") {
    setMode(next);
    setTarget(null);
    setMessage(next === "roam" ? "walking" : "following");
  }
  function fetchPixel() {
    setRoll(null);
    if (reduced) {
      setPixels((count) => count + 1);
      setMessage("found");
      return;
    }
    const floor = (hud.current?.offsetHeight ?? 70) + 16;
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
    setMessage("fetching");
  }
  function interact() {
    setReaction((count) => count + 1);
    setRoll(special === "roll" ? Math.floor(Math.random() * 20) + 1 : null);
    setMessage(action.message);
  }
  const reactionArt = reaction > 0 && (
    <span
      key={reaction}
      className={`pet-reaction reaction-${special}`}
      aria-hidden="true"
    >
      {special === "roll" ? roll : action.art}
    </span>
  );
  return (
    <>
      <div
        className={`companion-world pet-${item.id}`}
        data-motion={docked ? "off" : "on"}
        data-mode={mode}
      >
        {target && !reduced && (
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
          hidden={docked}
          aria-label={`${c.controls}: ${item.name[language]}`}
          onClick={() => {
            setOpen(true);
            toggle.current?.focus();
          }}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
          }}
        >
          <span className="pet-shadow" aria-hidden="true" />
          <span className="pet-sprite">
            <span className="pet-body">
              <RewardArt reward={item} />
            </span>
          </span>
          {reactionArt}
        </button>
      </div>
      <aside
        ref={hud}
        className="companion-hud"
        data-open={open}
        aria-label={c.controls}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="companion-toolbar">
          <button
            ref={berth}
            className="hud-pet"
            onClick={interact}
            aria-label={`${c[special]}: ${item.name[language]}`}
          >
            {docked ? (
              <RewardArt reward={item} />
            ) : (
              <Footprints size={22} aria-hidden="true" />
            )}
            {docked && reactionArt}
          </button>
          <button
            ref={toggle}
            className="companion-toggle"
            aria-expanded={open}
            aria-controls="companion-menu"
            onClick={() => setOpen(!open)}
          >
            <span>
              <strong>{item.name[language]}</strong>
              <small>{reduced ? c.resting : c[modeLabels[mode]]}</small>
            </span>
            <ChevronUp size={18} aria-hidden="true" />
            <span className="sr-only">{c.controls}</span>
          </button>
          <button
            className="companion-dismiss"
            aria-label={c.hide}
            onClick={() => goHome("hide")}
          >
            <X size={18} />
          </button>
        </div>
        <div id="companion-menu" className="companion-menu" hidden={!open}>
          <span className="pixel-label">
            {visiting ? c.visiting : c.equipped}
          </span>
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
              <ActionIcon size={16} />
              {c[special]}
            </button>
            <button
              onClick={() => goHome("rest")}
              aria-pressed={mode === "rest"}
            >
              <Pause size={16} />
              {c.rest}
            </button>
          </div>
          <div className="companion-readout">
            <p role="status">
              {reduced && (message === "walking" || message === "following")
                ? c.resting
                : c[message]}
              {roll !== null && message === "rolled" ? `: ${roll} / 20` : ""}
            </p>
            <span>
              {pixels} {pixels === 1 ? c.pixel : c.pixels}
            </span>
            {reduced && <small>{c.reduced}</small>}
          </div>
          <Link href="/inventory" className="hud-inventory">
            {c.manage}
          </Link>
        </div>
      </aside>
    </>
  );
}
