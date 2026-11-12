// src/data/experiences.ts
import { Experience } from "@/features/portfolio/model/types";

export const getExperiences = (locale: "en" | "pt"): Experience[] => {
  const data = {
    en: [
      {
        id: "exp-1",
        role: "iOS Developer",
        company: "Apple Developer Academy",
        period: "Feb 2025 — Present",
        current: true,
        description: (
          <p>
            I manage the full development lifecycle of native iOS apps, from
            architecture design and{" "}
            <strong className="text-mustard">HIG</strong> compliance to
            automated deployment with{" "}
            <strong className="text-mustard">Xcode Cloud</strong>. I build
            immersive, interactive experiences with{" "}
            <strong className="text-mustard">RealityKit</strong>,{" "}
            <strong className="text-mustard">SpriteKit</strong> and CoreMotion,
            focused on performance and hardware sensor integration. <br />
            <br />I designed cloud storage and{" "}
            <strong className="text-mustard">CloudKit</strong> sync strategies
            with <strong className="text-mustard">NSCache</strong> that keep
            data <strong className="text-mustard">100% consistent</strong>{" "}
            across devices. I lead technical discussions and apply testing and
            peer review within <strong className="text-mustard">Scrum</strong>,
            and I cut interface work per sprint by building modular, reusable
            components in <strong className="text-mustard">SwiftUI</strong> and
            UIKit that follow Apple&apos;s design principles.
          </p>
        ),
        technologies: [
          "Swift",
          "SwiftUI",
          "UIKit",
          "CloudKit",
          "RealityKit",
          "Xcode Cloud",
        ],
      },
      {
        id: "exp-2",
        role: "Fullstack Developer",
        company: "Comercial Rech",
        period: "Jul 2023 — Present",
        current: true,
        description: (
          <p>
            I manage the full development cycle of a business management
            platform that replaces the legacy system, from concept and data
            modelling to deployment and maintenance. I built{" "}
            <strong className="text-mustard">REST APIs</strong> in{" "}
            <strong className="text-mustard">Java</strong>,{" "}
            <strong className="text-mustard">Spring Boot</strong> and{" "}
            <strong className="text-mustard">PostgreSQL</strong> that centralise
            products, customers, stock, sales and reports, with session
            authentication, role-based authorisation and CSRF protection. <br />
            <br />
            An immutable stock movement history, with who made each change and
            balance reconciliation,{" "}
            <strong className="text-mustard">
              reduced stock discrepancies by 10%
            </strong>
            . Automating revenue, best-seller and stock adjustment calculations{" "}
            <strong className="text-mustard">
              cut report consolidation time by 60%
            </strong>
            .
          </p>
        ),
        technologies: ["Java", "Spring Boot", "PostgreSQL", "REST", "Security"],
      },
      {
        id: "exp-3",
        role: "Fullstack Developer Intern",
        company: "BeasyBox",
        period: "Oct 2024 — Dec 2024",
        description: (
          <p>
            I designed the end-to-end architecture of a corporate diagnostics
            platform, turning complex business logic into a scalable
            questionnaire system to validate the company&apos;s MVP. I planned
            and built the database schemas and backend APIs for dynamic user
            data and diagnostic reports with{" "}
            <strong className="text-mustard">PostgreSQL</strong> and{" "}
            <strong className="text-mustard">NestJS</strong>. <br />
            <br />
            Integrating external <strong className="text-mustard">
              AI
            </strong>{" "}
            services to validate and process answers automatically{" "}
            <strong className="text-mustard">
              reduced manual analysis by 70%
            </strong>
            . I also built responsive, fast interfaces focused on usability and
            data visualisation with{" "}
            <strong className="text-mustard">React</strong> and{" "}
            <strong className="text-mustard">TailwindCSS</strong>.
          </p>
        ),
        technologies: [
          "React",
          "NestJS",
          "TypeScript",
          "PostgreSQL",
          "Tailwind",
          "AI",
        ],
      },
    ],
    pt: [
      {
        id: "exp-1",
        role: "Desenvolvedor iOS",
        company: "Apple Developer Academy",
        period: "Fev 2025 — Presente",
        current: true,
        description: (
          <p>
            Gerencio o ciclo de vida completo de aplicativos nativos para iOS,
            do design da arquitetura e conformidade com a{" "}
            <strong className="text-mustard">HIG</strong> até a implantação
            automatizada com{" "}
            <strong className="text-mustard">Xcode Cloud</strong>. Projeto
            soluções imersivas e interativas com{" "}
            <strong className="text-mustard">RealityKit</strong>,{" "}
            <strong className="text-mustard">SpriteKit</strong> e CoreMotion,
            com foco em desempenho e integração de sensores de hardware. <br />
            <br />
            Garanti{" "}
            <strong className="text-mustard">
              100% de consistência de dados
            </strong>{" "}
            entre dispositivos ao arquitetar armazenamento em nuvem e
            sincronização via <strong className="text-mustard">CloudKit</strong>{" "}
            com <strong className="text-mustard">NSCache</strong>. Lidero
            discussões técnicas e aplico testes e revisão por pares dentro do{" "}
            <strong className="text-mustard">Scrum</strong>, e reduzi o tempo de
            interface por sprint com componentes modulares e reutilizáveis em{" "}
            <strong className="text-mustard">SwiftUI</strong> e UIKit, seguindo
            os princípios de design da Apple.
          </p>
        ),
        technologies: [
          "Swift",
          "SwiftUI",
          "UIKit",
          "CloudKit",
          "RealityKit",
          "Xcode Cloud",
        ],
      },
      {
        id: "exp-2",
        role: "Desenvolvedor Fullstack",
        company: "Comercial Rech",
        period: "Jul 2023 — Presente",
        current: true,
        description: (
          <p>
            Gerencio o ciclo completo de desenvolvimento de uma plataforma de
            gestão comercial que substitui o sistema legado, da concepção e
            modelagem de dados ao deploy e à manutenção. Desenvolvi{" "}
            <strong className="text-mustard">APIs REST</strong> em{" "}
            <strong className="text-mustard">Java</strong>,{" "}
            <strong className="text-mustard">Spring Boot</strong> e{" "}
            <strong className="text-mustard">PostgreSQL</strong> que centralizam
            produtos, clientes, estoque, vendas e relatórios, com autenticação
            por sessão, autorização por perfil e proteção CSRF. <br />
            <br />
            Um histórico imutável de movimentações, com identificação do
            responsável e reconciliação de saldos,{" "}
            <strong className="text-mustard">
              reduziu em 10% as divergências de estoque
            </strong>
            . Automatizar os cálculos de faturamento, produtos mais vendidos e
            ajustes de estoque{" "}
            <strong className="text-mustard">
              diminuiu em 60% o tempo de consolidação de relatórios
            </strong>
            .
          </p>
        ),
        technologies: [
          "Java",
          "Spring Boot",
          "PostgreSQL",
          "REST",
          "Segurança",
        ],
      },
      {
        id: "exp-3",
        role: "Estagiário Fullstack",
        company: "BeasyBox",
        period: "Out 2024 — Dez 2024",
        description: (
          <p>
            Projetei a arquitetura end-to-end de uma plataforma de diagnóstico
            corporativo, traduzindo lógicas de negócio complexas em um sistema
            de questionários escalável para validar o MVP da empresa. Planejei e
            implementei os esquemas de banco de dados e as APIs backend para
            dados dinâmicos de usuários e relatórios de diagnóstico com{" "}
            <strong className="text-mustard">PostgreSQL</strong> e{" "}
            <strong className="text-mustard">NestJS</strong>. <br />
            <br />A integração com serviços externos de{" "}
            <strong className="text-mustard">IA</strong> para validar e
            processar respostas automaticamente{" "}
            <strong className="text-mustard">
              reduziu em 70% o esforço manual de análise
            </strong>
            . Também desenvolvi interfaces responsivas e de alto desempenho, com
            foco em usabilidade e visualização de dados, usando{" "}
            <strong className="text-mustard">React</strong> e{" "}
            <strong className="text-mustard">TailwindCSS</strong>.
          </p>
        ),
        technologies: [
          "React",
          "NestJS",
          "TypeScript",
          "PostgreSQL",
          "Tailwind",
          "IA",
        ],
      },
    ],
  };

  return data[locale];
};
