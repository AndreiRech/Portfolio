"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { en, type TranslationKey } from "@/shared/i18n/en";
import { pt } from "@/shared/i18n/pt";
import { interfaceCopy } from "@/shared/i18n/interface";
type Language = "en" | "pt";
const dictionaries = { en, pt };
function createLanguageStore() {
  let language: Language = "en";
  let loaded = false;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!loaded) {
        loaded = true;
        try {
          const stored = localStorage.getItem("lang");
          if (stored === "en" || stored === "pt") language = stored;
        } catch {
          /* Preferences remain usable for this visit. */
        }
      }
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => language,
    getServerSnapshot: (): Language => "en",
    set(next: Language) {
      language = next;
      try {
        localStorage.setItem("lang", next);
      } catch {
        /* Preferences remain usable for this visit. */
      }
      listeners.forEach((listener) => listener());
    },
  };
}
interface Settings {
  language: Language;
  toggleLanguage: (language: Language) => void;
  t: (key: TranslationKey | string) => string;
  copy: typeof interfaceCopy.en;
}
const SettingsContext = createContext<Settings | null>(null);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createLanguageStore);
  const language = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);
  return (
    <SettingsContext.Provider
      value={{
        language,
        toggleLanguage: store.set,
        copy: interfaceCopy[language],
        t: (key) => dictionaries[language][key as TranslationKey] ?? key,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("SettingsProvider is required.");
  return context;
}
