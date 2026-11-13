"use client";
import { useEffect, useState } from "react";
import { Check, CircleX, Share2, Trophy } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { countdown } from "@/features/games/daily/model/daily";
import { useUntilTomorrow } from "@/features/games/daily/hooks/useDaily";
import PixelRain from "../../rarity/components/PixelRain";

/** Shown once a daily puzzle ends: the verdict, a share button and the wait. */
export default function DailyFinish({
  won,
  message,
  share,
}: {
  won: boolean;
  message: string;
  share?: string;
}) {
  const { language } = useSettings();
  const c = playCopy[language];
  const left = useUntilTomorrow(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <div className="daily-finish" data-won={won}>
      {won ? <PixelRain points={10} seed={731} /> : null}
      <div className="daily-finish-verdict" role="status">
        <strong>
          {won ? (
            <Trophy size={22} aria-hidden="true" />
          ) : (
            <CircleX size={22} aria-hidden="true" />
          )}
          {won ? c.dailyWon : c.dailyLost}
        </strong>
        <p>{message}</p>
      </div>
      <div className="daily-finish-row">
        {share ? (
          <button
            className="button primary"
            onClick={() =>
              navigator.clipboard
                ?.writeText(share)
                .then(() => setCopied(true))
                .catch(() => setCopied(false))
            }
          >
            {copied ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <Share2 size={17} aria-hidden="true" />
            )}
            {copied ? c.dailyCopied : c.dailyShare}
          </button>
        ) : null}
        <span className="daily-next">
          {c.dailyNext} <b>{countdown(left)}</b>
        </span>
      </div>
    </div>
  );
}
