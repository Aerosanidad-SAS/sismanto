"use client";

import { useEffect, useState } from "react";
import { getCierresDeTurnoHoy } from "@/app/api/actions/cierre-turno";
import { CierresTurnoHoyCard } from "@/components/regulacion/cierres-turno-hoy";
import type { CierresDeHoy } from "@/lib/cierre-turno";

/**
 * Vista de consulta del cierre de turno para el Administrador. El cierre lo hace cada OVEM de su propio vehículo
 * (km final, combustible, limpieza, entrega); el Administrador no lo firma por él: ve qué vehículos ya cerraron hoy
 * y cuáles faltan, con el mismo resumen de la Sala de control.
 */
export function CierresTurnoConsulta() {
  const [datos, setDatos] = useState<CierresDeHoy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    getCierresDeTurnoHoy()
      .then((d) => {
        if (!cancelado) setDatos(d);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudieron cargar los cierres de turno. Inténtalo de nuevo en un momento.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Consulta: cada OVEM cierra su propio turno desde su portal. Aquí ves quién ya cerró hoy y qué vehículos faltan.
      </p>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {!error && !datos && <p className="text-sm text-muted-foreground">Cargando…</p>}
      {datos && <CierresTurnoHoyCard datos={datos} />}
    </div>
  );
}
