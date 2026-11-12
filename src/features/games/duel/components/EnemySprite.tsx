/**
 * Hand-drawn 16-pixel-wide monsters for the duel. Each frame is a grid of
 * palette keys ("." is transparent). Frames named `alt` alternate while idle
 * and `attack` replaces the body while striking; CSS picks the visible one.
 */
import PixelFrame from "../../../../shared/ui/PixelFrame";

type Sprite = {
  palette: Record<string, string>;
  idle: string[];
  alt?: string[];
  attack?: string[];
};

const SPRITES: Record<string, Sprite> = {
  slime: {
    palette: {
      o: "#1d3b1f",
      g: "#58b947",
      l: "#a6e38a",
      k: "#10200f",
      w: "#ffffff",
    },
    idle: [
      "................",
      "................",
      "......oooo......",
      "....oollggoo....",
      "...olllggggo....",
      "..ollgggggggo...",
      "..oggggggggggo..",
      ".oggkwggggkwggo.",
      ".oggkkggggkkggo.",
      ".oggggggggggggo.",
      ".ogggggkkgggggo.",
      ".ogggggggggggggo",
      "..oooooooooooo..",
    ],
    attack: [
      "................",
      "......oooo......",
      "....oollggoo....",
      "...olllggggo....",
      "..ollgggggggo...",
      "..oggggggggggo..",
      ".oggkwggggkwggo.",
      ".oggkkggggkkggo.",
      ".ogggokkkkogggo.",
      ".ogggokllkogggo.",
      ".ogggggooggggggo",
      ".ogggggggggggggo",
      "..oooooooooooo..",
    ],
  },
  bat: {
    palette: {
      o: "#1c1424",
      a: "#6b4f87",
      w: "#3d2c52",
      r: "#ff5a5a",
      f: "#ffffff",
    },
    idle: [
      "o..............o",
      "oo............oo",
      "owo..........owo",
      "owwo.oo..oo.owwo",
      "owwwoaaooaaowwwo",
      "owwwwaaaaaawwwwo",
      ".owwaraaaarawwo.",
      ".owwwaaaaaawwwo.",
      "..owwafaafawwo..",
      "...ooaaaaaaoo...",
      ".....oaaaao.....",
      "......oooo......",
    ],
    alt: [
      "................",
      "................",
      "................",
      ".....oo..oo.....",
      "....oaaooaao....",
      "..ooaaaaaaaaoo..",
      ".owwaraaaarawwo.",
      "owwwaaaaaaaawwwo",
      "owwwaafaafaawwwo",
      "oww.oaaaaaao.wwo",
      "ow...oaaaao...wo",
      "o.....oooo.....o",
    ],
  },
  skeleton: {
    palette: { o: "#2a2a30", b: "#e8e4d6", s: "#b9b3a1", k: "#121214" },
    idle: [
      ".....oooooo.....",
      "....obbbbbbo....",
      "...obbbbbbbbo...",
      "...obkkbbkkbo...",
      "...obkkbbkkbo...",
      "...obbbkkbbbo...",
      "....obbbbbbo....",
      "....obkbkbko....",
      ".....oooooo.....",
      "..obbo.bb.obbo..",
      "..ob.obssbo.bo..",
      "..ob..obbo..bo..",
      "..o...osso...o..",
      "......obbo......",
      ".....ob..bo.....",
      ".....oo..oo.....",
    ],
    attack: [
      ".....oooooo.....",
      "....obbbbbbo....",
      "...obbbbbbbbo...",
      "...obkkbbkkbo...",
      "...obkkbbkkbo...",
      "...obbbkkbbbo...",
      "....obbbbbbo....",
      "....okkkkkko....",
      "....obkbkbko.ob.",
      "..obbooooooobbo.",
      "..ob.obssbo.....",
      "..ob..obbo......",
      "..o...osso......",
      "......obbo......",
      ".....ob..bo.....",
      ".....oo..oo.....",
    ],
  },
  goblin: {
    palette: {
      o: "#1b2a12",
      g: "#7cb342",
      d: "#55822c",
      r: "#ffd54a",
      k: "#111111",
      c: "#8d5a2b",
      t: "#ffffff",
    },
    idle: [
      "................",
      "oo...oooooo...oo",
      "ogo.oggggggo.ogo",
      ".oggggggggggggo.",
      "..ogrkggggrkgo..",
      "..oggggddggggo..",
      "..oggkttttkggo..",
      "...oggggggggo...",
      "....oooooooo....",
      "...occccccccco..",
      "..ogocccccccogo.",
      "..ogocccccccogo.",
      "....occccccco...",
      "....odo...odo...",
      "....oo....oo....",
    ],
    attack: [
      "................",
      "oo...oooooo...oo",
      "ogo.oggggggo.ogo",
      ".oggggggggggggo.",
      "..ogrkggggrkgo..",
      "..oggggddggggo..",
      "..oggkkkkkkggo..",
      "...ogkttttkgo...",
      "....oooooooo..oo",
      "...occccccccoogo",
      "..ogoccccccco.o.",
      "..ogocccccccc...",
      "....occccccco...",
      "....odo...odo...",
      "....oo....oo....",
    ],
  },
  mimic: {
    palette: {
      o: "#2a1608",
      w: "#9a5a2b",
      l: "#c27a3a",
      m: "#d9a441",
      t: "#ffffff",
      r: "#b3243b",
      k: "#120a05",
      e: "#ffe14d",
    },
    idle: [
      "................",
      "................",
      "..oooooooooooo..",
      ".ollllllllllllo.",
      ".owwwwwmmwwwwwo.",
      ".owwwwwmmwwwwwo.",
      ".ommmmmmmmmmmmo.",
      ".otttttttttttto.",
      ".owwwwwmmwwwwwo.",
      ".owwwwmkkmwwwwo.",
      ".owwwwwmmwwwwwo.",
      ".ollllllllllllo.",
      "..oooooooooooo..",
    ],
    attack: [
      "..oooooooooooo..",
      ".ollllllllllllo.",
      ".owwwwwmmwwwwwo.",
      ".ommmmmmmmmmmmo.",
      ".otktktktktktko.",
      ".okeekkkkkeekko.",
      ".okkkkrrrrkkkko.",
      ".otktktktktktko.",
      ".ommmmmmmmmmmmo.",
      ".owwwwmkkmwwwwo.",
      ".owwwwwmmwwwwwo.",
      ".ollllllllllllo.",
      "..oooooooooooo..",
    ],
  },
};

export const ENEMY_IDS = Object.keys(SPRITES);

export default function EnemySprite({ id }: { id: string }) {
  const sprite = SPRITES[id] ?? SPRITES.slime;
  const height = Math.max(
    sprite.idle.length,
    sprite.alt?.length ?? 0,
    sprite.attack?.length ?? 0,
  );
  // Frames are bottom-aligned so the monster stands on the same floor.
  const frame = (rows: string[], name: string) => (
    <g transform={`translate(0 ${height - rows.length})`}>
      <PixelFrame
        rows={rows}
        palette={sprite.palette}
        className={`sprite-frame frame-${name}`}
      />
    </g>
  );
  return (
    <svg
      className="enemy-sprite"
      data-enemy={id}
      data-frames={[sprite.alt && "alt", sprite.attack && "attack"]
        .filter(Boolean)
        .join(" ")}
      viewBox={`0 0 16 ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {frame(sprite.idle, "idle")}
      {sprite.alt ? frame(sprite.alt, "alt") : null}
      {sprite.attack ? frame(sprite.attack, "attack") : null}
    </svg>
  );
}
