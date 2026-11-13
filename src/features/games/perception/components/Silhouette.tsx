import {
  spriteAspect,
  spriteFill,
  spriteOutline,
  type ScaleSprite,
} from "../model/pixelSilhouette";

const paths = new Map<string, { fill: string; outline: string }>();
function pathsFor(sprite: ScaleSprite) {
  let cached = paths.get(sprite.shape);
  if (!cached) {
    cached = {
      fill: spriteFill(sprite.art),
      outline: spriteOutline(sprite.art),
    };
    paths.set(sprite.shape, cached);
  }
  return cached;
}

export const aspectOf = (sprite: ScaleSprite) => spriteAspect(sprite.art);

/** Pixel art standing on the ground line, `height` scene units tall. */
export default function Silhouette({
  sprite,
  height,
  x,
  ghost = false,
}: {
  sprite: ScaleSprite;
  height: number;
  x: number;
  ghost?: boolean;
}) {
  const rows = sprite.art.length;
  const cols = sprite.art[0].length;
  const width = (height * cols) / rows;
  const { fill, outline } = pathsFor(sprite);
  return (
    <svg
      aria-hidden="true"
      className={ghost ? "size-silhouette size-ghost" : "size-silhouette"}
      x={x - width / 2}
      y={256 - height}
      width={width}
      height={height}
      viewBox={`0 0 ${cols} ${rows}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      overflow="visible"
    >
      <path d={fill} />
      {ghost ? <path d={outline} className="size-ghost-outline" /> : null}
    </svg>
  );
}
