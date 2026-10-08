"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { paginarLista } from "@/lib/paginacion-lista";

type Fila = Record<string, string | number | boolean | null>;
const TODOS = "__todos__";

/** Directorio con búsqueda libre, filtros por columna (p. ej. ciudad, área) y paginador arriba y abajo (100 por página). */
export function DirectorioTabla({
  filas,
  columnas,
  filtros = [],
  vacio,
  accion,
}: {
  filas: Fila[];
  columnas: { campo: string; titulo: string }[];
  filtros?: { campo: string; titulo: string }[];
  vacio: string;
  /** Contenido de una última columna por fila (p. ej. «Editar»), para quien puede modificar. */
  accion?: (fila: Fila) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});
  const [pagina, setPagina] = useState(1);

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

  const vista = paginarLista(visibles, pagina);

  const paginador = vista.paginas > 1 && (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Mostrando {formatNumber(vista.desde)}–{formatNumber(vista.hasta)} de {formatNumber(vista.total)} · Página {vista.pagina} de{" "}
        {vista.paginas}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={vista.pagina <= 1} onClick={() => setPagina(vista.pagina - 1)}>
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={vista.pagina >= vista.paginas}
          onClick={() => setPagina(vista.pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nombre, documento, teléfono…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPagina(1);
          }}
          className="sm:col-span-2"
          aria-label="Buscar"
        />
        {filtros.map((f) => (
          <Select
            key={f.campo}
            value={sel[f.campo] || TODOS}
            onValueChange={(v) => {
              setSel((prev) => ({ ...prev, [f.campo]: v === TODOS ? "" : v }));
              setPagina(1);
            }}
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
      </p>

      {paginador}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((c) => (
                <TableHead key={c.campo}>{c.titulo}</TableHead>
              ))}
              {accion && <TableHead className="w-0" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length + (accion ? 1 : 0)} className="text-center text-muted-foreground">
                  {filas.length === 0 ? vacio : "Sin resultados para esta búsqueda"}
                </TableCell>
              </TableRow>
            )}
            {vista.filas.map((r, i) => (
              <TableRow key={String(r.id ?? i)}>
                {columnas.map((c) => (
                  <TableCell key={c.campo} className={c.campo === "nombre" ? "font-medium" : undefined}>
                    {r[c.campo] === null || r[c.campo] === undefined ? "—" : String(r[c.campo])}
                  </TableCell>
                ))}
                {accion && <TableCell className="text-right">{accion(r)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginador}
    </div>
  );
}
