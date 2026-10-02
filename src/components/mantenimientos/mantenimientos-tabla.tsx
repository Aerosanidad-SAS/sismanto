"use client";

import { useState, useRef, useCallback, useId } from "react";
import { Check, ChevronsUpDown, Loader2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { formatDateShort, formatCurrency, cn } from "@/lib/utils";
import { actualizarMantenimientoCampo } from "@/app/api/actions/mantenimientos";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MantenimientoRow {
  id_manto: number;
  fecha: string;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  kilometraje_actual: number;
  proveedor: string | null;
  valor: number | null;
  numero_factura: string | null;
  descripcion_trabajo: string | null;
  vehicle_id: string;
  categoria_id: number | null;
  vehicles: { placa: string } | null;
  maintenance_categories: { nombre: string } | null;
}

interface Category {
  id: number;
  nombre: string;
  grupo_padre: string | null;
}

// ─── Tipo Cell ────────────────────────────────────────────────────────────────

function TipoCell({
  idManto,
  tipo,
  onUpdate,
}: {
  idManto: number;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  onUpdate: (t: "PREVENTIVO" | "CORRECTIVO") => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = useCallback(
    async (next: "PREVENTIVO" | "CORRECTIVO") => {
      if (next === tipo) { setOpen(false); return; }
      setOpen(false);
      setSaving(true);
      onUpdate(next); // optimistic
      const { error } = await actualizarMantenimientoCampo(idManto, { tipo: next });
      if (error) onUpdate(tipo); // revert on error
      setSaving(false);
    },
    [idManto, tipo, onUpdate]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Cambiar tipo de mantenimiento: ${tipo}`}
        >
          <Badge
            variant={tipo === "PREVENTIVO" ? "default" : "secondary"}
            className="cursor-pointer group-hover:opacity-80 transition-opacity"
          >
            {tipo}
          </Badge>
          {saving
            ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          }
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {(["PREVENTIVO", "CORRECTIVO"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleSelect(t)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors",
              t === tipo && "font-medium"
            )}
          >
            <Check className={cn("h-3 w-3", t === tipo ? "opacity-100" : "opacity-0")} />
            {t}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Categoría Cell ───────────────────────────────────────────────────────────

function CategoriaCell({
  idManto,
  categoriaId,
  categoriaNombre,
  categories,
  onUpdate,
}: {
  idManto: number;
  categoriaId: number | null;
  categoriaNombre: string | null;
  categories: Category[];
  onUpdate: (id: number | null, nombre: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = useCallback(
    async (id: number | null, nombre: string | null) => {
      setOpen(false);
      if (id === categoriaId) return;
      setSaving(true);
      onUpdate(id, nombre); // optimistic
      const { error } = await actualizarMantenimientoCampo(idManto, { categoriaId: id });
      if (error) onUpdate(categoriaId, categoriaNombre); // revert
      setSaving(false);
    },
    [idManto, categoriaId, categoriaNombre, onUpdate]
  );

  const gruposCategoria = categories.reduce(
    (acc, c) => {
      const g = c.grupo_padre || "Otros";
      if (!acc[g]) acc[g] = [];
      acc[g].push(c);
      return acc;
    },
    {} as Record<string, Category[]>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 group text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-[160px]"
          aria-label={`Cambiar categoría: ${categoriaNombre || "sin categoría"}`}
        >
          <span className={cn("text-sm truncate", !categoriaNombre && "text-muted-foreground")}>
            {categoriaNombre || "N/A"}
          </span>
          {saving
            ? <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
            : <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          }
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandList>
            <CommandEmpty>Sin coincidencias.</CommandEmpty>
            <CommandGroup heading="Sin categoría">
              <CommandItem value="sin-categoria" onSelect={() => handleSelect(null, null)}>
                <Check className={cn("mr-2 h-4 w-4", categoriaId === null ? "opacity-100" : "opacity-0")} />
                N/A
              </CommandItem>
            </CommandGroup>
            {Object.entries(gruposCategoria).map(([grupo, cats]) => (
              <CommandGroup key={grupo} heading={grupo}>
                {cats.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={cat.nombre}
                    onSelect={() => handleSelect(cat.id, cat.nombre)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", cat.id === categoriaId ? "opacity-100" : "opacity-0")} />
                    {cat.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Descripción Cell ─────────────────────────────────────────────────────────

function DescripcionCell({
  idManto,
  placa,
  descripcion,
  onUpdate,
}: {
  idManto: number;
  placa: string | null | undefined;
  descripcion: string | null;
  onUpdate: (d: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(descripcion || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();
  const label = placa ? `Editar descripción del mantenimiento de ${placa}` : "Editar descripción";

  const startEdit = () => {
    setDraft(descripcion || "");
    setError(null);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const cancel = () => {
    setDraft(descripcion || "");
    setError(null);
    setEditing(false);
  };

  const save = useCallback(async () => {
    if (!editing) return;
    const trimmed = draft.trim();
    if (trimmed === (descripcion || "").trim()) { setEditing(false); return; } // sin cambios
    if (trimmed.length < 3) { setError("Escribe al menos 3 caracteres."); return; }
    setError(null);
    setEditing(false);
    setSaving(true);
    onUpdate(trimmed); // optimistic
    const { error: saveError } = await actualizarMantenimientoCampo(idManto, { descripcionTrabajo: trimmed });
    if (saveError) onUpdate(descripcion || ""); // revert on error
    setSaving(false);
  }, [editing, draft, descripcion, idManto, onUpdate]);

  if (editing) {
    return (
      <div className="min-w-[220px] space-y-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
            if (e.key === "Escape") cancel();
          }}
          rows={3}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={save}>
            Guardar
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={cancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      aria-label={label}
      className="flex items-start gap-1 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
    >
      <span className={cn(
        "text-sm line-clamp-2 max-w-[240px]",
        !descripcion && "text-muted-foreground italic"
      )}>
        {descripcion || "Sin descripción"}
      </span>
      {saving
        ? <Loader2 className="h-3 w-3 shrink-0 mt-0.5 animate-spin text-muted-foreground" aria-hidden="true" />
        : <Pencil className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
      }
    </button>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function MantenimientosTabla({
  mantenimientos: initial,
  categories,
}: {
  mantenimientos: MantenimientoRow[];
  categories: Category[];
}) {
  const [rows, setRows] = useState<MantenimientoRow[]>(initial);

  const updateRow = useCallback((idManto: number, patch: Partial<MantenimientoRow>) => {
    setRows((prev) => prev.map((r) => (r.id_manto === idManto ? { ...r, ...patch } : r)));
  }, []);

  if (rows.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No hay resultados con estos filtros.
      </p>
    );
  }

  const categoriaCell = (m: MantenimientoRow) => (
    <CategoriaCell
      idManto={m.id_manto}
      categoriaId={m.categoria_id}
      categoriaNombre={m.maintenance_categories?.nombre ?? null}
      categories={categories}
      onUpdate={(id, nombre) =>
        updateRow(m.id_manto, {
          categoria_id: id,
          maintenance_categories: nombre ? { nombre } : null,
        })
      }
    />
  );
  const descripcionCell = (m: MantenimientoRow) => (
    <DescripcionCell
      idManto={m.id_manto}
      placa={m.vehicles?.placa}
      descripcion={m.descripcion_trabajo}
      onUpdate={(d) => updateRow(m.id_manto, { descripcion_trabajo: d })}
    />
  );
  const tipoCell = (m: MantenimientoRow) => (
    <TipoCell
      idManto={m.id_manto}
      tipo={m.tipo}
      onUpdate={(t) => updateRow(m.id_manto, { tipo: t })}
    />
  );

  return (
    <>
      {/* Móvil: tarjetas con placa, fecha y valor; los campos editables van dentro */}
      <ul className="space-y-3 md:hidden">
        {rows.map((m) => (
          <li key={m.id_manto} className="rounded-lg border bg-card p-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.vehicles?.placa}</p>
                <p className="text-sm text-muted-foreground">{formatDateShort(m.fecha)}</p>
              </div>
              <p className="font-mono text-sm">{m.valor ? formatCurrency(m.valor) : "N/A"}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd>{tipoCell(m)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kilometraje</dt>
                <dd className="font-mono">{m.kilometraje_actual.toLocaleString()} km</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Categoría</dt>
                <dd>{categoriaCell(m)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Descripción</dt>
                <dd>{descripcionCell(m)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Proveedor</dt>
                <dd>{m.proveedor || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Factura</dt>
                <dd>{m.numero_factura || "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Kilometraje</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Factura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id_manto}>
                <TableCell className="whitespace-nowrap">{formatDateShort(m.fecha)}</TableCell>
                <TableCell className="font-medium">{m.vehicles?.placa}</TableCell>

                <TableCell>{categoriaCell(m)}</TableCell>
                <TableCell>{descripcionCell(m)}</TableCell>
                <TableCell>{tipoCell(m)}</TableCell>

                <TableCell className="text-right font-mono">
                  {m.kilometraje_actual.toLocaleString()} km
                </TableCell>
                <TableCell>{m.proveedor || "N/A"}</TableCell>
                <TableCell className="text-right font-mono">
                  {m.valor ? formatCurrency(m.valor) : "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {m.numero_factura || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
