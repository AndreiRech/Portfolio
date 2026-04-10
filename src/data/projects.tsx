// src/data/projects.ts
import { Project } from '@/types';

export const getProjects = (locale: 'en' | 'pt'): Project[] => {
  const data: Record<'en' | 'pt', Project[]> = {
    en: [
      // HearMe
      {
        id: 'hearme',
        name: 'HearMe',
        category: 'iOS',
        date: '2026',
        awards: [{ long: 'Swift Student Challenge 2026 Winner', short: 'SSC 26 Winner' }],
        shortDescription: <>Connecting worlds through sound and silence.</>,
        description: 'Swift Student Challenge 2026 Winner, HearMe is an iOS application developed to raise awareness about hearing loss. Inspired by real stories and personal experiences, the app aims to translate the invisible struggle of hearing impairment into a visual and interactive experience.',
        technologies: ['SwiftUI', 'AVFoundation', 'MVVM', 'ECS'],
        roles: ['iOS Developer', 'UI/UX Designer'],
        detailedRole: 'I was responsible for creating the entire iOS application from scratch. This included the idea, creating the design and assets used in the app, and the entire development process. Since this is based on real stories, I tried to make it as immersive as possible, trying to put the user in the shoes of someone with hearing loss.',
        links: { appStore: 'https://apps.apple.com/br/app/hearme-unheard/id6761224867', github: 'https://github.com/AndreiRech/HearMe' },
        media: [
          "/projects/hearme/screen1.png",
          "/projects/hearme/screen2.png",
          "/projects/hearme/screen3.png",
          "/projects/hearme/screen4.png",
        ],
        logoUrl: "/projects/hearme/logo.png",
        cardImageUrl: "/projects/hearme/card.png",
        orientation: 'horizontal',
        team: [{ name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' }]
      },

      // Cerne
      {
        id: 'cerne',
        name: 'Cerne',
        category: 'iOS',
        date: '2025',
        awards: [{ long: 'Apple Developer 1° year Standout Project', short: 'Standout Project' }],
        shortDescription: <>Measure tree carbon with AR and view scanned tree map.</>,
        description: <>Cerne is an iOS application developed to raise awareness about the importance of trees and their role in the environment. It allows users to measure tree carbon and view scanned tree pins on a map. The app objective is to show how much carbon a tree can absorb and create a collaborative database to know the total CO2 absorption capacity of trees in a region.</>,
        technologies: ['SwiftUI', 'RealityKit', 'CloudKit', 'NSCache'],
        roles: ['iOS Developer', 'Project Owner', 'Tech Lead'],
        detailedRole: 
        <>
          As the PO, I was responsible for organizing the team and the project, defining the most important features, prioritizing tasks, and ensuring the project was delivered on time. <br/>
          As the Tech Lead, I was responsible for the development of the architecture of the application, using MVVM and ECS patterns, defining the database schema, and implementing the core features of the application. <br/>
          Created an CI/CD pipeline to automate the build and deployment of the application utilizing GitHub Actions and XCode Cloud. <br/>
          Implemented the CloudKit connection and optimized the application with NSCache to let the user have a smooth experience even with low-end devices. <br/>
          With the help of RealityKit and ARKit, calculated the tree height using trigonometric functions and identified the tree species using the PlantNet API. <br/>
        </>, 
        links: { appStore: 'https://apps.apple.com/br/app/cerne-captura-de-co/id6751984534', github: 'https://github.com/AndreiRech/Cerne' },
        media: [
          "/projects/cerne/screen1.png",
          "/projects/cerne/screen2.png",
          "/projects/cerne/screen3.png",
          "/projects/cerne/screen4.png",
          "/projects/cerne/screen5.png",
          "/projects/cerne/screen6.png",
        ],
        logoUrl: "/projects/cerne/logo.png",
        cardImageUrl: "/projects/cerne/card.png",
        orientation: 'vertical',
        team: [
          { name: 'Vinicius Cadore', role: 'UX/UI Designer', linkedinUrl: 'https://www.linkedin.com/in/cadoreee/' },
          { name: 'Richard Rodrigues', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/richardsros/' },
          { name: 'Maria Eduarda Santellano', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/mariaeduardasantellano/' },
          { name: 'Gabriel Kowaleski', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/gabriel-kowaleski/' },
          { name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' },
        ]
      },

      // Dirty Dogs
      {
        id: 'dirtydogs',
        name: 'Dirty Dogs',
        category: 'iOS',
        date: '2025',
        awards: [],
        shortDescription: <>The Fastest, Furriest Duel on the Yard</>,
        description: <>Dirty Dogs is a real-time local competitive game where two players control digging dogs competing to find a bone. The game let the players throw wacky itens outside the phone to mess with the other player, beeing required to use different methods to stop their actions: shaking the phone, blow the microphone and a lot more! Challenge yours friends in fast duels and be the dirtiest dog of them all! </>,
        technologies: ['SpriteKit', 'GameplayKit', 'GameCenter', 'ECS'],
        roles: ['iOS Developer', 'Project Owner'],
        detailedRole: <>
          Contributed to the smoothness of the development acting as a PO, prioritizing tasks and helping the team with difficult features. <br/>
          Defined the architecture of the application, using ECS + MVVM patterns. Created all the communication inter-device using GameCenter, factory pattern and DTOs. <br/>
          Implemented the game physics using SpriteKit and GameplayKit, creating a smooth and responsive gameplay. <br/>
          Created the Game Design Document, defining the game mechanics, features, and overall vision. <br/>
        </>,
        links: { appStore: 'https://apps.apple.com/ch/app/dirty-dogs-duel-on-the-yard/id6756587971', github: 'https://github.com/AndreiRech/DirtyDogs', other: ['GDD', 'https://docs.google.com/document/d/1yqepSgL-H29Fz9zC_o1Q6KzFwwIlxHzSCJSqnD_Qc_o/edit?usp=sharing'] },
        media: [
          "/projects/dirtydogs/screen1.png",
          "/projects/dirtydogs/screen2.png",
          "/projects/dirtydogs/screen3.png",
          "/projects/dirtydogs/screen4.png",
          "/projects/dirtydogs/screen5.png",
          "/projects/dirtydogs/screen6.png",
        ],
        logoUrl: "/projects/dirtydogs/logo.png",
        cardImageUrl: "/projects/dirtydogs/card.png",
        orientation: 'vertical',
        team: [
          { name: 'Pedro Kosciuk Lima', role: 'UX/UI Designer', linkedinUrl: 'https://www.linkedin.com/in/pedro-kosciuk-lima-a29855207/' },
          { name: 'Julia Fazenda Ruiz', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/julia-fazenda-ruiz/' },
          { name: 'Isadora Ferreira Guerra', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/isadoraferreiraguerra/' },
          { name: 'Eduardo Ferrari', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/edurferrari/' },
          { name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' },
        ]
      },

      // Tower of the Winds
      {
        id: 'totw',
        name: 'Tower of the Winds',
        category: 'iOS',
        date: '2026',
        awards: [],
        shortDescription: <>Reach the top of the tower using the power of the winds.</>,
        description: <>
          Tower of the Winds is a 2D puzzle and against-time game where the player is a small cat that needs to reach the top of a tower by using the power of the Anemois. Reach the top of the tower as quickly as possible, discover the secrets of the winds and what the little cat wishes for his last time! <br/>
        </>,
        technologies: ['GameplayKit', 'SpriteKit', 'SKTile', 'GameCenter'],
        roles: ['iOS Developer'],
        detailedRole: <>
          Defined the architecture of the application, using ECS + SKTiles to define the map and entities. <br/>
          Implemented the game physics using SpriteKit and GameplayKit, creating a smooth and responsive gameplay. <br/>
          Implemented the GameCenter integration, allowing players to compete with each other with a global rank, achievements and leaderboards. <br/>
        </>,
        links: { github: 'https://github.com/camana98/WindSolveGame' },
        logoUrl: "/projects/totw/logo.png",
        cardImageUrl: "/projects/totw/card.png",
        orientation: 'vertical',
        media: [
          "/projects/totw/screen1.png",
          "/projects/totw/screen2.png",
          "/projects/totw/screen3.png",
          "/projects/totw/screen4.png",
          "/projects/totw/screen5.png",
        ],
        team: [
          { name: 'Rafael Julianotte', role: 'UX/UI Designer', linkedinUrl: 'https://www.linkedin.com/in/rafajulianotte/' },
          { name: 'Eduardo Fensterseifer', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/eduardo-fensterseifer/' },
          { name: 'Eduardo Camana', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/eduardocamana/' },
          { name: 'Carolina Silva dos Santos', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/carolina-silva-dos-santos-a320111a7/' },
          { name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' },
        ]
      },

      // Clairfy
      {
        id: 'clairfy',
        name: 'Clairfy',
        category: 'iOS',
        date: '2025',
        awards: [{ long: 'Tecnopuc Garage 2025 Finalist', short: 'Tecnopuc Finalist'}],
        shortDescription: <>Focus on the patient. We'll take care of the rest.</>,
        description: <>
        Clairfy transform the way doctors and patients deal with medical consultation information. With just one tap, the app records the medical consultation conversation, processes the content with artificial intelligence and generates a structured and clear summary of the main points discussed, such as symptoms, diagnoses and recommended conducts. <br/>
        Ideal for health professionals who want to better record their consultations and for patients who seek to understand and retain the information received.<br/>
        </>,
        technologies: ['UIKit', 'AI APIs', 'REST APIs', 'MVC'],
        roles: ['iOS Developer', 'Tech Lead'],
        detailedRole: <>
          Defined the architecture of the application, using MVC patterns. <br/>
          Built an API to connect with the AI models, processing the audio and returning the summary. Implemented encryption to protect the data. <br/>
          Helped the team with the development of the application, providing guidance and support about technologies, architecture and GIT. <br/>
        </>,
        links: { appStore: 'https://apps.apple.com/br/app/clairfy/id6747406139', github: 'https://github.com/AndreiRech/Clairfy', live: 'https://clairfy.netlify.app/' },
        logoUrl: "/projects/clairfy/logo.png",
        cardImageUrl: "/projects/clairfy/card.png",
        orientation: 'vertical',
        media: [
          "/projects/clairfy/screen1.png",
          "/projects/clairfy/screen2.png",
          "/projects/clairfy/screen3.png",
          "/projects/clairfy/screen4.png",
          "/projects/clairfy/screen5.png",
        ],
        team: [
          { name: 'Leonardo Simon', role: 'UX/UI Designer', linkedinUrl: 'https://www.linkedin.com/in/leonardosimon/' },
          { name: 'Bernardo Fensterseifer', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/bernardofens/' },
          { name: 'Pablo Garcia', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/pablogarciadev/' },
          { name: 'Eduardo Ferrari', role: 'iOS Developer', linkedinUrl: 'https://www.linkedin.com/in/edurferrari/' },
          { name: 'Andrei Rech', role: 'iOS Developer', linkedinUrl: 'https://linkedin.com/in/rechandrei' },
        ]
      },
    ],
    pt: [
      // Hearme
    ]
  };

  return data[locale];
};