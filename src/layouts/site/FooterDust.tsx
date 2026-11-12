"use client";
import { useEffect, useRef, type RefObject } from "react";

/** Grains kept at once; the oldest settled grain makes room for a new one. */
const MAX_GRAINS = 650;
const GRAVITY = 0.22;
const MAX_FALL = 9;
const PUSH_RADIUS = 56;
const COLOR_TOKENS = ["--fg", "--fg", "--muted", "--accent", "--blue"];
const FIXED_COLORS = ["#eac67d", "#c09aef", "#93c9ed"];

type Grain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  landed: boolean;
};

/**
 * Pixels rain over the footer signature and pile up on its letters like sand;
 * moving the pointer through them scatters the pile. The collision mask is
 * rendered from the signature's own glyphs, so it follows font and layout.
 * Runs only while visible and never under reduced motion.
 */
export default function FooterDust({
  target,
}: {
  target: RefObject<HTMLElement | null>;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = host.current;
    const signature = target.current;
    const footer = stage?.closest("footer");
    if (!stage || !signature || !footer) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("2d");
    if (!context) return;
    stage.append(canvas);

    const grains: Grain[] = [];
    const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0 };
    let grid = new Uint8Array(0); // 0 empty, 1 letter, 2 settled grain
    let cell = 4;
    let columns = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let originX = 0;
    let originY = 0;
    let palette = FIXED_COLORS;
    let visible = false;
    let running = false;
    let frame = 0;
    let request = 0;

    const column = (x: number) => Math.floor((x - originX) / cell);
    const row = (y: number) => Math.floor((y - originY) / cell);
    // Sides are walls; above and below the stage are open.
    const solid = (c: number, r: number) =>
      c < 0 || c >= columns
        ? true
        : r >= 0 && r < rows && grid[r * columns + c] > 0;
    const mark = (grain: Grain, value: number) => {
      const c = column(grain.x);
      const r = row(grain.y);
      if (c >= 0 && c < columns && r >= 0 && r < rows)
        grid[r * columns + c] = value;
    };
    const land = (grain: Grain, c: number, r: number) => {
      grain.x = originX + c * cell;
      grain.y = originY + r * cell;
      grain.vx = 0;
      grain.vy = 0;
      grain.landed = true;
      mark(grain, 2);
    };
    const lift = (grain: Grain) => {
      if (!grain.landed) return;
      mark(grain, 0);
      grain.landed = false;
    };

    function readPalette() {
      const style = getComputedStyle(document.documentElement);
      palette = [
        ...COLOR_TOKENS.map((token) => style.getPropertyValue(token).trim()),
        ...FIXED_COLORS,
      ].filter(Boolean);
    }

    function build() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const box = stage!.getBoundingClientRect();
      width = Math.round(box.width);
      height = Math.round(box.height);
      if (!width || !height) return;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);

      const style = getComputedStyle(signature!);
      const fontSize = parseFloat(style.fontSize);
      cell = Math.max(3, Math.round(fontSize / 50));
      const mask = document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
      });
      if (!mask) return;
      mask.canvas.width = width;
      mask.canvas.height = height;
      mask.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = mask.measureText("a");
      const ascent = metrics.fontBoundingBoxAscent;
      const glyphHeight = ascent + metrics.fontBoundingBoxDescent;
      // The outer letter spans keep a stable box while glyphs animate.
      signature!
        .querySelectorAll<HTMLElement>(".pixel-letter")
        .forEach((letter) => {
          const rect = letter.getBoundingClientRect();
          mask.fillText(
            letter.textContent ?? "",
            rect.left - box.left,
            rect.top - box.top + (rect.height - glyphHeight) / 2 + ascent,
          );
        });
      const pixels = mask.getImageData(0, 0, width, height).data;
      let minX = width;
      let minY = height;
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
          if (pixels[(y * width + x) * 4 + 3] > 128) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
          }
      // Align the grain grid to the font's pixels so piles sit flush on top.
      originX = minX < width ? minX % cell : 0;
      originY = minY < height ? minY % cell : 0;
      columns = Math.ceil((width - originX) / cell);
      rows = Math.ceil((height - originY) / cell);
      grid = new Uint8Array(columns * rows);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < columns; c++) {
          const x = Math.min(
            width - 1,
            Math.floor(originX + c * cell + cell / 2),
          );
          const y = Math.min(
            height - 1,
            Math.floor(originY + r * cell + cell / 2),
          );
          if (pixels[(y * width + x) * 4 + 3] > 128) grid[r * columns + c] = 1;
        }
      grains.length = 0;
      readPalette();
    }

    function spawn() {
      if (grains.length >= MAX_GRAINS) {
        const oldest = grains.findIndex((grain) => grain.landed);
        if (oldest < 0) return;
        mark(grains[oldest], 0);
        grains.splice(oldest, 1);
      }
      grains.push({
        x: Math.random() * (width - cell),
        y: -cell,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 1.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        landed: false,
      });
    }

    function fall(grain: Grain) {
      grain.vy = Math.min(grain.vy + GRAVITY, MAX_FALL);
      grain.vx *= 0.995;
      // Sub-steps keep fast grains from tunnelling through thin strokes.
      const steps =
        Math.ceil(
          Math.max(Math.abs(grain.vx), Math.abs(grain.vy)) / (cell / 2),
        ) || 1;
      for (let step = 0; step < steps; step++) {
        const c = column(grain.x);
        const r = row(grain.y);
        let nextX = grain.x + grain.vx / steps;
        const nextY = grain.y + grain.vy / steps;
        if (nextX < 0 || nextX > width - cell) {
          nextX = Math.max(0, Math.min(width - cell, nextX));
          grain.vx = -grain.vx * 0.6;
        }
        const nextC = column(nextX);
        const nextR = row(nextY);
        if (nextC !== c && solid(nextC, r)) {
          grain.vx = -grain.vx * 0.4;
          continue;
        }
        if (nextR > r && solid(nextC, nextR)) {
          const sides =
            grain.vx === 0
              ? Math.random() < 0.5
                ? [-1, 1]
                : [1, -1]
              : [Math.sign(grain.vx), -Math.sign(grain.vx)];
          const side = sides.find(
            (offset) =>
              !solid(nextC + offset, nextR) && !solid(nextC + offset, r),
          );
          if (side !== undefined) {
            grain.x = originX + (nextC + side) * cell;
            grain.y = originY + nextR * cell;
            grain.vx = side * Math.max(Math.abs(grain.vx), grain.vy * 0.45);
            grain.vy *= 0.55;
            continue;
          }
          if (grain.vy > 2.4) {
            grain.vy = -grain.vy * 0.3;
            grain.vx += (Math.random() - 0.5) * grain.vy;
            grain.y = originY + r * cell;
            continue;
          }
          land(grain, nextC, r);
          return;
        }
        grain.x = nextX;
        grain.y = nextY;
      }
    }

    // A settled grain slides off a slope or drops when its support is gone.
    function settle(grain: Grain) {
      const c = column(grain.x);
      const r = row(grain.y);
      if (!solid(c, r + 1)) return lift(grain);
      const first = Math.random() < 0.5 ? -1 : 1;
      for (const side of [first, -first])
        if (!solid(c + side, r + 1) && !solid(c + side, r)) {
          mark(grain, 0);
          land(grain, c + side, r + 1);
          return;
        }
    }

    function push(grain: Grain) {
      if (Math.hypot(pointer.vx, pointer.vy) < 0.6) return;
      const dx = grain.x - pointer.x;
      const dy = grain.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > PUSH_RADIUS) return;
      const force = 1 - distance / PUSH_RADIUS;
      lift(grain);
      grain.vx += pointer.vx * force * 0.35 + (dx / (distance || 1)) * force;
      grain.vy +=
        pointer.vy * force * 0.35 + (dy / (distance || 1)) * force - force;
    }

    function tick() {
      if (!running) return;
      frame++;
      if (frame % 2 === 0) spawn();
      if (frame % 120 === 0) readPalette();
      context!.clearRect(0, 0, width, height);
      for (let index = grains.length - 1; index >= 0; index--) {
        const grain = grains[index];
        push(grain);
        if (grain.landed) {
          if (frame % 3 === index % 3) settle(grain);
        } else {
          fall(grain);
          if (grain.y > height) {
            grains.splice(index, 1);
            continue;
          }
        }
        context!.fillStyle = grain.color;
        context!.fillRect(Math.round(grain.x), Math.round(grain.y), cell, cell);
      }
      pointer.vx *= 0.8;
      pointer.vy *= 0.8;
      request = requestAnimationFrame(tick);
    }

    function sync() {
      const shouldRun = visible && !motion.matches && width > 0;
      if (shouldRun && !running) {
        running = true;
        request = requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(request);
        if (motion.matches) {
          build();
          context!.clearRect(0, 0, width, height);
        }
      }
    }

    const move = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      if (pointer.x > -1e4) {
        pointer.vx = x - pointer.x;
        pointer.vy = y - pointer.y;
      }
      pointer.x = x;
      pointer.y = y;
    };
    const leave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
      pointer.vx = 0;
      pointer.vy = 0;
    };
    footer.addEventListener("pointermove", move);
    footer.addEventListener("pointerleave", leave);
    motion.addEventListener("change", sync);
    const resize = new ResizeObserver(() => {
      build();
      sync();
    });
    resize.observe(stage);
    const view = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    view.observe(stage);
    // The mask depends on the pixel font, which may finish loading later.
    let disposed = false;
    void document.fonts?.ready.then(() => {
      if (!disposed) build();
    });

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(request);
      footer.removeEventListener("pointermove", move);
      footer.removeEventListener("pointerleave", leave);
      motion.removeEventListener("change", sync);
      resize.disconnect();
      view.disconnect();
      canvas.remove();
    };
  }, [target]);

  return <div ref={host} className="footer-dust" aria-hidden="true" />;
}
