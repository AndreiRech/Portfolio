"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RotateCcw, ArrowUpRight } from "lucide-react";
import { REWARDS, getReward, type RewardKind } from "@/data/collectibles";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
import ArcadeHeading from "./ArcadeHeading";
import ItemCard from "./ItemCard";
import RewardArt from "./RewardArt";

const kinds = ["palette", "cursor", "companion"] as const;
export default function InventoryView() {
  const { data, ready, remove, resetAppearance } = useCollection();
  const { copy: c, language } = useSettings();
  const [filter, setFilter] = useState<"all" | RewardKind>("all");
  const [showLocked, setShowLocked] = useState(false);
  const items = REWARDS.filter(
    (item) =>
      (filter === "all" || item.kind === filter) &&
      (showLocked || data.counts[item.id]),
  );
  return (
    <main id="main" className="inner-page container">
      <ArcadeHeading page="inventory" />
      <div className="page-heading-row">
        <p className="section-count">
          {Object.keys(data.counts).length} / 12 {c.collectionProgress}
        </p>
        <button className="button" onClick={resetAppearance}>
          <RotateCcw size={14} />
          {c.restore}
        </button>
      </div>
      <div className="equipped-slots">
        {kinds.map((kind) => {
          const item = getReward(data.equipped[kind] ?? "");
          return (
            <div className="equipped-slot" key={kind}>
              <div className="item-art">
                {item ? (
                  <RewardArt reward={item} />
                ) : (
                  <span className="default-slot" aria-hidden="true">
                    +
                  </span>
                )}
              </div>
              <div>
                <small>{c[kind]}</small>
                <strong>
                  {item
                    ? item.name[language]
                    : language === "pt"
                      ? "Padrão"
                      : "Default"}
                </strong>
                {item ? (
                  <button onClick={() => remove(kind)}>{c.remove}</button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <h2 className="sr-only">{c.inventory}</h2>
      <div className="inventory-toolbar">
        <div className="filter-buttons" role="group" aria-label={c.inventory}>
          {(["all", ...kinds] as const).map((kind) => (
            <button
              key={kind}
              onClick={() => setFilter(kind)}
              aria-pressed={filter === kind}
            >
              {c[kind]}
            </button>
          ))}
        </div>
        <label className="show-locked">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(event) => setShowLocked(event.target.checked)}
          />
          {c.showAll}
        </label>
      </div>
      {items.length ? (
        <div className="collection-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} collectible />
          ))}
        </div>
      ) : (
        <div className="empty-collection">
          <Image
            src="/collectibles/case.svg"
            width={160}
            height={120}
            alt=""
            className="mx-auto"
          />
          <h2>
            {!ready
              ? language === "pt"
                ? "Carregando coleção…"
                : "Loading collection…"
              : Object.keys(data.counts).length
                ? c.emptyFilter
                : c.empty}
          </h2>
          <p>
            {Object.keys(data.counts).length ? c.emptyFilterBody : c.emptyBody}
          </p>
          <Link href="/cases" className="button primary">
            {c.boxAction}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
      <p className="storage-note">{c.savedLocally}</p>
    </main>
  );
}
