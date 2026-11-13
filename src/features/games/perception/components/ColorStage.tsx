import type { CSSProperties } from "react";
import { cssColor, type HSL } from "../model/perception";

type Props = {
  pt: boolean;
  preview: boolean;
  result: boolean;
  seconds: number;
  target: HSL;
  guess: HSL;
  value: HSL;
  onChange: (value: HSL) => void;
};
export default function ColorStage({
  pt,
  preview,
  result,
  seconds,
  target,
  guess,
  value,
  onChange,
}: Props) {
  const gradients = [
    "linear-gradient(to right, #f44, #ff4, #4f4, #4ff, #44f, #f4f, #f44)",
    `linear-gradient(to right, ${cssColor([value[0], 0, value[2]])}, ${cssColor([value[0], 100, value[2]])})`,
    `linear-gradient(to right, #000, ${cssColor([value[0], value[1], 50])}, #fff)`,
  ];
  return (
    <div className="color-stage" data-adjusting={!preview && !result}>
      <div className="color-comparison" data-paired={result}>
        <figure>
          <div
            className="color-swatch"
            style={{
              backgroundColor: cssColor(
                preview ? target : result ? guess : value,
              ),
            }}
          />
          <figcaption>
            {preview
              ? pt
                ? "Memorize esta cor"
                : "Remember this color"
              : pt
                ? "Sua cor"
                : "Your color"}
            {preview ? <span role="timer">{seconds}s</span> : null}
          </figcaption>
        </figure>
        {result ? (
          <figure>
            <div
              className="color-swatch"
              style={{ backgroundColor: cssColor(target) }}
            />
            <figcaption>{pt ? "Cor original" : "Original color"}</figcaption>
          </figure>
        ) : null}
      </div>
      {!preview && !result ? (
        <div className="perception-sliders color-sliders">
          {[
            pt ? "Matiz" : "Hue",
            pt ? "Saturação" : "Saturation",
            pt ? "Luminosidade" : "Lightness",
          ].map((name, i) => (
            <label key={name} htmlFor={`color-channel-${i}`}>
              <span>{name}</span>
              <output htmlFor={`color-channel-${i}`}>
                {value[i]}
                {i === 0 ? "°" : "%"}
              </output>
              <input
                id={`color-channel-${i}`}
                name={`color-channel-${i}`}
                type="range"
                min={0}
                max={i === 0 ? 359 : 100}
                value={value[i]}
                style={{ "--range-fill": gradients[i] } as CSSProperties}
                onChange={(event) =>
                  onChange(
                    value.map((v, j) =>
                      j === i ? Number(event.target.value) : v,
                    ) as HSL,
                  )
                }
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
