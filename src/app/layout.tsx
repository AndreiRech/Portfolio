// src/app/layout.tsx
import type { Metadata } from 'next';
import { Big_Shoulders_Stencil, Literata } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import CustomCursor from '@/components/CustomCursor';

const bigShouldersStencil = Big_Shoulders_Stencil({
  // Pinned heavy: Archivo Black was intrinsically black at weight 400, so
  // headings that only set `font-family` (e.g. Navbar) would otherwise
  // render in this family's regular weight and read lighter, not bolder.
  weight: '800',
  subsets: ['latin'],
  variable: '--font-big-shoulders-stencil',
  display: 'swap',
  // Next has no fallback metrics for this family, so pick condensed
  // fallbacks by hand instead of letting it warn on every build.
  adjustFontFallback: false,
  fallback: ['Impact', 'Haettenschweiler', 'Arial Narrow', 'sans-serif'],
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
      className={`${bigShouldersStencil.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SettingsProvider>
          <CustomCursor />
          {children}
          
          {/* Footer */}
          <footer className="section-overlay py-3">
            <div className="section-container text-center text-sm text-smoke">
              <p>
                © {new Date().getFullYear()} Andrei Rech
              </p>
            </div>
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}