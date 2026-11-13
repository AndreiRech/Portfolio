import { C, g, m, s } from "./lib.mjs";

const pyramid = (() => {
  const halves = [0, 1, 2, 2, 3, 4, 5, 5, 6, 7, 8, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16];
  const c = new C(33, halves.length);
  halves.forEach((hw, y) => c.rect(16 - hw, y, hw * 2 + 1, 1));
  return c.rows();
})();

const sphinx = g(`
.......######...........................
......########..........................
......#########.........................
.....##########.........................
.....##########.........................
......#########.........................
......#########.........................
.......########.........................
.......#########........................
......###########.......................
......##########################........
......##############################....
.....################################...
.....#################################..
.....#################################..
.....##################################.
#######################################.
########################################
`);

const tikal = (() => {
  const c = new C(23, 34);
  c.rect(9, 0, 5, 1).rect(8, 1, 7, 6); // roof comb
  c.clear(10, 2, 1, 2).clear(12, 2, 1, 2);
  c.rect(7, 7, 9, 5).clear(10, 9, 3, 3); // temple with doorway
  const tiers = [5, 6, 7, 8, 9, 10, 11];
  tiers.forEach((hw, k) => {
    const y = 12 + k * 3;
    c.rect(11 - hw + 1, y, (hw - 1) * 2 + 1, 1).rect(11 - hw, y + 1, hw * 2 + 1, 2);
  });
  c.rect(9, 12, 5, 21);
  c.rect(0, 33, 23, 1);
  return c.rows();
})();

const ziggurat = (() => {
  const c = new C(41, 26);
  c.rect(17, 0, 7, 1).rect(18, 1, 5, 3).clear(20, 2, 1, 2); // shrine
  const tiers = [[4, 3], [7, 3], [10, 4], [13, 4], [16, 4], [20, 4]];
  let y = 4;
  for (const [hw, n] of tiers) {
    c.rect(20 - hw, y, hw * 2 + 1, n);
    // A darker band of brick along each terrace edge.
    c.set(20 - hw, y, false).set(20 + hw, y, false);
    y += n;
  }
  return c.rows();
})();

const ishtar = m(`
#.#.#..........
#####..........
#####..........
#####..........
#####.#.#.#.#.#
###############
###############
###############
###############
###############
###############
############...
###########....
##########.....
##########.....
##########.....
##########.....
##########.....
##########.....
##########.....
`);

const colosseum = (() => {
  const W = 49,
    H = 18;
  const c = new C(W, H);
  for (let x = 0; x < W; x++) {
    // Intact on the left, the broken outer ring steps down to the right.
    const top = x < 29 ? 0 : x < 33 ? 1 : x < 37 ? 5 : x < 41 ? 9 : 13;
    c.rect(x, top, 1, H - top);
  }
  // Attic windows, then three tiers of round-topped arches.
  for (let x = 2; x < 28; x += 4) c.clear(x, 2, 2, 1);
  for (const ty of [4, 8, 12]) {
    c.rect(0, ty, W, 1, true).clear(0, ty, W, 0);
    for (let x = 1; x + 3 <= W; x += 4) {
      c.clear(x + 1, ty + 1, 1, 1).clear(x, ty + 2, 3, 2);
    }
  }
  // The cornice line above each tier follows the broken profile.
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    const top = x < 29 ? 0 : x < 33 ? 1 : x < 37 ? 5 : x < 41 ? 9 : 13;
    if (y < top) c.set(x, y, false);
  }
  c.rect(0, 16, W, 2);
  return c.rows();
})();

const parthenon = m(`
..............##
...........#####
........########
.....###########
..##############
################
################
.##..##..##..##.
.##..##..##..##.
.##..##..##..##.
.##..##..##..##.
.##..##..##..##.
.##..##..##..##.
.##..##..##..##.
################
################
`);

const eiffel = m(`
........#
........#
........#
........#
.......##
.......##
......###
.......##
.......##
.......##
.......##
.......##
.......##
.......##
......###
......###
......###
......###
......###
......###
.....####
.....####
.....####
.....####
.....####
....#####
...######
....#####
....###.#
....##...
....##...
...###...
...##....
...##....
.########
..#######
..####...
..###....
.###.....
.##......
.##......
###......
###......
`);

const burj = m(`
......#
......#
......#
......#
......#
......#
......#
.....##
.....##
.....##
.....##
.....##
.....##
.....##
....###
....###
....###
....###
....###
....###
....###
...####
...####
...####
...####
...####
...####
...####
..#####
..#####
..#####
..#####
..#####
..#####
..#####
..#####
.######
.######
.######
.######
.######
.######
.######
#######
#######
#######
#######
#######
`);

const empire = m(`
......#
......#
......#
......#
......#
......#
.....##
.....##
.....##
.....##
....###
....###
....###
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
...####
..#####
..#####
..#####
..#####
.######
.######
.######
#######
#######
#######
#######
#######
`);

const liberty = g(`
........#..
.......###..
........#...
........#...
........#...
...#.#..#...
..#####.#...
...###.##...
...###.#....
..######....
.#######....
.#######....
##.#####....
##.#####....
##.#####....
...#####....
...#####....
..######....
..#######...
.########...
..#######...
..#######...
.#########..
..#######...
..#######...
..#######...
..#######...
..#######...
..#######...
..#######...
.#########..
.#########..
###########.
###########.
`);

const christ = m(`
.........##
.........##
..........#
###########
###########
......#####
........###
........###
........###
........###
.......####
.......####
.......####
.......####
.......####
.......####
.......####
......#####
......#####
.....######
......#####
......#####
......#####
......#####
.....######
.....######
`);

const bigBen = m(`
....#
....#
....#
...##
...##
...##
..###
..###
.####
#.#.#
#####
.#.##
.#.##
.####
#####
###..
##..#
##...
###..
#####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
.####
#####
#####
`);

const pisa = (() => {
  const H = 32,
    c = new C(16, H);
  for (let y = 0; y < H; y++) {
    const off = Math.round(((H - 1 - y) * 4) / (H - 1));
    let w, holes = false;
    if (y < 4) w = y === 0 ? 5 : 7;
    else if (y === 4) w = 9;
    else {
      const t = (y - 5) % 4;
      w = t === 0 ? 11 : 9;
      holes = t === 2 && y < H - 6;
    }
    const x = 2 + off + Math.round((11 - w) / 2);
    c.rect(x, y, w, 1);
    if (holes) for (let i = x + 2; i < x + w - 2; i += 2) c.set(i, y, false);
    if (y === 2) c.set(x + 2, y, false).set(x + 4, y, false);
  }
  return c.rows();
})();

const taj = (() => {
  const c = new C(47, 32);
  const cx = 23;
  // Finial and onion dome.
  c.rect(cx, 0, 1, 3);
  [1, 2, 3, 5, 6, 7, 7, 7, 6, 5, 5].forEach((hw, k) => c.rect(cx - hw + 1, 3 + k, hw * 2 - 1, 1));
  // Chhatris either side of the dome.
  for (const x of [cx - 10, cx + 10]) {
    c.rect(x, 8, 1, 1).rect(x - 1, 9, 3, 1).rect(x - 2, 10, 5, 2).rect(x - 2, 12, 1, 2).rect(x + 2, 12, 1, 2);
  }
  // Main hall with the great iwan.
  c.rect(cx - 13, 14, 27, 13).clear(cx - 3, 16, 7, 11).set(cx - 3, 16).set(cx + 3, 16);
  c.clear(cx - 11, 18, 3, 9).clear(cx + 9, 18, 3, 9);
  c.clear(cx - 11, 15, 3, 2).clear(cx + 9, 15, 3, 2);
  // Minarets.
  for (const x of [1, 45]) {
    c.rect(x, 5, 1, 1).rect(x - 1, 6, 3, 2).rect(x, 8, 1, 19);
    c.rect(x - 1, 12, 3, 1).rect(x - 1, 19, 3, 1);
  }
  c.rect(0, 27, 47, 5);
  return c.rows();
})();

const moai = g(`
.....#######
....########
...#########
.###########
############
....########
....########
...#########
..##########
.###########
############
...#########
..##########
...#########
..##########
.###########
.###########
...#########
.....#######
.....#######
....########
....########
....########
....########
....########
....########
`);

const londonEye = (() => {
  const c = new C(36, 38);
  const cx = 18,
    cy = 18,
    r = 17;
  c.ring(cx, cy, r, 1.4);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    c.line(cx, cy, Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1)));
    c.disc(cx + Math.cos(a) * (r + 0.2), cy + Math.sin(a) * (r + 0.2), 1.1);
  }
  c.disc(cx, cy, 2);
  // A-frame support legs to the ground.
  c.line(cx, cy, 8, 37, 2).line(cx, cy, 13, 37, 2);
  c.rect(5, 37, 12, 1);
  return c.rows();
})();

const goldenGate = m(`
.###..
.###..
.###..
.###..
.#####
.#####
.###..
.###..
.###..
.###..
.#####
.#####
.###..
.###..
.###..
.###..
.###..
.#####
.#####
.###..
.###..
.###..
.###..
.###..
.###..
.#####
.#####
.###..
.###..
.###..
.###..
#######
#######
.###..
.###..
.###..
.###..
.###..
.###..
.###..
.###..
.###..
#####.
#####.
`);

const sugarloaf = (() => {
  const W = 34,
    H = 30,
    c = new C(W, H);
  for (let x = 0; x < W; x++) {
    // Steep western face, rounded dome, long slope to the east.
    const t = x / (W - 1);
    const peak = 0.32;
    let h;
    if (t < peak) h = Math.pow(t / peak, 0.45);
    else h = Math.pow(1 - (t - peak) / (1 - peak), 0.55) * 0.92 + 0.08 * (1 - t);
    c.rect(x, Math.round((1 - h) * (H - 1)), 1, H);
  }
  return c.rows();
})();

const brasiliaCathedral = m(`
#...#...#...#..
#...#...#...#..
.#...#...#..#..
.#...#...#...#.
..#...#..#...#.
..#...#..#...#.
...#..#..#...#.
...##.##.##.###
....###########
....###########
.....##########
.....##########
.....##########
....###########
....###########
....###########
...############
...############
..#############
.##############
###############
`);

const elCastillo = (() => {
  const c = new C(37, 20);
  c.rect(13, 0, 11, 1).rect(14, 1, 9, 4).clear(17, 2, 3, 3);
  const tiers = [10, 11, 13, 14, 16, 17, 18];
  tiers.forEach((hw, k) => {
    const y = 5 + k * 2;
    c.rect(18 - hw + 1, y, (hw - 1) * 2 + 1, 1).rect(18 - hw, y + 1, hw * 2 + 1, 1);
  });
  c.rect(15, 5, 7, 15);
  c.rect(0, 19, 37, 1);
  return c.rows();
})();

const stonehenge = g(`
.#############.
###############
.####.....####.
.####.....####.
.####.....####.
.#####....####.
.#####....####.
.####.....#####
.####.....#####
.####.....####.
.####.....####.
.####.....####.
#####.....#####
`);

const arc = m(`
.##########
###########
###########
.##########
###########
###########
########...
#######....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
######.....
`);

const spaceNeedle = m(`
.......#
.......#
.......#
.......#
.......#
.......#
......##
.....###
..######
########
.#######
...#####
....##.#
.....#.#
.....#.#
.....#.#
......##
......##
......##
......##
......##
......##
......##
.....#.#
.....#.#
.....#.#
....#..#
....#..#
....#..#
...#...#
...#...#
...#...#
..#....#
..#....#
..#....#
.#.....#
.#.....#
##....##
`);

const skytree = m(`
....#
....#
....#
....#
....#
....#
....#
....#
....#
....#
...##
...##
...##
..###
...##
...##
...##
...##
...##
..###
.####
..###
...##
...##
...##
...##
...##
...##
...##
...##
..###
..###
..###
..###
..###
..###
..###
..###
.####
.####
.####
.####
.####
.####
#####
#####
#####
#####
`);

const cnTower = m(`
.....#
.....#
.....#
.....#
.....#
.....#
.....#
.....#
.....#
.....#
....##
....##
.....#
.....#
.....#
....##
.#####
######
..####
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
....##
...###
...###
..####
..####
.##.##
.##.##
##..##
`);

const petronas = m(`
....#........
....#........
....#........
....#........
...###.......
...###.......
..#####......
..#####......
.#######.....
.#######.....
.#######.....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#############
#############
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
#########....
`);

const saturn = m(`
.....#
.....#
.....#
.....#
....##
....##
...###
...###
...###
...###
...###
...###
...###
...###
...###
..####
..####
..####
..####
..####
..####
..####
..####
..####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
.#####
######
######
#.###.
#..#..
`);

const sagrada = (() => {
  const c = new C(41, 44);
  const spire = (cx, top, base, w) => {
    c.rect(cx, top, 1, 3);
    for (let y = top + 3; y < base; y++) {
      const t = (y - top - 3) / Math.max(1, base - top - 3);
      const ww = Math.max(1, Math.round(1 + (w - 1) * Math.min(1, t * 1.6)));
      c.span(cx + 0.5, y, ww % 2 ? ww : ww + 1);
    }
  };
  spire(20, 0, 30, 7);
  c.rect(19, 1, 3, 1);
  spire(15, 8, 30, 5);
  spire(25, 8, 30, 5);
  spire(10, 12, 30, 5);
  spire(30, 12, 30, 5);
  spire(4, 17, 30, 5);
  spire(36, 17, 30, 5);
  spire(7, 20, 30, 3);
  spire(33, 20, 30, 3);
  c.rect(1, 30, 39, 14);
  c.clear(17, 35, 7, 9).set(17, 35).set(23, 35);
  c.clear(6, 37, 3, 7).clear(32, 37, 3, 7);
  return c.rows();
})();


const taipei101 = (() => {
  const c = new C(15, 50);
  c.rect(7, 0, 1, 8).rect(6, 8, 3, 3);
  c.rect(4, 11, 7, 2);
  // Eight flared pagoda segments.
  for (let k = 0; k < 8; k++) {
    const y = 13 + k * 4;
    c.rect(3, y, 9, 1).rect(2, y + 1, 11, 1).rect(1, y + 2, 13, 1).rect(3, y + 3, 9, 1);
  }
  c.rect(3, 45, 9, 1).rect(2, 46, 11, 1).rect(1, 47, 13, 1).rect(0, 48, 15, 2);
  return c.rows();
})();

const oneWtc = (() => {
  const c = new C(11, 48);
  c.rect(5, 0, 1, 12);
  for (let y = 12; y < 44; y++) {
    const t = (y - 12) / 31;
    c.span(5.5, y, Math.round(5 + t * 6) | 1);
  }
  c.rect(0, 44, 11, 4);
  return c.rows();
})();

const shanghai = (() => {
  const c = new C(13, 52);
  for (let y = 0; y < 52; y++) {
    const t = y / 51;
    const w = Math.round(3 + 10 * Math.pow(t, 0.55));
    // The twisting facade leaves a notch on one side.
    c.rect(Math.round(6.5 - w / 2), y, w, 1);
    if (y > 2 && y % 6 === 0) c.set(Math.round(6.5 + w / 2) - 1, y, false);
  }
  return c.rows();
})();

const gatewayArch = (() => {
  const W = 33,
    H = 33,
    c = new C(W, H);
  const a = 6.2;
  const top = a * Math.cosh(16 / a);
  for (let y = 0; y < H; y++) {
    const h = a + (y / (H - 1)) * (top - a);
    const x = Math.round(a * Math.acosh(h / a));
    const thick = y < 2 ? 4 : y > H - 6 ? 2 : 3;
    c.rect(16 - x, y, thick, 1).rect(16 + x - thick + 1, y, thick, 1);
  }
  return c.rows();
})();

const washington = m(`
..#
.##
.##
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
`);

const landmarks = [
  s("great-pyramid", "Grande Pirâmide de Gizé", "Great Pyramid of Giza", 139, pyramid),
  s("great-sphinx", "Grande Esfinge de Gizé", "Great Sphinx of Giza", 20, sphinx),
  s("el-castillo", "El Castillo, Chichén Itzá", "El Castillo, Chichén Itzá", 30, elCastillo),
  s("tikal-temple", "Templo I de Tikal (maia)", "Tikal Temple I (Maya)", 47, tikal),
  s("babylon-ziggurat", "Zigurate da Babilônia (estimado)", "Babylon ziggurat (estimated)", 91, ziggurat),
  s("ishtar-gate", "Portão de Ishtar, Babilônia", "Ishtar Gate, Babylon", 14, ishtar),
  s("colosseum", "Coliseu de Roma", "Rome Colosseum", 48, colosseum),
  s("parthenon", "Partenon", "Parthenon", 14, parthenon),
  s("eiffel-tower", "Torre Eiffel", "Eiffel Tower", 330, eiffel),
  s("burj-khalifa", "Burj Khalifa", "Burj Khalifa", 828, burj),
  s("empire-state", "Empire State Building (antena)", "Empire State Building (antenna)", 443, empire),
  s("statue-of-liberty", "Estátua da Liberdade (com pedestal)", "Statue of Liberty (with pedestal)", 93, liberty),
  s("christ-the-redeemer", "Cristo Redentor (com pedestal)", "Christ the Redeemer (with pedestal)", 38, christ),
  s("big-ben", "Big Ben", "Big Ben", 96, bigBen),
  s("leaning-tower", "Torre de Pisa", "Leaning Tower of Pisa", 56, pisa),
  s("taj-mahal", "Taj Mahal", "Taj Mahal", 73, taj),
  s("moai", "Moai da Ilha de Páscoa", "Easter Island moai", 4, moai),
  s("stonehenge", "Trílito de Stonehenge", "Stonehenge trilithon", 7.3, stonehenge),
  s("arc-de-triomphe", "Arco do Triunfo", "Arc de Triomphe", 50, arc),
  s("space-needle", "Space Needle", "Space Needle", 184, spaceNeedle),
  s("tokyo-skytree", "Tokyo Skytree", "Tokyo Skytree", 634, skytree),
  s("cn-tower", "CN Tower", "CN Tower", 553, cnTower),
  s("petronas-towers", "Torres Petronas", "Petronas Towers", 452, petronas),
  s("saturn-v", "Foguete Saturn V", "Saturn V rocket", 111, saturn),
  s("sagrada-familia", "Sagrada Família", "Sagrada Família", 172, sagrada),
  s("london-eye", "London Eye", "London Eye", 135, londonEye),
  s("golden-gate", "Torre da Golden Gate", "Golden Gate tower", 227, goldenGate),
  s("sugarloaf", "Pão de Açúcar", "Sugarloaf Mountain", 396, sugarloaf),
  s("taipei-101", "Taipei 101", "Taipei 101", 508, taipei101),
  s("one-world-trade-center", "One World Trade Center", "One World Trade Center", 541, oneWtc),
  s("shanghai-tower", "Shanghai Tower", "Shanghai Tower", 632, shanghai),
  s("gateway-arch", "Gateway Arch, St. Louis", "Gateway Arch, St. Louis", 192, gatewayArch),
  s("washington-monument", "Monumento a Washington", "Washington Monument", 169, washington),
  s("brasilia-cathedral", "Catedral de Brasília", "Cathedral of Brasília", 40, brasiliaCathedral),
];

export default landmarks;
