// src/lib/categoryColors.ts
import type { ProjectCategory } from "@/features/portfolio/model/types";

/** A category's block color, plus the text color that reads on top of it when
    the block is used as a fill. No single text color works on all four at full
    strength, so `globals.css` pairs them: green/yellow take `ink`, red/blue
    take `paper`. Keeping the pair in one entry is what stops them drifting. */
export interface CategoryColor {
  block: string;
  on: string;
}

/** Each project category owns one of the four block-color tokens defined in
    `globals.css`. Those four colors are reserved for category identity — they
    are deliberately not used as general-purpose accents anywhere else.

    `Record<ProjectCategory, …>` makes the mapping exhaustive at compile time:
    adding a category to the union breaks the build here until it gets a color. */
const CATEGORY_COLORS: Record<ProjectCategory, CategoryColor> = {
  iOS: { block: "var(--color-block-blue)", on: "var(--color-paper)" },
  University: { block: "var(--color-block-green)", on: "var(--color-ink)" },
  Personal: { block: "var(--color-block-red)", on: "var(--color-paper)" },
  Others: { block: "var(--color-block-yellow)", on: "var(--color-ink)" },
};

/** The colors for a category, as consumed by the `--category-color` /
    `--category-on` custom properties that `.filter-chip` and `.category-badge`
    read. */
export function getCategoryColor(category: ProjectCategory): CategoryColor {
  return CATEGORY_COLORS[category];
}
