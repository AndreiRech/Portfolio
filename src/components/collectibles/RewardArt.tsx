import Image from "next/image";
import { PALETTE_SWATCHES, type Reward } from "@/data/collectibles";
export default function RewardArt({ reward }: { reward: Reward }) {
  if (reward.kind === "palette")
    return (
      <div className="palette-art" aria-hidden="true">
        {PALETTE_SWATCHES[reward.id].map((color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ))}
      </div>
    );
  return (
    <Image
      src={`/collectibles/${reward.kind === "cursor" ? "cursors" : "companions"}/${reward.id}.${reward.kind === "cursor" || reward.id === "medallion" ? "svg" : "webp"}`}
      width={100}
      height={100}
      alt=""
      className={`${reward.kind}-art`}
    />
  );
}
