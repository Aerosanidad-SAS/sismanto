"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportarNovedadDialog } from "@/components/novedades/reportar-novedad-dialog";

/** Botón «Nueva novedad» de la pantalla de Novedades: abre el mismo formulario de la sala de control. */
export function NuevaNovedadBoton({ vehiculos, reportadoPor }: { vehiculos: { id: string; placa: string }[]; reportadoPor: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)} disabled={vehiculos.length === 0}>
        <AlertTriangle className="mr-1 h-4 w-4" aria-hidden />
        Nueva novedad
      </Button>
      <ReportarNovedadDialog abierto={abierto} onAbiertoChange={setAbierto} vehiculos={vehiculos} reportadoPor={reportadoPor} />
    </>
  );
}
