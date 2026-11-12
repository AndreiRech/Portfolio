"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Maximize2,
} from "lucide-react";
import { getProjects } from "@/features/portfolio/data/projects";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";
import ImageLightbox, {
  type ImagePreview,
} from "@/features/portfolio/components/ImageLightbox";
export default function ProjectsSection() {
  const { language, copy: c } = useSettings();
  const projects = getProjects(language);
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const [imageIndex, setImageIndex] = useState(0);
  const [expanded, setExpanded] = useState<ImagePreview | null>(null);
  const selected =
    projects.find((project) => project.id === selectedId) ?? projects[0];
  const media =
    imageIndex === 0
      ? (selected.cardImageUrl ?? selected.media[0])
      : selected.media[imageIndex - 1];
  const count = selected.media.length + 1;
  const unlock = useUnlock();
  const viewed = useRef(new Set([projects[0].id]));
  const choices = useRef<(HTMLButtonElement | null)[]>([]);
  function moveImage(direction: number) {
    setImageIndex((value) => (value + direction + count) % count);
  }
  function select(id: string) {
    setSelectedId(id);
    setImageIndex(0);
    viewed.current.add(id);
    if (viewed.current.size === projects.length) unlock("inspector");
  }
  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : 0;
    if (!step || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const current = projects.findIndex((project) => project.id === selected.id);
    const next = (current + step + projects.length) % projects.length;
    select(projects[next].id);
    choices.current[next]?.focus();
  }
  return (
    <section id="projects" className="section container">
      <div className="section-heading">
        <div>
          <h2>
            {c.projects}
            <span className="heading-dot">.</span>
          </h2>
          <p>{c.projectIntro}</p>
        </div>
        <span className="section-count">
          {String(projects.length).padStart(2, "0")} {c.projects.toLowerCase()}
        </span>
      </div>
      <div className="project-inspector">
        <div
          className="project-list"
          role="group"
          aria-label={c.selectProject}
          onKeyDown={moveSelection}
        >
          {projects.map((project, index) => (
            <button
              key={project.id}
              ref={(element) => {
                choices.current[index] = element;
              }}
              aria-pressed={selected.id === project.id}
              className={`project-choice ${selected.id === project.id ? "selected" : ""}`}
              onClick={() => select(project.id)}
            >
              {project.logoUrl ? (
                <Image src={project.logoUrl} alt="" width={48} height={48} />
              ) : null}
              <span>
                <strong>{project.name}</strong>
                <small>
                  {project.category} / {project.date}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        <div className="project-stage" key={selected.id}>
          <div className="project-preview pixel-corners">
            <button
              className="preview-image-button"
              onClick={(event) =>
                setExpanded({ src: media, opener: event.currentTarget })
              }
              aria-label={`${c.enlarge}: ${selected.name}`}
            >
              <Image
                src={media}
                alt={`${selected.name} ${c.image.toLowerCase()} ${imageIndex + 1}`}
                fill
                sizes="(max-width: 700px) 90vw, 65vw"
                loading="eager"
                className={
                  imageIndex === 0 ? "project-cover" : "project-screen"
                }
              />
            </button>
            {selected.awards?.length ? (
              <span className="project-award">
                <Trophy size={13} />
                {selected.awards[0].short}
              </span>
            ) : null}
            <button
              className="icon-button expand-button"
              onClick={(event) =>
                setExpanded({ src: media, opener: event.currentTarget })
              }
              aria-label={c.enlarge}
            >
              <Maximize2 size={18} />
            </button>
            <div className="preview-controls">
              <button
                className="icon-button"
                aria-label={c.previousImage}
                onClick={() => moveImage(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {String(imageIndex + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <button
                className="icon-button"
                aria-label={c.nextImage}
                onClick={() => moveImage(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="project-summary">
            <div>
              <p className="project-category">{selected.category}</p>
              <h3>{selected.name}</h3>
              <p>{selected.shortDescription}</p>
            </div>
            <Link className="button primary" href={`/projects/${selected.id}`}>
              {c.inspect}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="project-technologies">
            {selected.technologies.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
            <span className="project-role">{selected.roles.join(" / ")}</span>
          </div>
        </div>
      </div>
      {expanded ? (
        <ImageLightbox
          preview={expanded}
          alt={selected.name}
          close={() => setExpanded(null)}
        />
      ) : null}
    </section>
  );
}
