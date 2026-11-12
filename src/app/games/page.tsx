import type { Metadata } from "next";
import { Suspense } from "react";
import Playground from "@/features/games/pages/GamesPage";

export const metadata: Metadata = {
  title: "Games",
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return (
    <main id="main" className="inner-page container">
      <Suspense
        fallback={
          <div
            className="game-loading"
            aria-busy="true"
            aria-label="Loading games"
          />
        }
      >
        <Playground />
      </Suspense>
    </main>
  );
}
