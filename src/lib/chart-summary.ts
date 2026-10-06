/** Pure helpers to describe chart data as text (aria-label summaries, share bars). */

export type SummaryRow = Record<string, string | number | null | undefined>;

export interface SeriesStats {
  count: number;
  average: number;
  min: { label: string; value: number };
  max: { label: string; value: number };
}

/** Min / max / average of a numeric column. Ignores null, NaN and non-numeric values. */
export function seriesStats(rows: SummaryRow[], labelKey: string, valueKey: string): SeriesStats | null {
  const valid = rows.flatMap((row) => {
    const value = row[valueKey];
    return typeof value === "number" && Number.isFinite(value)
      ? [{ label: String(row[labelKey] ?? ""), value }]
      : [];
  });
  if (valid.length === 0) return null;
  let min = valid[0];
  let max = valid[0];
  let sum = 0;
  for (const point of valid) {
    sum += point.value;
    if (point.value < min.value) min = point;
    if (point.value > max.value) max = point;
  }
  return { count: valid.length, average: sum / valid.length, min, max };
}

export interface DescribeSeriesOptions {
  title: string;
  rows: SummaryRow[];
  labelKey: string;
  valueKey: string;
  /** Formats a value for reading, e.g. a percent or a currency string. */
  format: (value: number) => string;
  /** Singular and plural noun for the points, e.g. ["vehículo", "vehículos"]. */
  noun: [string, string];
  /** Prefix for min/max labels, e.g. "placa". Optional. */
  labelPrefix?: string;
}

/** One-sentence text summary of a series, meant for `aria-label`. */
export function describeSeries({ title, rows, labelKey, valueKey, format, noun, labelPrefix }: DescribeSeriesOptions): string {
  const stats = seriesStats(rows, labelKey, valueKey);
  if (!stats) return `${title}: sin datos.`;
  const where = (label: string) => (label ? ` (${labelPrefix ? `${labelPrefix} ` : ""}${label})` : "");
  const count = `${stats.count} ${stats.count === 1 ? noun[0] : noun[1]}`;
  if (stats.count === 1) return `${title}: ${count}, ${format(stats.min.value)}${where(stats.min.label)}.`;
  return `${title}: ${count}, promedio ${format(stats.average)}, menor ${format(stats.min.value)}${where(stats.min.label)}, mayor ${format(stats.max.value)}${where(stats.max.label)}.`;
}

/** Integer percentages of two parts over their sum; they always add up to 100. Null when the total is 0. */
export function splitPercent(a: number, b: number): { a: number; b: number } | null {
  const total = a + b;
  if (!(total > 0) || a < 0 || b < 0) return null;
  const pa = Math.round((a / total) * 100);
  return { a: pa, b: 100 - pa };
}
