"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { REWARDS } from "@/data/collectibles";
import { useSettings } from "@/context/SettingsContext";
import { useCollection } from "@/context/CollectionContext";
import RewardArt from "@/components/collectibles/RewardArt";
export default function ExploreSection() {
  const { copy: c } = useSettings();
  const { data } = useCollection();
  return (
    <section id="explore" className="section container">
      <div className="section-heading">
        <div>
          <h2>{c.exploreTitle}</h2>
          <p>{c.exploreBody}</p>
        </div>
      </div>
      <div className="explore-grid">
        <article className="explore-card">
          <div className="explore-art">
            <Image
              src="/collectibles/case.svg"
              alt=""
              className="crate-image"
              width={240}
              height={180}
            />
          </div>
          <h3>{c.boxIntro}</h3>
          <p>{c.boxBody}</p>
          <Link href="/cases" className="text-link">
            {c.boxAction}
            <ArrowUpRight size={18} />
          </Link>
        </article>
        <article className="explore-card">
          <div className="explore-art inventory-preview">
            {[REWARDS[0], REWARDS[2], REWARDS[4]].map((item) => (
              <div className="mini-slot" key={item.id}>
                <RewardArt reward={item} />
              </div>
            ))}
          </div>
          <h3>{c.inventoryIntro}</h3>
          <p>{c.inventoryBody}</p>
          <Link href="/inventory" className="text-link">
            {c.inventoryAction}
            <ArrowUpRight size={18} />
          </Link>
          <span className="explore-collection-count">
            {Object.keys(data.counts).length} / 12 {c.collectionProgress}
          </span>
        </article>
      </div>
    </section>
  );
}
