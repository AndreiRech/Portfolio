import type { Metadata } from "next";
import CasesView from "@/components/collectibles/CasesView";
export const metadata: Metadata = { title: "Cases" };
export default function CasesPage() {
  return <CasesView />;
}
