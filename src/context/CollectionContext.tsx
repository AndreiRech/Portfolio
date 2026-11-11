"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createCollectionStore } from "@/lib/collection";

type Store = ReturnType<typeof createCollectionStore>;
const CollectionContext = createContext<Store | null>(null);
export function CollectionProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createCollectionStore(() => window.localStorage),
  );
  return (
    <CollectionContext.Provider value={store}>
      {children}
      <ApplyAppearance />
    </CollectionContext.Provider>
  );
}
export function useCollection() {
  const store = useContext(CollectionContext);
  if (!store) throw new Error("CollectionProvider is required.");
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    grant: store.grant,
    equip: store.equip,
    remove: store.remove,
    resetAppearance: store.resetAppearance,
  };
}
function ApplyAppearance() {
  const { data } = useCollection();
  useEffect(() => {
    document.documentElement.dataset.palette =
      data.equipped.palette ?? "default";
    document.documentElement.dataset.cursor = data.equipped.cursor ?? "default";
  }, [data.equipped.palette, data.equipped.cursor]);
  return null;
}
