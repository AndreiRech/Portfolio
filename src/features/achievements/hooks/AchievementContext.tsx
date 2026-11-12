"use client";
import { sfx } from "@/shared/lib/sfx";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Trophy } from "lucide-react";
import {
  ACHIEVEMENTS,
  createAchievementStore,
  type AchievementId,
} from "@/features/achievements/model/achievements";
import { useSettings } from "@/shared/i18n/SettingsContext";

type Store = ReturnType<typeof createAchievementStore>;
type Toast = { id: AchievementId; key: number };
const AchievementContext = createContext<{
  store: Store;
  unlock: (id: AchievementId) => void;
} | null>(null);
const TOAST_MS = 4600;

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createAchievementStore(() => window.localStorage),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const nextKey = useRef(0);
  const unlock = useCallback(
    (id: AchievementId) => {
      if (!store.unlock(id)) return;
      sfx.achievement();
      const key = nextKey.current++;
      setToasts((current) => [...current.slice(-2), { id, key }]);
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setToasts((current) => current.filter((toast) => toast.key !== key));
      }, TOAST_MS);
      timers.current.add(timer);
    },
    [store],
  );
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const value = useMemo(() => ({ store, unlock }), [store, unlock]);
  return (
    <AchievementContext.Provider value={value}>
      {children}
      <AchievementToasts toasts={toasts} />
    </AchievementContext.Provider>
  );
}

function AchievementToasts({ toasts }: { toasts: Toast[] }) {
  const { copy: c, language } = useSettings();
  return (
    <div className="achievement-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const achievement = ACHIEVEMENTS.find((item) => item.id === toast.id)!;
        return (
          <div className="achievement-toast" key={toast.key}>
            <span className="achievement-icon" aria-hidden="true">
              <Trophy size={20} />
            </span>
            <p>
              <small>{c.achievementUnlocked}</small>
              <strong>{achievement.title[language]}</strong>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) throw new Error("AchievementProvider is required.");
  const { store, unlock } = context;
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return { unlocked: snapshot.unlocked, unlock };
}

/** Unlock function only, for callers that should not re-render on unlocks. */
export function useUnlock() {
  const context = useContext(AchievementContext);
  if (!context) throw new Error("AchievementProvider is required.");
  return context.unlock;
}
