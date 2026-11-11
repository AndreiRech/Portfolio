"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Trophy,
  Footprints,
  Gamepad2,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useCompanion } from "@/context/CompanionContext";
import HeroDice from "@/components/interactions/HeroDice";

export default function HeroSection() {
  const { copy: c } = useSettings();
  const { visit } = useCompanion();
  return (
    <section id="hero" className="hero container">
      <div className="hero-copy">
        <p className="hero-role">{c.intro}</p>
        <h1>
          Andrei
          <br />
          <span>
            Rech<span className="hero-period">.</span>
          </span>
        </h1>
        <p className="hero-description">{c.heroBody}</p>
        <div className="hero-links">
          <a href="#projects" className="button primary">
            {c.work}
            <ArrowDownRight size={20} />
          </a>
          <a href="#contact" className="text-link">
            {c.hello}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <HeroDice />
      <div className="hero-bottom">
        <Link href="/projects/hearme" className="hero-award">
          <span className="hero-trophy">
            <Trophy size={24} />
          </span>
          <span>{c.award}</span>
          <ArrowUpRight size={16} />
        </Link>
        <div className="hero-sidequests">
          <button onClick={() => visit("chicken")}>
            <Image
              src="/collectibles/companions/chicken.webp"
              alt=""
              width={38}
              height={38}
            />
            <span>{c.releaseChicken}</span>
            <Footprints size={17} />
          </button>
          <a href="#playground">
            <Gamepad2 size={21} />
            <span>{c.playMemory}</span>
            <ArrowDownRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
