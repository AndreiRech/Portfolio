"use client";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, MapPin, Trophy } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
export default function HeroSection() {
  const { copy: c } = useSettings();
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
        <p className="award-note">
          <Trophy size={17} />
          {c.award}
        </p>
      </div>
      <figure className="hero-portrait">
        <div className="portrait-frame">
          <Image
            src="/others/me.jpg"
            alt="Andrei Rech"
            width={600}
            height={750}
            priority
            className="portrait-photo"
          />
          <span className="portrait-pixel pixel-one" />
          <span className="portrait-pixel pixel-two" />
        </div>
        <figcaption>
          <MapPin size={15} />
          {c.location}
          <a
            href="https://github.com/AndreiRech"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Andrei Rech / GitHub"
          >
            <ArrowUpRight size={17} />
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
