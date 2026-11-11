"use client";
import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, PackageOpen } from "lucide-react";
import {
  RARITIES,
  REWARDS,
  drawReward,
  getRarity,
  type Reward,
} from "@/data/collectibles";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
import ArcadeHeading from "./ArcadeHeading";
import ItemCard from "./ItemCard";
import RewardArt from "./RewardArt";

type Opening = {
  id: string;
  reward: Reward;
  duplicate: boolean;
  reel: Reward[];
};
export default function CasesView() {
  const { data, ready, grant, equip } = useCollection();
  const { copy: c, language } = useSettings();
  const [opening, setOpening] = useState<Opening | null>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const locked = useRef(false);
  const activeOpening = useRef<string | null>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  function start() {
    if (locked.current || !ready) return;
    locked.current = true;
    const reward = drawReward();
    const id = crypto.randomUUID();
    activeOpening.current = id;
    const reel = Array.from({ length: 32 }, (_, index) =>
      index === 26
        ? reward
        : REWARDS[Math.floor(Math.random() * REWARDS.length)],
    );
    grant(id, reward.id);
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
    if (reduced) locked.current = false;
  }
  function finish(id: string, fromButton = false) {
    if (activeOpening.current !== id) return;
    locked.current = false;
    setPhase("result");
    if (fromButton) requestAnimationFrame(() => openButton.current?.focus());
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
            ref={openButton}
            className="button primary"
            onClick={start}
            disabled={!ready || phase === "spinning"}
          >
            <PackageOpen size={18} />
            {phase === "spinning" ? c.opening : c.openCase}
          </button>
          {phase === "spinning" ? (
            <button
              className="button"
              onClick={() => opening && finish(opening.id, true)}
            >
              {c.skipAnimation}
            </button>
          ) : (
            <Link href="/inventory" className="button">
              {c.inventory}
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
        <p className="free-note">{c.free}</p>
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
                  {getRarity(opening.reward.rarity).name}
                </p>
              </div>
              <button
                className="button"
                onClick={() => equip(opening.reward.id)}
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
        <span className="section-count">12 {c.items}</span>
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
              <span>{rarity.name}</span>
              <strong>{rarity.chance}%</strong>
            </div>
          ))}
        </div>
      </section>
      <p className="storage-note">{c.savedLocally}</p>
    </main>
  );
}
