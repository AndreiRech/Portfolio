"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/shared/i18n/SettingsContext";
import { playCopy } from "@/shared/i18n/play";
import { useDailyProgress, useToday } from "../../daily/hooks/useDaily";
import { useRecordDailyResult } from "../../daily/hooks/useHistory";
import DailyFinish from "../../daily/components/DailyFinish";
import GameHelp from "../../components/GameHelp";
import {
  colorScore,
  dailyColors,
  dailyPairs,
  freshPerception,
  parsePerception,
  scaleScore,
  type HSL,
} from "../model/perception";
import ColorStage from "./ColorStage";
import ScaleStage from "./ScaleStage";
import { useUnlock } from "@/features/achievements/hooks/AchievementContext";

const scoreBand = (score: number) =>
  score >= 90
    ? "excellent"
    : score >= 70
      ? "good"
      : score >= 40
        ? "fair"
        : "low";
const scoreLabels = {
  pt: { excellent: "Excelente", good: "Boa", fair: "Regular", low: "Baixa" },
  en: { excellent: "Excellent", good: "Good", fair: "Fair", low: "Low" },
};
export default function PerceptionGame({ kind }: { kind: "color" | "scale" }) {
  const today = useToday();
  return today ? (
    <Challenge
      key={`${kind}-${today.key}`}
      kind={kind}
      day={today.number}
      date={today.key}
    />
  ) : (
    <div role="status">...</div>
  );
}
function Challenge({
  kind,
  day,
  date,
}: {
  kind: "color" | "scale";
  day: number;
  date: string;
}) {
  const { language } = useSettings();
  const unlock = useUnlock();
  const pt = language === "pt",
    color = kind === "color";
  const title = color ? (pt ? "Cores" : "Color") : pt ? "Escala" : "Size it up";
  const colors = useMemo(() => dailyColors(day), [day]);
  const pairs = useMemo(() => dailyPairs(day), [day]);
  const [progress, setProgress] = useDailyProgress(
    color ? "perception-color-v1" : "perception-scale-v3",
    date,
    freshPerception,
    (value) => parsePerception(value, kind),
  );
  const [hsl, setHsl] = useState<HSL>([180, 50, 50]);
  const [ratio, setRatio] = useState(1);
  const [seconds, setSeconds] = useState(5);
  /** After the fifth round, which round's guess is on the stage. */
  const [reviewed, setReviewed] = useState(4);
  useEffect(() => {
    if (progress?.phase !== "preview") return;
    const end = Date.now() + 5000;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSeconds(left);
      if (!left) {
        window.clearInterval(timer);
        setProgress((current) => ({ ...current, phase: "adjust" }));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [progress?.phase, setProgress]);
  const scores =
    progress?.guesses.map((guess, i) =>
      color
        ? colorScore(guess as HSL, colors[i])
        : scaleScore(
            guess[0],
            pairs[i].target.meters / pairs[i].reference.meters,
          ),
    ) ?? [];
  const mean = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const finished = progress?.guesses.length === 5;
  useRecordDailyResult(
    kind,
    date,
    finished ? (mean >= 70 ? "won" : "lost") : null,
  );
  const precise = scores.some((score) => score >= 95);
  useEffect(() => {
    if (finished) unlock(color ? "color-five" : "scale-five");
    if (precise) unlock(color ? "color-eye" : "scale-eye");
  }, [finished, color, precise, unlock]);
  useEffect(() => {
    if (!finished) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        target?.closest("input, textarea, select, [contenteditable]")
      )
        return;
      const step =
        event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      if (!step) return;
      event.preventDefault();
      setReviewed((current) => Math.max(0, Math.min(4, current + step)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished]);
  if (!progress) return <div role="status">...</div>;
  const result = progress.phase === "result";
  const round = finished
    ? reviewed
    : Math.min(4, progress.guesses.length - (result ? 1 : 0));
  const roundWord = pt ? "Rodada" : "Round";
  const pair = pairs[round];
  const shownRatio = result ? progress.guesses[round][0] : ratio;
  const next = () => {
    setHsl([180, 50, 50]);
    setRatio(1);
    setSeconds(5);
    setProgress((current) => ({
      ...current,
      phase: color ? "preview" : "adjust",
    }));
  };
  return (
    <article
      className="daily-lab perception-lab"
      aria-labelledby="perception-title"
    >
      <div className="play-panel-heading">
        <span className="pixel-label">
          {playCopy[language].dailyLabel.replace("{n}", String(day))}
        </span>
        <span className="memory-best">
          {roundWord} <strong>{round + 1}/5</strong>
        </span>
      </div>
      <h2 id="perception-title">{title}</h2>
      <GameHelp>
        {color
          ? pt
            ? "Observe a cor por cinco segundos. Depois, recrie-a de memória ajustando matiz, saturação e luminosidade. São cinco cores por dia, com até 100 pontos por rodada. Vença com média de pelo menos 70/100."
            : "Study a color for five seconds, then recreate it from memory using hue, saturation and lightness. Five colors per day, up to 100 points each. Average at least 70/100 to win."
          : pt
            ? "Ajuste o tamanho da silhueta da direita até representar a proporção real entre os dois objetos. As alturas são valores típicos aproximados. São cinco pares por dia, com até 100 pontos por rodada. Vença com média de pelo menos 70/100."
            : "Resize the right silhouette to match its real-world scale next to the reference. Heights are approximate typical values. Five pairs per day, up to 100 points each. Average at least 70/100 to win."}
      </GameHelp>
      {progress.phase === "ready" ? (
        <button className="button primary perception-action" onClick={next}>
          {pt ? "Começar" : "Start"}
        </button>
      ) : (
        <>
          {color ? (
            <ColorStage
              pt={pt}
              preview={progress.phase === "preview"}
              result={result}
              seconds={seconds}
              target={colors[round]}
              guess={(progress.guesses[round] ?? hsl) as HSL}
              value={hsl}
              onChange={setHsl}
            />
          ) : (
            <ScaleStage
              pt={pt}
              reference={pair.reference}
              target={pair.target}
              ratio={shownRatio}
              result={result}
              onChange={setRatio}
            />
          )}
          {progress.phase === "adjust" ? (
            <button
              className="button primary perception-action"
              onClick={() =>
                setProgress((current) =>
                  current.phase !== "adjust"
                    ? current
                    : {
                        guesses: [...current.guesses, color ? hsl : [ratio]],
                        phase: "result",
                      },
                )
              }
            >
              {pt ? "Confirmar" : "Confirm"}
            </button>
          ) : null}
          {result ? (
            <div
              className="perception-result"
              data-score-band={scoreBand(scores[round])}
              role="status"
              aria-live="polite"
            >
              {finished ? (
                <div className="perception-review">
                  <button
                    type="button"
                    className="perception-review-arrow"
                    aria-label={pt ? "Rodada anterior" : "Previous round"}
                    disabled={round === 0}
                    onClick={() => setReviewed(round - 1)}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <span>
                    {roundWord} {round + 1} {pt ? "de" : "of"} 5
                  </span>
                  <button
                    type="button"
                    className="perception-review-arrow"
                    aria-label={pt ? "Próxima rodada" : "Next round"}
                    disabled={round === 4}
                    onClick={() => setReviewed(round + 1)}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <strong>{scores[round]}/100</strong>
              <p>
                {scoreLabels[language][scoreBand(scores[round])]} ·{" "}
                {pt ? "Pontos nesta rodada" : "Points this round"}
              </p>
              {!finished ? (
                <button
                  className="button primary perception-action"
                  onClick={next}
                >
                  {pt ? "Próxima rodada" : "Next round"}
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
      {scores.length ? (
        <ol
          className="perception-scores"
          aria-label={pt ? "Pontuação por rodada" : "Round scores"}
        >
          {scores.map((score, i) => {
            const body = (
              <>
                <span>
                  {roundWord} {i + 1}
                </span>
                <b>
                  {score}
                  <small>/100</small>
                </b>
                <em>{scoreLabels[language][scoreBand(score)]}</em>
              </>
            );
            return (
              <li
                key={i}
                data-score-band={scoreBand(score)}
                data-active={finished && i === round}
              >
                {finished ? (
                  <button
                    type="button"
                    aria-pressed={i === round}
                    onClick={() => setReviewed(i)}
                  >
                    {body}
                  </button>
                ) : (
                  body
                )}
              </li>
            );
          })}
          {finished ? (
            <li className="perception-mean" data-score-band={scoreBand(mean)}>
              <span>{pt ? "Média" : "Average"}</span>
              <b>
                {mean}
                <small>/100</small>
              </b>
              <em>{scoreLabels[language][scoreBand(mean)]}</em>
            </li>
          ) : null}
        </ol>
      ) : null}
      {finished ? (
        <DailyFinish
          won={mean >= 70}
          message={`${pt ? "Média do dia" : "Daily average"}: ${mean}/100`}
          share={`${title} #${day}\n${scores.join(" · ")}\n${mean}/100`}
        />
      ) : null}
    </article>
  );
}
