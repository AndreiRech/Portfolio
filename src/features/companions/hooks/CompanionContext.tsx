"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { canUseCompanion } from "@/features/collectibles/model/collection";
const CompanionContext = createContext<{
  preview: string | null;
  visit: (id: string | null) => void;
} | null>(null);
export function CompanionProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  const unlock = useUnlock();
  const { data } = useCollection();
  function visit(id: string | null) {
    // ASVS 2.2.1: validate catalogue kind and ownership before activating.
    if (id !== null && !canUseCompanion(data, id)) return;
    setPreview(id);
    if (id !== null) unlock("companion");
  }
  return (
    <CompanionContext.Provider
      value={{
        preview: preview && canUseCompanion(data, preview) ? preview : null,
        visit,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}
export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) throw new Error("CompanionProvider is required.");
  return context;
}
