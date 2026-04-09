// src/app/layout.tsx
import type { Metadata } from 'next';
import { Archivo_Black, Literata } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import CustomCursor from '@/components/CustomCursor';

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Andrei Rech',
  description:
    'Personal portfolio of Andrei Rech, a passionate iOS and Fullstack Developer crafting beautiful, performant digital experiences.',
    keywords: [
    'iOS Developer',
    'Fullstack Developer',
    'Swift',
    'React',
    'Next.js',
    'TypeScript',
    'Portfolio',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SettingsProvider>
          <CustomCursor />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}