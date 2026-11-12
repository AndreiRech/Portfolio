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
  "higher-lower",
  "duel",
  "termo",
  "conexo",
  "crossword",
  "rarity",
  "sudoku",
  "companions",
] as const;
export type GameActivity = (typeof GAME_ACTIVITIES)[number];
type ArcadePage = GameActivity | "cases" | "inventory";

/** Games that share one tab, with a second strip to pick among them. */
export const GAME_GROUPS = {
  daily: ["termo", "conexo", "crossword", "rarity", "sudoku"],
  infinite: ["songs", "higher-lower"],
} as const satisfies Record<string, readonly GameActivity[]>;
type GameGroup = keyof typeof GAME_GROUPS;
const groupOf = (page: ArcadePage) =>
  (Object.keys(GAME_GROUPS) as GameGroup[]).find((group) =>
    (GAME_GROUPS[group] as readonly string[]).includes(page),
  );

type Tab = { kind: "page"; id: ArcadePage } | { kind: "group"; id: GameGroup };
/** Top strip order: collection first, then games, the classics last. */
const TABS: Tab[] = [
  { kind: "page", id: "cases" },
  { kind: "page", id: "inventory" },
  { kind: "page", id: "companions" },
  { kind: "group", id: "daily" },
  { kind: "group", id: "infinite" },
  { kind: "page", id: "duel" },
  { kind: "page", id: "memory" },
];

const pageHref = (id: ArcadePage) =>
  id === "cases" || id === "inventory"
    ? `/${id}`
    : id === "memory"
      ? "/games"
      : `/games?activity=${id}`;

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
    "higher-lower": play.animeTab,
    duel: play.duelTab,
    termo: play.termoTab,
    conexo: play.conexoTab,
    crossword: play.cwTab,
    rarity: play.rarityTab,
    sudoku: play.sudokuTab,
    companions: play.companionTab,
    cases: c.boxes,
    inventory: c.inventory,
  };
  const groupLabels: Record<GameGroup, string> = {
    daily: play.dailyGamesTab,
    infinite: play.infiniteGamesTab,
  };
  const group = groupOf(page);
  return (
    <>
      <div className="arcade-bar">
        <Link href={isGame ? "/#games" : "/games"} className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          {isGame ? c.back : c.gamesBack}
        </Link>
        <nav ref={nav} className="arcade-tabs" aria-label={c.games}>
          {TABS.map((tab) =>
            tab.kind === "page" ? (
              <Link
                key={tab.id}
                href={pageHref(tab.id)}
                aria-current={page === tab.id ? "page" : undefined}
              >
                {labels[tab.id]}
              </Link>
            ) : (
              <Link
                key={tab.id}
                href={pageHref(GAME_GROUPS[tab.id][0])}
                aria-current={group === tab.id ? "true" : undefined}
              >
                {groupLabels[tab.id]}
              </Link>
            ),
          )}
        </nav>
      </div>
      {group ? (
        <nav className="arcade-subtabs" aria-label={groupLabels[group]}>
          {GAME_GROUPS[group].map((id) => (
            <Link
              key={id}
              href={pageHref(id)}
              aria-current={page === id ? "page" : undefined}
            >
              {labels[id]}
            </Link>
          ))}
        </nav>
      ) : null}
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
