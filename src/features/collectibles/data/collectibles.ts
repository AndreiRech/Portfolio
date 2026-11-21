export const REWARD_KINDS = [
  "palette",
  "cursor",
  "trail",
  "companion",
] as const;
export type RewardKind = (typeof REWARD_KINDS)[number];
export const RARITIES = [
  { id: "consumer", name: "Consumer Grade", color: "#d6d8dd", chance: 35 },
  { id: "industrial", name: "Industrial Grade", color: "#9ac8f5", chance: 25 },
  { id: "milspec", name: "Mil-Spec", color: "#4b69ff", chance: 20 },
  { id: "restricted", name: "Restricted", color: "#8847ff", chance: 10 },
  { id: "classified", name: "Classified", color: "#d45ce8", chance: 6 },
  { id: "covert", name: "Covert", color: "#ef6464", chance: 3 },
  { id: "special", name: "Legendary", color: "#edc45a", chance: 1 },
] as const;
export type RarityId = (typeof RARITIES)[number]["id"];
export interface Reward {
  id: string;
  kind: RewardKind;
  rarity: RarityId;
  name: { en: string; pt: string };
}
export const REWARDS = [
  {
    id: "forest",
    kind: "palette",
    rarity: "consumer",
    name: { en: "Forest", pt: "Floresta" },
  },
  {
    id: "arrow",
    kind: "cursor",
    rarity: "consumer",
    name: { en: "Pixel arrow", pt: "Seta pixel" },
  },
  {
    id: "coral",
    kind: "palette",
    rarity: "consumer",
    name: { en: "Coral red", pt: "Vermelho coral" },
  },
  {
    id: "dust",
    kind: "trail",
    rarity: "consumer",
    name: { en: "Pixel dust", pt: "Poeira de pixel" },
  },
  {
    id: "violet",
    kind: "palette",
    rarity: "industrial",
    name: { en: "Violet", pt: "Violeta" },
  },
  {
    id: "crosshair",
    kind: "cursor",
    rarity: "industrial",
    name: { en: "Crosshair", pt: "Mira" },
  },
  {
    id: "paw",
    kind: "cursor",
    rarity: "industrial",
    name: { en: "Paw", pt: "Patinha" },
  },
  {
    id: "ocean",
    kind: "palette",
    rarity: "industrial",
    name: { en: "Ocean", pt: "Oceano" },
  },
  {
    id: "slime",
    kind: "companion",
    rarity: "industrial",
    name: { en: "Slime", pt: "Slime" },
  },
  {
    id: "bubbles",
    kind: "trail",
    rarity: "industrial",
    name: { en: "Bubbles", pt: "Bolhas" },
  },
  {
    id: "pickaxe",
    kind: "cursor",
    rarity: "milspec",
    name: { en: "Pickaxe", pt: "Picareta" },
  },
  {
    id: "chicken",
    kind: "companion",
    rarity: "milspec",
    name: { en: "Chicken", pt: "Galinha" },
  },
  {
    id: "cat",
    kind: "companion",
    rarity: "milspec",
    name: { en: "Cat", pt: "Gato" },
  },
  {
    id: "frog",
    kind: "companion",
    rarity: "milspec",
    name: { en: "Frog", pt: "Sapo" },
  },
  {
    id: "campfire",
    kind: "palette",
    rarity: "restricted",
    name: { en: "Campfire", pt: "Fogueira" },
  },
  {
    id: "rose",
    kind: "palette",
    rarity: "restricted",
    name: { en: "Rose", pt: "Rosa" },
  },
  {
    id: "sword",
    kind: "cursor",
    rarity: "restricted",
    name: { en: "Sword", pt: "Espada" },
  },
  {
    id: "wand",
    kind: "cursor",
    rarity: "restricted",
    name: { en: "Magic wand", pt: "Varinha mágica" },
  },
  {
    id: "embers",
    kind: "trail",
    rarity: "restricted",
    name: { en: "Embers", pt: "Brasas" },
  },
  {
    id: "medallion",
    kind: "companion",
    rarity: "classified",
    name: { en: "Wolf School medallion", pt: "Medalhão da Escola do Lobo" },
  },
  {
    id: "ghost",
    kind: "companion",
    rarity: "classified",
    name: { en: "Ghost", pt: "Fantasma" },
  },
  {
    id: "saber",
    kind: "cursor",
    rarity: "classified",
    name: { en: "Light saber", pt: "Sabre de luz" },
  },
  {
    id: "bat",
    kind: "companion",
    rarity: "classified",
    name: { en: "Bat", pt: "Morcego" },
  },
  {
    id: "aurora",
    kind: "palette",
    rarity: "covert",
    name: { en: "Aurora", pt: "Aurora" },
  },
  {
    id: "d20",
    kind: "companion",
    rarity: "covert",
    name: { en: "D20", pt: "D20" },
  },
  {
    id: "rainbow",
    kind: "trail",
    rarity: "covert",
    name: { en: "8-bit rainbow", pt: "Arco-íris 8-bit" },
  },
  {
    id: "knife",
    kind: "cursor",
    rarity: "special",
    name: { en: "Golden knife", pt: "Faca dourada" },
  },
  {
    id: "treasure",
    kind: "palette",
    rarity: "special",
    name: { en: "Treasure", pt: "Tesouro" },
  },
  {
    id: "dragon",
    kind: "companion",
    rarity: "special",
    name: { en: "Golden dragon", pt: "Dragão dourado" },
  },
] as const satisfies readonly Reward[];
export type RewardId = (typeof REWARDS)[number]["id"];
export const PALETTE_SWATCHES: Record<string, readonly string[]> = {
  coral: ["#1c1d1f", "#e6e7eb", "#e56d68", "#5967ff"],
  forest: ["#18231e", "#c9dbc1", "#a2d692", "#629f85"],
  violet: ["#211d2c", "#e4daf4", "#c8a1ed", "#9587e9"],
  campfire: ["#26201c", "#f4e1c8", "#efb569", "#d6906c"],
  rose: ["#291b25", "#f9e7f0", "#f395bf", "#ce83bd"],
  aurora: ["#0f1630", "#e8ecff", "#5cf2a6", "#b07cff"],
  ocean: ["#0f1d2b", "#e3eef7", "#4f9dff", "#2fc4b2"],
  treasure: ["#1d180d", "#fbf1d3", "#ffd23f", "#e0a526"],
};
export const getReward = (id: string): Reward | undefined =>
  REWARDS.find((item) => item.id === id);
export const getRarity = (id: RarityId) =>
  RARITIES.find((rarity) => rarity.id === id)!;
/** Tier names follow the CS2 reference; only the special tier is translated. */
export const rarityName = (id: RarityId, special: string) =>
  id === "special" ? special : getRarity(id).name;

export function drawReward(random: () => number = Math.random): Reward {
  const roll = random();
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1)
    throw new RangeError("Expected a random value in [0, 1).");
  let limit = 0;
  const rarity = RARITIES.find((tier) => {
    limit += tier.chance;
    return roll * 100 < limit;
  })!;
  const candidates = REWARDS.filter((item) => item.rarity === rarity.id);
  const itemRoll = random();
  if (!Number.isFinite(itemRoll) || itemRoll < 0 || itemRoll >= 1)
    throw new RangeError("Expected a random value in [0, 1).");
  return candidates[Math.floor(itemRoll * candidates.length)];
}
