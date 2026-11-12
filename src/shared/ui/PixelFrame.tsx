/** One frame of grid pixel art: each row becomes horizontal runs of rects. */
export default function PixelFrame({
  rows,
  palette,
  className,
  x = 0,
  y = 0,
}: {
  rows: readonly string[];
  palette: Record<string, string>;
  className?: string;
  x?: number;
  y?: number;
}) {
  const runs: React.ReactNode[] = [];
  rows.forEach((row, top) => {
    let left = 0;
    while (left < row.length) {
      const key = row[left];
      let end = left + 1;
      while (end < row.length && row[end] === key) end++;
      if (key !== "." && palette[key])
        runs.push(
          <rect
            key={`${top}-${left}`}
            x={x + left}
            y={y + top}
            width={end - left}
            height={1}
            fill={palette[key]}
          />,
        );
      left = end;
    }
  });
  return <g className={className}>{runs}</g>;
}
