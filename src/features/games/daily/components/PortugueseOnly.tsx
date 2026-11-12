"use client";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";

/**
 * Word games stay in Portuguese; English visitors see a PT-BR ribbon across
 * the panel's corner. Screen readers get the full sentence.
 */
export default function PortugueseOnly() {
  const { language } = useSettings();
  if (language !== "en") return null;
  return (
    <p className="pt-ribbon" lang="en" title={playCopy.en.portugueseOnly}>
      <span aria-hidden="true">PT-BR</span>
      <span className="sr-only">{playCopy.en.portugueseOnly}</span>
    </p>
  );
}
