"use client";
import { useSettings } from "@/context/SettingsContext";
const skills = [
  {
    category: "iOS",
    items: ["Swift", "SwiftUI", "CloudKit", "Testing", "Xcode Cloud", "MVVM"],
  },
  {
    category: "Backend & Web",
    items: [
      "Node.js",
      "NestJS",
      "FastAPI",
      "React",
      "Next.js",
      "Tailwind",
      "TypeScript",
      "Spring Boot",
    ],
  },
  {
    category: "Data & Languages",
    items: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Cassandra",
      "Python",
      "Java",
      "Swift",
      "TypeScript",
    ],
  },
  {
    category: "Tools & DevOps",
    items: ["Docker", "GitHub Actions", "Figma", "Azure", "Prisma"],
  },
];
export default function AboutSection() {
  const { copy: c, t } = useSettings();
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
            <span>2023 / 2026</span>
          </div>
        </div>
        <div className="skills-list">
          {skills.map((group) => (
            <div key={group.category}>
              <h3>{group.category}</h3>
              <div className="tags">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
