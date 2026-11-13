"use client";
import type { ReactNode } from "react";
import { useSettings } from "@/shared/i18n/SettingsContext";
export default function GameHelp({ children }: { children: ReactNode }) {
  const { language } = useSettings();
  return (
    <details className="game-help">
      <summary>
        {language === "pt" ? "Como jogar" : "How to play"}{" "}
        <span aria-hidden="true">?</span>
      </summary>
      <div>{children}</div>
    </details>
  );
}
