import { Experience } from '@/types';

export const experiences: Experience[] = [
  {
    id: 'exp-1',
    role: 'Senior iOS Developer',
    company: 'TechNova',
    period: 'Jan 2023 — Present',
    description:
      'Lead the iOS squad building a fintech super-app serving 2M+ users. Architected the modular SwiftUI design system, reducing feature delivery time by 40%. Mentored 3 junior developers.',
    technologies: ['Swift', 'SwiftUI', 'Combine', 'TCA', 'CI/CD'],
  },
  {
    id: 'exp-2',
    role: 'Fullstack Developer',
    company: 'DataStream Labs',
    period: 'Mar 2021 — Dec 2022',
    description:
      'Built and maintained real-time data pipeline dashboards with React and Node.js. Designed the REST API layer powering internal analytics tools used by 500+ analysts.',
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  },
  {
    id: 'exp-3',
    role: 'iOS Developer',
    company: 'AppForge Studio',
    period: 'Jun 2019 — Feb 2021',
    description:
      'Developed and shipped 4 consumer-facing iOS apps from concept to App Store. Implemented Core Data migration strategies and push notification infrastructure.',
    technologies: ['Swift', 'UIKit', 'Core Data', 'Firebase', 'Fastlane'],
  },
  {
    id: 'exp-4',
    role: 'Junior Developer',
    company: 'CodeBase Startup',
    period: 'Jan 2018 — May 2019',
    description:
      'Full-stack contributions to an early-stage SaaS product. Built responsive web interfaces and contributed to the Go-based microservice backend.',
    technologies: ['JavaScript', 'React', 'Go', 'Docker', 'MongoDB'],
  },
];
