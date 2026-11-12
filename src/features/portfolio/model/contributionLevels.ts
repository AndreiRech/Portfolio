export const CONTRIBUTION_RANGES = ["0", "1-5", "6-15", "16-40", "41+"];

export function contributionLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 5) return 1;
  if (count <= 15) return 2;
  if (count <= 40) return 3;
  return 4;
}
