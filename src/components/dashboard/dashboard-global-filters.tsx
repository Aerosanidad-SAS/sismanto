"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { stripDashboardGlobalParams } from "@/lib/dashboard-search-params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { cn } from "@/lib/utils";

const SELECT_ALL = "__all__";

const HELP_GLOBAL =
  "Filtros globales del dashboard: unifican el período (desde/hasta) y opcionalmente un centro de operación para las tarjetas de costo por vehículo, disponibilidad de flota y resolución de novedades. Si ajusta los filtros dentro de una tarjeta concreta, el período global se desactiva para evitar conflictos. Use «Aplicar global» para guardar en la URL; «Quitar global» vuelve al modo por tarjeta.";

/** Parámetros de cards que pierden vigencia ante un período global unificado */
const KEYS_TO_DROP_ON_GLOBAL = [
  "inicio",
  "fin",
  "dispInicio",
  "dispFin",
  "dispCentro",
  "costoCentro",
  "costoPlacas",
  "costoBusqueda",
];

interface DashboardGlobalFiltrosProps {
  centros: { id: number; nombre: string }[];
  globalInicio: string | null;
  globalFin: string | null;
  globalCentroId?: number | null;
  /** Fechas efectivas mostradas cuando no hay global (solo informativo) */
  fechaDefectoInicio: string;
  fechaDefectoFin: string;
  modoGlobalActivo: boolean;
  className?: string;
}

export function DashboardGlobalFiltros({
  centros,
  globalInicio,
  globalFin,
  globalCentroId,
  fechaDefectoInicio,
  fechaDefectoFin,
  modoGlobalActivo,
  className,
}: DashboardGlobalFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const baseFrom = modoGlobalActivo && globalInicio ? globalInicio : fechaDefectoInicio;
  const baseTo = modoGlobalActivo && globalFin ? globalFin : fechaDefectoFin;

  const [fi, setFi] = useState(baseFrom);
  const [ff, setFf] = useState(baseTo);
  const [cen, setCen] = useState(globalCentroId != null ? String(globalCentroId) : "");

  useEffect(() => {
    setFi(baseFrom);
    setFf(baseTo);
  }, [baseFrom, baseTo]);

  useEffect(() => {
    setCen(globalCentroId != null ? String(globalCentroId) : "");
  }, [globalCentroId]);

  const aplicarGlobal = () => {
    const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    for (const k of KEYS_TO_DROP_ON_GLOBAL) qs.delete(k);
    qs.set("gInicio", fi);
    qs.set("gFin", ff);
    if (cen.trim()) qs.set("gCentro", cen.trim());
    else qs.delete("gCentro");
    startTransition(() => router.push(`${pathname}?${qs.toString()}`));
  };

  const quitarGlobal = () => {
    const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    stripDashboardGlobalParams(qs);
    startTransition(() => router.push(`${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`));
  };

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 rounded-lg border border-border/80 bg-muted/30 px-2 py-2 sm:px-3",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden text-xs font-medium text-foreground whitespace-nowrap sm:inline">Global</span>
        <HelpTrigger text={HELP_GLOBAL} />
        {modoGlobalActivo ? (
          <span
            className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wide text-primary whitespace-nowrap"
            title="El período global está aplicado a las métricas enlazadas"
          >
            Activo
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 min-w-0 flex-1 sm:flex-initial">
      <Input
        type="date"
        value={fi}
        onChange={(e) => setFi(e.target.value)}
        className="h-8 w-[8.75rem] text-xs shrink-0"
        aria-label="Período global desde"
        title="Fecha inicio del período global"
      />
      <Input
        type="date"
        value={ff}
        onChange={(e) => setFf(e.target.value)}
        className="h-8 w-[8.75rem] text-xs shrink-0"
        aria-label="Período global hasta"
        title="Fecha fin del período global"
      />

      <Select value={cen || SELECT_ALL} onValueChange={(v) => setCen(v === SELECT_ALL ? "" : v)}>
        <SelectTrigger
          className="h-8 w-[min(100%,10.5rem)] text-xs shrink-0"
          title="Filtrar métricas globales por centro (opcional)"
          aria-label="Centro para filtros globales"
        >
          <SelectValue placeholder="Centro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>Todos</SelectItem>
          {centros.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={aplicarGlobal} disabled={pending}>
          {pending ? "…" : "Aplicar"}
        </Button>
        {modoGlobalActivo ? (
          <Button type="button" size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={quitarGlobal} disabled={pending}>
            Quitar
          </Button>
        ) : null}
      </div>
      </div>
    </div>
  );
}
