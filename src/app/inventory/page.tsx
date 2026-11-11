import type { Metadata } from "next";
import InventoryView from "@/components/collectibles/InventoryView";
export const metadata: Metadata = { title: "Inventory" };
export default function InventoryPage() {
  return <InventoryView />;
}
