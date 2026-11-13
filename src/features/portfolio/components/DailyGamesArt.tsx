import PixelFrame from "@/shared/ui/PixelFrame";

const LETTERS: Record<string, string[]> = {
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
};

/** A pixel calendar with word tiles for the daily games invitation. */
export default function DailyGamesArt({ language }: { language: "pt" | "en" }) {
  const word = language === "pt" ? "DIA" : "DAY";
  return (
    <svg
      className="daily-games-art"
      viewBox="0 0 80 64"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M12 10h56v4h4v44h-4v4H12v-4H8V14h4Z" fill="var(--bg)" />
      <path d="M10 8h56v4h4v44h-4v4H10v-4H6V12h4Z" fill="var(--line)" />
      <path d="M10 12h56v10H10Z" fill="var(--accent)" />
      <path d="M10 24h56v32H10Z" fill="var(--raised)" />
      <path d="M18 4h4v12h-4Zm32 0h4v12h-4Z" fill="var(--fg)" />
      {["#a2cc98", "#dec77d", "#a5d9e2"].map((color, index) => (
        <g key={color} transform={`translate(${16 + index * 16} 28)`}>
          <rect width="12" height="12" fill={color} />
          <g transform="translate(3 1) scale(2)">
            <PixelFrame
              rows={LETTERS[word[index]]}
              palette={{ "#": "#25272a" }}
            />
          </g>
          <rect y="16" width="12" height="6" fill="var(--line)" />
        </g>
      ))}
      <path d="M62 40h16v20H58V44h4Z" fill="#a2cc98" />
      <path
        d="M61 49h3v3h3v-3h3v-3h3v-3h3v6h-3v3h-3v3h-3v3h-3v-3h-3Z"
        fill="var(--bg)"
      />
    </svg>
  );
}
