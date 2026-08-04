// src/components/ClientApp.tsx
'use client';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import ContactSection from '@/components/sections/ContactSection';

export default function ClientApp() {
  return (
    <>
      {/* Static noir backdrop — sits where the animated shader canvas used to,
          but renders on the first paint with no client-side work. */}
      <div className="noir-backdrop" aria-hidden="true" />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>

    </>
  );
}