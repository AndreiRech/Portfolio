import type { Metadata } from "next";
import InventoryView from "@/features/collectibles/pages/InventoryPage";
export const metadata: Metadata = { title: "Inventory" };
export default function InventoryPage() {
  return <InventoryView />;
}
