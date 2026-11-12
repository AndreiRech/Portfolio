import type { Metadata } from "next";
import CasesView from "@/features/collectibles/pages/CasesPage";
export const metadata: Metadata = { title: "Cases" };
export default function CasesPage() {
  return <CasesView />;
}
