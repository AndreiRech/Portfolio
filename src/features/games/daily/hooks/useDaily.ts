"use client";
import { useCallback, useEffect, useState } from "react";
import {
  dayKey,
  dayNumber,
  msUntilTomorrow,
} from "@/features/games/daily/model/daily";

export type Today = { key: string; number: number };

/**
 * Today's puzzle date, known only after mount (the static export cannot know
 * the visitor's day) and updated at local midnight.
 */
export function useToday(): Today | null {
  const [today, setToday] = useState<Today | null>(null);
  useEffect(() => {
    let timer = 0;
    const update = () => {
      const now = new Date();
      setToday((current) =>
        current?.key === dayKey(now)
          ? current
          : { key: dayKey(now), number: dayNumber(now) },
      );
      timer = window.setTimeout(update, msUntilTomorrow(now) + 500);
    };
    queueMicrotask(update);
    return () => clearTimeout(timer);
  }, []);
  return today;
}

/** Seconds-resolution countdown to the next puzzle, for the finished screen. */
export function useUntilTomorrow(active: boolean): number {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!active) return;
    const tick = () => setLeft(msUntilTomorrow(new Date()));
    queueMicrotask(tick);
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [active]);
  return left;
}

const storageKey = (game: string, day: string) => `daily:${game}:${day}`;

function readSaved<T>(key: string, parse: (value: unknown) => T | null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Progress on today's puzzle, saved in the browser so a reload keeps it.
 * Older days are dropped so storage does not grow. `parse` validates the
 * saved shape and returns null to start fresh.
 */
export function useDailyProgress<T>(
  game: string,
  day: string | null,
  initial: () => T,
  parse: (value: unknown) => T | null,
): [T | null, (next: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<{ day: string; value: T } | null>(null);

  useEffect(() => {
    if (!day) return;
    const value = readSaved(storageKey(game, day), parse) ?? initial();
    queueMicrotask(() => setState({ day, value }));
    // Reading once per day is the point; parse and initial are stable enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, day]);

  // Persists after render, keeping the state updater pure.
  useEffect(() => {
    if (!state) return;
    try {
      const prefix = `daily:${game}:`;
      const own = storageKey(game, state.day);
      for (let index = window.localStorage.length - 1; index >= 0; index--) {
        const key = window.localStorage.key(index);
        if (key?.startsWith(prefix) && key !== own)
          window.localStorage.removeItem(key);
      }
      window.localStorage.setItem(own, JSON.stringify(state.value));
    } catch {
      /* Private mode or full storage: progress lasts for the visit. */
    }
  }, [game, state]);

  const update = useCallback(
    (next: T | ((current: T) => T)) =>
      setState((current) =>
        current
          ? {
              day: current.day,
              value:
                typeof next === "function"
                  ? (next as (current: T) => T)(current.value)
                  : next,
            }
          : current,
      ),
    [],
  );

  return [state && state.day === day ? state.value : null, update];
}
