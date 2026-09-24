/**
 * Lectura y plantilla del Excel de destinatarios (SISRES: includes/wa/xlsxReader.php, generarPlantillaXlsx.php).
 *
 * Se usa SOLO desde el navegador de quien sube el archivo: el Excel se lee allí y al servidor llegan filas ya
 * convertidas a JSON (que el servidor vuelve a validar). Así el archivo no se procesa en el servidor: la versión de
 * `xlsx` del proyecto (0.18.5) tiene vulnerabilidades conocidas al leer archivos no confiables (prototipos y ReDoS).
 */
import { MAX_BYTES_EXCEL } from "@/lib/campanas-destinatarios";

export interface HojaLeida {
  encabezados: string[];
  filas: Record<string, unknown>[];
}

/** Lee la primera hoja. Lanza un Error con un mensaje para el usuario si el archivo no sirve. */
export async function leerHoja(buffer: ArrayBuffer, nombreArchivo: string): Promise<HojaLeida> {
  if (!/\.xlsx$/i.test(nombreArchivo)) throw new Error("El archivo debe ser .xlsx (descarga la plantilla y guárdala como Excel).");
  if (buffer.byteLength > MAX_BYTES_EXCEL) throw new Error("El archivo supera el límite de 5 MB.");

  // Un .xlsx es un ZIP (empieza por "PK"). Sin esta comprobación la librería "lee" también texto o CSV con
  // extensión .xlsx y el error aparece después, lejos de la causa.
  const cabecera = new Uint8Array(buffer.slice(0, 4));
  if (cabecera[0] !== 0x50 || cabecera[1] !== 0x4b || cabecera[2] !== 0x03 || cabecera[3] !== 0x04) {
    throw new Error("No se pudo leer el Excel: el archivo está dañado o no es un .xlsx válido.");
  }

  const XLSX = await import("xlsx");
  let libro;
  try {
    // Sin fórmulas, HTML ni estilos: solo los valores.
    libro = XLSX.read(buffer, { type: "array", cellFormula: false, cellHTML: false, cellStyles: false, cellDates: false });
  } catch {
    throw new Error("No se pudo leer el Excel: el archivo está dañado o no es un .xlsx válido.");
  }
  const hoja = libro.Sheets[libro.SheetNames[0]];
  if (!hoja) throw new Error("El Excel no tiene hojas.");

  const primera = (XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "", raw: false }) as unknown[][])[0] ?? [];
  const encabezados = primera.map((h) => String(h ?? "").trim()).filter((h) => h !== "");
  if (encabezados.length === 0) throw new Error("La primera fila del Excel debe tener los encabezados (por ejemplo: telefono, nombre).");

  // raw:false → los números salen como texto tal como se ven en la celda (un celular no se convierte en 3.0e9).
  const todas = XLSX.utils.sheet_to_json(hoja, { defval: "", raw: false }) as Record<string, unknown>[];
  // Las filas totalmente vacías (típicas al final de una hoja) no son destinatarios ni deben contarse como omitidos.
  const filas = todas.filter((f) => Object.values(f).some((v) => String(v ?? "").trim() !== ""));
  return { encabezados, filas };
}

/** Descarga la plantilla con los encabezados y dos filas de ejemplo. */
export async function descargarPlantilla(): Promise<void> {
  const XLSX = await import("xlsx");
  const hoja = XLSX.utils.aoa_to_sheet([
    ["telefono", "nombre", "param1", "param2"],
    ["3001234567", "Juan Pérez", "Juan", "mañana 8am"],
    ["3109876543", "Ana Gómez", "Ana", "tarde 2pm"],
  ]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Destinatarios");
  XLSX.writeFile(libro, "plantilla_destinatarios_whatsapp.xlsx");
}
