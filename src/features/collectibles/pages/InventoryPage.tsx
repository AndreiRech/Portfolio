"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RotateCcw, ArrowUpRight, LockKeyhole, Trophy } from "lucide-react";
import {
  REWARDS,
  REWARD_KINDS,
  getReward,
  type RewardKind,
} from "@/features/collectibles/data/collectibles";
import { useCompanion } from "@/features/companions/hooks/CompanionContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useAchievements } from "@/features/achievements/hooks/AchievementContext";
import { ACHIEVEMENTS } from "@/features/achievements/model/achievements";
import ArcadeHeading from "../../games/components/ArcadeHeading";
import ItemCard from "../components/ItemCard";
import RewardArt from "../components/RewardArt";

const kinds = REWARD_KINDS;
export default function InventoryView() {
  const { data, ready, remove, resetAppearance } = useCollection();
  const { copy: c, language } = useSettings();
  const { visit } = useCompanion();
  const { unlocked } = useAchievements();
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
          {Object.keys(data.counts).length} / {REWARDS.length}{" "}
          {c.collectionProgress}
        </p>
        <button
          className="button"
          onClick={() => {
            visit(null);
            resetAppearance();
          }}
        >
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
                <strong>{item ? item.name[language] : c.defaultItem}</strong>
                {item ? (
                  <button
                    onClick={() => {
                      if (kind === "companion") visit(null);
                      remove(kind);
                    }}
                  >
                    {c.remove}
                  </button>
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
              ? c.loadingCollection
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
      <section className="achievements" aria-labelledby="achievements-title">
        <div className="subheading">
          <div>
            <h2 id="achievements-title">{c.achievementsTitle}</h2>
            <p>{c.achievementsBody}</p>
          </div>
          <span className="section-count">
            {unlocked.length} / {ACHIEVEMENTS.length} {c.achievementsProgress}
          </span>
        </div>
        <ul className="achievement-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const done = unlocked.includes(achievement.id);
            return (
              <li key={achievement.id} data-unlocked={done}>
                <span className="achievement-icon" aria-hidden="true">
                  {done ? <Trophy size={20} /> : <LockKeyhole size={18} />}
                </span>
                <div>
                  <strong>{achievement.title[language]}</strong>
                  <p>{achievement.hint[language]}</p>
                  {done ? null : (
                    <span className="sr-only">{c.achievementLocked}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="storage-note">{c.savedLocally}</p>
    </main>
  );
}
