import Image from "next/image";
import {
  PALETTE_SWATCHES,
  type Reward,
} from "@/features/collectibles/data/collectibles";
import PixelPet, {
  hasPixelPet,
} from "@/features/companions/components/PixelPet";
export default function RewardArt({ reward }: { reward: Reward }) {
  if (reward.kind === "palette")
    return (
      <div className="palette-art" aria-hidden="true">
        {PALETTE_SWATCHES[reward.id].map((color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ))}
      </div>
    );
  // Every companion is pixel art drawn in code; cursors stay SVG files.
  if (reward.kind === "companion" || hasPixelPet(reward.id))
    return <PixelPet id={reward.id} className="companion-art" />;
  return (
    <Image
      src={`/collectibles/cursors/${reward.id}.svg`}
      width={100}
      height={100}
      alt=""
      className={`${reward.kind}-art`}
    />
  );
}
