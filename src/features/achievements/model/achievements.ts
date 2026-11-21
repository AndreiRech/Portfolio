export const ACHIEVEMENT_KEY = "andrei-achievements-v1"; // gitleaks:allow -- Public browser storage namespace, not a credential.

export const ACHIEVEMENTS = [
  {
    id: "nat20",
    title: { en: "Natural 20", pt: "20 natural" },
    hint: {
      en: "Roll a 20 with the D20 companion.",
      pt: "Tire 20 com o companheiro D20.",
    },
  },
  {
    id: "fumble",
    title: { en: "Critical fail", pt: "Falha crítica" },
    hint: {
      en: "Roll a 1 with the D20 companion.",
      pt: "Tire 1 com o companheiro D20.",
    },
  },
  {
    id: "first-case",
    title: { en: "Unboxed", pt: "Primeira caixa" },
    hint: { en: "Open your first case.", pt: "Abra sua primeira caixa." },
  },
  {
    id: "golden-drop",
    title: { en: "Golden drop", pt: "Drop dourado" },
    hint: {
      en: "Find a ★ item in a case.",
      pt: "Encontre um item ★ em uma caixa.",
    },
  },
  {
    id: "memory5",
    title: { en: "Sharp memory", pt: "Memória afiada" },
    hint: {
      en: "Clear round 5 of the memory game.",
      pt: "Vença a rodada 5 do jogo de memória.",
    },
  },
  {
    id: "perfect-pitch",
    title: { en: "Perfect pitch", pt: "Ouvido absoluto" },
    hint: {
      en: "Guess a song from its first one-second clip.",
      pt: "Acerte uma música no primeiro trecho de um segundo.",
    },
  },
  {
    id: "anime-streak",
    title: { en: "Otaku sense", pt: "Faro otaku" },
    hint: {
      en: "Get 10 in a row in Higher or lower.",
      pt: "Acerte 10 seguidas no Mais ou menos.",
    },
  },
  {
    id: "mimic",
    title: { en: "Monster slayer", pt: "Caçador de monstros" },
    hint: { en: "Win a D20 duel.", pt: "Vença um duelo D20." },
  },
  {
    id: "companion",
    title: { en: "Good company", pt: "Boa companhia" },
    hint: {
      en: "Let a companion explore the site.",
      pt: "Solte um companheiro pelo site.",
    },
  },
  {
    id: "inspector",
    title: { en: "Inspector", pt: "Inspetor" },
    hint: { en: "Look at every project.", pt: "Veja todos os projetos." },
  },
  {
    id: "contact",
    title: { en: "First contact", pt: "Primeiro contato" },
    hint: { en: "Copy the email address.", pt: "Copie o endereço de e-mail." },
  },
  {
    id: "konami",
    title: { en: "Old school", pt: "Das antigas" },
    hint: {
      en: "Enter a classic code. You know the one.",
      pt: "Digite um código clássico. Você sabe qual.",
    },
  },
  {
    id: "mine-clear",
    title: { en: "Safe ground", pt: "Terreno seguro" },
    hint: {
      en: "Win a game of Minesweeper.",
      pt: "Vença uma partida de Campo minado.",
    },
  },
  {
    id: "mine-expert",
    title: { en: "Bomb disposal", pt: "Desarmador" },
    hint: {
      en: "Win Minesweeper on Hard.",
      pt: "Vença o Campo minado no Difícil.",
    },
  },
  {
    id: "sudoku-solved",
    title: { en: "One to nine", pt: "De um a nove" },
    hint: {
      en: "Solve a Sudoku without revealing the answer.",
      pt: "Resolva um Sudoku sem revelar a resposta.",
    },
  },
  {
    id: "sudoku-clean",
    title: { en: "Pure logic", pt: "Lógica pura" },
    hint: {
      en: "Solve a Hard Sudoku without mistakes or hints.",
      pt: "Resolva um Sudoku Difícil sem erros nem dicas.",
    },
  },
  {
    id: "color-five",
    title: { en: "Color memory", pt: "Memória de cores" },
    hint: {
      en: "Finish all five daily Color rounds.",
      pt: "Conclua as cinco rodadas diárias de Cores.",
    },
  },
  {
    id: "color-eye",
    title: { en: "An eye for color", pt: "Olho para cores" },
    hint: {
      en: "Score at least 95 in a Color round.",
      pt: "Faça pelo menos 95 pontos em uma rodada de Cores.",
    },
  },
  {
    id: "scale-five",
    title: { en: "A sense of scale", pt: "Noção de escala" },
    hint: {
      en: "Finish all five daily Size it up rounds.",
      pt: "Conclua as cinco rodadas diárias de Escala.",
    },
  },
  {
    id: "scale-eye",
    title: { en: "Made to measure", pt: "Sob medida" },
    hint: {
      en: "Score at least 95 in a Size it up round.",
      pt: "Faça pelo menos 95 pontos em uma rodada de Escala.",
    },
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

const known = new Set<string>(ACHIEVEMENTS.map((item) => item.id));
export const isAchievement = (id: unknown): id is AchievementId =>
  typeof id === "string" && known.has(id);

/** Keeps only catalogue ids, once each, in the order they were unlocked. */
export function parseAchievements(raw: string | null): AchievementId[] {
  if (!raw || raw.length > 2000) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(isAchievement))];
  } catch {
    return [];
  }
}

export function unlockAchievement(
  unlocked: readonly AchievementId[],
  id: string,
): readonly AchievementId[] {
  if (!isAchievement(id) || unlocked.includes(id)) return unlocked;
  return [...unlocked, id];
}

export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/** Advances the code position for one key; reaching KONAMI.length completes it. */
export function konamiStep(position: number, key: string): number {
  const pressed = key.length === 1 ? key.toLowerCase() : key;
  if (pressed === KONAMI[position]) return position + 1;
  // Two leading ups followed by a third still leaves two ups entered.
  if (pressed === "ArrowUp") return position === 2 ? 2 : 1;
  return 0;
}

export interface AchievementStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type AchievementSnapshot = {
  unlocked: readonly AchievementId[];
  ready: boolean;
};
export function createAchievementStore(storage: () => AchievementStorage) {
  let snapshot: AchievementSnapshot = { unlocked: [], ready: false };
  const serverSnapshot = snapshot;
  const listeners = new Set<() => void>();
  const load = () => {
    let unlocked: AchievementId[] = [];
    try {
      unlocked = parseAchievements(storage().getItem(ACHIEVEMENT_KEY));
    } catch {
      /* Achievements stay usable for this visit. */
    }
    snapshot = { unlocked, ready: true };
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!snapshot.ready) load();
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    /** Returns true only the first time an achievement is unlocked. */
    unlock(id: string): boolean {
      if (!snapshot.ready) load();
      const unlocked = unlockAchievement(snapshot.unlocked, id);
      if (unlocked === snapshot.unlocked) return false;
      try {
        storage().setItem(ACHIEVEMENT_KEY, JSON.stringify(unlocked));
      } catch {
        /* Achievements stay usable for this visit. */
      }
      snapshot = { unlocked, ready: true };
      listeners.forEach((listener) => listener());
      return true;
    },
  };
}
