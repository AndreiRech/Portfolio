// src/components/ClientApp.tsx
'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import ContactSection from '@/components/sections/ContactSection';

const ShaderBackground = dynamic(
  () => import('@/components/ShaderBackground'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-base" />
    ),
  }
);

export default function ClientApp() {
  return (
    <>
      <ShaderBackground />
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