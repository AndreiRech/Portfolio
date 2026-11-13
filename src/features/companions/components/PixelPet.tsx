import {
  FACES_LEFT,
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
const FRAMES: (keyof PetFrames)[] = [
  "idle",
  "blink",
  "walkA",
  "walkB",
  "walkC",
  "walkD",
];

export const hasPixelPet = (id: string) => id in PET_SPRITES;

/**
 * A companion drawn as real pixel art. Every frame is in the SVG and CSS
 * shows one at a time: blinking while idle, stepping while walking. Pets with
 * four walk frames (`data-steps="4"`) play a full four-beat cycle.
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
      data-steps={sprite.frames.walkC ? 4 : 2}
      data-facing={FACES_LEFT.has(id) ? "left" : undefined}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {FRAMES.map((frame) => {
        const rows = sprite.frames[frame];
        return rows ? (
          <PixelFrame
            key={frame}
            rows={rows}
            palette={sprite.palette}
            className={`pet-frame frame-${frame}`}
          />
        ) : null;
      })}
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
