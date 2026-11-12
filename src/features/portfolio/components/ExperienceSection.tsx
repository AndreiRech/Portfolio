"use client";
import { getExperiences } from "@/features/portfolio/data/experiences";
import { useSettings } from "@/shared/i18n/SettingsContext";
import ContributionsSection from "./ContributionsSection";
export default function ExperienceSection() {
  const { language, copy: c } = useSettings();
  return (
    <section id="experience" className="section container">
      <div className="section-heading">
        <h2>{c.experienceTitle}</h2>
      </div>
      <ol className="experience-list">
        {getExperiences(language).map((experience) => (
          <li
            className="experience-row"
            key={experience.id}
            data-current={experience.current ? "true" : undefined}
          >
            <div className="experience-meta">
              <p>{experience.period}</p>
              <h3>{experience.company}</h3>
              {experience.current ? (
                <span className="experience-current">{c.current}</span>
              ) : null}
            </div>
            <div>
              <h3 className="experience-role">{experience.role}</h3>
              <div className="experience-description">
                {experience.description}
              </div>
              <div className="tags">
                {experience.technologies.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <ContributionsSection />
    </section>
  );
}
