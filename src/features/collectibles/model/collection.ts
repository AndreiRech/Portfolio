import { REWARDS, getReward, type RewardKind } from "../data/collectibles.ts";

export const COLLECTION_KEY = "andrei-collection-v1"; // gitleaks:allow -- Public browser storage namespace, not a credential.
export interface Collection {
  version: 1;
  counts: Record<string, number>;
  equipped: Record<RewardKind, string | null>;
  lastOpening: string | null;
}
export const emptyCollection = (): Collection => ({
  version: 1,
  counts: {},
  equipped: { palette: null, cursor: null, companion: null },
  lastOpening: null,
});

const validCount = (count: unknown): count is number =>
  typeof count === "number" &&
  Number.isSafeInteger(count) &&
  count > 0 &&
  count <= 1_000_000;

/** Companion activation follows the same ownership rule as equipment. */
export function canUseCompanion(collection: Collection, id: string): boolean {
  return (
    getReward(id)?.kind === "companion" && (collection.counts[id] ?? 0) > 0
  );
}

export function parseCollection(raw: string | null): Collection {
  const clean = emptyCollection();
  if (!raw || raw.length > 16000) return clean;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1
    )
      return clean;
    const candidate = value as Partial<Collection>;
    if (candidate.counts && typeof candidate.counts === "object") {
      for (const item of REWARDS) {
        const current = candidate.counts[item.id];
        const legacy =
          item.id === "medallion" ? candidate.counts.wolf : undefined;
        const count = Math.min(
          (validCount(current) ? current : 0) +
            (validCount(legacy) ? legacy : 0),
          1_000_000,
        );
        if (Number.isSafeInteger(count) && count > 0 && count <= 1_000_000)
          clean.counts[item.id] = count;
      }
    }
    if (candidate.equipped && typeof candidate.equipped === "object") {
      for (const kind of ["palette", "cursor", "companion"] as const) {
        const stored: unknown = candidate.equipped[kind];
        const id = stored === "wolf" ? "medallion" : stored;
        if (
          typeof id === "string" &&
          getReward(id)?.kind === kind &&
          clean.counts[id]
        )
          clean.equipped[kind] = id;
      }
    }
    if (
      typeof candidate.lastOpening === "string" &&
      candidate.lastOpening.length <= 80
    )
      clean.lastOpening = candidate.lastOpening;
  } catch {
    /* An unreadable collection must not prevent access to the portfolio. */
  }
  return clean;
}

export function grantReward(
  collection: Collection,
  opening: string,
  rewardId: string,
): Collection {
  if (!opening || opening === collection.lastOpening || !getReward(rewardId))
    return collection;
  return {
    ...collection,
    lastOpening: opening,
    counts: {
      ...collection.counts,
      [rewardId]: Math.min((collection.counts[rewardId] ?? 0) + 1, 1_000_000),
    },
  };
}

export function equipReward(collection: Collection, id: string): Collection {
  const reward = getReward(id);
  if (!reward || !collection.counts[id]) return collection;
  return {
    ...collection,
    equipped: { ...collection.equipped, [reward.kind]: id },
  };
}

export type CollectionSnapshot = {
  data: Collection;
  ready: boolean;
  saved: boolean;
};
export interface CollectionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function createCollectionStore(storage: () => CollectionStorage) {
  let snapshot: CollectionSnapshot = {
    data: emptyCollection(),
    ready: false,
    saved: true,
  };
  const serverSnapshot = snapshot;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const load = () => {
    try {
      snapshot = {
        data: parseCollection(storage().getItem(COLLECTION_KEY)),
        ready: true,
        saved: true,
      };
    } catch {
      snapshot = { ...snapshot, ready: true, saved: false };
    }
  };
  const update = (change: (data: Collection) => Collection) => {
    if (!snapshot.ready) load();
    const data = change(snapshot.data);
    if (data === snapshot.data) return;
    let saved = true;
    try {
      storage().setItem(COLLECTION_KEY, JSON.stringify(data));
    } catch {
      saved = false;
    }
    snapshot = { data, ready: true, saved };
    notify();
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
    grant: (opening: string, id: string) =>
      update((data) => grantReward(data, opening, id)),
    equip: (id: string) => update((data) => equipReward(data, id)),
    remove: (kind: RewardKind) =>
      update((data) => ({
        ...data,
        equipped: { ...data.equipped, [kind]: null },
      })),
    resetAppearance: () =>
      update((data) => ({
        ...data,
        equipped: { palette: null, cursor: null, companion: null },
      })),
  };
}
