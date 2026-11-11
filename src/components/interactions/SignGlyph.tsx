export const SIGNS = [
  { id: "aard", name: "Aard", color: "#93c9ed", path: "M8 8H24L16 24Z" },
  { id: "igni", name: "Igni", color: "#f38d63", path: "M8 24H24L16 8Z" },
  {
    id: "yrden",
    name: "Yrden",
    color: "#c09aef",
    path: "M8 8H24L16 24ZM11 15H21",
  },
  {
    id: "quen",
    name: "Quen",
    color: "#efca75",
    path: "M8 24H24L16 8ZM11 17H21",
  },
  {
    id: "axii",
    name: "Axii",
    color: "#9aca8b",
    path: "M8 8H24L16 24ZM8 20H24",
  },
] as const;
export default function SignGlyph({ id }: { id: string }) {
  const sign = SIGNS.find((sign) => sign.id === id) ?? SIGNS[0];
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d={sign.path} />
    </svg>
  );
}
