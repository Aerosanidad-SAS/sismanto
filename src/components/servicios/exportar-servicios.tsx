"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportarServicios } from "@/app/api/actions/servicios-medicos";
import {
  celdaExcelSegura,
  COLUMNAS_EXPORT,
  EXPORT_MAX_FILAS,
  fechaHora24,
  type FiltrosServicios,
} from "@/lib/servicios-lista";

const CAMPOS_FECHA = new Set(COLUMNAS_EXPORT.map(([, c]) => c).filter((c) => c.startsWith("fecha_hora")));

/** Excel con los filtros activos y las mismas columnas que export/exportExcel.php. */
export function ExportarServicios({ filtros }: { filtros: FiltrosServicios }) {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const exportar = async () => {
    setCargando(true);
    setAviso(null);
    const res = await exportarServicios(filtros);
    if ("error" in res && res.error) {
      setAviso(res.error);
      setCargando(false);
      return;
    }
    const filas = (res.filas ?? []) as Record<string, unknown>[];
    const XLSX = await import("xlsx");
    const datos = [
      COLUMNAS_EXPORT.map(([titulo]) => titulo),
      ...filas.map((s) =>
        COLUMNAS_EXPORT.map(([, campo]) => {
          const v = s[campo];
          if (CAMPOS_FECHA.has(campo) && typeof v === "string") return fechaHora24(v, true);
          return celdaExcelSegura(v);
        })
      ),
    ];
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Servicios");
    const sello = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" }).replace(/[: ]/g, "-");
    XLSX.writeFile(libro, `servicios_${sello}.xlsx`);
    if (res.truncado) {
      setAviso(`Se exportaron solo las primeras ${EXPORT_MAX_FILAS.toLocaleString("es-CO")} filas. Aplica filtros para exportar el resto.`);
    }
    setCargando(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={exportar} disabled={cargando} className="h-8 gap-2 px-3 text-sm">
        <FileSpreadsheet className="h-4 w-4" />
        {cargando ? "Exportando…" : "Exportar Excel"}
      </Button>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}
    </div>
  );
}
