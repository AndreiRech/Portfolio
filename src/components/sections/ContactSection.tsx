"use client";
import { ArrowUpRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { useSettings } from "@/context/SettingsContext";
export default function ContactSection() {
  const { copy: c, t } = useSettings();
  const links = [
    {
      href: "mailto:andreirech22@outlook.com",
      label: "Email",
      value: "andreirech22@outlook.com",
      Icon: Mail,
    },
    {
      href: "https://www.linkedin.com/in/rechandrei/",
      label: "LinkedIn",
      value: "/in/rechandrei",
      Icon: LinkedinIcon,
    },
    {
      href: "https://github.com/AndreiRech",
      label: "GitHub",
      value: "/AndreiRech",
      Icon: GithubIcon,
    },
  ];
  return (
    <section id="contact" className="section contact-section container">
      <h2>{c.contactTitle}</h2>
      <p>{t("contact_desc")}</p>
      <div className="contact-links">
        {links.map(({ href, label, value, Icon }) => (
          <a
            href={href}
            key={label}
            target={href.startsWith("https") ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            <Icon size={21} />
            <div>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
            <ArrowUpRight size={20} />
          </a>
        ))}
      </div>
    </section>
  );
}
