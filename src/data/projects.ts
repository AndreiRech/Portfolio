import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'fintrack-ios',
    title: 'FinTrack',
    type: 'Personal',
    year: 2024,
    description:
      'A personal finance tracker built natively with SwiftUI, featuring real-time budget analytics and biometric authentication.',
    tags: ['Swift', 'SwiftUI', 'Core Data', 'Charts'],
    imageUrl: '/projects/fintrack.png',
    liveUrl: 'https://apps.apple.com',
    repoUrl: 'https://github.com/andreirech',
  },
  {
    id: 'pulse-api',
    title: 'Pulse API',
    type: 'Freelance',
    year: 2023,
    description:
      'High-throughput RESTful microservice powering a health & fitness platform with 10K+ concurrent connections.',
    tags: ['Node.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
    imageUrl: '/projects/pulse.png',
    repoUrl: 'https://github.com/andreirech',
  },
  {
    id: 'collecta',
    title: 'Collecta',
    type: 'Personal',
    year: 2023,
    description:
      'Cross-platform collectible management app with AR preview, barcode scanning, and community marketplace.',
    tags: ['React Native', 'Expo', 'Firebase', 'ARKit'],
    imageUrl: '/projects/collecta.png',
    liveUrl: 'https://apps.apple.com',
    repoUrl: 'https://github.com/andreirech',
  },
  {
    id: 'devboard',
    title: 'DevBoard',
    type: 'University',
    year: 2022,
    description:
      'Developer productivity dashboard aggregating GitHub, Jira, and Slack into actionable sprint metrics.',
    tags: ['Next.js', 'TypeScript', 'GraphQL', 'D3.js'],
    imageUrl: '/projects/devboard.png',
    liveUrl: 'https://devboard.dev',
    repoUrl: 'https://github.com/andreirech',
  },
  {
    id: 'medlog',
    title: 'MedLog',
    type: 'Freelance',
    year: 2021,
    description:
      'HIPAA-compliant patient intake and medical records system with role-based access and audit trails.',
    tags: ['React', 'Node.js', 'MongoDB', 'Docker'],
    imageUrl: '/projects/medlog.png',
    repoUrl: 'https://github.com/andreirech',
  },
];
