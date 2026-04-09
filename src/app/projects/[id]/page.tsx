// src/app/projects/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Smartphone, Image as ImageIcon } from 'lucide-react';
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
    <main className="min-h-screen bg-base text-mist pb-8 pt-16 px-6 md:px-10 selection:bg-accent selection:text-mist">
      <div className="max-w-8xl mx-auto">
        
        {/* Navigation */}
        <Link 
          href="/#projects" 
          className="inline-flex items-center gap-2 text-sm font-medium text-msit hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        {/* Header Block */}
        <header className="flex flex-row justify-between relative border-b border-glass-border pb-8">
        <div className="flex flex-row gap-6">
            {project.logoUrl ? (
                <div className="w-28 h-28 rounded-xl overflow-hidden glass flex items-center justify-center shrink-0 bg-midnight">
                  <Image src={project.logoUrl} alt={`${project.name} Logo`} width={64} height={64} className="object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-xl overflow-hidden glass flex items-center justify-center shrink-0 bg-midnight/20 border border-glass-border">
                  <ImageIcon size={32} className="text-desat/50" strokeWidth={1.5} />
                </div>
              )}
            <div className="flex flex-col gap-4 max-w3xl">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                {project.name}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-mist leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              {project.shortDescription}
            </p>
          </div>
        </div>

          {/* Centered Date and Category at the bottom of the header */}
          <div className="flex flex-col items-center justify-center gap-2 pt-8 mt-4">
            <span className="text-mist font-medium tracking-wide">
              {project.date}
            </span>
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest bg-midnight/40 border border-glass-border text-mist rounded-full uppercase">
              {project.category}
            </span>
          </div>
        </header>

        {/* Block 1: Media Gallery Carousel */}
        <section className="w-full mt-8 mb-12 border-b border-glass-border pb-8">
          <h2 className="text-2xl font-bold text-accent tracking-wide mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Media Gallery</h2>
          <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
            {project.media && project.media.length > 0 ? (
              project.media.map((mediaUrl, idx) => (
                <div key={idx} className="relative h-[00px] md:h-[300px] min-w-[280px] md:min-w-[500px] rounded-2xl overflow-hidden glass border border-glass-border snap-center shrink-0 bg-midnight/10">
                  <Image 
                    src={mediaUrl} 
                    alt={`${project.name} screenshot ${idx + 1}`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 300px, 700px" 
                  />
                </div>
              ))
            ) : (
              /* Fallback Placeholder Logic */
              [1, 2, 3].map((_, idx) => (
                <div key={idx} className="relative h-[300px] md:h-[300px] min-w-[280px] md:min-w-[500px] rounded-2xl overflow-hidden glass border border-glass-border snap-center shrink-0 flex flex-col items-center justify-center bg-midnight/20">
                  <div className="flex flex-col items-center gap-3 text-desat/40">
                    <ImageIcon size={48} strokeWidth={1} />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Media Placeholder {idx + 1}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Block 2: Information Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-glass-border pb-12">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-accent tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                About the Project
              </h2>
              <div className="text-base md:text-lg text-mist leading-relaxed space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
                {project.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-accent tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                My Contributions
              </h2>
              <div className="text-base md:text-lg text-mist leading-relaxed space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
                {project.detailedRole.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col lg:items-end pt-12 lg:pt-0">
            
            {/* WRAPPER (O equivalente à VStack após o Spacer)
              Mantém o conteúdo interno alinhado à esquerda, mas tem a largura máxima contida 
              para que o pai (lg:items-end) possa empurrá-lo como um bloco único para a direita.
            */}
            <div className="flex flex-col gap-10 w-full lg:max-w-sm">
              
              {/* Links Section */}
              {(project.links.github || project.links.appStore || project.links.live) && (
                <section className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold tracking-widest text-mist uppercase">Links</h3>
                  <div className="flex flex-wrap gap-3"> {/* Correção: flex-warp para flex-wrap */}
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <GithubIcon size={18} /> GitHub
                      </a>
                    )}
                    {project.links.appStore && (
                      <a href={project.links.appStore} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <Smartphone size={18} /> App Store
                      </a>
                    )}
                    {project.links.live && (
                      <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <ExternalLink size={18} /> Website
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Technologies Section */}
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold tracking-widest text-mist uppercase">Technologies</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-4 py-2 rounded-xl text-sm font-medium text-mist border border-glass-border transition-colors hover:text-accent">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {/* Roles Section */}
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold tracking-widest text-mist uppercase">Roles</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {project.roles.map((role) => (
                    <span key={role} className="px-4 py-2 rounded-xl text-sm font-medium text-mist border border-glass-border transition-colors hover:text-accent">
                      {role}
                    </span>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Block 3: Credits / Team Section */}
        {project.team && project.team.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-12 gap-6">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex flex-col gap-2 glass p-6 rounded-2xl border border-glass-border hover:border-accent transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-mist text-lg">{member.name}</span>
                    {member.linkedinUrl && (
                      <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-mist hover:text-accent transition-colors" aria-label={`${member.name}'s LinkedIn`}>
                        <ExternalSquareIcon size={18} />
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-accent font-medium leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
        )}
      </div>
    </main>
  );
}