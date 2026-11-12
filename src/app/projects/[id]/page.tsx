// src/app/projects/[id]/page.tsx
import { getProjects } from "@/features/portfolio/data/projects";
import ProjectDetails from "@/features/portfolio/pages/ProjectPage";

export async function generateStaticParams() {
  const projects = getProjects("en");

  return projects.map((project) => ({
    id: project.id,
  }));
}

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;

  return <ProjectDetails projectId={resolvedParams.id} />;
}
