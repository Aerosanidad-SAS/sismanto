"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  importarMantenimientos,
  importarCombustible,
  type FilaMantenimiento,
  type FilaCombustible,
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

type TipoCarga = "mantenimientos" | "combustible";

const COLUMNAS_MANTENIMIENTOS = [
  "placa", "fecha", "kilometraje", "tipo", "categoria",
  "descripcion", "proveedor", "valor", "numero_factura", "tiempo_fuera_servicio",
];

const COLUMNAS_COMBUSTIBLE = [
  "placa", "fecha", "kilometraje", "galones", "costo", "notas",
];

export function CargaMasivaTab() {
  const [tipoCarga, setTipoCarga] = useState<TipoCarga>("mantenimientos");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columnas = tipoCarga === "mantenimientos" ? COLUMNAS_MANTENIMIENTOS : COLUMNAS_COMBUSTIBLE;

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
        const rows: any[] = XLSX.utils.sheet_to_json(ws, {
          defval: "",
          raw: false,
          dateNF: "yyyy-mm-dd",
        });
        setPreview(rows.slice(0, 5));
      } catch {
        setErrorArchivo("No se pudo leer el archivo. Asegúrese de que sea un Excel (.xlsx) o CSV válido.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const parsearArchivo = (): any[] | null => {
    if (!archivo) return null;
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = ev.target?.result;
          const wb = XLSX.read(data, { type: "binary", cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(ws, {
            defval: "",
            raw: false,
            dateNF: "yyyy-mm-dd",
          });
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(archivo);
    }) as any;
  };

  const handleImportar = async () => {
    if (!archivo) return;
    setIsLoading(true);
    setResultado(null);
    setErrorArchivo(null);

    try {
      const reader = new FileReader();
      const rows = await new Promise<any[]>((resolve, reject) => {
        reader.onload = (ev) => {
          try {
            const wb = XLSX.read(ev.target?.result, { type: "binary", cellDates: true });
            const ws = wb.Sheets[wb.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(ws, { defval: "", raw: false, dateNF: "yyyy-mm-dd" }));
          } catch { reject(new Error("Error leyendo archivo")); }
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
        res = await importarMantenimientos(rows as FilaMantenimiento[]);
      } else {
        res = await importarCombustible(rows as FilaCombustible[]);
      }
      setResultado(res);
    } catch (err) {
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
            Importe históricos de mantenimiento o registros de combustible desde Excel o CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setTipoCarga("mantenimientos"); resetear(); }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                tipoCarga === "mantenimientos"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Mantenimientos
            </button>
            <button
              type="button"
              onClick={() => { setTipoCarga("combustible"); resetear(); }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                tipoCarga === "combustible"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Combustible
            </button>
          </div>

          {/* Plantilla y columnas */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Columnas requeridas ({tipoCarga})
              </h4>
              <Button variant="outline" size="sm" onClick={descargarPlantilla}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {columnas.map((col) => (
                <code key={col} className="px-2 py-1 bg-white border rounded text-xs text-gray-700">
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
          </div>

          {/* Upload */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => inputRef.current?.click()}
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

          {/* Preview */}
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
                        <th key={k} className="px-3 py-2 text-left font-medium text-gray-600 border-b">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {Object.values(row).map((v: any, j) => (
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

          {/* Botón importar */}
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

          {/* Resultado */}
          {resultado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    Importación completada
                  </p>
                  <div className="flex gap-3 mt-1">
                    <Badge variant="success">
                      {resultado.exitosos} registros exitosos
                    </Badge>
                    {resultado.errores.length > 0 && (
                      <Badge variant="destructive">
                        {resultado.errores.length} errores
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {resultado.errores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-700">
                    Errores encontrados:
                  </h4>
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
