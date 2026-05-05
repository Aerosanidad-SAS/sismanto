"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  importarMantenimientos,
  importarCombustible,
  importarVehiculos,
  importarProveedores,
  type FilaMantenimiento,
  type FilaCombustible,
  type FilaVehiculo,
  type FilaProveedor,
  type ResultadoCarga,
} from "@/app/api/actions/carga-masiva";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";

type TipoCarga = "mantenimientos" | "combustible" | "vehiculos" | "proveedores";

const COLUMNAS_MANTENIMIENTOS = [
  "placa",
  "fecha",
  "kilometraje",
  "tipo",
  "categoria",
  "descripcion",
  "proveedor",
  "valor",
  "numero_factura",
  "tiempo_fuera_servicio",
];

const COLUMNAS_COMBUSTIBLE = [
  "placa",
  "fecha",
  "kilometraje",
  "galones",
  "costo",
  "notas",
];

const COLUMNAS_VEHICULOS = [
  "placa",
  "marca",
  "modelo",
  "linea",
  "centro_codigo",
  "tipo_combustible",
  "tipo_llantas",
  "tipo_bombillos",
  "tipo_refrigerante",
  "aceite_usado",
  "ref_filtro_aire_motor",
  "ref_filtro_aceite",
  "ref_filtro_combustible",
  "notas",
  "vencimiento_soat",
  "vencimiento_tecnicomecanica",
];

const COLUMNAS_PROVEEDORES = ["nombre", "nit", "contacto"];

const MODOS: { id: TipoCarga; label: string }[] = [
  { id: "mantenimientos", label: "Mantenimientos" },
  { id: "combustible", label: "Combustible" },
  { id: "vehiculos", label: "Vehículos" },
  { id: "proveedores", label: "Proveedores" },
];

function columnasPorTipo(t: TipoCarga): string[] {
  switch (t) {
    case "mantenimientos":
      return COLUMNAS_MANTENIMIENTOS;
    case "combustible":
      return COLUMNAS_COMBUSTIBLE;
    case "vehiculos":
      return COLUMNAS_VEHICULOS;
    case "proveedores":
      return COLUMNAS_PROVEEDORES;
  }
}

export function CargaMasivaTab() {
  const [tipoCarga, setTipoCarga] = useState<TipoCarga>("mantenimientos");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columnas = columnasPorTipo(tipoCarga);

  const resetearAlCambiarModo = () => {
    setArchivo(null);
    setPreview([]);
    setResultado(null);
    setErrorArchivo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const cambiarTipo = (t: TipoCarga) => {
    setTipoCarga(t);
    resetearAlCambiarModo();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setResultado(null);
    setErrorArchivo(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: "binary", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: "",
          raw: false,
          dateNF: "yyyy-mm-dd",
        });
        setPreview(rows.slice(0, 5));
      } catch {
        setErrorArchivo(
          "No se pudo leer el archivo. Asegúrese de que sea un Excel (.xlsx) o CSV válido."
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportar = async () => {
    if (!archivo) return;
    setIsLoading(true);
    setResultado(null);
    setErrorArchivo(null);

    try {
      const reader = new FileReader();
      const rows = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        reader.onload = (ev) => {
          try {
            const wb = XLSX.read(ev.target?.result, { type: "binary", cellDates: true });
            const ws = wb.Sheets[wb.SheetNames[0]];
            resolve(
              XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
                defval: "",
                raw: false,
                dateNF: "yyyy-mm-dd",
              })
            );
          } catch {
            reject(new Error("Error leyendo archivo"));
          }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(archivo);
      });

      if (rows.length === 0) {
        setErrorArchivo("El archivo no contiene datos.");
        return;
      }

      let res: ResultadoCarga;
      if (tipoCarga === "mantenimientos") {
        res = await importarMantenimientos(rows as unknown as FilaMantenimiento[]);
      } else if (tipoCarga === "combustible") {
        res = await importarCombustible(rows as unknown as FilaCombustible[]);
      } else if (tipoCarga === "vehiculos") {
        res = await importarVehiculos(rows as FilaVehiculo[]);
      } else {
        res = await importarProveedores(rows as FilaProveedor[]);
      }
      setResultado(res);
    } catch {
      setErrorArchivo("Error al procesar el archivo.");
    } finally {
      setIsLoading(false);
    }
  };

  const descargarPlantilla = () => {
    const ws = XLSX.utils.aoa_to_sheet([columnas]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, `plantilla_${tipoCarga}.xlsx`);
  };

  const resetear = () => {
    setArchivo(null);
    setPreview([]);
    setResultado(null);
    setErrorArchivo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carga Masiva de Datos</CardTitle>
          <CardDescription>
            Importe históricos de mantenimiento, combustible, altas de vehículos o proveedores desde
            Excel o CSV. Solo administradores pueden ejecutar importaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {MODOS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => cambiarTipo(m.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tipoCarga === m.id
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-gray-700">
                Columnas ({tipoCarga})
              </h4>
              <Button variant="outline" size="sm" onClick={descargarPlantilla}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {columnas.map((col) => (
                <code
                  key={col}
                  className="px-2 py-1 bg-white border rounded text-xs text-gray-700"
                >
                  {col}
                </code>
              ))}
            </div>
            {tipoCarga === "mantenimientos" && (
              <p className="text-xs text-gray-500">
                <strong>tipo:</strong> PREVENTIVO o CORRECTIVO &nbsp;|&nbsp;
                <strong>fecha:</strong> YYYY-MM-DD &nbsp;|&nbsp;
                <strong>categoria:</strong> nombre exacto de la categoría
              </p>
            )}
            {tipoCarga === "vehiculos" && (
              <p className="text-xs text-gray-500">
                <strong>centro_codigo:</strong> código del centro en{" "}
                <code className="bg-white px-1 rounded border">operational_centers</code> o nombre
                exacto del centro. Si la placa ya existe, la fila se omite sin detener el lote.
              </p>
            )}
            {tipoCarga === "proveedores" && (
              <p className="text-xs text-gray-500">
                Si el NIT (solo dígitos) o el nombre ya existe, la fila se omite.{" "}
                <strong>nit</strong> y <strong>contacto</strong> son opcionales.
              </p>
            )}
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
          >
            <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {archivo ? archivo.name : "Haga clic para seleccionar un archivo"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Excel (.xlsx) o CSV</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {errorArchivo && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorArchivo}
            </div>
          )}

          {preview.length > 0 && !resultado && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Vista previa (primeras {preview.length} filas)
              </h4>
              <div className="overflow-x-auto border rounded">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((k) => (
                        <th
                          key={k}
                          className="px-3 py-2 text-left font-medium text-gray-600 border-b"
                        >
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700">
                            {String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {archivo && !resultado && (
            <div className="flex gap-3">
              <Button onClick={handleImportar} disabled={isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Importando..." : "Importar Datos"}
              </Button>
              <Button variant="outline" onClick={resetear} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Importación completada</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="success">{resultado.exitosos} registros exitosos</Badge>
                    {resultado.omitidos.length > 0 && (
                      <Badge variant="secondary">{resultado.omitidos.length} omitidos</Badge>
                    )}
                    {resultado.errores.length > 0 && (
                      <Badge variant="destructive">{resultado.errores.length} errores</Badge>
                    )}
                  </div>
                </div>
              </div>

              {resultado.omitidos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-800">Filas omitidas</h4>
                  <p className="text-xs text-muted-foreground">
                    No cuentan como error de validación; el resto del archivo se procesó.
                  </p>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    <table className="text-xs w-full">
                      <thead className="bg-amber-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Fila</th>
                          <th className="px-3 py-2 text-left font-medium">Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.omitidos.map((o, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-3 py-2 font-mono">{o.fila > 0 ? o.fila : "—"}</td>
                            <td className="px-3 py-2 text-amber-900">{o.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {resultado.errores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-700">Errores encontrados</h4>
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <table className="text-xs w-full">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Fila</th>
                          <th className="px-3 py-2 text-left font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.errores.map((err, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-3 py-2 font-mono">
                              {err.fila > 0 ? err.fila : "—"}
                            </td>
                            <td className="px-3 py-2 text-red-700">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={resetear}>
                Cargar otro archivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
