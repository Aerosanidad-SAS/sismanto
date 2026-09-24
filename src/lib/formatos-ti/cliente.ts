/**
 * Ayudas de navegador compartidas por las pantallas de los Formatos TI: bajar un PDF que llega en base64
 * desde una acción de servidor y armar el Excel de un listado. Solo se importan desde componentes de cliente.
 */
import { celdaExcelSegura } from "@/lib/servicios-lista";

/** Clase de los <select> nativos, igual que los Input de shadcn. */
export const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface RespuestaPdf {
  error?: string;
  data?: string;
  filename?: string;
}

/** Descarga el PDF de una respuesta `{ data: base64, filename }`; muestra el error si lo hubo. */
export function descargarPdfBase64(res: RespuestaPdf, nombreDefecto: string): void {
  if (res.error) {
    alert(res.error);
    return;
  }
  if (!res.data) return;
  const bytes = Uint8Array.from(atob(res.data), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = res.filename ?? nombreDefecto;
  enlace.click();
  URL.revokeObjectURL(url);
}

export type ColumnaExcel<T> = [titulo: string, valor: (fila: T) => unknown];

/** Excel de un listado con las celdas protegidas contra inyección de fórmulas (celdaExcelSegura). */
export async function exportarExcel<T>(hoja: string, prefijoArchivo: string, columnas: ColumnaExcel<T>[], filas: T[]): Promise<void> {
  const XLSX = await import("xlsx");
  const datos = [columnas.map(([t]) => t), ...filas.map((f) => columnas.map(([, v]) => celdaExcelSegura(v(f))))];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(datos), hoja);
  const sello = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" }).replace(/[: ]/g, "-");
  XLSX.writeFile(libro, `${prefijoArchivo}_${sello}.xlsx`);
}
