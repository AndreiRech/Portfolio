"use client";
import PixelPet from "@/features/companions/components/PixelPet";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Trophy, Footprints } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import ArcadeCabinet from "@/features/portfolio/components/ArcadeCabinet";
import HeroName from "@/features/portfolio/components/HeroName";

export default function HeroSection() {
  const { copy: c } = useSettings();
  return (
    <section id="hero" className="hero container">
      <div className="hero-copy">
        <p className="hero-role">{c.intro}</p>
        <HeroName />
        <p className="hero-description">{c.heroBody}</p>
        <div className="hero-links">
          <a href="#projects" className="text-link">
            {c.work}
            <ArrowDownRight size={18} />
          </a>
          <a href="#contact" className="text-link">
            {c.hello}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <ArcadeCabinet />
      <div className="hero-bottom">
        <Link href="/projects/hearme" className="hero-award">
          <span className="hero-trophy">
            <Trophy size={24} />
          </span>
          <span>{c.award}</span>
          <ArrowUpRight size={16} />
        </Link>
        <div className="hero-sidequests">
          <Link href="/games?activity=companions">
            <PixelPet id="chicken" className="hero-sidequest-pet" />
            <span>{c.viewCompanions}</span>
            <Footprints size={17} />
          </Link>
          <Link href="/cases">
            <span>{c.games}</span>
            <ArrowDownRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
