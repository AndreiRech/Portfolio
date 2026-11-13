import { Minus, Plus } from "lucide-react";
import Silhouette from "./Silhouette";
import type { ObjectSize } from "../model/perception";
type Props = {
  pt: boolean;
  reference: ObjectSize;
  target: ObjectSize;
  ratio: number;
  result: boolean;
  onChange: (ratio: number) => void;
};
export default function ScaleStage({
  pt,
  reference,
  target,
  ratio,
  result,
  onChange,
}: Props) {
  const actual = target.meters / reference.meters;
  const unit = 200 / Math.max(1, ratio, result ? actual : 1);
  const name = (o: ObjectSize) => (pt ? o.pt : o.en);
  const number = (n: number) =>
    n.toLocaleString(pt ? "pt-BR" : "en-US", { maximumFractionDigits: 2 });
  const change = (next: number) => onChange(Math.min(8, Math.max(0.125, next)));
  return (
    <div className="scale-stage">
      <div className="size-scene">
        <svg
          viewBox="0 0 720 280"
          role="img"
          aria-label={`${name(reference)}, ${name(target)}`}
        >
          <path d="M24 258H696" className="size-ground" />
          <Silhouette shape={reference.shape} height={unit} x={180} />
          <Silhouette shape={target.shape} height={unit * ratio} x={540} />
          {result ? (
            <Silhouette
              shape={target.shape}
              height={unit * actual}
              x={540}
              ghost
            />
          ) : null}
        </svg>
        <div className="size-labels">
          <div>
            <span>{name(reference)}</span>
            <small>{number(reference.meters)} m</small>
          </div>
          <div>
            <span>{name(target)}</span>
            <small>
              {result
                ? `${number(target.meters)} m`
                : pt
                  ? "Ajuste o tamanho"
                  : "Adjust the size"}
            </small>
          </div>
        </div>
      </div>
      {result ? (
        <div className="size-legend">
          <span>
            <i />
            {pt ? "Sua estimativa" : "Your estimate"}
          </span>
          <span>
            <i />
            {pt ? "Tamanho correto" : "Correct size"}
          </span>
        </div>
      ) : (
        <div className="scale-adjustment">
          <label htmlFor="size-ratio">
            {pt ? "Tamanho da silhueta" : "Silhouette size"}
            <output htmlFor="size-ratio">{number(ratio)}×</output>
          </label>
          <div className="scale-range">
            <button
              type="button"
              aria-label={pt ? "Diminuir tamanho" : "Decrease size"}
              onClick={() => change(ratio / 1.08)}
              disabled={ratio <= 0.125}
            >
              <Minus size={18} aria-hidden="true" />
            </button>
            <input
              id="size-ratio"
              name="size-ratio"
              type="range"
              min={-100}
              max={100}
              step={1}
              value={(Math.log2(ratio) / 3) * 100}
              onChange={(event) =>
                change(2 ** ((Number(event.target.value) / 100) * 3))
              }
            />
            <button
              type="button"
              aria-label={pt ? "Aumentar tamanho" : "Increase size"}
              onClick={() => change(ratio * 1.08)}
              disabled={ratio >= 8}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
