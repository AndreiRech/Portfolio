import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ContactSection from "@/components/sections/ContactSection";
import ContributionsSection from "@/components/sections/ContributionsSection";
import ExploreSection from "@/components/sections/ExploreSection";
export default function ClientApp() {
  return (
    <main id="main">
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <ExperienceSection />
      <ContributionsSection />
      <ExploreSection />
      <ContactSection />
    </main>
  );
}
