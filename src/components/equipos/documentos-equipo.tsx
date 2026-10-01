"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  eliminarDocumentoEquipo,
  getDocumentosEquipo,
  getUrlDocumentoEquipo,
  registrarDocumentoEquipo,
  type DocumentoEquipo,
} from "@/app/api/actions/biomedico-documentos";
import {
  BUCKET_DOCUMENTOS_EQUIPO,
  EXTENSION_POR_MIME,
  MAX_BYTES_DOCUMENTO,
  MAX_MB_DOCUMENTO,
  TIPOS_DOCUMENTO_EQUIPO,
  etiquetaTipoDocumento,
  formatoTamano,
  rutaDocumento,
} from "@/lib/biomedico-documentos";
import { formatoInstante } from "@/lib/fechas";

const CLASE_SELECT = "h-9 rounded-md border border-input bg-background px-2 text-sm";

/** «Documentos del equipo» (docsEquipoWidget de SISRES): lista, ver, subir y eliminar. Se usa en la hoja de vida y en el registro de mantenimiento. */
export function DocumentosEquipo({ equipmentId }: { equipmentId: number }) {
  const [estado, setEstado] = useState<{
    documentos: DocumentoEquipo[];
    puedeSubir: boolean;
    puedeEliminar: boolean;
    sinTabla?: boolean;
  } | null>(null);
  const [tipo, setTipo] = useState<string>(TIPOS_DOCUMENTO_EQUIPO[0].tipo);
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let vigente = true;
    getDocumentosEquipo(equipmentId).then((r) => vigente && setEstado(r));
    return () => {
      vigente = false;
    };
  }, [equipmentId]);

  if (!estado) return <p className="text-xs text-muted-foreground">Cargando documentos…</p>;
  // Código desplegado antes que la migración 099 (en producción las migraciones van a mano): aviso en vez de error.
  if (estado.sinTabla) return <p className="text-xs text-muted-foreground">Los documentos del equipo todavía no están disponibles.</p>;

  async function subir() {
    if (!archivo) return setMensaje({ tipo: "error", texto: "Elige un archivo" });
    const ext = EXTENSION_POR_MIME[archivo.type];
    if (!ext) return setMensaje({ tipo: "error", texto: "Solo se admiten PDF, JPG o PNG" });
    if (archivo.size > MAX_BYTES_DOCUMENTO) return setMensaje({ tipo: "error", texto: `El archivo supera ${MAX_MB_DOCUMENTO} MB` });
    const nombreDoc = nombre.trim() || archivo.name.replace(/\.[^.]+$/, "");

    setOcupado(true);
    setMensaje(null);
    const ruta = rutaDocumento(equipmentId, crypto.randomUUID(), ext);
    const { error } = await createClient()
      .storage.from(BUCKET_DOCUMENTOS_EQUIPO)
      .upload(ruta, archivo, { contentType: archivo.type, upsert: false });
    if (error) {
      setOcupado(false);
      return setMensaje({ tipo: "error", texto: `No se pudo subir el archivo: ${error.message}` });
    }
    const r = await registrarDocumentoEquipo({ equipmentId, tipo, nombre: nombreDoc, ruta, nombreOriginal: archivo.name });
    setOcupado(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("documento" in r && r.documento) {
      const doc = r.documento;
      setEstado((e) => (e ? { ...e, documentos: [doc, ...e.documentos] } : e));
    }
    setNombre("");
    setArchivo(null);
    if (inputArchivo.current) inputArchivo.current.value = "";
    setMensaje({ tipo: "ok", texto: "Documento subido" });
  }

  async function ver(id: number) {
    const r = await getUrlDocumentoEquipo(id);
    if ("url" in r && r.url) window.open(r.url, "_blank", "noopener");
    else setMensaje({ tipo: "error", texto: ("error" in r && r.error) || "No se pudo abrir" });
  }

  async function eliminar(doc: DocumentoEquipo) {
    if (!confirm(`¿Eliminar «${doc.nombre}»?`)) return;
    setMensaje(null);
    const r = await eliminarDocumentoEquipo(doc.id);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    setEstado((e) => (e ? { ...e, documentos: e.documentos.filter((d) => d.id !== doc.id) } : e));
  }

  return (
    <section className="space-y-2 rounded-md border border-border p-3">
      <h3 className="text-sm font-medium">Documentos del equipo</h3>
      {estado.documentos.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin documentos (Registro INVIMA, manuales, guías…).</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {estado.documentos.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 py-1.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {etiquetaTipoDocumento(d.tipo)} · {formatoTamano(d.tamano_bytes)} ·{" "}
                  {formatoInstante(d.subido_en, { dateStyle: "short" })}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label={`Ver ${d.nombre}`} onClick={() => ver(d.id)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {estado.puedeEliminar && (
                  <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar ${d.nombre}`} onClick={() => eliminar(d)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {estado.puedeSubir && (
        // Sin <form>: este bloque vive dentro del formulario de mantenimiento y no debe enviarlo.
        <div className="flex flex-wrap items-end gap-2 border-t pt-2">
          <select aria-label="Tipo de documento" className={CLASE_SELECT} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_DOCUMENTO_EQUIPO.map((t) => (
              <option key={t.tipo} value={t.tipo}>
                {t.etiqueta}
              </option>
            ))}
          </select>
          <Input
            aria-label="Nombre del documento"
            placeholder="Nombre (opcional)"
            className="h-9 w-48"
            maxLength={200}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            ref={inputArchivo}
            aria-label="Archivo"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="max-w-[14rem] text-xs"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
          <Button type="button" size="sm" onClick={subir} disabled={ocupado || !archivo}>
            <Upload className="mr-1 h-4 w-4" />
            {ocupado ? "Subiendo…" : "Subir"}
          </Button>
          <span className="basis-full text-xs text-muted-foreground">PDF, JPG o PNG, máximo {MAX_MB_DOCUMENTO} MB.</span>
        </div>
      )}
      {mensaje && (
        <p className={mensaje.tipo === "error" ? "text-xs text-destructive" : "text-xs text-emerald-700"} role="status">
          {mensaje.texto}
        </p>
      )}
    </section>
  );
}
