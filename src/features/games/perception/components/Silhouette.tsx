import type { Shape } from "../model/perception";
const ASPECTS: Record<Shape, number> = {
  giraffe: 0.761585,
  elephant: 1.426508,
  cat: 1.537476,
  human: 0.427276,
  bear: 0.635436,
  bottle: 0.32,
  door: 0.48,
  basketball: 1.0,
};
/** Height in scene units. The source geometry keeps its original aspect ratio. */
export default function Silhouette({
  shape,
  height,
  x,
  ghost = false,
}: {
  shape: Shape;
  height: number;
  x: number;
  ghost?: boolean;
}) {
  const width = height * ASPECTS[shape];
  return (
    <g
      aria-hidden="true"
      className={ghost ? "size-silhouette size-ghost" : "size-silhouette"}
    >
      <use
        href={`/games/scale-silhouettes.svg#${shape}`}
        x={x - width / 2}
        y={256 - height}
        width={width}
        height={height}
      />
    </g>
  );
}
