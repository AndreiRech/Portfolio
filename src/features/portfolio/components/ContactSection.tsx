"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/shared/ui/icons";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";

const EMAIL = "andreirech22@outlook.com";
const links = [
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
export default function ContactSection() {
  const { copy: c } = useSettings();
  const unlock = useUnlock();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copyEmail() {
    let next: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(EMAIL);
      unlock("contact");
    } catch {
      next = "failed";
    }
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2600);
  }
  return (
    <section id="contact" className="section contact-section container">
      <div className="section-heading">
        <div>
          <h2>
            {c.contactTitle.replace(/\.$/, "")}
            <span className="heading-dot">.</span>
          </h2>
          <p>{c.contactBody}</p>
        </div>
      </div>
      <div className="contact-layout">
        <div className="contact-email pixel-frame">
          <a href={`mailto:${EMAIL}`}>
            <Mail size={28} aria-hidden="true" />
            <span>{EMAIL}</span>
          </a>
          <div className="contact-email-actions">
            <button className="button" onClick={copyEmail} data-status={status}>
              {status === "copied" ? <Check size={16} /> : <Copy size={16} />}
              {c.copyEmail}
            </button>
            <a href={`mailto:${EMAIL}`} className="text-link">
              {c.sendEmail}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <p className="contact-status" role="status" aria-live="polite">
            {status === "copied"
              ? c.copied
              : status === "failed"
                ? c.copyFailed
                : ""}
          </p>
        </div>
        <div className="contact-links">
          {links.map(({ href, label, value, Icon }) => (
            <a
              href={href}
              key={label}
              target="_blank"
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
      </div>
    </section>
  );
}
