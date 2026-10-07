"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarFotoSiniestro } from "@/app/api/actions/siniestros";
import { Button } from "@/components/ui/button";
import { SiniestroFotosSelector, type FotoLocal } from "@/components/ovem/siniestro-fotos-selector";
import { comprimirFoto } from "@/lib/comprimir-imagen";
import { MIN_FOTOS_DOCUMENTOS, MIN_FOTOS_HECHOS, type ResumenFotosSiniestro } from "@/lib/siniestro-datos";
import type { TipoFotoSiniestro } from "@/lib/siniestro-fotos";

/** Completa las fotos que faltan de un siniestro ya reportado (p. ej. cuando se cayó la conexión al reportarlo). */
export function CompletarFotosSiniestro({ accidentId, resumen }: { accidentId: number; resumen: ResumenFotosSiniestro }) {
  const router = useRouter();
  const [fotos, setFotos] = useState<Record<TipoFotoSiniestro, FotoLocal[]>>({ HECHOS: [], DOCUMENTOS: [] });
  const [avisos, setAvisos] = useState<Record<TipoFotoSiniestro, string[]>>({ HECHOS: [], DOCUMENTOS: [] });
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const agregar = async (tipo: TipoFotoSiniestro, archivos: File[]) => {
    const nuevas: FotoLocal[] = [];
    const rechazos: string[] = [];
    for (const a of archivos) {
      try {
        const file = await comprimirFoto(a);
        nuevas.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), estado: "PENDIENTE" });
      } catch (e) {
        rechazos.push(`${a.name}: ${e instanceof Error ? e.message : "no se pudo procesar"}`);
      }
    }
    setFotos((p) => ({ ...p, [tipo]: [...p[tipo], ...nuevas] }));
    setAvisos((p) => ({ ...p, [tipo]: rechazos }));
  };

  const quitar = (tipo: TipoFotoSiniestro, id: string) =>
    setFotos((p) => {
      const f = p[tipo].find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return { ...p, [tipo]: p[tipo].filter((x) => x.id !== id) };
    });

  const subir = async () => {
    setSubiendo(true);
    setMensaje(null);
    let fallidas = 0;
    const siguiente: Record<TipoFotoSiniestro, FotoLocal[]> = { HECHOS: [], DOCUMENTOS: [] };
    for (const tipo of ["HECHOS", "DOCUMENTOS"] as const) {
      for (const f of fotos[tipo]) {
        const r = await registrarFotoSiniestro(accidentId, tipo, f.file);
        if (r.error) {
          fallidas++;
          siguiente[tipo].push({ ...f, estado: "ERROR", error: r.error });
        } else {
          URL.revokeObjectURL(f.preview);
        }
      }
    }
    setFotos(siguiente);
    setSubiendo(false);
    setMensaje(fallidas > 0 ? `Faltan ${fallidas} foto${fallidas === 1 ? "" : "s"} por subir. Reintenta.` : "Fotos guardadas.");
    router.refresh();
  };

  const total = fotos.HECHOS.length + fotos.DOCUMENTOS.length;
  return (
    <div className="space-y-4 rounded-lg border border-warning bg-warning-soft p-3">
      <p className="text-sm font-medium text-warning-foreground">
        Faltan fotos para completar el respaldo:
        {resumen.faltanHechos > 0 && ` ${resumen.faltanHechos} de los hechos.`}
        {resumen.faltanDocumentos > 0 && ` ${resumen.faltanDocumentos} de los documentos.`}
      </p>
      {resumen.faltanHechos > 0 && (
        <SiniestroFotosSelector
          inputId="completar-hechos"
          titulo="Fotos de los hechos"
          ayuda="Agrega las que faltan."
          fotos={fotos.HECHOS}
          minimo={Math.max(0, MIN_FOTOS_HECHOS - resumen.hechos)}
          bloqueado={subiendo}
          avisos={avisos.HECHOS}
          onAgregar={(a) => agregar("HECHOS", a)}
          onQuitar={(id) => quitar("HECHOS", id)}
        />
      )}
      {resumen.faltanDocumentos > 0 && (
        <SiniestroFotosSelector
          inputId="completar-docs"
          titulo="Fotos de los documentos generados"
          ayuda="IPAT, acta u otros papeles."
          fotos={fotos.DOCUMENTOS}
          minimo={Math.max(0, MIN_FOTOS_DOCUMENTOS - resumen.documentos)}
          bloqueado={subiendo}
          avisos={avisos.DOCUMENTOS}
          onAgregar={(a) => agregar("DOCUMENTOS", a)}
          onQuitar={(id) => quitar("DOCUMENTOS", id)}
        />
      )}
      <Button type="button" onClick={subir} disabled={subiendo || total === 0} className="h-11 w-full sm:w-auto">
        {subiendo ? "Subiendo…" : "Subir fotos"}
      </Button>
      {mensaje && (
        <p role="status" className="text-sm">
          {mensaje}
        </p>
      )}
    </div>
  );
}
