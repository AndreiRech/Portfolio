'use client';

import AnimatedSection from '@/components/AnimatedSection';
import { User } from 'lucide-react';

const skills = [
  { category: 'Mobile', items: ['Swift', 'SwiftUI', 'UIKit', 'Core Data', 'Combine'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'GraphQL'] },
  { category: 'DevOps', items: ['Docker', 'AWS', 'CI/CD', 'Fastlane', 'Vercel'] },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-overlay py-28 md:py-36">
      <div className="section-container">
        <AnimatedSection direction="left">
          <span className="text-sm font-medium tracking-widest text-accent uppercase">
            About
          </span>
          <h2
            className="mt-3 text-4xl font-black text-mist md:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Who I Am
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
          {/* Profile image column */}
          <AnimatedSection direction="left" delay={0.15}>
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="glass flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl md:h-80">
                <div className="flex flex-col items-center gap-3 text-desat/40">
                  <User size={48} strokeWidth={1} />
                  <span className="text-xs tracking-widest uppercase">
                    Profile Photo
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Text + skills column */}
          <div className="flex flex-col gap-10">
            <AnimatedSection direction="right" delay={0.2}>
              <div className="space-y-5 text-base leading-relaxed text-desat md:text-lg">
                <p>
                  I&apos;m a developer passionate about crafting beautiful, performant
                  digital experiences — from pixel-perfect iOS apps to
                  scalable full-stack systems.
                </p>
                <p>
                  With 6+ years of experience shipping production software, I
                  thrive at the intersection of design and engineering.
                  I believe great code should be invisible: users should only
                  feel the magic.
                </p>
                <p>
                  When I&apos;m not coding, you&apos;ll find me exploring new design
                  systems, contributing to open source, or experimenting with
                  creative coding and shader art.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.3}>
              <div className="grid grid-cols-2 gap-4">
                {skills.map((group) => (
                  <div
                    key={group.category}
                    className="glass rounded-xl p-5 transition-all duration-300 hover:border-accent/30"
                  >
                    <h3 className="mb-3 text-sm font-bold tracking-wider text-accent uppercase">
                      {group.category}
                    </h3>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="text-sm text-desat">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
