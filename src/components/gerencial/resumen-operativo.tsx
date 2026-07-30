"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/forms/date-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getResumenOperativoDiario, type ResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { LayoutGrid, ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, CircleSlash } from "lucide-react";

const CIUDADES = ["Todas", "Bogotá", "Medellín"] as const;

const TARJETAS = [
  { key: "asignados", label: "Asignados", icon: ClipboardCheck, bg: "bg-blue-50", fg: "text-blue-700" },
  { key: "atendidos", label: "Atendidos", icon: CheckCircle2, bg: "bg-green-50", fg: "text-green-700" },
  { key: "fallidos", label: "Fallidos", icon: AlertTriangle, bg: "bg-amber-50", fg: "text-amber-700" },
  { key: "cancelados", label: "Cancelados", icon: XCircle, bg: "bg-red-50", fg: "text-red-700" },
  { key: "noEfectivo", label: "No efectivo", icon: CircleSlash, bg: "bg-purple-50", fg: "text-purple-700" },
] as const;

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ResumenOperativo({ inicial }: { inicial: ResumenOperativoDiario }) {
  const [desde, setDesde] = useState(hoyIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [ciudad, setCiudad] = useState<(typeof CIUDADES)[number]>("Todas");
  const [resumen, setResumen] = useState(inicial);
  const [cargando, setCargando] = useState(false);

  const filtrar = async () => {
    setCargando(true);
    const r = await getResumenOperativoDiario({ desde, hasta, ciudad });
    setResumen(r);
    setCargando(false);
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <CardTitle>Resumen operativo</CardTitle>
        </div>
        <CardDescription>
          Servicios recibidos y programados por Regulación — mismo reporte diario que ya se revisa por ciudad.
        </CardDescription>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Desde</label>
            <DateField value={desde} onChange={setDesde} inputClassName="h-9 w-32" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <DateField value={hasta} onChange={setHasta} inputClassName="h-9 w-32" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Ciudad</label>
            <Select value={ciudad} onValueChange={(v) => setCiudad(v as (typeof CIUDADES)[number])}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIUDADES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={filtrar} disabled={cargando}>
            {cargando ? "Filtrando..." : "Filtrar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">
            Total — {ciudad === "Todas" ? "Bogotá y Medellín" : ciudad.toUpperCase()}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {TARJETAS.map(({ key, label, icon: Icon, bg, fg }) => (
              <div key={key} className={`rounded-lg p-4 text-center ${bg}`}>
                <Icon className={`mx-auto mb-1 h-4 w-4 ${fg}`} />
                <p className={`text-2xl font-bold ${fg}`}>{resumen[key]}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Por tipo de servicio</p>
          <p className="mb-2 text-xs text-muted-foreground">
            TAB DOBLE/TAM DOBLE cuentan como 2 en este desglose, y &quot;Asignados&quot; no incluye los No
            Efectivo — por eso la suma no cuadra exacto con el total de arriba.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {resumen.porTipo.map((t) => (
              <div key={t.tipo} className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t.tipo}</p>
                <p className="text-lg font-bold">
                  {t.asignados} <span className="text-sm font-normal text-muted-foreground">/ {t.atendidos}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
