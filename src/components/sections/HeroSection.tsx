"use client";
import { useState } from "react";
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
import { getProjects } from "@/data/projects";

export default function HeroSection() {
  const { copy: c, language } = useSettings();
  const { visit } = useCompanion();
  const projects = getProjects(language).slice(0, 3);
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
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
      <div className="hero-showcase">
        <div className="hero-showcase-heading">
          <span className="pixel-label">{c.featuredProject}</span>
          <span className="hero-project-category">{project.category}</span>
        </div>
        <Link
          className="hero-project-visual"
          href={`/projects/${project.id}`}
          aria-label={`${c.inspect}: ${project.name}`}
        >
          <Image
            key={project.id}
            src={project.cardImageUrl ?? project.media[0]}
            alt={project.name}
            fill
            sizes="(max-width: 767px) 90vw, 46vw"
            priority={selected === 0}
            className="hero-project-image"
          />
          <span className="hero-inspect">
            <ArrowUpRight size={26} />
          </span>
        </Link>
        <div className="hero-project-caption" aria-live="polite">
          <div>
            <h2>{project.name}</h2>
            <p>{project.shortDescription}</p>
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="text-link"
            aria-label={`${c.inspect}: ${project.name}`}
          >
            <ArrowUpRight size={24} />
          </Link>
        </div>
        <div
          className="hero-project-picker"
          role="group"
          aria-label={c.selectProject}
        >
          {projects.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
            >
              {item.logoUrl && (
                <Image src={item.logoUrl} width={30} height={30} alt="" />
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
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
