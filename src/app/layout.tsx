import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import "./interactions.css";
import "./hero.css";
import "./polish.css";
import "./games.css";
import "./daily.css";
import { SettingsProvider } from "@/shared/i18n/SettingsContext";
import { CollectionProvider } from "@/features/collectibles/hooks/CollectionContext";
import Navbar from "@/layouts/site/Navbar";
import Footer from "@/layouts/site/Footer";
import { CompanionProvider } from "@/features/companions/hooks/CompanionContext";
import CompanionDock from "@/features/companions/components/CompanionDock";
import PixelFeedback from "@/shared/ui/PixelFeedback";
import EasterEggs from "@/features/achievements/components/EasterEggs";
import { AchievementProvider } from "@/features/achievements/hooks/AchievementContext";
const pixel = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});
const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});
const description =
  "Portfolio of Andrei Rech, iOS and Fullstack Developer and Swift Student Challenge 2026 winner. Apps, games and a few side quests.";
export const metadata: Metadata = {
  metadataBase: new URL("https://andreirech.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Andrei Rech",
    title: "Andrei Rech | iOS & Fullstack",
    description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Andrei Rech" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andrei Rech | iOS & Fullstack",
    description,
    images: ["/og.png"],
  },
  title: {
    default: "Andrei Rech | iOS & Fullstack",
    template: "%s | Andrei Rech",
  },
  description,
};
export const viewport: Viewport = { themeColor: "#1c1d1f" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${pixel.variable} ${body.variable}`}
    >
      <body>
        <SettingsProvider>
          <AchievementProvider>
            <CollectionProvider>
              <CompanionProvider>
                <Navbar />
                {children}
                <Footer />
                <CompanionDock />
                <PixelFeedback />
                <EasterEggs />
              </CompanionProvider>
            </CollectionProvider>
          </AchievementProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
