/** Distinct line markers so series differ by shape, not only by color (WCAG 1.4.1). */

interface DotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
}

export function CircleDot({ cx, cy, stroke }: DotProps) {
  if (cx === undefined || cy === undefined) return <g />;
  return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--background))" stroke={stroke} strokeWidth={2} />;
}

export function SquareDot({ cx, cy, stroke }: DotProps) {
  if (cx === undefined || cy === undefined) return <g />;
  return <rect x={cx - 4} y={cy - 4} width={8} height={8} fill="hsl(var(--background))" stroke={stroke} strokeWidth={2} />;
}

export const DASH_PATTERN = "6 4";
