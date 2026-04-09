// src/data/experiences.ts
import { Experience } from '@/types';

export const getExperiences = (locale: 'en' | 'pt'): Experience[] => {
  const data = {
    en: [
      {
        id: 'exp-1',
        role: 'iOS Developer',
        company: 'Apple Developer Academy',
        period: 'Fev 2025 - Present',
        description: (
          <p>
            Developing applications that aim to solve <strong className="text-accent">real-world problems</strong>, focusing on code quality and user experience. Using the best practices of iOS development, I have more than <strong className="text-accent">5 applications</strong> published on the <strong className="text-accent">App Store</strong>, using <strong className="text-accent">SwiftUI</strong>, SwiftData, CloudKit, RealityKit, SpriteKit technologies and based on ECS and <strong className="text-accent">MVVM</strong> architectures. <br /><br />
            
            Acted as <strong className="text-accent">Product Owner</strong> in 3 projects, being responsible for managing and ensuring the quality of the projects, using agile methodologies such as Scrum and Kanban and CI/CD techniques, such as GitHub Actions and XCodeCloud. <br /><br />
            
            Contributed to projects from ideation, research, design on Figma to ready-to-deploy implementations.
          </p>
        ),
        technologies: ['Swift', 'SwiftUI', 'CloudKit', 'MVVM', 'Figma', 'XCodeCloud'],
      },
      {
        id: 'exp-2',
        role: 'Fullstack Developer',
        company: 'BeasyBox',
        period: 'Out 2024 — Dec 2024',
        description: (
          <p>
            At Beasybox, I contributed directly to the validation of the MVP, participating in the development of core features for the business diagnostics platform. I was responsible for the end-to-end creation of the central questionnaire system, translating complex business rules into fluid user experiences using <strong className="text-accent">React</strong> and <strong className="text-accent">TailwindCSS</strong>. <br /><br />
            
            Simultaneously, I structured the back-end, APIs, and data modeling with <strong className="text-accent">Node.js</strong>, <strong className="text-accent">NestJS</strong>, and <strong className="text-accent">PostgreSQL</strong>. The implementation of integrations with <strong className="text-accent">Artificial Intelligence</strong> for response processing consolidated my systemic view of the product, connecting scalable architecture with a high-quality interface.
          </p>
        ),
        technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind', 'AI'],
      },
    ],
    pt: [
      {
        id: 'exp-1',
        role: 'Desenvolvedor iOS',
        company: 'Apple Developer Academy',
        period: 'Fev 2025 - Presente',
        description: (
          <p>
            Desenvolvendo aplicativos que visam solucionar problemas reais, focando na qualidade do código e na experiência do usuário. Utilizando as melhores práticas de desenvolvimento iOS, possuo mais de <strong className="text-accent">5 aplicativos</strong> publicados na <strong className="text-accent">App Store</strong>, utilizando <strong className="text-accent">SwiftUI</strong>, SwiftData, CloudKit, RealityKit, SpriteKit tecnologias e se baseando nas arquiteturas ECS e <strong className="text-accent">MVVM</strong>. <br /><br />
            
            Atuei como <strong className="text-accent">Product Owner</strong> em 3 projetos, sendo responsável por gerenciar e garantir a qualidade dos projetos, utilizando metodologias ágeis como Scrum e Kanban e técnicas de CI/CD, como GitHub Actions e XCodeCloud. <br /><br />
            
            Contribuí em meus projetos desde a ideação, pesquisa, design no Figma e até implementações prontas para a App Store.
          </p>
        ),
        technologies: ['Swift', 'SwiftUI', 'CloudKit', 'MVVM', 'Figma', 'XCodeCloud'],
      },
      {
        id: 'exp-2',
        role: 'Desenvolvedor Fullstack',
        company: 'BeasyBox',
        period: 'Out 2024 — Dez 2024',
        description: (
          <p>
            Na Beasybox, atuei no desenvolvimento full-stack para validação do MVP da plataforma de diagnósticos empresariais, sendo responsável pela criação end-to-end do sistema central de questionários. Traduzi regras de negócio complexas em experiências de usuário fluidas utilizando <strong className="text-accent">React</strong> e <strong className="text-accent">TailwindCSS</strong>, ao mesmo tempo em que estruturei o back-end, as APIs e a modelagem de dados com <strong className="text-accent">Node.js</strong>, <strong className="text-accent">NestJS</strong> e <strong className="text-accent">PostgreSQL</strong>. . <br /><br />
            
            A implementação de integrações com <strong className="text-accent">Inteligência Artificial</strong> para processamento de respostas consolidou minha visão sistêmica de produto, conectando arquitetura escalável a uma interface de alta qualidade.
          </p>
        ),
        technologies: ['React', 'NestJS', 'TypeScript', 'PostgreSQL', 'Tailwind', 'AI'],
      },
    ]
  };

  return data[locale];
};