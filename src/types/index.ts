// src/types/index.ts

export type ProjectCategory = 'iOS' | 'University' | 'Personal' | 'Others';
export type FilterType = 'All Projects' | ProjectCategory;

export interface ProjectLinks {
  github?: string;
  appStore?: string;
  live?: string;
}

export interface Contributor {
  name: string;
  role: string;
  linkedinUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  roles: string[];
  detailedRole: string;
  technologies: string[];
  description: string;
  shortDescription: string;
  date: string;
  links: ProjectLinks;
  media: string[];
  logoUrl?: string;
  team: Contributor[];
}

export interface IconConfig {
  id: string;
  component: React.FC<{ size?: number; className?: string }>;
  href: string;
  ariaLabel: string;
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
  description: string;
  technologies: string[];
}