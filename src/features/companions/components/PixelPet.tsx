import {
  PET_SPRITES,
  type PetFrames,
} from "@/features/companions/data/petSprites";
import PixelFrame from "../../../shared/ui/PixelFrame";

/** 3 × 5 digits for the number on a die's front face. */
const DIGITS: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", ".##", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
};
const FRAMES: (keyof PetFrames)[] = ["idle", "blink", "walkA", "walkB"];

export const hasPixelPet = (id: string) => id in PET_SPRITES;

/**
 * A companion drawn as real pixel art. Every frame is in the SVG and CSS
 * shows one at a time: blinking while idle, stepping while walking.
 */
export default function PixelPet({
  id,
  face,
  className,
}: {
  id: string;
  face?: number;
  className?: string;
}) {
  const sprite = PET_SPRITES[id];
  if (!sprite) return null;
  const size = sprite.frames.idle.length;
  const digits = face === undefined ? [] : String(face).split("");
  const width = digits.length * 4 - 1;
  const left = 12 - Math.ceil(width / 2);
  return (
    <svg
      className={["pixel-pet", className].filter(Boolean).join(" ")}
      data-pet={id}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {FRAMES.map((frame) => (
        <PixelFrame
          key={frame}
          rows={sprite.frames[frame]}
          palette={sprite.palette}
          className={`pet-frame frame-${frame}`}
        />
      ))}
      {digits.map((digit, index) => (
        <PixelFrame
          key={`${index}-${digit}`}
          rows={DIGITS[digit].map((row) => row.replace(/#/g, "n"))}
          palette={sprite.palette}
          x={left + index * 4}
          y={12}
        />
      ))}
    </svg>
  );
}
