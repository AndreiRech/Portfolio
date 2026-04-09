// src/data/projects.ts
import { Project } from '@/types';

export const getProjects = (locale: 'en' | 'pt'): Project[] => {
  const data: Record<'en' | 'pt', Project[]> = {
    en: [
      {
        id: 'hearme',
        name: 'HearMe',
        category: 'iOS',
        date: '2026',
        shortDescription: 'Swift Student Challenge 2026 Winner - Connecting worlds through sound and silence.',
        description: 'Swift Student Challenge 2026 Winner. HearMe is an iOS application developed to raise awareness about hearing loss. Inspired by real stories and personal experiences, the app aims to translate the invisible struggle of hearing impairment into a visual and interactive experience.',
        technologies: ['Swift', 'SwiftUI', 'AVFoundation', 'MVVM', 'ECS'],
        roles: ['iOS Developer', 'UI/UX Designer'],
        detailedRole: 'I was responsible for creating the entire iOS application from scratch. This included the idea, creating the design and assets used in the app, and the entire development process. Since this is based on real stories, I tried to make it as immersive as possible, trying to put the user in the shoes of someone with hearing loss.',
        links: { appStore: 'https://apps.apple.com/br/app/hearme-unheard/id6761224867?l=en-GBHearMe - Unheard', github: 'https://github.com/AndreiRech/HearMe' },
        media: [],
        team: [{ name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' }]
      },
      {
        id: 'collecta',
        name: 'Collecta',
        category: 'iOS',
        date: '2023',
        shortDescription: 'Cross-platform collectible management app with AR.',
        description: 'Cross-platform collectible management app with AR preview, barcode scanning, and community marketplace. Collecta lets users digitize their physical collections and visualize them in their space.',
        technologies: ['React Native', 'Expo', 'Firebase', 'ARKit'],
        roles: ['Fullstack Developer', 'AR Engineer'],
        detailedRole: 'My contribution spanned both the frontend mobile experience and the cloud backend. I integrated ARKit with React Native to allow users to project their collectibles onto physical surfaces. On the backend, I designed the Firestore NoSQL database structure for real-time inventory updates and managed the Firebase cloud functions for marketplace transactions.',
        links: { appStore: 'https://apps.apple.com', github: 'https://github.com/andreirech' },
        media: [],
        team: [
          { name: 'Adriel de Souza', role: 'iOS Developer, Scrum Master', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Carolina Silva', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Martina Gama', role: 'Product Designer', linkedinUrl: 'https://linkedin.com/' }
        ]
      },
      {
        id: 'devboard',
        name: 'DevBoard',
        category: 'University',
        date: '2022',
        shortDescription: 'Developer productivity dashboard aggregating metrics.',
        description: 'Developer productivity dashboard aggregating GitHub, Jira, and Slack into actionable sprint metrics. Created as a capstone project to streamline engineering team visibility.',
        technologies: ['Next.js', 'TypeScript', 'GraphQL', 'D3.js'],
        roles: ['Frontend Engineer'],
        detailedRole: 'I led the frontend development, transforming raw API data from Jira and GitHub into interactive, real-time visualizations using D3.js and React. I focused heavily on performance optimization, ensuring the dashboard maintained 60fps even when rendering thousands of commits and ticket transitions on a single view.',
        links: { live: 'https://devboard.dev', github: 'https://github.com/andreirech' },
        media: [],
        team: [
          { name: 'Bárbara Dapper', role: 'Frontend Developer', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Bruna Marschner', role: 'Backend Developer', linkedinUrl: 'https://linkedin.com/' }
        ]
      },
      {
        id: 'pulse-api',
        name: 'Pulse API',
        category: 'Others',
        date: '2023',
        shortDescription: 'High-throughput RESTful microservice for health & fitness.',
        description: 'High-throughput RESTful microservice powering a health & fitness platform with 10K+ concurrent connections.',
        technologies: ['Node.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
        roles: ['Backend Engineer', 'Database Architect'],
        detailedRole: 'Architected the underlying database schema and developed the core REST APIs. I implemented advanced caching strategies using Redis and message queuing with RabbitMQ to handle activity stream ingestion from thousands of IoT fitness devices concurrently without bottlenecking the main relational database.',
        links: { github: 'https://github.com/andreirech' },
        media: [],
        team: []
      }
    ],
    pt: [
      {
        id: 'fintrack-ios',
        name: 'FinTrack',
        category: 'iOS',
        date: '2024',
        shortDescription: 'Um rastreador de finanças pessoais construído nativamente com SwiftUI.',
        description: 'Um rastreador de finanças pessoais construído nativamente com SwiftUI, apresentando análises de orçamento em tempo real e autenticação biométrica. Este aplicativo se integra com segurança a serviços financeiros para fornecer uma experiência de usuário contínua.',
        technologies: ['Swift', 'SwiftUI', 'Core Data', 'Charts'],
        roles: ['Desenvolvedor Líder', 'Designer UI/UX'],
        detailedRole: 'Fui responsável por arquitetar todo o aplicativo iOS do zero. Isso incluiu projetar o esquema do Core Data para recursos offline-first, construir gráficos interativos complexos usando o novo framework Swift Charts e implementar todo o design system para garantir uma sensação nativa impecável. Também gerenciei todos os pipelines de implantação da App Store usando o Fastlane.',
        links: { appStore: 'https://apps.apple.com', github: 'https://github.com/andreirech' },
        media: [],
        team: [{ name: 'Andrei Rech', role: 'Desenvolvedor iOS', linkedinUrl: 'https://linkedin.com/in/rechandrei' }]
      },
      {
        id: 'collecta',
        name: 'Collecta',
        category: 'iOS',
        date: '2023',
        shortDescription: 'Aplicativo multiplataforma de gerenciamento de colecionáveis com RA.',
        description: 'Aplicativo multiplataforma de gerenciamento de colecionáveis com prévia em Realidade Aumentada (RA), escaneamento de código de barras e mercado comunitário. O Collecta permite aos usuários digitalizar suas coleções físicas e visualizá-las em seu espaço.',
        technologies: ['React Native', 'Expo', 'Firebase', 'ARKit'],
        roles: ['Desenvolvedor Fullstack', 'Engenheiro de RA'],
        detailedRole: 'Minha contribuição abrangeu tanto a experiência móvel frontend quanto o backend na nuvem. Integrei o ARKit com React Native para permitir que os usuários projetem seus colecionáveis em superfícies físicas. No backend, projetei a estrutura de banco de dados NoSQL Firestore para atualizações de inventário em tempo real e gerenciei as funções de nuvem do Firebase para transações de mercado.',
        links: { appStore: 'https://apps.apple.com', github: 'https://github.com/andreirech' },
        media: [],
        team: [
          { name: 'Adriel de Souza', role: 'Desenvolvedor iOS, Scrum Master', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Carolina Silva', role: 'Desenvolvedor iOS', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Martina Gama', role: 'Designer de Produto', linkedinUrl: 'https://linkedin.com/' }
        ]
      },
      {
        id: 'devboard',
        name: 'DevBoard',
        category: 'University',
        date: '2022',
        shortDescription: 'Painel de produtividade do desenvolvedor agregando métricas.',
        description: 'Painel de produtividade do desenvolvedor agregando GitHub, Jira e Slack em métricas acionáveis de sprint. Criado como um projeto de conclusão de curso para otimizar a visibilidade da equipe de engenharia.',
        technologies: ['Next.js', 'TypeScript', 'GraphQL', 'D3.js'],
        roles: ['Engenheiro Frontend'],
        detailedRole: 'Liderei o desenvolvimento frontend, transformando dados brutos de API do Jira e GitHub em visualizações interativas e em tempo real usando D3.js e React. Foquei fortemente na otimização de desempenho, garantindo que o painel mantivesse 60fps mesmo ao renderizar milhares de commits e transições de tickets em uma única visualização.',
        links: { live: 'https://devboard.dev', github: 'https://github.com/andreirech' },
        media: [],
        team: [
          { name: 'Bárbara Dapper', role: 'Desenvolvedora Frontend', linkedinUrl: 'https://linkedin.com/' },
          { name: 'Bruna Marschner', role: 'Desenvolvedora Backend', linkedinUrl: 'https://linkedin.com/' }
        ]
      },
      {
        id: 'pulse-api',
        name: 'Pulse API',
        category: 'Others',
        date: '2023',
        shortDescription: 'Microsserviço RESTful de alto rendimento para saúde.',
        description: 'Microsserviço RESTful de alto rendimento alimentando uma plataforma de saúde e condicionamento físico com mais de 10 mil conexões simultâneas.',
        technologies: ['Node.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
        roles: ['Engenheiro Backend', 'Arquiteto de Banco de Dados'],
        detailedRole: 'Arquitetei o esquema do banco de dados subjacente e desenvolvi as APIs REST principais. Implementei estratégias avançadas de cache usando Redis e fila de mensagens com RabbitMQ para lidar com a ingestão de fluxo de atividades de milhares de dispositivos fitness IoT simultaneamente sem sobrecarregar o banco de dados relacional principal.',
        links: { github: 'https://github.com/andreirech' },
        media: [],
        team: []
      }
    ]
  };

  return data[locale];
};