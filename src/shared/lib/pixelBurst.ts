type BurstOptions = {
  count?: number;
  distance?: number;
  size?: number;
  colors?: readonly string[];
  duration?: number;
};

/** Scatters short-lived pixels from a viewport point inside the shared
    feedback layer. Does nothing under reduced motion or before the layer mounts. */
export function pixelBurst(
  x: number,
  y: number,
  {
    count = 16,
    distance = 110,
    size = 8,
    colors = ["var(--accent)", "var(--blue)", "var(--fg)"],
    duration = 700,
  }: BurstOptions = {},
) {
  const layer = document.querySelector<HTMLElement>(".pixel-feedback");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  for (let index = 0; index < count; index++) {
    const pixel = document.createElement("i");
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.5;
    const reach = distance * (0.45 + Math.random() * 0.55);
    pixel.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[index % colors.length]}`;
    layer.appendChild(pixel);
    const animation = pixel.animate(
      [
        { transform: "translate(0, 0)", opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach - 30}px)`,
          opacity: 1,
          offset: 0.6,
        },
        {
          transform: `translate(${Math.cos(angle) * reach * 1.1}px, ${Math.sin(angle) * reach + 40}px)`,
          opacity: 0,
        },
      ],
      { duration, easing: "steps(10, end)" },
    );
    const remove = () => pixel.remove();
    animation.onfinish = remove;
    animation.oncancel = remove;
  }
}
