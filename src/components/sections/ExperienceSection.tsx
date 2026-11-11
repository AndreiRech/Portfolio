"use client";
import { getExperiences } from "@/data/experiences";
import { useSettings } from "@/context/SettingsContext";
export default function ExperienceSection() {
  const { language, copy: c } = useSettings();
  return (
    <section id="experience" className="section container">
      <div className="section-heading">
        <h2>{c.experienceTitle}</h2>
      </div>
      <div className="experience-list">
        {getExperiences(language).map((experience) => (
          <article className="experience-row" key={experience.id}>
            <div className="experience-meta">
              <p>{experience.period}</p>
              <h3>{experience.company}</h3>
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
          </article>
        ))}
      </div>
    </section>
  );
}
