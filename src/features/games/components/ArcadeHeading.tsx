"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCollection } from "@/features/collectibles/hooks/CollectionContext";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";

export const GAME_ACTIVITIES = [
  "memory",
  "songs",
  "anime",
  "duel",
  "companions",
] as const;
export type GameActivity = (typeof GAME_ACTIVITIES)[number];
type ArcadePage = GameActivity | "cases" | "inventory";

const activityHref = (id: GameActivity) =>
  id === "memory" ? "/games" : `/games?activity=${id}`;

/** Every games tab shares one bar and one centred title with no subtitle. */
export default function ArcadeHeading({ page }: { page: ArcadePage }) {
  const { saved } = useCollection();
  const { copy: c, language } = useSettings();
  const play = playCopy[language];
  const nav = useRef<HTMLElement>(null);
  // On narrow screens the tab strip scrolls; keep the current tab in view.
  useEffect(() => {
    const strip = nav.current;
    const current = strip?.querySelector<HTMLElement>("[aria-current]");
    if (!strip || !current || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollLeft =
      current.offsetLeft -
      strip.offsetLeft -
      (strip.clientWidth - current.offsetWidth) / 2;
  }, [page]);
  const isGame = (GAME_ACTIVITIES as readonly string[]).includes(page);
  const labels: Record<ArcadePage, string> = {
    memory: play.memoryTab,
    songs: play.songsTab,
    anime: play.animeTab,
    duel: play.duelTab,
    companions: play.companionTab,
    cases: c.boxes,
    inventory: c.inventory,
  };
  const tabs = [
    ...GAME_ACTIVITIES.map((id) => ({ id, href: activityHref(id) })),
    { id: "cases" as const, href: "/cases" },
    { id: "inventory" as const, href: "/inventory" },
  ];
  return (
    <>
      <div className="arcade-bar">
        <Link href={isGame ? "/#games" : "/games"} className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          {isGame ? c.back : c.gamesBack}
        </Link>
        <nav ref={nav} className="arcade-tabs" aria-label={c.games}>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={page === tab.id ? "page" : undefined}
            >
              {labels[tab.id]}
            </Link>
          ))}
        </nav>
      </div>
      <div className="page-heading arcade-heading">
        <h1>{labels[page]}.</h1>
      </div>
      {!saved ? (
        <p className="storage-warning" role="status">
          {c.storageUnavailable}
        </p>
      ) : null}
    </>
  );
}
