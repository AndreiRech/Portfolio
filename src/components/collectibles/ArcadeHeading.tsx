"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCollection } from "@/context/CollectionContext";
import { useSettings } from "@/context/SettingsContext";
export default function ArcadeHeading({
  page,
}: {
  page: "cases" | "inventory";
}) {
  const { saved } = useCollection();
  const { copy: c } = useSettings();
  return (
    <>
      <Link href="/#explore" className="back-link">
        <ArrowLeft size={15} />
        {c.back}
      </Link>
      <nav className="arcade-tabs" aria-label={c.explore}>
        <Link
          href="/cases"
          aria-current={page === "cases" ? "page" : undefined}
        >
          {c.boxes}
        </Link>
        <Link
          href="/inventory"
          aria-current={page === "inventory" ? "page" : undefined}
        >
          {c.inventory}
        </Link>
      </nav>
      <div className="page-heading">
        <h1>{page === "cases" ? c.casesTitle : c.inventoryTitle}</h1>
        <p>{page === "cases" ? c.casesBody : c.inventoryDescription}</p>
      </div>
      {!saved ? (
        <p className="storage-warning" role="status">
          {c.storageUnavailable}
        </p>
      ) : null}
    </>
  );
}
