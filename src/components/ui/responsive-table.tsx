"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ResponsiveColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /**
   * Shown on the mobile card. Defaults to the first 3 columns; set `true` on the ones that matter
   * (and `false` to hide a column from cards).
   */
  card?: boolean;
  /** This column identifies the row (placa, nombre): rendered as `<th scope="row">` and as the card title. */
  rowHeader?: boolean;
  className?: string;
}

export interface RowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: ReadonlyArray<ResponsiveColumn<T>>;
  rows: ReadonlyArray<T>;
  getRowId: (row: T) => string;
  /** Per-row menu. Rendered as a "⋯" button in the table and in each card. */
  actions?: (row: T) => ReadonlyArray<RowAction<T>>;
  /** Accessible name of the row menu button, e.g. (row) => `Acciones de ${row.placa}`. */
  actionsLabel?: (row: T) => string;
  /** Accessible table name (visually hidden `caption`). */
  caption: string;
  /** Rendered instead of the table when `rows` is empty (use <EmptyState/>). */
  empty?: React.ReactNode;
  className?: string;
}

function RowMenu<T>({
  row,
  actions,
  label,
}: {
  row: T;
  actions: ReadonlyArray<RowAction<T>>;
  label: string;
}) {
  if (actions.length === 0) return null;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="inline-flex h-touch w-touch items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {actions.map((action) => (
            <DropdownMenu.Item
              key={action.label}
              disabled={action.disabled}
              onSelect={() => action.onSelect(row)}
              className={cn(
                "flex min-h-touch cursor-pointer select-none items-center rounded-sm px-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                action.destructive && "font-medium text-destructive focus:text-destructive"
              )}
            >
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * Table from `md` up; below `md`, a list of cards with the key columns plus the actions menu
 * (no horizontal scroll hiding "Acciones"). Both layouts read the same `columns`.
 */
export function ResponsiveTable<T>({
  columns,
  rows,
  getRowId,
  actions,
  actionsLabel,
  caption,
  empty,
  className,
}: ResponsiveTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  const anyCardFlag = columns.some((c) => c.card !== undefined);
  const cardColumns = columns.filter((c, i) => (anyCardFlag ? c.card === true : i < 3) && !c.rowHeader);
  const titleColumn = columns.find((c) => c.rowHeader) ?? columns[0];
  const bodyColumns = cardColumns.filter((c) => c !== titleColumn);
  const menuLabel = (row: T) => actionsLabel?.(row) ?? "Acciones de la fila";

  return (
    <div className={className}>
      {/* >= md: table */}
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} scope="col" className={c.className}>
                  {c.header}
                </TableHead>
              ))}
              {actions ? (
                <TableHead scope="col" className="w-16">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((c) =>
                  c.rowHeader ? (
                    <th
                      key={c.key}
                      scope="row"
                      className={cn("p-4 text-left align-middle font-medium text-foreground", c.className)}
                    >
                      {c.cell(row)}
                    </th>
                  ) : (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  )
                )}
                {actions ? (
                  <TableCell className="py-2 text-right">
                    <RowMenu row={row} actions={actions(row)} label={menuLabel(row)} />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* < md: cards */}
      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={getRowId(row)} className="rounded-xl border border-border bg-card p-4 text-card-foreground">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-base font-semibold">{titleColumn.cell(row)}</div>
              {actions ? <RowMenu row={row} actions={actions(row)} label={menuLabel(row)} /> : null}
            </div>
            {bodyColumns.length > 0 ? (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                {bodyColumns.map((c) => (
                  <React.Fragment key={c.key}>
                    <dt className="text-muted-foreground">{c.header}</dt>
                    <dd className="min-w-0 break-words">{c.cell(row)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
