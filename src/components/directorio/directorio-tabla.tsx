"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";

type Fila = Record<string, string | number | null>;
const TODOS = "__todos__";
const MAX_FILAS = 300;

/** Directorio de solo lectura con búsqueda libre y filtros por columna (p. ej. ciudad, área). */
export function DirectorioTabla({
  filas,
  columnas,
  filtros = [],
  vacio,
}: {
  filas: Fila[];
  columnas: { campo: string; titulo: string }[];
  filtros?: { campo: string; titulo: string }[];
  vacio: string;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});

  const opciones = useMemo(
    () =>
      Object.fromEntries(
        filtros.map((f) => [
          f.campo,
          Array.from(new Set(filas.map((r) => r[f.campo]).filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b, "es")),
        ])
      ),
    [filas, filtros]
  );

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return filas.filter(
      (r) =>
        Object.entries(sel).every(([campo, v]) => !v || String(r[campo] ?? "") === v) &&
        (!texto || columnas.some((c) => String(r[c.campo] ?? "").toLowerCase().includes(texto)))
    );
  }, [filas, columnas, q, sel]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nombre, documento, teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:col-span-2"
          aria-label="Buscar"
        />
        {filtros.map((f) => (
          <Select
            key={f.campo}
            value={sel[f.campo] || TODOS}
            onValueChange={(v) => setSel((prev) => ({ ...prev, [f.campo]: v === TODOS ? "" : v }))}
          >
            <SelectTrigger aria-label={f.titulo}>
              <SelectValue placeholder={f.titulo} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>{f.titulo}: todas</SelectItem>
              {opciones[f.campo]?.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {formatNumber(visibles.length)} de {formatNumber(filas.length)} registros
        {visibles.length > MAX_FILAS && ` · se muestran los primeros ${MAX_FILAS}; afina la búsqueda`}
      </p>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((c) => (
                <TableHead key={c.campo}>{c.titulo}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} className="text-center text-muted-foreground">
                  {filas.length === 0 ? vacio : "Sin resultados para esta búsqueda"}
                </TableCell>
              </TableRow>
            )}
            {visibles.slice(0, MAX_FILAS).map((r, i) => (
              <TableRow key={String(r.id ?? i)}>
                {columnas.map((c) => (
                  <TableCell key={c.campo} className={c.campo === "nombre" ? "font-medium" : undefined}>
                    {r[c.campo] ?? "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
