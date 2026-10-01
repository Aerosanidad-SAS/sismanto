"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";

import { cargarHojaDeVida, type HojaDeVidaPayload, type ReporteHojaDeVida, type ResumenHoja } from "@/app/api/actions/hoja-de-vida";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FilaCruda } from "@/lib/hoja-de-vida";

const HOJAS = {
  vehiculos: "1_VEHICULOS",
  documentos: "2_DOCUMENTOS_Y_COSTOS",
  mantenimientos: "3_ULTIMO_MANTENIMIENTO",
} as const;

/** Las filas 1 a 3 de cada hoja son encabezado, guía y marca de inicio: los datos empiezan en la fila 4. */
const PRIMERA_FILA_DATOS = 4;

function leerHoja(wb: XLSX.WorkBook, nombre: string): FilaCruda[] | null {
  const ws = wb.Sheets[nombre];
  if (!ws) return null;
  const filas = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: true });
  const encabezados = (filas[0] ?? []).map((h) => String(h ?? "").replace(/\*/g, "").trim());
  const salida: FilaCruda[] = [];
  for (let i = PRIMERA_FILA_DATOS - 1; i < filas.length; i++) {
    const celdas = filas[i] ?? [];
    if (celdas.every((c) => String(c ?? "").trim() === "")) continue;
    const datos: Record<string, unknown> = {};
    encabezados.forEach((h, j) => {
      if (h) datos[h] = celdas[j];
    });
    salida.push({ fila: i + 1, datos });
  }
  return salida;
}

function Resumen({ titulo, r }: { titulo: string; r: ResumenHoja }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm font-medium">{titulo}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{r.nuevos}</span> nuevos ·{" "}
        <span className="font-semibold text-foreground">{r.actualizados}</span> actualizados ·{" "}
        <span className="font-semibold text-foreground">{r.sinCambios}</span> sin cambios
      </p>
    </div>
  );
}

function descargarCsv(nombre: string, filas: string[][]) {
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function HojaDeVidaImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<HojaDeVidaPayload | null>(null);
  const [nombre, setNombre] = useState("");
  const [reporte, setReporte] = useState<ReporteHojaDeVida | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const elegirArchivo = async (file: File | undefined) => {
    setReporte(null);
    setAviso(null);
    setPayload(null);
    if (!file) return;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const vehiculos = leerHoja(wb, HOJAS.vehiculos);
      if (!vehiculos) {
        setAviso(`El archivo no tiene la hoja «${HOJAS.vehiculos}». Usa la plantilla de hoja de vida sin renombrar las hojas.`);
        return;
      }
      setNombre(file.name);
      setPayload({
        vehiculos,
        documentos: leerHoja(wb, HOJAS.documentos) ?? [],
        mantenimientos: leerHoja(wb, HOJAS.mantenimientos) ?? [],
      });
    } catch {
      setAviso("No se pudo leer el archivo. Asegúrate de que sea un Excel (.xlsx) de la plantilla.");
    }
  };

  const ejecutar = async (confirmar: boolean) => {
    if (!payload) return;
    setCargando(true);
    setAviso(null);
    const res = await cargarHojaDeVida(payload, confirmar);
    setCargando(false);
    if ("error" in res) setAviso(res.error);
    else setReporte(res);
  };

  const descargarErrores = () =>
    reporte && descargarCsv("errores_hoja_de_vida.csv", [["hoja", "fila", "columna", "mensaje"], ...reporte.errores.map((e) => [e.hoja, String(e.fila), e.columna ?? "", e.mensaje])]);
  const descargarIncompletos = () =>
    reporte && descargarCsv("hojas_de_vida_incompletas.csv", [["placa", "faltantes"], ...reporte.incompletos.map((i) => [i.placa, i.faltantes.join(", ")])]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" aria-hidden /> Hoja de vida de vehículos
        </CardTitle>
        <CardDescription>
          Sube la plantilla diligenciada (vehículos, documentos y costos, último mantenimiento). Primero ves qué pasaría; nada se escribe hasta que confirmes.
          Se puede repetir sin duplicar y una celda vacía nunca borra un dato ya cargado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={inputRef} type="file" accept=".xlsx" onChange={(e) => elegirArchivo(e.target.files?.[0])} className="block text-sm" />

        {aviso && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {aviso}
          </p>
        )}

        {payload && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {nombre}: {payload.vehiculos.length} vehículos · {payload.documentos.length} documentos · {payload.mantenimientos.length} últimos mantenimientos
            </p>
            <Button type="button" variant="outline" onClick={() => ejecutar(false)} disabled={cargando}>
              {cargando && !reporte?.aplicado ? "Revisando…" : "Vista previa"}
            </Button>
            {reporte && !reporte.aplicado && (
              <Button type="button" onClick={() => ejecutar(true)} disabled={cargando}>
                {cargando ? "Cargando…" : "Confirmar carga"}
              </Button>
            )}
          </div>
        )}

        {reporte && (
          <div className="space-y-4">
            <p className={`flex items-center gap-2 text-sm font-medium ${reporte.aplicado ? "text-green-700" : "text-amber-700"}`}>
              {reporte.aplicado ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
              {reporte.aplicado ? "Carga aplicada." : "Vista previa: todavía no se escribió nada."}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <Resumen titulo="Vehículos" r={reporte.vehiculos} />
              <Resumen titulo="Documentos y costos" r={reporte.documentos} />
              <Resumen titulo="Último mantenimiento" r={reporte.mantenimientos} />
            </div>
            <p className="text-sm text-muted-foreground">
              {reporte.lecturasKm} lecturas de kilometraje · {reporte.vencimientos} vencimientos de SOAT/técnico-mecánica actualizados · {reporte.sinValor} documentos sin valor (solo aportan vencimiento) · {reporte.cambiosDeEstado.length} vehículos nuevos o con cambio de estado
            </p>

            {reporte.errores.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-red-700">{reporte.errores.length} filas con error (no se cargan)</p>
                  <Button type="button" size="sm" variant="outline" onClick={descargarErrores}>
                    Descargar CSV
                  </Button>
                </div>
                <ul className="max-h-64 space-y-1 overflow-auto rounded-md border p-2 text-sm">
                  {reporte.errores.slice(0, 200).map((e, i) => (
                    <li key={i}>
                      <span className="font-mono text-xs text-muted-foreground">
                        {e.hoja} · fila {e.fila}
                        {e.columna ? ` · ${e.columna}` : ""}
                      </span>{" "}
                      {e.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reporte.incompletos.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-amber-700">{reporte.incompletos.length} hojas de vida quedan incompletas</p>
                  <Button type="button" size="sm" variant="outline" onClick={descargarIncompletos}>
                    Descargar CSV
                  </Button>
                </div>
                <ul className="max-h-64 space-y-1 overflow-auto rounded-md border p-2 text-sm">
                  {reporte.incompletos.map((i) => (
                    <li key={i.placa}>
                      <span className="font-medium">{i.placa}</span> — falta: {i.faltantes.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
