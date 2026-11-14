"use client";
import { MODES } from "../termo/model/modes";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
  "minesweeper",
  "color",
  "scale",
  "companions",
] as const;
export type GameActivity = (typeof GAME_ACTIVITIES)[number];
type ArcadePage = GameActivity | "cases" | "inventory";

/** Games that share one tab, with a second strip to pick among them. */
export const GAME_GROUPS = {
  daily: ["termo", "conexo", "crossword", "rarity", "color", "scale"],
} as const satisfies Record<string, readonly GameActivity[]>;
type GameGroup = keyof typeof GAME_GROUPS;
/** Unlimited games whose daily challenge (`mode=daily`) sits in the daily strip. */
export const DAILY_MODE_GAMES = ["songs", "higher-lower"] as const;
const hasDailyMode = (page: ArcadePage) =>
  (DAILY_MODE_GAMES as readonly string[]).includes(page);
const groupOf = (page: ArcadePage) =>
  (Object.keys(GAME_GROUPS) as GameGroup[]).find((group) =>
    (GAME_GROUPS[group] as readonly string[]).includes(page),
  );

type Tab = { kind: "page"; id: ArcadePage } | { kind: "group"; id: GameGroup };
/** Collection, daily games and the unlimited games share one navigation. */
const TABS: Tab[] = [
  { kind: "page", id: "cases" },
  { kind: "page", id: "inventory" },
  { kind: "page", id: "companions" },
  { kind: "group", id: "daily" },
  { kind: "page", id: "songs" },
  { kind: "page", id: "higher-lower" },
  { kind: "page", id: "sudoku" },
  { kind: "page", id: "minesweeper" },
  { kind: "page", id: "duel" },
  { kind: "page", id: "memory" },
];

const pageHref = (id: ArcadePage) =>
  id === "cases" || id === "inventory"
    ? `/${id}`
    : id === "memory"
      ? "/games?activity=memory"
      : `/games?activity=${id}`;

/** Every games tab shares one bar and one centred title with no subtitle. */
export default function ArcadeHeading({
  page,
  mode = "classic",
}: {
  page: ArcadePage;
  mode?: string;
}) {
  const selectedMode = MODES.find((value) => value === mode) ?? "classic";
  const { saved } = useCollection();
  const { copy: c, language } = useSettings();
  const play = playCopy[language];
  const dailyMode = hasDailyMode(page) && mode === "daily";
  const group = dailyMode ? "daily" : groupOf(page);
  const [dailyOpen, setDailyOpen] = useState(Boolean(group));
  const labels: Record<ArcadePage, string> = {
    memory: play.memoryTab,
    songs: play.songsTab,
    "higher-lower": play.animeTab,
    duel: play.duelTab,
    termo:
      selectedMode === "classic"
        ? play.termoTab
        : play.termoModes[selectedMode],
    conexo: play.conexoTab,
    crossword: play.cwTab,
    rarity: play.rarityTab,
    sudoku: play.sudokuTab,
    minesweeper: language === "pt" ? "Campo minado" : "Minesweeper",
    color: language === "pt" ? "Cores" : "Color",
    scale: language === "pt" ? "Escala" : "Size it up",
    companions: play.companionTab,
    cases: c.boxes,
    inventory: c.inventory,
  };
  const groupLabels: Record<GameGroup, string> = {
    daily: play.dailyGamesTab,
  };
  return (
    <>
      <div className="arcade-navigation">
        <nav className="arcade-subtabs arcade-primary" aria-label={c.games}>
          {TABS.map((tab) =>
            tab.kind === "page" ? (
              <Link
                key={tab.id}
                href={pageHref(tab.id)}
                aria-current={
                  page === tab.id && !dailyMode ? "page" : undefined
                }
                onClick={() => setDailyOpen(false)}
              >
                {labels[tab.id]}
              </Link>
            ) : (
              <button
                key={tab.id}
                aria-current={group === tab.id ? "true" : undefined}
                aria-expanded={dailyOpen}
                aria-controls={dailyOpen ? "daily-games-menu" : undefined}
                onClick={() => setDailyOpen((open) => !open)}
              >
                {groupLabels[tab.id]}
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            ),
          )}
        </nav>
        {dailyOpen ? (
          <nav
            id="daily-games-menu"
            className="arcade-subtabs arcade-daily"
            aria-label={groupLabels.daily}
          >
            {GAME_GROUPS.daily.flatMap((id) =>
              id === "termo"
                ? MODES.map((termMode) => (
                    <Link
                      key={termMode}
                      href={`/games?activity=termo&mode=${termMode}`}
                      aria-current={
                        page === "termo" && selectedMode === termMode
                          ? "page"
                          : undefined
                      }
                    >
                      {termMode === "classic"
                        ? play.termoTab
                        : play.termoModes[termMode]}
                    </Link>
                  ))
                : [
                    <Link
                      key={id}
                      href={pageHref(id)}
                      aria-current={page === id ? "page" : undefined}
                    >
                      {labels[id]}
                    </Link>,
                  ],
            )}
            {DAILY_MODE_GAMES.map((id) => (
              <Link
                key={`${id}-daily`}
                href={`/games?activity=${id}&mode=daily`}
                aria-current={page === id && dailyMode ? "page" : undefined}
              >
                {labels[id]}
              </Link>
            ))}
          </nav>
        ) : null}
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
