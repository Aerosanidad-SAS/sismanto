"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportarPacientes } from "@/app/api/actions/pacientes";
import { EXPORT_PACIENTES_MAX_FILAS, matrizExportPacientes } from "@/lib/pacientes-export";

/** Excel de pacientes con las mismas columnas que export/exportExcelPacientes.php. */
export function ExportarPacientes() {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const exportar = async () => {
    setCargando(true);
    setAviso(null);
    try {
      const res = await exportarPacientes();
      if ("error" in res && res.error) {
        setAviso(res.error);
        return;
      }
      const XLSX = await import("xlsx");
      const sello = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" });
      const hoyIso = sello.slice(0, 10);
      const hoja = XLSX.utils.aoa_to_sheet(matrizExportPacientes(res.filas ?? [], hoyIso));
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Pacientes");
      XLSX.writeFile(libro, `pacientes_${sello.replace(/[: ]/g, "-")}.xlsx`);
      if (res.truncado) {
        setAviso(`Se exportaron solo las primeras ${EXPORT_PACIENTES_MAX_FILAS.toLocaleString("es-CO")} filas.`);
      }
    } catch {
      setAviso("No se pudo generar el Excel. Intenta de nuevo o contacta a Sistemas.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={exportar} disabled={cargando} className="gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        {cargando ? "Exportando…" : "Exportar Excel"}
      </Button>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}
    </div>
  );
}
