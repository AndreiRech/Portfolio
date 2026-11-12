"use client";
import { useEffect } from "react";
import { KONAMI, konamiStep } from "@/features/achievements/model/achievements";
import { pixelBurst } from "@/shared/lib/pixelBurst";
import { unlockAudioOnGesture } from "@/shared/lib/sfx";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";

const GOLD = ["#eac67d", "#f3db9c", "var(--accent)", "var(--blue)"];

export default function EasterEggs() {
  const unlock = useUnlock();
  // Game sounds fire from timers and animations; unlock audio on first tap.
  useEffect(() => unlockAudioOnGesture(), []);
  useEffect(() => {
    let position = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      )
        return;
      position = konamiStep(position, event.key);
      if (position < KONAMI.length) return;
      position = 0;
      unlock("konami");
      for (let index = 0; index < 6; index++)
        timers.push(
          setTimeout(
            () =>
              pixelBurst(
                window.innerWidth * (0.12 + Math.random() * 0.76),
                window.innerHeight * (0.15 + Math.random() * 0.5),
                { count: 18, distance: 150, colors: GOLD, duration: 900 },
              ),
            index * 140,
          ),
        );
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      timers.forEach(clearTimeout);
    };
  }, [unlock]);
  return null;
}
