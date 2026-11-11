import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import "./interactions.css";
import "./hero.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { CollectionProvider } from "@/context/CollectionContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CompanionProvider } from "@/context/CompanionContext";
import CompanionDock from "@/components/collectibles/CompanionDock";
import PixelFeedback from "@/components/interactions/PixelFeedback";
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
export const metadata: Metadata = {
  title: {
    default: "Andrei Rech | iOS & Fullstack",
    template: "%s | Andrei Rech",
  },
  description:
    "Portfolio of Andrei Rech, iOS and Fullstack Developer and Swift Student Challenge 2026 winner. Apps, games and a few side quests.",
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
          <CollectionProvider>
            <CompanionProvider>
              <Navbar />
              {children}
              <Footer />
              <CompanionDock />
              <PixelFeedback />
            </CompanionProvider>
          </CollectionProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
