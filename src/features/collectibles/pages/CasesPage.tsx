"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, PackageOpen } from "lucide-react";
import {
  RARITIES,
  REWARDS,
  drawReward,
  getRarity,
  rarityName,
  type Reward,
} from "@/features/collectibles/data/collectibles";
import { useCompanion } from "@/features/companions/hooks/CompanionContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import { sfx } from "@/shared/lib/sfx";
import ArcadeHeading from "../../games/components/ArcadeHeading";
import ItemCard from "../components/ItemCard";
import RewardArt from "../components/RewardArt";

type Opening = {
  id: string;
  reward: Reward;
  duplicate: boolean;
  reel: Reward[];
};
export default function CasesView() {
  const { data, ready, grant, equip } = useCollection();
  const { visit } = useCompanion();
  const { copy: c, language } = useSettings();
  const [opening, setOpening] = useState<Opening | null>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const locked = useRef(false);
  const activeOpening = useRef<string | null>(null);
  const unlock = useUnlock();
  const track = useRef<HTMLDivElement>(null);

  // Each tile that crosses the marker ticks, like the CS2 case reel.
  useEffect(() => {
    if (phase !== "spinning") return;
    const node = track.current;
    const tiles = node?.children;
    if (!node || !tiles || tiles.length < 2) return;
    const first = tiles[0] as HTMLElement;
    const step = (tiles[1] as HTMLElement).offsetLeft - first.offsetLeft;
    const half = first.offsetWidth / 2;
    let passed = 0;
    let frame = 0;
    const watch = () => {
      const offset = -new DOMMatrixReadOnly(getComputedStyle(node).transform)
        .m41;
      const current = Math.floor((offset - half) / step + 0.5);
      if (current > passed) {
        passed = current;
        sfx.tick();
      }
      frame = requestAnimationFrame(watch);
    };
    frame = requestAnimationFrame(watch);
    return () => cancelAnimationFrame(frame);
  }, [phase, opening?.id]);

  // Unlocks wait for the reveal so a toast never spoils the roulette.
  function celebrate(reward: Reward) {
    sfx.reveal(
      Math.max(
        0,
        RARITIES.findIndex((rarity) => rarity.id === reward.rarity),
      ),
    );
    unlock("first-case");
    if (reward.rarity === "special") unlock("golden-drop");
  }
  function start() {
    if (locked.current || !ready) return;
    locked.current = true;
    const reward = drawReward();
    const id = crypto.randomUUID();
    activeOpening.current = id;
    const reel = Array.from({ length: 32 }, (_, index) =>
      index === 26 ? reward : drawReward(),
    );
    grant(id, reward.id);
    sfx.caseOpen();
    setOpening({
      id,
      reward,
      duplicate: Boolean(data.counts[reward.id]),
      reel,
    });
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPhase(reduced ? "result" : "spinning");
    if (reduced) {
      locked.current = false;
      celebrate(reward);
    }
  }
  function finish(id: string) {
    if (activeOpening.current !== id) return;
    locked.current = false;
    setPhase("result");
    if (opening) celebrate(opening.reward);
  }
  const equipped = opening
    ? data.equipped[opening.reward.kind] === opening.reward.id
    : false;
  return (
    <main id="main" className="inner-page container">
      <ArcadeHeading page="cases" />
      <section className="roulette-panel" aria-label={c.boxes}>
        {opening ? (
          <div className="roulette-window">
            <div
              key={opening.id}
              ref={track}
              className={`roulette-track ${phase === "spinning" ? "spinning" : "finished"}`}
              aria-hidden="true"
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) finish(opening.id);
              }}
            >
              {opening.reel.map((reward, index) => (
                <div
                  className="roulette-tile"
                  key={index}
                  style={
                    {
                      "--rarity": getRarity(reward.rarity).color,
                    } as CSSProperties
                  }
                >
                  <RewardArt reward={reward} />
                  <span>{reward.name[language]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="roulette-idle">
            <Image
              className="crate-image"
              src="/collectibles/case.svg"
              width={240}
              height={180}
              alt=""
              priority
            />
          </div>
        )}
        <div className="roulette-actions">
          <button
            className="button primary"
            onClick={start}
            disabled={!ready || phase === "spinning"}
          >
            <PackageOpen size={18} />
            {c.openCase}
          </button>
          <Link href="/inventory" className="button">
            {c.inventory}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div aria-live="polite" aria-atomic="true">
          {opening && phase === "result" ? (
            <div className="reward-result">
              <RewardArt reward={opening.reward} />
              <div>
                <p>
                  {c.result} / {opening.duplicate ? c.duplicate : c.newItem}
                </p>
                <strong>{opening.reward.name[language]}</strong>
                <p
                  className="rarity-label"
                  style={
                    {
                      "--rarity": getRarity(opening.reward.rarity).color,
                    } as CSSProperties
                  }
                >
                  {rarityName(opening.reward.rarity, c.specialRarity)}
                </p>
              </div>
              <button
                className="button"
                onClick={() => {
                  if (opening.reward.kind === "companion") visit(null);
                  sfx.sparkle();
                  equip(opening.reward.id);
                }}
                disabled={equipped}
              >
                {equipped ? (
                  <>
                    <Check size={15} />
                    {c.equipped}
                  </>
                ) : (
                  c.equip
                )}
              </button>
            </div>
          ) : null}
        </div>
      </section>
      <div className="subheading">
        <h2>{c.caseContents}</h2>
        <span className="section-count">
          {REWARDS.length} {c.items}
        </span>
      </div>
      <div className="collection-grid">
        {REWARDS.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      <section aria-label={c.odds}>
        <div className="subheading">
          <h2>{c.odds}</h2>
        </div>
        <div className="odds-list">
          {RARITIES.map((rarity) => (
            <div
              className="odds-item"
              key={rarity.id}
              style={{ "--rarity": rarity.color } as CSSProperties}
            >
              <span>{rarityName(rarity.id, c.specialRarity)}</span>
              <strong>{rarity.chance}%</strong>
            </div>
          ))}
        </div>
      </section>
      <p className="storage-note">{c.savedLocally}</p>
    </main>
  );
}
