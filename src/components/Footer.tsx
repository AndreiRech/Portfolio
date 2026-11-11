"use client";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
export default function Footer() {
  const { copy: c } = useSettings();
  return (
    <footer className="site-footer container">
      <span className="wordmark">andrei.rech</span>
      <span>© {new Date().getFullYear()} Andrei Rech</span>
      <Link href="/#contact">{c.contact}</Link>
    </footer>
  );
}
