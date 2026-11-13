import { C, g, m, me, s } from "./lib.mjs";

const wheel = (c, x, y, r) => c.disc(x, y, r).disc(x, y, Math.max(0.8, r * 0.35), false);

const car = (() => {
  const c = new C(30, 12);
  c.rect(9, 0, 11, 1).rect(7, 1, 15, 1).rect(6, 2, 18, 2);
  c.clear(9, 1, 5, 3).clear(15, 1, 5, 3).set(8, 2, false).set(20, 1, false);
  c.rect(1, 4, 28, 1).rect(0, 5, 30, 4).rect(1, 9, 28, 0);
  c.clear(3, 7, 7, 2).clear(20, 7, 7, 2);
  wheel(c, 6.5, 9, 3);
  wheel(c, 23.5, 9, 3);
  return c.rows();
})();

const van = (() => {
  const c = new C(32, 18);
  c.rect(0, 0, 25, 1).rect(0, 1, 27, 1).rect(0, 2, 29, 4).rect(0, 6, 32, 8);
  c.clear(2, 2, 5, 4).clear(8, 2, 6, 4).clear(15, 2, 6, 4).clear(23, 2, 4, 4);
  c.clear(3, 12, 8, 2).clear(21, 12, 8, 2);
  wheel(c, 7, 14.5, 3.5);
  wheel(c, 25, 14.5, 3.5);
  return c.rows();
})();

const bus = (() => {
  const c = new C(50, 17);
  c.rect(1, 0, 48, 1).rect(0, 1, 50, 12);
  for (let x = 3; x < 44; x += 6) c.clear(x, 3, 5, 4);
  c.clear(45, 3, 3, 7);
  c.clear(5, 11, 8, 2).clear(37, 11, 8, 2);
  wheel(c, 9, 13.5, 3.5);
  wheel(c, 41, 13.5, 3.5);
  return c.rows();
})();

const doubleDecker = (() => {
  const c = new C(40, 24);
  c.rect(1, 0, 38, 1).rect(0, 1, 40, 19);
  for (let x = 3; x < 36; x += 6) c.clear(x, 3, 5, 4).clear(x, 11, 5, 4);
  c.clear(36, 11, 2, 7);
  c.clear(4, 18, 8, 2).clear(28, 18, 8, 2);
  wheel(c, 8, 20.5, 3.5);
  wheel(c, 32, 20.5, 3.5);
  return c.rows();
})();

const truck = (() => {
  const c = new C(48, 20);
  c.rect(0, 0, 33, 15); // cargo box
  c.rect(34, 4, 10, 11).rect(44, 7, 4, 8); // cab
  c.clear(37, 6, 6, 4);
  c.rect(0, 15, 48, 1);
  c.clear(2, 14, 8, 2).clear(16, 14, 8, 2).clear(36, 14, 8, 2);
  wheel(c, 6, 16.5, 3.5);
  wheel(c, 20, 16.5, 3.5);
  wheel(c, 40, 16.5, 3.5);
  return c.rows();
})();

const motorcycle = (() => {
  const c = new C(32, 18);
  c.ring(6, 12.5, 5.5, 2).ring(26, 12.5, 5.5, 2);
  c.disc(6, 12.5, 1.2).disc(26, 12.5, 1.2);
  c.rect(9, 5, 7, 2).rect(8, 4, 5, 1); // seat
  c.rect(14, 5, 7, 3).rect(15, 4, 5, 1); // tank
  c.rect(11, 8, 9, 4).rect(13, 12, 5, 2); // engine
  c.line(6, 12, 11, 8, 2).line(20, 6, 26, 12, 2); // swing arm and fork
  c.line(21, 5, 22, 0, 2).rect(19, 0, 6, 1); // handlebar
  c.rect(2, 6, 7, 2); // rear fender
  return c.rows();
})();

const bicycle = (() => {
  const c = new C(34, 21);
  c.ring(7, 14, 6.5, 1.6).ring(27, 14, 6.5, 1.6);
  c.disc(7, 14, 1).disc(27, 14, 1);
  c.line(7, 14, 14, 6).line(14, 6, 24, 6).line(14, 6, 17, 14).line(7, 14, 17, 14).line(17, 14, 24, 6);
  c.line(24, 6, 27, 14).line(23, 2, 24, 6).rect(21, 1, 5, 1).rect(25, 2, 2, 1);
  c.line(14, 6, 13, 2).rect(10, 1, 6, 1).rect(11, 0, 4, 1);
  return c.rows();
})();

const tractor = (() => {
  const c = new C(36, 27);
  c.rect(6, 0, 14, 1).rect(7, 1, 1, 9).rect(18, 1, 1, 9); // cab roof and posts
  c.rect(6, 9, 15, 4).rect(20, 11, 15, 6).rect(32, 7, 2, 4); // body, hood, exhaust
  c.disc(10, 17.5, 9).disc(10, 17.5, 3.5, false).disc(10, 17.5, 1.5);
  c.disc(29, 21.5, 5.5).disc(29, 21.5, 2, false);
  return c.rows();
})();

const sailboat = (() => {
  const c = new C(30, 40);
  c.rect(13, 0, 1, 33); // mast
  for (let y = 2; y < 30; y++) {
    const t = (y - 2) / 27;
    c.rect(14 + 1, y, Math.round(1 + t * 13), 1); // mainsail
    if (y > 6) c.rect(12 - Math.round(((y - 6) / 23) * 10), y, Math.round(((y - 6) / 23) * 10), 1); // jib
  }
  c.rect(0, 33, 30, 2).rect(1, 35, 28, 2).rect(3, 37, 24, 2).rect(6, 39, 18, 1);
  return c.rows();
})();

const jumbo = (() => {
  const c = new C(64, 18);
  c.rect(4, 7, 52, 6).rect(56, 8, 4, 4).rect(60, 9, 3, 2).rect(63, 10, 1, 1); // fuselage and nose
  for (let x = 40; x < 58; x++) c.rect(x, 7 - Math.round(Math.min(4, Math.max(0, x - 40) / 2.5)), 1, 1); // hump
  c.rect(44, 3, 12, 5);
  for (let y = 0; y < 8; y++) c.rect(1 + Math.round(y * 0.9), y, 7 + Math.round(y * 0.6), 1); // tail fin
  c.rect(0, 8, 12, 2).rect(0, 10, 6, 1); // tail cone and stabiliser
  c.rect(24, 12, 16, 2).rect(26, 14, 5, 2).rect(34, 14, 5, 2); // wing root and engines
  for (let x = 46; x < 62; x += 2) c.set(x, 9, false);
  for (let x = 12; x < 44; x += 2) c.set(x, 9, false);
  c.rect(14, 13, 1, 3).rect(13, 16, 3, 2).rect(52, 13, 1, 3).rect(51, 16, 3, 2);
  return c.rows();
})();

const titanic = (() => {
  const c = new C(80, 18);
  // Hull with a raked bow and counter stern.
  for (let x = 0; x < 80; x++) {
    const top = 10;
    const bottom = x < 3 ? 14 : x > 76 ? 13 : 17;
    c.rect(x, top, 1, bottom - top + 1);
  }
  c.rect(79, 8, 1, 4).rect(78, 9, 1, 3);
  c.rect(10, 8, 58, 2).rect(14, 7, 48, 1); // superstructure
  for (const x of [22, 32, 42, 52]) c.rect(x, 1, 4, 6).rect(x - 1, 0, 6, 1);
  c.rect(8, 0, 1, 8).rect(70, 0, 1, 8); // masts
  for (let x = 4; x < 76; x += 3) c.set(x, 12, false);
  return c.rows();
})();

const balloon = (() => {
  const c = new C(23, 34);
  c.disc(11.5, 10.5, 10.5);
  for (let y = 18; y < 26; y++) c.span(11.5, y, Math.max(5, Math.round(19 - (y - 18) * 1.8)) | 1);
  for (let x = 2; x < 22; x += 4) for (let y = 1; y < 25; y++) if (c.p[y][x] && y % 1 === 0) c.set(x, y, false);
  c.line(8, 26, 9, 30).line(15, 26, 14, 30);
  c.rect(8, 30, 7, 4);
  return c.rows();
})();

const door = g(`
#########
#########
##.....##
##.###.##
##.###.##
##.###.##
##.###.##
##.###.##
##.....##
#########
######.##
#########
##.....##
##.###.##
##.###.##
##.###.##
##.###.##
##.###.##
##.....##
#########
#########
`);

const wineBottle = m(`
...#
..##
..##
..##
..##
..##
..##
.###
####
####
####
####
####
####
####
####
####
####
####
####
`);

const waterBottle = m(`
..##
..##
.###
####
####
####
.###
####
####
####
.###
####
####
####
.###
####
####
`);

const sodaCan = m(`
.####
#####
#####
#####
#####
#####
#####
#####
#####
#####
#####
#####
.####
`);

const mug = g(`
##########...
##########...
##########.##
##########..#
##########..#
##########..#
##########.##
##########...
.########....
`);

const wineGlass = m(`
#####
#####
#####
#####
#####
.####
..###
....#
....#
....#
....#
....#
....#
....#
..###
#####
`);

const blender = m(`
....###
..#####
.######
.######
.######
.######
..#####
..#####
..#####
...####
...####
...####
..#####
.######
.######
.######
.######
`);

const toilet = g(`
.....#####.
.....#####.
.....#####.
.....#####.
.....#####.
.....#####.
.....#####.
..#########
###########
###########
.##########
..########.
...######..
....#####..
....#####..
....#####..
...######..
`);

const chair = g(`
#######...
#.....#...
#######...
#.#.#.#...
#.#.#.#...
#.#.#.#...
#.#.#.#...
##########
##########
#........#
#........#
#........#
#........#
#........#
#........#
`);

const couch = g(`
....################....
....################....
....################....
....################....
.######################
########################
########################
########################
########################
########################
##....................##
##....................##
`);

const fridge = g(`
############
#..........#
#.#........#
#.#........#
#.#........#
#..........#
############
#..........#
#.#........#
#.#........#
#.#........#
#.#........#
#.#........#
#.#........#
#.#........#
#..........#
#..........#
############
.#........#.
`).map((r) => r.replace(/\.(?=\.*#$)/g, "#").replace(/#\.\.+#/g, (x) => x));

const washer = (() => {
  const c = new C(16, 17);
  c.rect(0, 0, 16, 16).rect(1, 16, 2, 1).rect(13, 16, 2, 1);
  c.rect(1, 1, 3, 1, false).rect(10, 1, 1, 1, false).rect(12, 1, 1, 1, false);
  c.rect(0, 3, 16, 1, false);
  c.disc(8, 9.5, 5, false).ring(8, 9.5, 4, 1.2).disc(8, 9.5, 2.6);
  c.disc(8, 9.5, 1.4, false);
  return c.rows();
})();

const floorLamp = m(`
..######
..######
.#######
.#######
########
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
.......#
....####
`);

const deskLamp = g(`
........#####.
.......#######
......###.....
.....##.......
....##........
...##.........
...##.........
....##........
.....##.......
......##......
.......#......
.......#......
......###.....
....#######...
`);

const cone = m(`
......##
......##
.....###
.....###
.....###
....####
....####
....####
...#####
...#####
...#####
..######
..######
..######
########
########
`);

const hydrant = g(`
...###...
..#####..
.#######.
..#####..
..#####..
#########
#########
..#####..
..#####..
..#####..
..#####..
..#####..
.#######.
#########
`);

const streetLamp = g(`
..#######..
.#########.
....###....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....#.....
.....##....
....###....
....###....
...#####...
`);

const phoneBooth = m(`
.....#
..####
.#####
######
#....#
######
#.#.#.
#.#.#.
#.#.#.
###.##
#.#.#.
#.#.#.
#.#.#.
###.##
#.#.#.
#.#.#.
#.#.#.
###.##
#.#.#.
#.#.#.
######
######
`).map((r) => r.replace(/^#/, "#"));

const suitcase = me(`
....###
....#..
....#..
.......
#######
#######
##.####
#######
#######
#######
#######
##.####
#######
#######
#######
#######
##.####
#######
#######
.#.....
`).map((r, i) => (i === 3 ? r : r));

const guitar = m(`
...##
...##
...##
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
....#
....#
..###
.####
#####
#####
.####
..###
.####
#####
##..#
##..#
#####
#####
.####
`);

const ball = (n, holes) => {
  const c = new C(n, n);
  c.disc(n / 2, n / 2, n / 2);
  holes(c);
  return c.rows();
};
const basketball = ball(16, (c) => {
  c.rect(0, 7, 16, 1, false).rect(7, 0, 1, 16, false);
  for (let y = 1; y < 15; y++) {
    const dx = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 7.5) / 7.5) ** 2)) * 3);
    c.set(3 - dx + 3, y, false).set(12 + dx - 3, y, false);
  }
});
const soccer = ball(15, (c) => {
  c.stamp(5, 5, [".###.", "#####", "#####", ".###."], false);
  c.stamp(6, 6, ["###", "###"], true);
  c.rect(1, 4, 2, 2, false).rect(12, 4, 2, 2, false).rect(2, 11, 2, 2, false).rect(11, 11, 2, 2, false).rect(7, 0, 1, 2, false);
});
const tennis = ball(12, (c) => {
  for (let y = 1; y < 11; y++) {
    const d = Math.round(Math.cos(((y - 0.5) / 10) * Math.PI) * 2.5);
    c.set(2 + d + 0, y, false);
    c.set(9 - d, y, false);
  }
});

const bowlingPin = m(`
..##
.###
.###
.###
..##
..##
.###
####
####
####
####
####
####
####
.###
..##
`);

const pawn = m(`
..##
.###
.###
..##
.###
..##
..##
.###
.###
####
####
`);

const king = m(`
...#
..##
...#
..##
.###
.###
..##
..##
..##
..##
.###
.###
####
####
`);

const smartphone = g(`
.#######.
#########
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#########
####.####
.#######.
`);

const gameBoy = g(`
#############
#############
##.........##
##.........##
##.........##
##.........##
##.........##
##.........##
#############
#############
###.#########
##...####.###
###.####.####
#############
#####.#.#####
#############
############.
`);

const arcade = g(`
.##########...
############..
#..........#..
#..........#..
############..
.#........#...
.#........#...
.#........#...
.#........#...
.##########...
#############.
##.#..#.#..###
##############
.###########..
.###########..
.###########..
.####.#.####..
.###########..
.###########..
.###########..
.###########..
.###########..
.###########..
.###########..
`);

const rubik = g(`
###.###.###
###.###.###
###.###.###
...........
###.###.###
###.###.###
###.###.###
...........
###.###.###
###.###.###
###.###.###
`);

const d20 = (() => {
  const c = new C(15, 16);
  for (let y = 0; y < 16; y++) {
    const w = y < 4 ? 5 + y * 2.5 : y > 11 ? 5 + (15 - y) * 2.5 : 15;
    c.span(7.5, y, Math.round(w) | 1);
  }
  // Facet edges.
  c.line(7, 2, 2, 10).line(7, 2, 12, 10).line(2, 10, 12, 10);
  for (const [x, y] of [[7, 2], [2, 10], [12, 10]]) c.set(x, y);
  const holes = new C(15, 16);
  holes.line(7, 2, 2, 10).line(7, 2, 12, 10).line(3, 11, 11, 11);
  holes.p.forEach((row, y) => row.forEach((v, x) => v && c.set(x, y, false)));
  return c.rows();
})();

const lego = m(`
....##
...###
..####
..####
..####
...###
######
######
######
######
######
######
##.###
#..###
...###
...###
...###
...##.
...##.
...##.
...##.
..###.
`);

const duck = g(`
....####......
...######.....
...######.....
.#.######.....
####.####.....
....#####.....
...########..#
..###########.
.############.
.############.
..##########..
...########...
`);

const pencil = m(`
...#
..##
..##
.###
.###
####
####
####
####
####
####
####
####
####
####
####
####
####
####
####
....
####
####
.###
`).map((r) => (r.includes("#") ? r : "#######"));

const hammer = g(`
.##########
###########
###########
.....##....
.....##....
.....##....
.....##....
.....##....
.....##....
.....##....
.....##....
.....##....
.....##....
....####...
....####...
....####...
....####...
....####...
`);

const lightbulb = m(`
...####
.######
#######
#######
#######
#######
#######
.######
..#####
...####
...####
....###
...####
....###
.....##
`);

const toiletPaper = g(`
..#######..
.##.....##.
.#..###..#.
.##.....##.
.#########.
.#########.
.#########.
.#########.
.#########.
.##########
.##########
..#######.#
`);

const hoop = g(`
################
#..............#
#....######....#
#....#....#....#
#....######....#
#..............#
################
.......##.......
....########....
.....#.##.#.....
......####......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.......##.......
.....######.....
`).map((r, i) => (i < 7 ? r.replace(/#\.{14}#/, "################") : r));

const objects = [
  s("car", "Carro compacto", "Compact car", 1.45, car),
  s("van", "Van de passageiros", "Passenger van", 2, van),
  s("bus", "Ônibus urbano", "City bus", 3.2, bus),
  s("double-decker", "Ônibus de dois andares", "Double-decker bus", 4.4, doubleDecker),
  s("truck", "Caminhão de carga", "Box truck", 3.8, truck),
  s("motorcycle", "Motocicleta", "Motorcycle", 1.1, motorcycle),
  s("bicycle", "Bicicleta adulta", "Adult bicycle", 1.05, bicycle),
  s("tractor", "Trator agrícola", "Farm tractor", 2.7, tractor),
  s("sailboat", "Veleiro", "Sailboat", 10, sailboat),
  s("boeing-747", "Boeing 747", "Boeing 747", 19.4, jumbo),
  s("titanic", "Titanic (quilha ao topo das chaminés)", "Titanic (keel to funnel tops)", 53, titanic),
  s("hot-air-balloon", "Balão de ar quente", "Hot air balloon", 22, balloon),
  s("door", "Porta padrão", "Standard door", 2.1, door),
  s("wine-bottle", "Garrafa de vinho", "Wine bottle", 0.3, wineBottle),
  s("water-bottle", "Garrafa de água de 500 ml", "500 ml water bottle", 0.21, waterBottle),
  s("soda-can", "Lata de refrigerante", "Soda can", 0.122, sodaCan),
  s("mug", "Caneca", "Mug", 0.1, mug),
  s("wine-glass", "Taça de vinho", "Wine glass", 0.22, wineGlass),
  s("blender", "Liquidificador", "Blender", 0.4, blender),
  s("toilet", "Vaso sanitário com caixa", "Toilet with tank", 0.75, toilet),
  s("chair", "Cadeira de jantar", "Dining chair", 0.9, chair),
  s("couch", "Sofá", "Couch", 0.85, couch),
  s("fridge", "Geladeira duplex", "Two-door fridge", 1.8, fridge),
  s("washing-machine", "Máquina de lavar", "Washing machine", 0.85, washer),
  s("floor-lamp", "Luminária de chão", "Floor lamp", 1.6, floorLamp),
  s("desk-lamp", "Luminária de mesa", "Desk lamp", 0.45, deskLamp),
  s("traffic-cone", "Cone de trânsito", "Traffic cone", 0.7, cone),
  s("fire-hydrant", "Hidrante", "Fire hydrant", 0.6, hydrant),
  s("street-lamp", "Poste de luz", "Street lamp", 6, streetLamp),
  s("phone-booth", "Cabine telefônica de Londres", "London phone box", 2.5, phoneBooth),
  s("basketball-hoop", "Cesta de basquete (topo da tabela)", "Basketball hoop (top of backboard)", 3.95, hoop),
  s("suitcase", "Mala de viagem", "Suitcase", 0.65, suitcase),
  s("guitar", "Violão", "Acoustic guitar", 1, guitar),
  s("basketball", "Bola de basquete", "Basketball", 0.24, basketball),
  s("soccer-ball", "Bola de futebol", "Soccer ball", 0.22, soccer),
  s("tennis-ball", "Bola de tênis", "Tennis ball", 0.067, tennis),
  s("bowling-pin", "Pino de boliche", "Bowling pin", 0.38, bowlingPin),
  s("chess-pawn", "Peão de xadrez", "Chess pawn", 0.05, pawn),
  s("chess-king", "Rei de xadrez", "Chess king", 0.095, king),
  s("smartphone", "Celular", "Smartphone", 0.15, smartphone),
  s("game-boy", "Game Boy", "Game Boy", 0.148, gameBoy),
  s("arcade-cabinet", "Fliperama", "Arcade cabinet", 1.8, arcade),
  s("rubiks-cube", "Cubo mágico", "Rubik's Cube", 0.057, rubik),
  s("d20", "Dado D20", "D20 die", 0.02, d20),
  s("lego-minifigure", "Minifigura LEGO", "LEGO minifigure", 0.04, lego),
  s("rubber-duck", "Patinho de borracha", "Rubber duck", 0.1, duck),
  s("pencil", "Lápis", "Pencil", 0.19, pencil),
  s("hammer", "Martelo", "Hammer", 0.32, hammer),
  s("lightbulb", "Lâmpada", "Light bulb", 0.11, lightbulb),
  s("toilet-paper", "Rolo de papel higiênico", "Toilet paper roll", 0.1, toiletPaper),
];

export default objects;
