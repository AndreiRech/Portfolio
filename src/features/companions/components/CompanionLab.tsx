"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useCompanion } from "@/features/companions/hooks/CompanionContext";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { canUseCompanion } from "@/features/collectibles/model/collection";
import { REWARDS } from "@/features/collectibles/data/collectibles";
import { playCopy } from "@/shared/i18n/play";
import RewardArt from "@/features/collectibles/components/RewardArt";

export default function CompanionLab() {
  const { language, copy } = useSettings();
  const c = playCopy[language];
  const { visit } = useCompanion();
  const { data, ready } = useCollection();
  const companions = REWARDS.filter((item) => canUseCompanion(data, item.id));
  const [selected, setSelected] = useState<string | null>(null);
  const pet = companions.find((item) => item.id === selected) ?? companions[0];

  if (!ready)
    return (
      <div className="game-loading" role="status">
        {c.loadingCompanions}
      </div>
    );
  if (!pet)
    return (
      <article
        className="pet-lab companion-empty"
        aria-labelledby="companions-title"
      >
        <Image src="/collectibles/case.svg" width={220} height={165} alt="" />
        <h2 id="companions-title">{c.noCompanions}</h2>
        <p>{c.unlockCompanions}</p>
        <Link href="/cases" className="button primary">
          {copy.boxAction}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </article>
    );

  return (
    <article className="pet-lab" aria-labelledby="companions-title">
      <h2 id="companions-title">{c.companions}</h2>
      <p className="pet-lab-intro">{c.companionHint}</p>
      <div className="pet-preview-stage">
        <div className="pixel-stars" aria-hidden="true">
          ✦<span>+</span>
          <span>✦</span>
        </div>
        <span key={pet.id} className="pet-idle" data-pet={pet.id}>
          <RewardArt reward={pet} />
        </span>
        <div className="pixel-ground" aria-hidden="true" />
        <span className="pixel-label preview-caption">
          {pet.name[language]}
        </span>
      </div>
      <div className="companion-picker" role="group" aria-label={c.step}>
        {companions.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            aria-pressed={pet.id === item.id}
            aria-label={item.name[language]}
          >
            <RewardArt reward={item} />
          </button>
        ))}
      </div>
      <button className="button primary" onClick={() => visit(pet.id)}>
        {c.tryPet}
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <Link href="/inventory" className="text-link">
        {c.manage}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
