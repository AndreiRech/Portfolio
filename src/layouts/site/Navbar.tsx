"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import PixelLetters from "@/shared/ui/PixelLetters";
export default function Navbar() {
  const { language, toggleLanguage, copy: c } = useSettings();
  const [open, setOpen] = useState(false);
  const path = usePathname().replace(/\/$/, "") || "/";
  const links = [
    { href: "/#about", label: c.about },
    { href: "/#experience", label: c.experience },
    { href: "/#projects", label: c.projects },
    { href: "/games", label: c.games },
    { href: "/#contact", label: c.contact },
  ];
  const [section, setSection] = useState<string | null>(null);
  useEffect(() => {
    if (path !== "/") return;
    const targets = ["about", "experience", "projects", "games", "contact"]
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null);
    // A section is current while it crosses a band just below the header.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id);
          else
            setSection((value) => (value === entry.target.id ? null : value));
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const current = (href: string) =>
    path === href ||
    (href === "/games" && ["/cases", "/inventory"].includes(path))
      ? "page"
      : path === "/" &&
          section &&
          (href === `/#${section}` ||
            (href === "/games" && section === "games"))
        ? "location"
        : undefined;
  return (
    <>
      <span id="top" />
      <a className="skip-link" href="#main">
        {c.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link
            href="/"
            className="wordmark name-interaction"
            aria-label="Andrei Rech"
            onClick={() => setOpen(false)}
          >
            <PixelLetters text="andrei" />
            <span className="wordmark-surname">
              <PixelLetters text=".rech" offset={6} />
            </span>
          </Link>
          <nav
            id="main-navigation"
            aria-label={c.menu}
            className={open ? "main-nav is-open" : "main-nav"}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current(link.href)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div
              className="language-switch"
              role="group"
              aria-label={language === "pt" ? "Idioma" : "Language"}
            >
              <button
                aria-pressed={language === "en"}
                onClick={() => toggleLanguage("en")}
              >
                EN
              </button>
              <span aria-hidden="true">/</span>
              <button
                aria-pressed={language === "pt"}
                onClick={() => toggleLanguage("pt")}
              >
                PT
              </button>
            </div>
            <button
              className="menu-toggle icon-button"
              aria-label={open ? c.close : c.menu}
              aria-expanded={open}
              aria-controls="main-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
