import awards from "./awards.json" with { type: "json" };
import { answerKey, type Theme } from "../model/rarity.ts";

export const AWARD_THEMES: Theme[] = [
  {
    name: "Bandas que ganharam Grammy",
    answers: awards.bands.map((band) => ({
      name: band.name,
      points: band.points,
      keys: [answerKey(band.name)],
    })),
  },
  {
    name: "Filmes premiados pelo Oscar",
    answers: awards.films.map((film) => ({
      name: film.name,
      points: film.points,
      keys: [...new Set([film.name, film.english].map(answerKey))],
    })),
  },
];
