"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Trophy } from "lucide-react";
import { getProjects } from "@/data/projects";
import { useSettings } from "@/context/SettingsContext";
import ImageLightbox from "@/components/ImageLightbox";
export default function ProjectDetails({ projectId }: { projectId: string }) {
  const { language, copy: c, t } = useSettings();
  const project = getProjects(language).find((item) => item.id === projectId);
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!project) notFound();
  const links = [
    { href: project.links.appStore, label: "App Store" },
    { href: project.links.github, label: "GitHub" },
    { href: project.links.live, label: "Website" },
    { href: project.links.other?.[1], label: project.links.other?.[0] },
  ].filter((link) => link.href);
  return (
    <main id="main" className="inner-page container">
      <Link href="/#projects" className="back-link">
        <ArrowLeft size={15} />
        {t("proj_back")}
      </Link>
      <header className="detail-heading">
        {project.logoUrl ? (
          <Image src={project.logoUrl} alt="" width={80} height={80} />
        ) : null}
        <div>
          <p className="project-category">
            {project.category} / {project.date}
          </p>
          <h1>{project.name}</h1>
          <p>{project.shortDescription}</p>
        </div>
      </header>
      {project.awards?.map((award) => (
        <p key={award.short} className="detail-award">
          <Trophy size={16} />
          {award.long}
        </p>
      ))}
      <section aria-label={t("proj_gallery")}>
        <div className="detail-gallery">
          {project.media.map((media, index) => (
            <button
              key={media}
              aria-label={`${c.enlarge}: ${project.name} ${index + 1}`}
              onClick={() => setExpanded(media)}
            >
              <Image
                src={media}
                width={960}
                height={600}
                alt={`${project.name} ${c.image.toLowerCase()} ${index + 1}`}
              />
            </button>
          ))}
        </div>
      </section>
      <div className="detail-body">
        <div>
          <section>
            <h2>{t("proj_about")}</h2>
            <div className="detail-prose">{project.description}</div>
          </section>
          <section>
            <h2>{t("proj_role")}</h2>
            <div className="detail-prose">{project.detailedRole}</div>
          </section>
        </div>
        <aside>
          <section>
            <h2>{t("proj_links")}</h2>
            <div className="detail-links">
              {links.map((link) => (
                <a
                  className="button"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          </section>
          <section>
            <h2>{t("proj_techs")}</h2>
            <div className="tags">
              {project.technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </section>
          <section>
            <h2>{t("proj_roles")}</h2>
            <div className="tags">
              {project.roles.map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
          </section>
        </aside>
      </div>
      {project.team.length ? (
        <section>
          <h2 className="detail-team-title">{c.team}</h2>
          <div className="detail-team">
            {project.team.map((member) => (
              <article key={member.name}>
                <strong>{member.name}</strong>
                <p>{member.role}</p>
                {member.linkedinUrl ? (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    aria-label={`${member.name} / LinkedIn`}
                  >
                    LinkedIn
                    <ArrowUpRight size={13} />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {expanded ? (
        <ImageLightbox
          src={expanded}
          alt={project.name}
          close={() => setExpanded(null)}
        />
      ) : null}
    </main>
  );
}
