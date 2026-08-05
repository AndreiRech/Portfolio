// src/types/index.ts

import type { ReactNode } from "react";

/** Source of truth for the category union — a runtime value so callers can
    iterate the categories (filter lists, exhaustiveness checks). */
export const PROJECT_CATEGORIES = ['iOS', 'University', 'Personal', 'Others'] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type FilterType = 'All Projects' | ProjectCategory;

export interface ProjectLinks {
  github?: string;
  appStore?: string;
  live?: string;
  other?: [string, string];
}

export interface Contributor {
  name: string;
  role: string;
  linkedinUrl?: string;
}

export interface Award {
  long: string;
  short: string;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  roles: string[];
  detailedRole: string | ReactNode;
  technologies: string[];
  description: string | ReactNode;
  shortDescription: string | ReactNode;
  date: string;
  links: ProjectLinks;
  media: string[];
  logoUrl?: string;
  cardImageUrl?: string;
  orientation?: 'horizontal' | 'vertical';
  team: Contributor[];
  awards?: Award[];
}

export interface IconConfig {
  id: string;
  component: React.FC<{ size?: number; className?: string }>;
  href: string;
  ariaLabel: string;
}

/** A contact card in `ContactSection`: `IconConfig`'s icon-plus-link shape,
    but labelled for display rather than for a bare icon button. */
export interface ContactLink {
  id: string;
  component: React.FC<{ size?: number; className?: string }>;
  href: string;
  label: string;
  value: string;
}

/** A link scrap in the hero collage. Distinct from `IconConfig` on both
    counts: `label` is visible type on the sticker rather than an aria-label
    standing in for a bare icon, and each scrap is pasted down at its own
    angle. */
export interface HeroLink {
  id: string;
  component: React.FC<{ size?: number; className?: string }>;
  href: string;
  label: string;
  tilt: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string | ReactNode;
  technologies: string[];
}