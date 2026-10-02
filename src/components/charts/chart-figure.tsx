import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ChartColumn {
  key: string;
  header: string;
  format?: (value: string | number) => string;
}

interface ChartFigureProps {
  /** Text summary read by screen readers instead of the SVG. */
  label: string;
  columns: ChartColumn[];
  rows: Record<string, string | number | null | undefined>[];
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a Recharts chart with a text alternative: `role="img"` + summary, and a
 * collapsible table with the same data. The table is a sibling of the figure
 * because `role="img"` makes its children presentational.
 */
export function ChartFigure({ label, columns, rows, children, className }: ChartFigureProps) {
  return (
    <div className={className}>
      <figure role="img" aria-label={label} className="m-0">
        {children}
      </figure>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer select-none rounded py-1 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          Ver datos
        </summary>
        <div className="mt-2 max-h-72 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    Sin datos
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((c) => {
                      const v = row[c.key];
                      return (
                        <TableCell key={c.key}>{v === null || v === undefined ? "—" : c.format ? c.format(v) : String(v)}</TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </details>
    </div>
  );
}
