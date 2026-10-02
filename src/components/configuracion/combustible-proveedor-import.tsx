"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, CheckCircle2, Fuel } from "lucide-react";

import {
  cargarCombustibleProveedor,
  getUltimaCargaCombustible,
  type ReporteCombustible,
  type UltimaCargaCombustible,
} from "@/app/api/actions/combustible-proveedor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatoInstante } from "@/lib/fechas";
import { ImportFileDrop, ImportSteps } from "@/components/configuracion/import-flow";

function descargarCsv(nombre: string, filas: string[][]) {
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function CombustibleProveedorImport() {
  const [hoja, setHoja] = useState<unknown[][] | null>(null);
  const [nombre, setNombre] = useState("");
  const [reporte, setReporte] = useState<ReporteCombustible | null>(null);
  const [ultima, setUltima] = useState<UltimaCargaCombustible | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    getUltimaCargaCombustible().then(setUltima).catch(() => setUltima(null));
  }, []);

  const ejecutar = async (datos: unknown[][], archivo: string, confirmar: boolean) => {
    setCargando(true);
    setAviso(null);
    const res = await cargarCombustibleProveedor(datos, archivo, confirmar);
    setCargando(false);
    if ("error" in res) setAviso(res.error);
    else {
      setReporte(res);
      if (res.ultimaCarga) setUltima(res.ultimaCarga);
    }
  };

  // La vista previa corre sola al elegir el archivo; nada se escribe hasta confirmar.
  const elegirArchivo = async (file: File | undefined) => {
    setReporte(null);
    setAviso(null);
    setHoja(null);
    if (!file) return;
    setLeyendo(true);
    try {
      // Sin transformar: el archivo del proveedor se sube tal cual; el servidor detecta las columnas por nombre.
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const nombreHoja = wb.SheetNames.find((n) => /combustible/i.test(n)) ?? wb.SheetNames[0];
      const datos = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nombreHoja], { header: 1, defval: "", raw: true });
      setHoja(datos);
      setNombre(file.name);
      setLeyendo(false);
      await ejecutar(datos, file.name, false);
    } catch {
      setAviso("No se pudo leer el archivo. Sube el Excel (.xlsx, .xls) o CSV tal como lo descargas del proveedor.");
    } finally {
      setLeyendo(false);
    }
  };

  const descargarProblemas = () =>
    reporte &&
    descargarCsv("combustible_problemas.csv", [
      ["tipo", "fila", "placa", "detalle"],
      ...reporte.errores.map((e) => ["ERROR", String(e.fila), e.placa, e.mensaje]),
      ...reporte.advertencias.map((w) => [w.tipo, String(w.fila), w.placa, w.mensaje]),
      ...reporte.placasDesconocidas.map((p) => ["PLACA_DESCONOCIDA", "", p.placa, `${p.filas} filas`]),
    ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" aria-hidden /> Combustible (archivo del proveedor)
        </CardTitle>
        <CardDescription>
          Sube cada semana el Excel del proveedor tal cual, sin cambiar columnas. Ves la vista previa y confirmas. Se puede repetir o solapar con
          la semana anterior: lo ya cargado se omite.
          {ultima
            ? ` Última carga: ${formatoInstante(ultima.fecha)} (${ultima.nuevas} nuevas, ${ultima.duplicadas} ya existentes).`
            : " Aún no se ha hecho ninguna carga desde aquí."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImportSteps current={reporte ? "confirmar" : hoja || leyendo ? "revisar" : "subir"} />
        <ImportFileDrop
          accept=".xlsx,.xls,.csv"
          hint="Excel (.xlsx, .xls) o CSV, tal como lo descargas del proveedor."
          label="Elige el archivo del proveedor o arrástralo aquí"
          busy={leyendo || cargando}
          busyLabel={leyendo ? "Leyendo el archivo…" : "Revisando qué pasaría…"}
          onFiles={(files) => elegirArchivo(files[0])}
        />

        {aviso && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {aviso}
          </p>
        )}

        {hoja && <p className="text-sm text-muted-foreground">{nombre}</p>}

        {reporte && (
          <div className="space-y-4">
            <p className={`flex items-center gap-2 text-sm font-medium ${reporte.aplicado ? "text-green-700" : "text-amber-700"}`}>
              {reporte.aplicado ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
              {reporte.aplicado ? "Carga aplicada." : "Vista previa: todavía no se escribió nada. Revisa las cifras y confirma."}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Filas del archivo", reporte.filasArchivo],
                ["Nuevas", reporte.nuevas],
                ["Ya existentes", reporte.duplicadas],
                ["Con error", reporte.errores.length],
              ].map(([t, n]) => (
                <div key={String(t)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{t}</p>
                  <p className="text-xl font-semibold">{n}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {reporte.rango ? `Del ${reporte.rango.desde} al ${reporte.rango.hasta}` : "Sin fechas"} · {reporte.lecturasKm} lecturas de km válidas ·{" "}
              {reporte.kmSospechosos} km sospechosos (se cargan, pero no mueven el km del vehículo)
            </p>

            {!reporte.aplicado && (
              <Button
                type="button"
                onClick={() => hoja && ejecutar(hoja, nombre, true)}
                disabled={cargando || reporte.nuevas === 0}
              >
                {cargando
                  ? "Cargando…"
                  : reporte.nuevas === 0
                    ? "No hay filas nuevas para cargar"
                    : `Confirmar carga de ${reporte.nuevas} ${reporte.nuevas === 1 ? "fila nueva" : "filas nuevas"}`}
              </Button>
            )}

            {reporte.placasDesconocidas.length > 0 && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Placas que no están en la flota (no se cargan, el resto sí):{" "}
                {reporte.placasDesconocidas.map((p) => `${p.placa} (${p.filas})`).join(", ")}
              </p>
            )}

            {(reporte.errores.length > 0 || reporte.advertencias.length > 0) && (
              <div className="space-y-2">
                <Button type="button" size="sm" variant="outline" onClick={descargarProblemas}>
                  Descargar errores y advertencias (CSV)
                </Button>
                <ul className="max-h-64 space-y-1 overflow-auto rounded-md border p-2 text-sm">
                  {reporte.errores.slice(0, 100).map((e, i) => (
                    <li key={`e${i}`}>
                      <span className="font-mono text-xs text-destructive">Error · fila {e.fila}</span> {e.placa} — {e.mensaje}
                    </li>
                  ))}
                  {reporte.advertencias.slice(0, 100).map((w, i) => (
                    <li key={`w${i}`}>
                      <span className="font-mono text-xs text-amber-700">Aviso · fila {w.fila}</span> {w.placa} — {w.mensaje}
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
