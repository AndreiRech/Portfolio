"use client";
import { useSettings } from "@/shared/i18n/SettingsContext";
import PixelLetters, {
  animatePixelLetter,
} from "../../../shared/ui/PixelLetters";

export default function HeroName() {
  const { copy: c } = useSettings();
  return (
    <h1 aria-label="Andrei Rech">
      <button
        className="hero-name name-interaction"
        aria-label={`Andrei Rech. ${c.animateName}`}
        onClick={(event) => {
          if (event.detail === 0)
            animatePixelLetter(
              event.currentTarget.querySelector(".pixel-letter"),
            );
        }}
      >
        <span className="hero-name-line">
          <PixelLetters text="Andrei" />
        </span>{" "}
        <span className="hero-name-line hero-name-surname">
          <PixelLetters text="Rech" offset={6} />
          <span className="hero-period">
            <PixelLetters text="." offset={10} />
          </span>
        </span>
      </button>
    </h1>
  );
}
