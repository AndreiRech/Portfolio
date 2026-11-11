"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
export default function Navbar() {
  const { language, toggleLanguage, copy: c } = useSettings();
  const [open, setOpen] = useState(false);
  const path = usePathname().replace(/\/$/, "") || "/";
  const links = [
    { href: "/#projects", label: c.projects },
    { href: "/#about", label: c.about },
    { href: "/#playground", label: c.explore },
    { href: "/cases", label: c.boxes },
    { href: "/inventory", label: c.inventory },
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        {c.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
            andrei<span>.rech</span>
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
                aria-current={path === link.href ? "page" : undefined}
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
            <Link className="header-contact" href="/#contact">
              {c.contact}
              <ArrowUpRight size={15} />
            </Link>
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
