"use client";
import { sfx } from "@/shared/lib/sfx";
import type { CSSProperties } from "react";
import { Check, LockKeyhole } from "lucide-react";
import {
  getRarity,
  rarityName,
  type Reward,
} from "@/features/collectibles/data/collectibles";
import { useCompanion } from "@/features/companions/hooks/CompanionContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { useSettings } from "@/shared/i18n/SettingsContext";
import RewardArt from "./RewardArt";
export default function ItemCard({
  item,
  collectible = false,
}: {
  item: Reward;
  collectible?: boolean;
}) {
  const { data, equip, remove } = useCollection();
  const { copy: c, language } = useSettings();
  const { visit } = useCompanion();
  const count = data.counts[item.id] ?? 0;
  const equipped = data.equipped[item.kind] === item.id;
  const rarity = getRarity(item.rarity);
  return (
    <article
      className={`item-card ${equipped ? "is-equipped" : ""} ${collectible && !count ? "locked-item" : ""}`}
      style={{ "--rarity": rarity.color } as CSSProperties}
    >
      <div className="item-art">
        <RewardArt reward={item} />
      </div>
      <h3>{item.name[language]}</h3>
      <p className="rarity-label">{rarityName(item.rarity, c.specialRarity)}</p>
      <div className="item-meta">
        <span className="item-kind">{c[item.kind]}</span>
        {collectible ? (
          <span className="item-quantity">
            {count ? (
              `×${count}`
            ) : (
              <LockKeyhole size={13} aria-label={c.locked} />
            )}
          </span>
        ) : null}
      </div>
      {collectible && count ? (
        <button
          className="button"
          aria-pressed={equipped}
          onClick={() => {
            if (item.kind === "companion") visit(null);
            if (equipped) remove(item.kind);
            else {
              sfx.sparkle();
              equip(item.id);
            }
          }}
        >
          {equipped ? (
            <>
              <Check size={13} />
              {c.equipped} / {c.remove}
            </>
          ) : (
            c.equip
          )}
        </button>
      ) : null}
    </article>
  );
}
