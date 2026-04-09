// src/app/projects/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Smartphone } from 'lucide-react';
import { GithubIcon, ExternalSquareIcon } from '@/components/icons';
import { Project } from '@/types';
import { projects } from '@/data/projects';

async function getProjectData(id: string): Promise<Project | null> {
  const project = projects.find((p) => p.id === id);
  return project || null;
}

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const project = await getProjectData(resolvedParams.id);

  if (!project) notFound();

  return (
    <main className="min-h-screen bg-base text-mist pb-24 pt-32 px-6 md:px-10 selection:bg-accent selection:text-mist">
      <div className="max-w-5xl mx-auto">
        
        <Link 
          href="/#projects" 
          className="inline-flex items-center gap-2 text-sm font-medium text-desat hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <header className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="flex items-center gap-4">
                {project.logoUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden glass flex items-center justify-center shrink-0 bg-midnight">
                    <Image src={project.logoUrl} alt={`${project.name} Logo`} width={64} height={64} className="object-cover" />
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-black text-mist" style={{ fontFamily: 'var(--font-heading)' }}>
                  {project.name}
                </h1>
              </div>
              <p className="text-lg md:text-xl text-desat leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                {project.shortDescription}
              </p>
            </div>

            <div className="flex flex-col gap-1 md:text-right shrink-0 alignment-end">
              <span className="text-mist font-medium">{project.date}</span>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-midnight/50 border border-glass-border text-mist rounded-full w-fit md:ml-auto capitalize">
                {project.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 pt-6 mt-2 border-t border-glass-border">
            {/* Horizontal Links */}
            {(project.links.github || project.links.appStore || project.links.live) && (
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-desat uppercase">Links</span>
                <div className="flex items-center gap-6">
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-mist hover:text-accent transition-colors">
                      <GithubIcon size={16} /> GitHub
                    </a>
                  )}
                  {project.links.appStore && (
                    <a href={project.links.appStore} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-mist hover:text-accent transition-colors">
                      <Smartphone size={16} /> App Store
                    </a>
                  )}
                  {project.links.live && (
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-mist hover:text-accent transition-colors">
                      <ExternalLink size={16} /> Live
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Horizontal Technologies */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-desat uppercase">Technologies</span>
              <div className="flex flex-wrap items-center gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-md bg-glass-hover text-xs font-medium text-mist border border-glass-border">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Horizontal Roles */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-desat uppercase">Roles</span>
              <div className="flex flex-wrap items-center gap-2">
                {project.roles.map((role) => (
                  <span key={role} className="px-3 py-1 rounded-md bg-glass-hover text-xs font-medium text-accent border border-glass-border">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <hr className="my-12 border-accent/20" />

        <section className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 max-w-4xl">
            <h2 className="text-xl font-bold text-mist mb-2 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              About the Project
            </h2>
            <div className="text-base text-desat leading-relaxed space-y-4" style={{ fontFamily: 'var(--font-body)' }}>
              {project.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-4xl bg-midnight/10 p-8 rounded-3xl border border-glass-border">
            <h2 className="text-xl font-bold text-mist mb-2 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              My Detailed Role
            </h2>
            <div className="text-base text-mist/90 leading-relaxed space-y-4" style={{ fontFamily: 'var(--font-body)' }}>
              {project.detailedRole.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {project.media && project.media.length > 0 && (
            <div className="w-full">
               <h2 className="text-xl font-bold text-mist mb-6 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>Gallery</h2>
              <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
                {project.media.map((mediaUrl, idx) => (
                  <div key={idx} className="relative h-[400px] min-w-[300px] md:min-w-[600px] rounded-2xl overflow-hidden glass border border-glass-border snap-center shrink-0">
                    <Image src={mediaUrl} alt={`${project.name} screenshot ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 300px, 600px" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.team && project.team.length > 0 && (
            <div className="border-t border-glass-border pt-6">
              <h3 className="text-[#4F90F2] text-sm font-black tracking-widest uppercase mb-10 flex items-center gap-4" style={{ fontFamily: 'var(--font-heading)' }}>
                THE TEAM <span className="flex-1 h-px bg-glass-border"></span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                {project.team.map((member, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-mist text-base">{member.name}</span>
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-desat hover:text-mist transition-colors" aria-label={`${member.name}'s LinkedIn`}>
                          <ExternalSquareIcon size={14} />
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-desat font-medium leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}