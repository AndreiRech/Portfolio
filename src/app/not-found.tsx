import type { Metadata } from "next";
import NotFoundView from "@/features/portfolio/pages/NotFoundPage";
export const metadata: Metadata = { title: "404" };
export default function NotFound() {
  return <NotFoundView />;
}
