// src/data/projects.ts
import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'fintrack-ios',
    name: 'FinTrack',
    category: 'iOS',
    date: '2024',
    shortDescription: 'A personal finance tracker built natively with SwiftUI.',
    description: 'A personal finance tracker built natively with SwiftUI, featuring real-time budget analytics and biometric authentication. This application securely integrates with core financial services to provide a seamless user experience.',
    technologies: ['Swift', 'SwiftUI', 'Core Data', 'Charts'],
    roles: ['Lead Developer', 'UI/UX Designer'],
    detailedRole: 'I was responsible for architecting the entire iOS application from the ground up. This included designing the Core Data schema for offline-first capabilities, building complex interactive charts using the new Swift Charts framework, and implementing the entire design system to ensure a flawless native feel. I also handled all App Store deployment pipelines using Fastlane.',
    links: {
      appStore: 'https://apps.apple.com',
      github: 'https://github.com/andreirech',
    },
    media: [],
    team: [
      { name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' }
    ]
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
    links: {
      appStore: 'https://apps.apple.com',
      github: 'https://github.com/andreirech',
    },
    media: [],
    team: [
      { name: 'Adriel de Souza', role: 'iOS Developer, Scrum Master', linkedinUrl: 'https://linkedin.com/' },
      { name: 'Carolina Silva', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/' },
      { name: 'Martina Gama', role: 'Product Designer, Product Owner', linkedinUrl: 'https://linkedin.com/' }
    ]
  },
  {
    id: 'collecta2',
    name: 'Collecta2',
    category: 'iOS',
    date: '2023',
    shortDescription: 'Cross-platform collectible management app with AR.',
    description: 'Cross-platform collectible management app with AR preview, barcode scanning, and community marketplace. Collecta lets users digitize their physical collections and visualize them in their space.',
    technologies: ['React Native', 'Expo', 'Firebase', 'ARKit'],
    roles: ['Fullstack Developer', 'AR Engineer'],
    detailedRole: 'My contribution spanned both the frontend mobile experience and the cloud backend. I integrated ARKit with React Native to allow users to project their collectibles onto physical surfaces. On the backend, I designed the Firestore NoSQL database structure for real-time inventory updates and managed the Firebase cloud functions for marketplace transactions.',
    links: {
      appStore: 'https://apps.apple.com',
      github: 'https://github.com/andreirech',
    },
    media: [],
    team: [
      { name: 'Adriel de Souza', role: 'iOS Developer, Scrum Master', linkedinUrl: 'https://linkedin.com/' },
      { name: 'Carolina Silva', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/' },
      { name: 'Martina Gama', role: 'Product Designer, Product Owner', linkedinUrl: 'https://linkedin.com/' }
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
    links: {
      live: 'https://devboard.dev',
      github: 'https://github.com/andreirech',
    },
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
    links: {
      github: 'https://github.com/andreirech',
    },
    media: [],
    team: []
  }
];