"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  adjuntarMediaCampana,
  exportarDetalleCampana,
  exportarHistorialCampanas,
  quitarMediaCampana,
} from "@/app/api/actions/campanas";
import { celdaExcelSegura } from "@/lib/servicios-lista";
import { COLUMNAS_DETALLE, COLUMNAS_HISTORIAL, nombreArchivoExport } from "@/lib/campanas-exportar";
import { MEDIA_MAX_BYTES, nombreSeguro } from "@/lib/campanas-media";

async function descargarExcel(titulo: string, columnas: readonly string[], filas: (string | number)[][], archivo: string) {
  const XLSX = await import("xlsx");
  const hoja = XLSX.utils.aoa_to_sheet([[...columnas], ...filas.map((f) => f.map(celdaExcelSegura))]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, titulo.slice(0, 31));
  XLSX.writeFile(libro, archivo);
}

/** Botón "Exportar historial" (todas las campañas). */
export function ExportarHistorialCampanas() {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const exportar = async () => {
    setCargando(true);
    setAviso(null);
    const res = await exportarHistorialCampanas();
    if ("error" in res && res.error) setAviso(res.error);
    else if (res.filas) await descargarExcel("Historial", COLUMNAS_HISTORIAL, res.filas, nombreArchivoExport("campanas_historial"));
    setCargando(false);
  };
  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="outline" onClick={exportar} disabled={cargando} className="gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        {cargando ? "Exportando…" : "Exportar historial"}
      </Button>
      {aviso && <p className="text-sm text-red-600">{aviso}</p>}
    </div>
  );
}

/** Adjuntar imagen/PDF/video (solo BORRADOR) y exportar el detalle de una campaña. */
export function CampanaAdjuntoExportar({
  id,
  estado,
  mediaNombre,
  puedeEditar,
}: {
  id: number;
  estado: string;
  mediaNombre?: string | null;
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const elegirArchivo = async (archivo: File | undefined) => {
    if (!archivo) return;
    setAviso(null);
    if (archivo.size > MEDIA_MAX_BYTES) {
      setAviso("El archivo supera el límite de 16 MB.");
      return;
    }
    setOcupado(true);
    // El archivo va directo del navegador a Storage (carpeta propia): así no pasa por el límite de cuerpo de las
    // funciones del servidor. El servidor lo valida por contenido antes de subirlo a Meta.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAviso("Sesión expirada");
      setOcupado(false);
      return;
    }
    const ruta = `${user.id}/${Date.now()}_${nombreSeguro(archivo.name)}`;
    const { error: errSubida } = await supabase.storage.from("campanas-media").upload(ruta, archivo, { upsert: false });
    if (errSubida) {
      setAviso(`No se pudo subir el archivo: ${errSubida.message}`);
      setOcupado(false);
      return;
    }
    const res = await adjuntarMediaCampana(id, ruta);
    if ("error" in res) {
      setAviso(res.error);
      // El servidor borra el archivo si no pasó la validación; si falló por otro motivo (Meta, estado) lo limpiamos aquí.
      await supabase.storage.from("campanas-media").remove([ruta]);
    } else router.refresh();
    if (input.current) input.current.value = "";
    setOcupado(false);
  };

  const quitar = async () => {
    setOcupado(true);
    setAviso(null);
    const res = await quitarMediaCampana(id);
    if ("error" in res && res.error) setAviso(res.error);
    else router.refresh();
    setOcupado(false);
  };

  const exportar = async () => {
    setOcupado(true);
    setAviso(null);
    const res = await exportarDetalleCampana(id);
    if ("error" in res && res.error) setAviso(res.error);
    else if (res.filas) await descargarExcel("Detalle", COLUMNAS_DETALLE, res.filas, nombreArchivoExport(res.nombre));
    setOcupado(false);
  };

  const enBorrador = estado === "BORRADOR";
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {puedeEditar && enBorrador && (
        <>
          <input
            ref={input}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx,.xlsx"
            onChange={(e) => elegirArchivo(e.target.files?.[0])}
          />
          <Button size="sm" variant="outline" disabled={ocupado} onClick={() => input.current?.click()} className="gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            {mediaNombre ? "Cambiar adjunto" : "Adjuntar"}
          </Button>
          {mediaNombre && (
            <Button size="sm" variant="ghost" disabled={ocupado} onClick={quitar} className="gap-1" title={`Quitar ${mediaNombre}`}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      )}
      {mediaNombre && !enBorrador && (
        <span className="max-w-[10rem] truncate text-xs text-muted-foreground" title={mediaNombre}>
          <Paperclip className="mr-1 inline h-3 w-3" />
          {mediaNombre}
        </span>
      )}
      <Button size="sm" variant="outline" disabled={ocupado} onClick={exportar} className="gap-1">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Exportar
      </Button>
      {aviso && <span className="basis-full text-right text-xs text-red-600">{aviso}</span>}
    </span>
  );
}
