"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import SignGlyph, { SIGNS } from "@/features/games/memory/components/SignGlyph";

const signColor = (id: string) => SIGNS.find((sign) => sign.id === id)?.color;
import PixelPet from "@/features/companions/components/PixelPet";

export default function ExploreSection() {
  const { copy: c, language } = useSettings();
  const play = playCopy[language];
  return (
    <section id="games" className="section container games-invitation">
      <div className="section-heading">
        <div>
          <h2>
            {c.games}
            <span className="heading-dot">.</span>
          </h2>
          <p>{c.gamesIntro}</p>
        </div>
      </div>
      <div className="games-teasers">
        <Link
          href="/games?activity=memory"
          className="game-teaser teaser-memory"
        >
          <div className="teaser-art teaser-signs" aria-hidden="true">
            <span style={{ color: signColor("aard") }}>
              <SignGlyph id="aard" />
            </span>
            <span style={{ color: signColor("igni") }}>
              <SignGlyph id="igni" />
            </span>
            <span style={{ color: signColor("quen") }}>
              <SignGlyph id="quen" />
            </span>
          </div>
          <div className="teaser-copy">
            <h3>{play.memoryTab}</h3>
            <p>{c.memoryTeaser}</p>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
        </Link>
        <Link href="/cases" className="game-teaser teaser-cases">
          <div className="teaser-art">
            <Image
              className="teaser-crate"
              src="/collectibles/case.svg"
              width={240}
              height={180}
              alt=""
            />
          </div>
          <div className="teaser-copy">
            <h3>{c.boxes}</h3>
            <p>{c.casesTeaser}</p>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
        </Link>
        <Link
          href="/games?activity=companions"
          className="game-teaser teaser-companions"
        >
          <div className="teaser-art teaser-pets">
            <PixelPet id="chicken" className="teaser-pet-chicken" />
            <PixelPet id="d20" face={20} className="teaser-pet-dice" />
          </div>
          <div className="teaser-copy">
            <h3>{play.companionTab}</h3>
            <p>{c.companionsTeaser}</p>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
        </Link>
      </div>
      <nav className="more-games" aria-label={play.moreGames}>
        <span>{play.moreGames}:</span>
        {(
          [
            ["termo", play.termoTab],
            ["conexo", play.conexoTab],
            ["crossword", play.cwTab],
            ["rarity", play.rarityTab],
            ["sudoku", play.sudokuTab],
            ["minesweeper", language === "pt" ? "Campo minado" : "Minesweeper"],
            ["color", language === "pt" ? "Cores" : "Color"],
            ["scale", language === "pt" ? "Escala" : "Size it up"],
            ["songs", play.songsTab],
            ["higher-lower", play.animeTab],
            ["duel", play.duelTab],
          ] as const
        ).map(([id, label]) => (
          <Link key={id} href={`/games?activity=${id}`}>
            {label}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
