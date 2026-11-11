"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { getReward } from "@/data/collectibles";
const CompanionContext = createContext<{
  preview: string | null;
  visit: (id: string | null) => void;
} | null>(null);
export function CompanionProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  function visit(id: string | null) {
    if (id === null || getReward(id)?.kind === "companion") setPreview(id);
  }
  return (
    <CompanionContext.Provider value={{ preview, visit }}>
      {children}
    </CompanionContext.Provider>
  );
}
export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) throw new Error("CompanionProvider is required.");
  return context;
}
