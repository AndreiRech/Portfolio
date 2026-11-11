"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useCompanion } from "@/context/CompanionContext";
import { REWARDS } from "@/data/collectibles";
import { playCopy } from "@/locales/play";
import RewardArt from "@/components/collectibles/RewardArt";
import MemoryGame from "./MemoryGame";
const companions = REWARDS.filter((item) => item.kind === "companion");
export default function Playground() {
  const { language } = useSettings();
  const c = playCopy[language];
  const { visit } = useCompanion();
  const [pet, setPet] = useState(companions[0]);
  return (
    <section id="playground" className="section container playground">
      <div className="section-heading">
        <div>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
        </div>
        <span className="pixel-cross" aria-hidden="true" />
      </div>
      <div className="playground-grid">
        <MemoryGame />
        <article className="pet-lab">
          <div className="play-panel-heading">
            <span className="pixel-label">COMPANIONS</span>
          </div>
          <h3>{c.companions}</h3>
          <p className="pet-lab-intro">{c.companionHint}</p>
          <div className="pet-preview-stage">
            <div className="pixel-stars" aria-hidden="true">
              ✦<span>+</span>
              <span>✦</span>
            </div>
            <RewardArt reward={pet} />
            <div className="pixel-ground" aria-hidden="true" />
            <span className="pixel-label preview-caption">
              {pet.name[language]}
            </span>
          </div>
          <div className="companion-picker" role="group" aria-label={c.step}>
            {companions.map((item) => (
              <button
                key={item.id}
                onClick={() => setPet(item)}
                aria-pressed={pet.id === item.id}
                aria-label={item.name[language]}
              >
                <RewardArt reward={item} />
              </button>
            ))}
          </div>
          <button className="button primary" onClick={() => visit(pet.id)}>
            {c.tryPet}
            <ArrowUpRight size={18} />
          </button>
          <Link href="/inventory" className="text-link">
            {c.manage}
            <ArrowUpRight size={16} />
          </Link>
        </article>
      </div>
    </section>
  );
}
