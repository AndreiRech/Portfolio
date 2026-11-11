"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useCompanion } from "@/context/CompanionContext";
import { REWARDS } from "@/data/collectibles";
import { playCopy } from "@/locales/play";
import RewardArt from "@/components/collectibles/RewardArt";
import SignGlyph, { SIGNS } from "./SignGlyph";
const companions = REWARDS.filter((item) => item.kind === "companion");
export default function Playground() {
  const { language } = useSettings();
  const c = playCopy[language];
  const { visit } = useCompanion();
  const [selected, select] = useState<(typeof SIGNS)[number]>(SIGNS[1]);
  const [casts, setCasts] = useState(0);
  const [pet, setPet] = useState(companions[0]);
  return (
    <section id="playground" className="section container playground">
      <div className="section-heading">
        <div>
          <p className="pixel-eyebrow">SIDE QUEST / 02</p>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
        </div>
        <span className="pixel-cross" aria-hidden="true" />
      </div>
      <div className="playground-grid">
        <article
          className="sign-lab"
          style={{ "--sign-color": selected.color } as CSSProperties}
        >
          <div className="play-panel-heading">
            <span className="pixel-label">01 / THE WITCHER</span>
            <span className="pixel-label">
              {String(casts).padStart(2, "0")} / {c.casts}
            </span>
          </div>
          <h3>{c.signs}</h3>
          <div className={`sign-stage sign-${selected.id}`}>
            <div className="rune-orbit" aria-hidden="true">
              {SIGNS.map((sign) => (
                <span key={sign.id}>
                  <SignGlyph id={sign.id} />
                </span>
              ))}
            </div>
            <Image
              className="lab-medallion"
              src="/collectibles/companions/medallion.svg"
              width={144}
              height={144}
              alt=""
            />
            {casts > 0 && (
              <div key={casts} className="spell-effect" aria-hidden="true">
                <div className="spell-ring" />
                {Array.from({ length: 16 }, (_, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--i": i,
                        "--dx": `${Math.cos((i * Math.PI) / 8) * (70 + (i % 3) * 20)}px`,
                        "--dy": `${Math.sin((i * Math.PI) / 8) * (60 + (i % 3) * 18)}px`,
                      } as CSSProperties
                    }
                  />
                ))}
                <span className="spell-glyph">
                  <SignGlyph id={selected.id} />
                </span>
              </div>
            )}
            <span className="stage-coordinates" aria-hidden="true">
              WOLF SCHOOL / LV. {String(casts + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="sign-picker" role="group" aria-label={c.signs}>
            {SIGNS.map((sign) => (
              <button
                key={sign.id}
                aria-pressed={selected.id === sign.id}
                onClick={() => {
                  select(sign);
                  setCasts(0);
                }}
                style={{ "--glyph-color": sign.color } as CSSProperties}
              >
                <SignGlyph id={sign.id} />
                <span>{sign.name}</span>
              </button>
            ))}
          </div>
          <div className="sign-description">
            <strong>{selected.name}</strong>
            <p>{c[selected.id]}</p>
          </div>
          <button
            className="button primary cast-button"
            onClick={() => setCasts((count) => count + 1)}
          >
            {c.cast}
            <SignGlyph id={selected.id} />
          </button>
          <p className="play-status" role="status">
            {casts > 0
              ? `${c.castDone}: ${selected.name}. ${casts}.`
              : c.signHint}
          </p>
        </article>
        <article className="pet-lab">
          <div className="play-panel-heading">
            <span className="pixel-label">02 / COMPANIONS</span>
            <span className="pixel-dot" aria-hidden="true" />
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
