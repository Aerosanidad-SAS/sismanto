"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { stripDashboardGlobalParams } from "@/lib/dashboard-search-params";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const SELECT_ALL = "__all__";

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
}

export function DashboardGlobalFiltros({
  centros,
  globalInicio,
  globalFin,
  globalCentroId,
  fechaDefectoInicio,
  fechaDefectoFin,
  modoGlobalActivo,
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
    <Card className="border-primary/20 bg-muted/20">
      <CardHeader className="py-3 space-y-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Filtros globales del dashboard</CardTitle>
        </div>
        <CardDescription>
          Un solo período (y opcionalmente un centro) para costo, disponibilidad y resolución de novedades. Al usar
          los filtros dentro de cada tarjeta, el período global se desactiva automáticamente.
        </CardDescription>
        {modoGlobalActivo ? (
          <p className="text-xs font-medium text-primary pt-1">Período global activo</p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className="h-9 mt-1 w-[9.5rem]" />
        </div>
        <div>
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className="h-9 mt-1 w-[9.5rem]" />
        </div>
        <div>
          <Label className="text-xs">Centro (opcional)</Label>
          <Select value={cen || SELECT_ALL} onValueChange={(v) => setCen(v === SELECT_ALL ? "" : v)}>
            <SelectTrigger className="h-9 mt-1 w-[min(100%,14rem)]">
              <SelectValue placeholder="Todos los centros" />
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
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={aplicarGlobal} disabled={pending}>
            {pending ? "…" : "Aplicar global"}
          </Button>
          {modoGlobalActivo ? (
            <Button type="button" size="sm" variant="outline" onClick={quitarGlobal} disabled={pending}>
              Quitar global
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
