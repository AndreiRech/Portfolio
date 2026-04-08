export interface Project {
  id: string;
  title: string;
  type: string;
  year: number;
  description: string;
  tags: string[];
  imageUrl: string;
  liveUrl?: string;
  repoUrl?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}
