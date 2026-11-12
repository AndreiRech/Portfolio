import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  MeshLambertMaterial,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";

export type DieVariant = "purple" | "gold";
export type DieController = {
  roll: (value: number, direction?: number) => Promise<void>;
  show: (value: number) => void;
  dispose: () => void;
};

const PALETTES: Record<
  DieVariant,
  { face: string; inner: string; ink: string; shadow: string; edge: number }
> = {
  purple: {
    face: "#8f34d6",
    inner: "#a34be6",
    ink: "#ffffff",
    shadow: "#3c0b6e",
    edge: 0x2a0750,
  },
  gold: {
    face: "#f3a91a",
    inner: "#fcd44a",
    ink: "#431000",
    shadow: "#fff1a6",
    edge: 0x3c1000,
  },
};

export type DieSides = 4 | 6 | 8 | 10 | 20;
const TEXTURE = 64;

/** A face as a convex polygon; `up` marks where the top of its number points. */
type Face = { points: Vector3[]; up: Vector3 };

function polygonFaces(
  polygons: Vector3[][],
  upMode: "vertex" | "edge",
): Face[] {
  return polygons.map((polygon) => {
    const centre = polygon
      .reduce((sum, point) => sum.add(point), new Vector3())
      .divideScalar(polygon.length);
    const normal = new Vector3()
      .subVectors(polygon[1], polygon[0])
      .cross(new Vector3().subVectors(polygon[2], polygon[0]));
    // Wind every face outwards; the first vertex stays first.
    const points =
      normal.dot(centre) < 0
        ? [polygon[0], ...polygon.slice(1).reverse()]
        : polygon;
    const anchor =
      upMode === "vertex"
        ? points[0]
        : points[0].clone().add(points[1]).multiplyScalar(0.5);
    return { points, up: anchor.clone().sub(centre) };
  });
}

function shapeFaces(sides: DieSides): Face[] {
  const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
  if (sides === 4) {
    const p = [v(1, 1, 1), v(-1, -1, 1), v(-1, 1, -1), v(1, -1, -1)];
    return polygonFaces(
      [
        [p[0], p[1], p[2]],
        [p[0], p[3], p[1]],
        [p[0], p[2], p[3]],
        [p[1], p[3], p[2]],
      ],
      "vertex",
    );
  }
  if (sides === 6) {
    const c = (x: number, y: number, z: number) => v(x, y, z);
    return polygonFaces(
      [
        [c(-1, 1, 1), c(1, 1, 1), c(1, -1, 1), c(-1, -1, 1)],
        [c(1, 1, -1), c(-1, 1, -1), c(-1, -1, -1), c(1, -1, -1)],
        [c(-1, 1, -1), c(1, 1, -1), c(1, 1, 1), c(-1, 1, 1)],
        [c(-1, -1, 1), c(1, -1, 1), c(1, -1, -1), c(-1, -1, -1)],
        [c(1, 1, 1), c(1, 1, -1), c(1, -1, -1), c(1, -1, 1)],
        [c(-1, 1, -1), c(-1, 1, 1), c(-1, -1, 1), c(-1, -1, -1)],
      ],
      "edge",
    );
  }
  if (sides === 8) {
    const polygons: Vector3[][] = [];
    for (const y of [1, -1])
      for (const [x, z] of [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ])
        polygons.push([v(0, y, 0), v(x, 0, 0), v(0, 0, z)]);
    return polygonFaces(polygons, "vertex");
  }
  if (sides === 10) {
    // Pentagonal trapezohedron: ring height keeps every kite planar.
    const cos36 = Math.cos(Math.PI / 5);
    const ring = (1 - cos36) / (1 + cos36);
    const upper = (k: number) => {
      const angle = (k * 2 * Math.PI) / 5;
      return v(Math.cos(angle), ring, Math.sin(angle));
    };
    const lower = (k: number) => {
      const angle = (k * 2 * Math.PI) / 5 + Math.PI / 5;
      return v(Math.cos(angle), -ring, Math.sin(angle));
    };
    const polygons: Vector3[][] = [];
    for (let k = 0; k < 5; k++) {
      polygons.push([v(0, 1, 0), upper(k), lower(k), upper(k + 1)]);
      polygons.push([v(0, -1, 0), lower(k), upper(k + 1), lower(k + 1)]);
    }
    return polygonFaces(polygons, "vertex");
  }
  const ico = new IcosahedronGeometry(1, 0);
  const position = ico.getAttribute("position");
  const polygons: Vector3[][] = [];
  for (let face = 0; face < 20; face++)
    polygons.push(
      [0, 1, 2].map((corner) =>
        new Vector3().fromBufferAttribute(position, face * 3 + corner),
      ),
    );
  ico.dispose();
  return polygonFaces(polygons, "vertex");
}

/** Projects a face onto its own plane: x to the right of `up`, y along it. */
function faceUv(face: Face) {
  const centre = face.points
    .reduce((sum, point) => sum.add(point), new Vector3())
    .divideScalar(face.points.length);
  const normal = centre.clone().normalize();
  const up = face.up.clone().normalize();
  const right = up.clone().cross(normal).normalize();
  const radius = Math.max(
    ...face.points.map((point) => point.distanceTo(centre)),
  );
  return face.points.map((point) => {
    const offset = point.clone().sub(centre);
    return [
      0.5 + offset.dot(right) / (2 * radius),
      0.5 + offset.dot(up) / (2 * radius),
    ] as const;
  });
}

function faceTexture(
  value: number,
  sides: DieSides,
  uv: readonly (readonly [number, number])[],
  variant: DieVariant,
  font: string,
) {
  const palette = PALETTES[variant];
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE;
  canvas.height = TEXTURE;
  const paint = canvas.getContext("2d")!;
  paint.fillStyle = palette.face;
  paint.fillRect(0, 0, TEXTURE, TEXTURE);
  const centre = TEXTURE / 2;
  // A lighter inset of the face outline gives it a bevel.
  paint.fillStyle = palette.inner;
  paint.beginPath();
  uv.forEach(([u, w], index) => {
    const x = centre + (u * TEXTURE - centre) * 0.72;
    const y = centre + ((1 - w) * TEXTURE - centre) * 0.72;
    if (index === 0) paint.moveTo(x, y);
    else paint.lineTo(x, y);
  });
  paint.closePath();
  paint.fill();
  const size = sides === 20 ? (value >= 10 ? 19 : 23) : sides === 10 ? 20 : 26;
  paint.font = `${size}px ${font}`;
  paint.textAlign = "center";
  paint.textBaseline = "middle";
  const label = String(value);
  paint.fillStyle = palette.shadow;
  paint.fillText(label, centre + 2, centre + 3);
  paint.fillStyle = palette.ink;
  paint.fillText(label, centre, centre + 1);
  // 6 and 9 read the same upside down, so they get the usual underline.
  if ((value === 6 || value === 9) && sides >= 10)
    paint.fillRect(centre - 5, centre + size / 2 + 2, 10, 2);
  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Orientation that shows a face to the camera with its number upright. */
function faceRotation(face: Face) {
  const centre = face.points
    .reduce((sum, point) => sum.add(point), new Vector3())
    .divideScalar(face.points.length);
  const toCamera = new Quaternion().setFromUnitVectors(
    centre.clone().normalize(),
    new Vector3(0, 0, 1),
  );
  const up = face.up.clone().applyQuaternion(toCamera);
  const upright = new Quaternion().setFromAxisAngle(
    new Vector3(0, 0, 1),
    Math.atan2(up.x, up.y),
  );
  // A slight tilt keeps neighbouring faces visible, so it reads as 3D.
  const tilt = new Quaternion().setFromAxisAngle(
    new Vector3(1, -0.6, 0).normalize(),
    0.32,
  );
  return tilt.multiply(upright).multiply(toCamera);
}

/** Every shape is scaled to the same outer radius. */
const SIZE: Record<DieSides, number> = {
  4: 1.45,
  6: 1.3,
  8: 1.4,
  10: 1.35,
  20: 1.25,
};

const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Renders a real polyhedral die (d4 to d20) at a low resolution so the browser scales it
 * up with crisp pixels. Frames are only drawn while the die moves.
 */
export function createDie(
  canvas: HTMLCanvasElement,
  {
    variant,
    resolution,
    font,
    sides = 20,
  }: {
    variant: DieVariant;
    resolution: number;
    font: string;
    sides?: DieSides;
  },
): DieController {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(1);
  renderer.setSize(resolution, resolution, false);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 6.2);
  scene.add(new AmbientLight(0xffffff, 1.5));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(2.5, 3.5, 4);
  scene.add(sun);

  const faces = shapeFaces(sides);
  const scale =
    SIZE[sides] / Math.max(...faces[0].points.map((p) => p.length()));
  const positions: number[] = [];
  const uvs: number[] = [];
  const geometry = new BufferGeometry();
  const materials = faces.map((face, index) => {
    const uv = faceUv(face);
    const start = positions.length / 3;
    // Fan-triangulate the polygon; coplanar seams draw no outline.
    for (let corner = 1; corner < face.points.length - 1; corner++)
      for (const point of [0, corner, corner + 1]) {
        const p = face.points[point];
        positions.push(p.x * scale, p.y * scale, p.z * scale);
        uvs.push(uv[point][0], uv[point][1]);
      }
    geometry.addGroup(start, positions.length / 3 - start, index);
    return new MeshLambertMaterial({
      map: faceTexture(index + 1, sides, uv, variant, font),
      flatShading: true,
    });
  });
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  const die = new Mesh(geometry, materials);
  const edges = new LineSegments(
    new EdgesGeometry(geometry),
    new LineBasicMaterial({ color: PALETTES[variant].edge }),
  );
  die.add(edges);
  scene.add(die);

  const targets = faces.map(faceRotation);
  let frame = 0;
  let pending: (() => void) | null = null;
  const draw = () => renderer.render(scene, camera);

  function show(value: number) {
    cancelAnimationFrame(frame);
    pending?.();
    pending = null;
    die.quaternion.copy(targets[value - 1]);
    die.position.set(0, 0, 0);
    draw();
  }

  function roll(value: number, direction = 1) {
    cancelAnimationFrame(frame);
    pending?.();
    return new Promise<void>((resolve) => {
      pending = resolve;
      const from = die.quaternion.clone();
      const to = targets[value - 1];
      const axis = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        -direction * (0.6 + Math.random() * 0.4),
      ).normalize();
      const turns = Math.PI * 2 * (3 + Math.random() * 1.5);
      const duration = 1250;
      const started = performance.now();
      const spin = new Quaternion();
      const step = (now: number) => {
        const t = Math.min((now - started) / duration, 1);
        const settled = ease(t);
        spin.setFromAxisAngle(axis, turns * (1 - settled));
        die.quaternion.slerpQuaternions(from, to, settled).premultiply(spin);
        // Three shrinking bounces while it tumbles towards rest.
        die.position.y =
          Math.abs(Math.sin(t * Math.PI * 3)) * (1 - t) ** 2 * 1.1;
        die.position.x = direction * (1 - settled) * 0.9;
        draw();
        if (t < 1) frame = requestAnimationFrame(step);
        else {
          pending = null;
          resolve();
        }
      };
      frame = requestAnimationFrame(step);
    });
  }

  return {
    roll,
    show,
    dispose() {
      cancelAnimationFrame(frame);
      pending?.();
      pending = null;
      materials.forEach((material) => {
        material.map?.dispose();
        material.dispose();
      });
      edges.geometry.dispose();
      (edges.material as LineBasicMaterial).dispose();
      geometry.dispose();
      renderer.dispose();
      // Free the WebGL context now; damage dice come and go often.
      renderer.forceContextLoss();
    },
  };
}
