"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

import { cargarUsuarios, type ReporteUsuarios, type UsuarioCreado } from "@/app/api/actions/usuarios-carga";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { esFilaDeGuia, FILAS_POR_LOTE_USUARIOS, type FilaUsuarioCruda } from "@/lib/usuarios-carga";

/** La fila 1 es el encabezado; la guía (fila 2) y la marca «↓ datos desde aquí» (fila 3) se reconocen por su contenido, no por su posición. */
const PRIMERA_FILA_DATOS = 2;

function descargarCsv(nombre: string, filas: string[][]) {
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function leerFilas(wb: XLSX.WorkBook): FilaUsuarioCruda[] | null {
  const ws = wb.Sheets["USUARIOS"];
  if (!ws) return null;
  const filas = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: true });
  const encabezados = (filas[0] ?? []).map((h) => String(h ?? "").replace(/\*/g, "").trim());
  const salida: FilaUsuarioCruda[] = [];
  for (let i = PRIMERA_FILA_DATOS - 1; i < filas.length; i++) {
    const celdas = filas[i] ?? [];
    if (celdas.every((c) => String(c ?? "").trim() === "")) continue;
    if (esFilaDeGuia(celdas)) continue;
    const datos: Record<string, unknown> = {};
    encabezados.forEach((h, j) => {
      if (h) datos[h] = celdas[j];
    });
    salida.push({ fila: i + 1, datos });
  }
  return salida;
}

/** Administración → Usuarios → carga masiva desde la plantilla (vista previa, luego confirmar por lotes). */
export function UsuariosCargaMasiva() {
  const [filas, setFilas] = useState<FilaUsuarioCruda[] | null>(null);
  const [nombre, setNombre] = useState("");
  const [reporte, setReporte] = useState<ReporteUsuarios | null>(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const elegir = async (file: File | undefined) => {
    setReporte(null);
    setAviso(null);
    setFilas(null);
    if (!file) return;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const f = leerFilas(wb);
      if (!f) {
        setAviso("El archivo no tiene la hoja «USUARIOS». Usa la plantilla sin renombrar las hojas.");
        return;
      }
      setNombre(file.name);
      setFilas(f);
    } catch {
      setAviso("No se pudo leer el archivo. Sube la plantilla de usuarios (.xlsx).");
    }
  };

  const vistaPrevia = async () => {
    if (!filas) return;
    setCargando(true);
    setAviso(null);
    try {
      const r = await cargarUsuarios(filas, false);
      if ("error" in r) setAviso(r.error);
      else setReporte(r);
    } catch {
      setAviso("No se pudo revisar el archivo. Revisa tu conexión y que tu sesión siga abierta, y vuelve a intentarlo.");
    } finally {
      setCargando(false);
    }
  };

  const confirmar = async () => {
    if (!filas || !reporte) return;
    setCargando(true);
    setAviso(null);
    // La vista previa ya validó TODO el archivo (cédulas repetidas, ya existentes, rol, centro): solo se envían las filas
    // buenas. Validar por lotes de 12 no ve los repetidos que caen en lotes distintos y los daría por «ya existían».
    const omitidas = new Set([...reporte.errores.map((e) => e.fila), ...reporte.existentes.map((e) => e.fila)]);
    const porCrear = filas.filter((f) => !omitidas.has(f.fila));
    const total: ReporteUsuarios = { aplicado: true, nuevos: 0, existentes: [...reporte.existentes], errores: [...reporte.errores], creados: [] };
    try {
      for (let i = 0; i < porCrear.length; i += FILAS_POR_LOTE_USUARIOS) {
        setProgreso(`Creando usuarios… ${Math.min(i + FILAS_POR_LOTE_USUARIOS, porCrear.length)} de ${porCrear.length}`);
        const r = await cargarUsuarios(porCrear.slice(i, i + FILAS_POR_LOTE_USUARIOS), true);
        if ("error" in r) {
          setAviso(r.error);
          break;
        }
        total.nuevos += r.nuevos;
        total.existentes.push(...r.existentes);
        total.errores.push(...r.errores);
        total.creados.push(...r.creados);
      }
    } catch {
      // Un lote que se corta (red, sesión vencida, tiempo): lo ya creado queda guardado; se muestra y se descarga.
      setAviso(
        `La carga se interrumpió después de crear ${total.creados.length} de ${porCrear.length} usuarios. Revisa tu conexión y vuelve a subir el mismo archivo: quienes ya se crearon aparecen como «ya existían» y no se tocan.`
      );
    }
    setProgreso("");
    setCargando(false);
    setReporte(total);
  };

  const descargarCreados = (creados: UsuarioCreado[]) =>
    descargarCsv("usuarios_creados.csv", [
      ["cedula", "nombre", "rol", "centro", "codigo_acceso"],
      ...creados.map((c) => [c.cedula, c.nombre, c.rol, c.centro ?? "", c.codigo]),
    ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden /> Carga masiva de usuarios
        </CardTitle>
        <CardDescription>
          Sube la plantilla de usuarios. Primero ves qué pasaría; nada se crea hasta que confirmes. Cada persona entra con su cédula (o su código de 6
          números) y la clave inicial, y el sistema le obliga a cambiarla en el primer ingreso. Los usuarios que ya existen no se tocan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="file" accept=".xlsx" onChange={(e) => elegir(e.target.files?.[0])} className="block text-sm" />
        {aviso && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {aviso}
          </p>
        )}
        {filas && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {nombre}: {filas.length} filas
            </p>
            <Button type="button" variant="outline" onClick={vistaPrevia} disabled={cargando}>
              Vista previa
            </Button>
            {reporte && !reporte.aplicado && reporte.nuevos > 0 && (
              <Button type="button" onClick={confirmar} disabled={cargando}>
                {cargando ? progreso || "Creando…" : `Crear ${reporte.nuevos} usuarios`}
              </Button>
            )}
          </div>
        )}

        {reporte && (
          <div className="space-y-4">
            <p className={`flex items-center gap-2 text-sm font-medium ${reporte.aplicado ? "text-green-700" : "text-amber-700"}`}>
              {reporte.aplicado ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
              {reporte.aplicado ? "Carga aplicada." : "Vista previa: todavía no se creó nadie."}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [reporte.aplicado ? "Creados" : "Se crearían", reporte.nuevos],
                ["Ya existían (omitidos)", reporte.existentes.length],
                ["Con error", reporte.errores.length],
              ].map(([t, n]) => (
                <div key={String(t)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{t}</p>
                  <p className="text-xl font-semibold">{n}</p>
                </div>
              ))}
            </div>

            {!reporte.aplicado && reporte.nuevos > 0 && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Quien no tenga `password_inicial` en la plantilla entra con su cédula como clave. Hasta su primer ingreso, cualquiera que conozca esa
                cédula podría entrar por él: entrega el acceso el mismo día de la carga y pide que cada persona entre y elija su clave de inmediato.
              </p>
            )}

            {reporte.aplicado && reporte.creados.length > 0 && (
              <div className="space-y-1">
                <Button type="button" size="sm" variant="outline" onClick={() => descargarCreados(reporte.creados)}>
                  Descargar CSV con los códigos de acceso
                </Button>
                <p className="text-xs text-muted-foreground">Contiene cédulas: entrégalo por un canal privado y no lo guardes en el repositorio.</p>
              </div>
            )}

            {reporte.existentes.length > 0 && (
              <p className="rounded-md border p-3 text-sm text-muted-foreground">
                Ya registradas (no se modifican): {reporte.existentes.slice(0, 30).map((e) => e.cedula).join(", ")}
                {reporte.existentes.length > 30 ? "…" : ""}
              </p>
            )}

            {reporte.errores.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-red-700">{reporte.errores.length} filas con error (no se crean)</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      descargarCsv("errores_usuarios.csv", [["fila", "columna", "mensaje"], ...reporte.errores.map((e) => [String(e.fila), e.columna ?? "", e.mensaje])])
                    }
                  >
                    Descargar CSV
                  </Button>
                </div>
                <ul className="max-h-64 space-y-1 overflow-auto rounded-md border p-2 text-sm">
                  {reporte.errores.slice(0, 200).map((e, i) => (
                    <li key={i}>
                      <span className="font-mono text-xs text-muted-foreground">
                        fila {e.fila}
                        {e.columna ? ` · ${e.columna}` : ""}
                      </span>{" "}
                      {e.mensaje}
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
