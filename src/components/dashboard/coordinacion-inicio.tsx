import Link from "next/link";
import { BarChart3, FileSpreadsheet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import type { ResumenOperativoConsolidado } from "@/app/api/actions/estadisticas-servicios";
import type { VehiculoDelDia } from "@/app/api/actions/coordinacion";
import { CIUDADES_SERVICIO } from "@/lib/servicios-lista";
import { PreoperacionalHoyCard } from "@/components/regulacion/preoperacional-hoy";
import type { PreoperacionalHoy } from "@/app/api/actions/preoperacional-pendiente";

const ETAPA_VARIANTE: Record<string, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PROGRAMADO: "secondary",
  CURSO: "default",
  FINALIZADO: "success",
  FALLIDO: "destructive",
  CANCELADO: "outline",
};

const hora = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" }).format(new Date(iso));

/**
 * Inicio del rol COORDINACION: lo primero es el resumen de servicios de SU CRA (Bogotá solo Bogotá, Medellín solo
 * Medellín; sin centro asignado ve ambas), luego los vehículos operando hoy con tripulación y servicios, y los
 * accesos a informes. Es una vista propia, no el tablero ejecutivo por pestañas.
 */
export function CoordinacionInicio({
  resumen,
  ciudad,
  flota,
  preoperacional,
}: {
  resumen: ResumenOperativoConsolidado;
  ciudad: string;
  flota: VehiculoDelDia[];
  preoperacional: PreoperacionalHoy;
}) {
  const nombreCiudad = CIUDADES_SERVICIO.find((c) => c.clave === ciudad)?.nombre;
  const totalServicios = flota.reduce((s, v) => s + v.servicios.length, 0);

  return (
    <div className="space-y-6">
      <ResumenOperativo inicial={resumen} ciudad={ciudad} />

      <Card>
        <CardHeader>
          <CardTitle>Vehículos operando hoy{nombreCiudad ? ` — ${nombreCiudad}` : ""}</CardTitle>
          <CardDescription>
            {flota.length} vehículo{flota.length === 1 ? "" : "s"} con tripulación asignada · {totalServicios} servicio
            {totalServicios === 1 ? "" : "s"} asignado{totalServicios === 1 ? "" : "s"} hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flota.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Ningún vehículo tiene tripulación asignada hoy.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flota.map((v) => (
                <div key={v.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-semibold">{v.placa}</p>
                    <Badge variant={v.servicios.length > 0 ? "default" : "outline"}>
                      {v.servicios.length} servicio{v.servicios.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-muted-foreground">OVEM</dt>
                    <dd className="truncate">{v.ovem ?? "—"}</dd>
                    <dt className="text-muted-foreground">Médico</dt>
                    <dd className="truncate">{v.medico ?? "—"}</dd>
                    <dt className="text-muted-foreground">Auxiliar</dt>
                    <dd className="truncate">{v.auxiliar ?? "—"}</dd>
                  </dl>
                  {v.servicios.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-t pt-2">
                      {v.servicios.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 truncate">
                            <span className="tabular-nums text-muted-foreground">{hora(s.hora)}</span> · {s.tipo} · {s.paciente}
                          </span>
                          <Badge variant={ETAPA_VARIANTE[s.etapa] ?? "outline"} className="shrink-0">
                            {s.etapa}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PreoperacionalHoyCard datos={preoperacional} />

      {/* Placeholder: el copago se capta en el formulario de servicio (paridad SISRES, a cargo de León y David).
          Cuando existan copago_esperado / copago_cobrado y la tabla de reglas por cliente y plan, esta tarjeta
          muestra por vehículo y día: esperado, cobrado por método de pago y diferencia. Ver COPAGOS_PARA_LEON_DAVID.md. */}
      <Card>
        <CardHeader>
          <CardTitle>Balance de copagos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Próximamente: balance de copagos por vehículo y día.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informes y descargas</CardTitle>
          <CardDescription>Servicios registrados: consulta, filtros y exportación a Excel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden /> Base de servicios y exportación
          </Link>
          <Link
            href="/estadisticas"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <BarChart3 className="h-4 w-4" aria-hidden /> Estadísticas de servicios
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
