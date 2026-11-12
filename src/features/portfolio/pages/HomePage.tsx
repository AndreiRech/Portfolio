import HeroSection from "@/features/portfolio/components/HeroSection";
import AboutSection from "@/features/portfolio/components/AboutSection";
import ProjectsSection from "@/features/portfolio/components/ProjectsSection";
import ExperienceSection from "@/features/portfolio/components/ExperienceSection";
import ContactSection from "@/features/portfolio/components/ContactSection";
import ExploreSection from "@/features/portfolio/components/ExploreSection";
export default function ClientApp() {
  return (
    <main id="main">
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <ExploreSection />
      <ContactSection />
    </main>
  );
}
