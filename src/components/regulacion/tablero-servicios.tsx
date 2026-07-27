"use client";

import { useMemo } from "react";
import { subEstadoServicio } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTrigger } from "@/components/ui/help-trigger";

interface ServicioTablero {
  id: number;
  tipo_servicio: string;
  nombre_completo: string;
  etapa: string;
  movil_placa: string | null;
  fecha_hora_programacion: string | null;
  vehicles?: { placa: string | null } | null;
  [key: string]: unknown;
}

interface TableroServiciosProps {
  servicios: ServicioTablero[];
}

const ETAPAS_CERRADAS_SIN_EXITO = ["CANCELADO", "FALLIDO", "NO EFECTIVO", "DUPLICADO"];
const MAX_POR_COLUMNA = 25;

function horaCorta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function TarjetaServicio({ s }: { s: ServicioTablero }) {
  const subEstado = s.etapa === "CURSO" ? subEstadoServicio(s.tipo_servicio, s) : null;
  const placa = s.vehicles?.placa ?? s.movil_placa;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium truncate">{s.nombre_completo || "Sin nombre"}</p>
        {placa && (
          <span className="text-xs font-semibold text-muted-foreground shrink-0">{placa}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{s.tipo_servicio}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{horaCorta(s.fecha_hora_programacion)}</span>
        {subEstado && (
          <Badge variant="warning" className="text-[10px]">
            {subEstado}
          </Badge>
        )}
      </div>
    </div>
  );
}

function Columna({
  titulo,
  servicios,
  hint,
}: {
  titulo: string;
  servicios: ServicioTablero[];
  hint: string;
}) {
  const visibles = servicios.slice(0, MAX_POR_COLUMNA);
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            {titulo}
            <HelpTrigger text={hint} />
          </span>
          <Badge variant="secondary">{servicios.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[32rem] overflow-y-auto">
        {visibles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Sin servicios</p>
        )}
        {visibles.map((s) => (
          <TarjetaServicio key={s.id} s={s} />
        ))}
        {servicios.length > MAX_POR_COLUMNA && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{servicios.length - MAX_POR_COLUMNA} más — vea el listado completo en Servicios médicos
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TableroServicios({ servicios }: TableroServiciosProps) {
  const { programados, enCurso, finalizados, cerrados } = useMemo(() => {
    const programados: ServicioTablero[] = [];
    const enCurso: ServicioTablero[] = [];
    const finalizados: ServicioTablero[] = [];
    const cerrados: ServicioTablero[] = [];
    for (const s of servicios) {
      if (s.etapa === "PROGRAMADO") programados.push(s);
      else if (s.etapa === "CURSO") enCurso.push(s);
      else if (s.etapa === "FINALIZADO") finalizados.push(s);
      else if (ETAPAS_CERRADAS_SIN_EXITO.includes(s.etapa)) cerrados.push(s);
    }
    return { programados, enCurso, finalizados, cerrados };
  }, [servicios]);

  return (
    <div>
      <h2 className="text-xl mb-3">Tablero de servicios</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Columna
          titulo="Programados"
          servicios={programados}
          hint="Servicios creados por Regulación que aún no inician desplazamiento."
        />
        <Columna
          titulo="En curso"
          servicios={enCurso}
          hint="La etiqueta amarilla muestra en qué punto del trayecto va cada servicio."
        />
        <Columna
          titulo="Finalizados"
          servicios={finalizados}
          hint="Últimos servicios finalizados (más recientes primero)."
        />
        <Columna
          titulo="Cancelados / fallidos"
          servicios={cerrados}
          hint="Incluye cancelados, fallidos, no efectivos y duplicados."
        />
      </div>
    </div>
  );
}
