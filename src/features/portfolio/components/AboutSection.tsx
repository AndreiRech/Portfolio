"use client";
import { useSettings } from "@/shared/i18n/SettingsContext";
type Language = "en" | "pt";
const skills = (language: Language) => [
  {
    category: "iOS",
    items: [
      "Swift",
      "SwiftUI",
      "UIKit",
      "Testing",
      "Xcode Cloud",
      "CloudKit",
      "MVVM",
      "ECS",
      "SpriteKit",
    ],
  },
  {
    category: "Backend & Web",
    items: [
      "Next.js",
      "NestJS",
      "FastAPI",
      "React",
      "Tailwind",
      "Spring Boot",
      "Python",
      "Java",
      "JS/TS",
    ],
  },
  {
    category: "Data",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Oracle", "Cassandra"],
  },
  {
    category: "Tools & DevOps",
    items: ["GitHub Actions", "AWS", "Figma", "Azure", "Prisma", "Claude", "Codex"],
  },
  {
    category: language === "pt" ? "Idiomas" : "Languages",
    items: [language === "pt" ? "Inglês (avançado)" : "English (advanced)"],
  },
];
/** Newest first. */
const certificates = [
  {
    issuer: "Google",
    name: {
      en: "Cybersecurity Foundations",
      pt: "Fundações em Cibersegurança",
    },
    date: { en: "Oct 2026", pt: "Out 2026" },
  },
  {
    issuer: "Comunicativa Fonoaudiologia",
    name: {
      en: "Communication and Public Speaking",
      pt: "Comunicação e Oratória",
    },
    date: { en: "Mar 2026", pt: "Mar 2026" },
  },
  {
    issuer: "Alura",
    name: { en: "Machine Learning Track", pt: "Formação em Machine Learning" },
    date: { en: "Jun 2024", pt: "Jun 2024" },
  },
  {
    issuer: "Alura",
    name: {
      en: "Node.js: REST API with Express and MongoDB",
      pt: "Node.js: API REST com Express e MongoDB",
    },
    date: { en: "Mar 2024", pt: "Mar 2024" },
  },
  {
    issuer: "Alura",
    name: {
      en: "Object-Oriented Java Track",
      pt: "Formação Java com Orientação a Objetos",
    },
    date: { en: "Aug 2023", pt: "Ago 2023" },
  },
];
export default function AboutSection() {
  const { copy: c, t, language } = useSettings();
  return (
    <section id="about" className="section container">
      <div className="section-heading">
        <h2>{c.aboutTitle}</h2>
      </div>
      <div className="about-layout">
        <div className="about-prose">
          <p>{t("about_p1")}</p>
          <p>{t("about_p2")}</p>
          <p>{t("about_p3")}</p>
          <div className="education">
            <span>{t("about_edu_title")}</span>
            <h3>{t("about_edu_degree")}</h3>
            <p>{t("about_edu_uni")}</p>
            <p className="education-gpa">{t("about_edu_gpa")}</p>
            <span>{t("about_edu_period")}</span>
          </div>
        </div>
        <div className="skills-panel pixel-frame">
          <div className="skills-panel-heading">
            <h3>{c.skillsTitle}</h3>
          </div>
          {skills(language).map((group, index) => (
            <div className="skill-group" key={group.category} data-tone={index}>
              <h4>{group.category}</h4>
              <ul className="skill-slots">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="certificates">
        <span>{t("about_certs_title")}</span>
        <ul>
          {certificates.map((item) => (
            <li key={item.name.en}>
              <strong>{item.name[language]}</strong>
              <small>
                {item.issuer} · {item.date[language]}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
