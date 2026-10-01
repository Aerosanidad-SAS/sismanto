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
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    getUltimaCargaCombustible().then(setUltima).catch(() => setUltima(null));
  }, []);

  const elegirArchivo = async (file: File | undefined) => {
    setReporte(null);
    setAviso(null);
    setHoja(null);
    if (!file) return;
    try {
      // Sin transformar: el archivo del proveedor se sube tal cual; el servidor detecta las columnas por nombre.
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const nombreHoja = wb.SheetNames.find((n) => /combustible/i.test(n)) ?? wb.SheetNames[0];
      setHoja(XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nombreHoja], { header: 1, defval: "", raw: true }));
      setNombre(file.name);
    } catch {
      setAviso("No se pudo leer el archivo. Sube el Excel (.xlsx, .xls) o CSV tal como lo descargas del proveedor.");
    }
  };

  const ejecutar = async (confirmar: boolean) => {
    if (!hoja) return;
    setCargando(true);
    setAviso(null);
    const res = await cargarCombustibleProveedor(hoja, nombre, confirmar);
    setCargando(false);
    if ("error" in res) setAviso(res.error);
    else {
      setReporte(res);
      if (res.ultimaCarga) setUltima(res.ultimaCarga);
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
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => elegirArchivo(e.target.files?.[0])} className="block text-sm" />

        {aviso && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {aviso}
          </p>
        )}

        {hoja && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">{nombre}</p>
            <Button type="button" variant="outline" onClick={() => ejecutar(false)} disabled={cargando}>
              {cargando && !reporte ? "Revisando…" : "Vista previa"}
            </Button>
            {reporte && !reporte.aplicado && reporte.nuevas > 0 && (
              <Button type="button" onClick={() => ejecutar(true)} disabled={cargando}>
                {cargando ? "Cargando…" : `Confirmar carga (${reporte.nuevas})`}
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
                      <span className="font-mono text-xs text-red-700">Error · fila {e.fila}</span> {e.placa} — {e.mensaje}
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
