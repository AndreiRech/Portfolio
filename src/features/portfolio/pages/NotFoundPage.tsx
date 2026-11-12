"use client";
import PixelPet from "@/features/companions/components/PixelPet";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
export default function NotFoundView() {
  const { copy: c } = useSettings();
  return (
    <main id="main" className="inner-page container not-found">
      <div className="not-found-art" aria-hidden="true">
        <span>4</span>
        <PixelPet id="chicken" className="not-found-pet" />
        <span>4</span>
      </div>
      <p className="pixel-label">{c.notFoundCode}</p>
      <h1>{c.notFoundTitle}</h1>
      <p>{c.notFoundBody}</p>
      <div className="not-found-actions">
        <Link href="/" className="button primary">
          <ArrowLeft size={17} />
          {c.back}
        </Link>
        <Link href="/cases" className="button">
          <PackageOpen size={17} />
          {c.boxAction}
        </Link>
      </div>
    </main>
  );
}
