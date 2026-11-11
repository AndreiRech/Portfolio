"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { getReward } from "@/data/collectibles";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
import RewardArt from "./RewardArt";
export default function CompanionDock() {
  const { data, remove } = useCollection();
  const { copy: c, language } = useSettings();
  const [reacting, setReacting] = useState(false);
  const item = getReward(data.equipped.companion ?? "");
  if (!item) return null;
  return (
    <aside className="companion-dock" aria-label={item.name[language]}>
      <button
        className={`companion-play ${reacting ? "reacting" : ""}`}
        onClick={() => setReacting(true)}
        onAnimationEnd={() => setReacting(false)}
        aria-label={`${c.interactCompanion}: ${item.name[language]}`}
      >
        <RewardArt reward={item} />
      </button>
      <button
        className="companion-dismiss"
        aria-label={c.hideCompanion}
        onClick={() => remove("companion")}
      >
        <X size={13} />
      </button>
    </aside>
  );
}
