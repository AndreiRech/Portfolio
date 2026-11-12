"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/shared/ui/icons";
import { useSettings } from "@/shared/i18n/SettingsContext";
import PixelLetters, { animatePixelLetter } from "@/shared/ui/PixelLetters";
import FooterDust from "@/layouts/site/FooterDust";

export default function Footer() {
  const { copy: c } = useSettings();
  const signature = useRef<HTMLButtonElement>(null);
  return (
    <footer className="site-footer">
      <div className="footer-ground" aria-hidden="true" />
      <div className="footer-inner container">
        <div className="footer-top">
          <p>{c.intro}</p>
          <nav className="footer-nav" aria-label={c.footerNav}>
            <Link href="/#about">{c.about}</Link>
            <Link href="/#experience">{c.experience}</Link>
            <Link href="/#projects">{c.projects}</Link>
            <Link href="/games">{c.games}</Link>
            <Link href="/#contact">{c.contact}</Link>
          </nav>
        </div>
        <div className="footer-signature-stage">
          <button
            ref={signature}
            className="footer-signature name-interaction"
            aria-label={`andrei.rech. ${c.animateName}`}
            onClick={(event) => {
              if (event.detail === 0)
                animatePixelLetter(
                  event.currentTarget.querySelector(".pixel-letter"),
                );
            }}
          >
            <PixelLetters text="andrei.rech" />
          </button>
          <FooterDust target={signature} />
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Andrei Rech</span>
          <div className="footer-socials">
            <a
              href="https://github.com/AndreiRech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/rechandrei/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
          </div>
          <a href="#top" className="back-to-top">
            {c.backToTop}
            <ArrowUp size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
