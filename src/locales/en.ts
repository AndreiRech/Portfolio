// src/locales/en.ts
export const en = {
  // Config & Navbar
  lang_label: 'LANGUAGE',
  nav_home: 'Home',
  nav_about: 'About',
  nav_projects: 'Projects',
  nav_experience: 'Experience',
  nav_contact: 'Contact',

  // Hero & About
  hero_date_locale: 'en-US',
  hero_role: 'iOS & Fullstack Developer',
  about_subtitle: 'About',
  about_title: 'Who I Am',
  about_photo: '/others/me.jpg',
  about_edu_title: 'Education',
  about_edu_degree: 'Bachelor of Software Engineering',
  about_edu_uni: 'PUCRS — Pontifícia Universidade Católica do Rio Grande do Sul',
  about_p1: "As a winner of the Apple Swift Student Challenge 2026, my goal goes beyond just writing code: I seek to create digital experiences that truly solve users' problems and pain points.",
  about_p2: "Based in Porto Alegre and a Software Engineering student at PUCRS, I work with iOS development and full-stack ecosystems. With over two years of experience, I have been building robust applications, from back-end architecture to the final interface.",
  about_p3: "Outside the development environment, I am driven by continuous curiosity. When I'm not coding, you'll find me exploring new technologies, diving into the Japanese language and culture, or enjoying free time playing games with friends.",

  // Experience Section
  exp_subtitle: 'Journey',
  exp_title: 'Experience',

  // Projects Section
  proj_subtitle: 'Work',
  proj_title: 'Featured Projects',
  proj_desc: 'Drag to browse. Click a centered project to view details.',
  proj_view_details: 'View Details',
  proj_preview: 'Preview',
  proj_empty: 'No projects found for this category.',
  
  // Project Categories (Filtros)
  cat_all: 'All Projects',
  cat_ios: 'iOS',
  cat_university: 'University',
  cat_personal: 'Personal',
  cat_others: 'Others',

  // Project Detail Page
  proj_back: 'Back to Projects',
  proj_gallery: 'Gallery',
  proj_about: 'About the Project',
  proj_role: 'My Contributions',
  proj_links: 'Links',
  proj_techs: 'Technologies',
  proj_roles: 'Roles',

  // Contact Section
  contact_subtitle: 'Get in Touch',
  contact_title: "Let's Connect",
  contact_desc: "I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology and design. Feel free to reach out through any of the platforms below!",
};

export type Translations = typeof en;
export type TranslationKey = keyof Translations;