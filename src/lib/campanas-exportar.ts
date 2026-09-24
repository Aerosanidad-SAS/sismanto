/**
 * Filas para exportar campañas a Excel (SISRES: exportCampanaHistorial.php). Puras y tolerantes: las columnas de estado
 * de Meta (`estado_meta`, `entregado_at`, `leido_at`) las agrega el webhook de WhatsApp; si esa migración aún no está
 * aplicada llegan `undefined` y salen en blanco en vez de romper la exportación.
 */

type Fila = Record<string, unknown>;

export const COLUMNAS_DETALLE = ["Teléfono", "Estado envío", "Estado Meta", "Enviado", "Entregado", "Leído", "WAMID", "Error", "Variables"] as const;
export const COLUMNAS_HISTORIAL = ["ID", "Nombre", "Plantilla", "Idioma", "Estado", "Destinatarios", "Enviados", "Fallidos", "Creada"] as const;

const texto = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

function variables(v: unknown): string {
  if (Array.isArray(v)) return v.map(texto).join(" | ");
  return texto(v);
}

export function filasDetalle(destinatarios: Fila[]): (string | number)[][] {
  return destinatarios.map((d) => [
    texto(d.telefono),
    texto(d.estado),
    texto(d.estado_meta),
    texto(d.sent_at),
    texto(d.entregado_at),
    texto(d.leido_at),
    texto(d.wamid),
    texto(d.error),
    variables(d.parametros),
  ]);
}

export function filasHistorial(campanas: Fila[]): (string | number)[][] {
  return campanas.map((c) => [
    Number(c.id) || 0,
    texto(c.nombre),
    texto(c.plantilla),
    texto(c.idioma),
    texto(c.estado),
    Number(c.total_destinatarios) || 0,
    Number(c.total_enviados) || 0,
    Number(c.total_fallidos) || 0,
    texto(c.created_at),
  ]);
}

/** Nombre de archivo sin caracteres problemáticos. */
export function nombreArchivoExport(base: string, fecha: Date = new Date()): string {
  const limpio = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
  return `${limpio || "campana"}_${fecha.toISOString().slice(0, 10)}.xlsx`;
}
