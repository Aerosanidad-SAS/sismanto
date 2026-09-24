/**
 * Entrega y/o Préstamo de Equipos Informáticos, G-TECN-F 018
 * (SISRES: registroPrestamo.php, includes/prestamoCamposConfig.php, includes/modificarPrestamo.php).
 */
import { z } from "zod";
import type { LadoDef } from "./firmas-registro";

export type EstadoPrestamo = "PRESTADO" | "DEVUELTO";

/** Devuelto cuando hay fecha de devolución (prestamoFilaHtml.php); si no, sigue prestado. */
export function estadoPrestamo(p: { fecha_devolucion: string | null | undefined }): EstadoPrestamo {
  return p.fecha_devolucion ? "DEVUELTO" : "PRESTADO";
}

const txt = (max: number) => z.string().trim().max(max).default("");
const req = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const opc = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null));
const fechaOpc = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de devolución inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

/**
 * Obligatorios como en SISRES por defecto: placa, quien recibe y quien entrega. La devolución nunca es obligatoria
 * al crear (el préstamo empieza sin devolución): se llena editando.
 */
export const prestamoSchema = z.object({
  equipo_descripcion: req(150, "Descripción del equipo requerida"),
  equipo_placa: req(40, "Placa del equipo requerida"),
  equipo_incluye: txt(255),
  usuario_recibe_nombre: req(150, "Nombre de quien recibe requerido"),
  usuario_recibe_cargo: txt(100),
  func_entrega_nombre: req(150, "Nombre de quien entrega requerido"),
  func_entrega_cargo: txt(100),
  fecha_devolucion: fechaOpc,
  gestion_recibe_nombre: opc(150),
  gestion_recibe_cargo: opc(100),
  usuario_entrega_dev_nombre: opc(150),
  usuario_entrega_dev_cargo: opc(100),
  observaciones: txt(500),
});
export type PrestamoEntrada = z.input<typeof prestamoSchema>;
export type PrestamoDatos = z.output<typeof prestamoSchema>;

/** Fila de `ti_prestamo_equipo` para la lista y el PDF. */
export interface PrestamoFila {
  id: number;
  numero_orden: string;
  fecha_entrega: string;
  equipo_descripcion: string;
  equipo_placa: string;
  equipo_incluye: string;
  usuario_recibe_nombre: string;
  usuario_recibe_cargo: string;
  firma_usuario_recibe_ruta: string;
  firma_usuario_recibe_hash: string;
  func_entrega_nombre: string;
  func_entrega_cargo: string;
  firma_func_entrega_ruta: string;
  firma_func_entrega_hash: string;
  fecha_devolucion: string | null;
  gestion_recibe_nombre: string | null;
  gestion_recibe_cargo: string | null;
  firma_gestion_recibe_ruta: string | null;
  firma_gestion_recibe_hash: string | null;
  usuario_entrega_dev_nombre: string | null;
  usuario_entrega_dev_cargo: string | null;
  firma_usuario_entrega_dev_ruta: string | null;
  firma_usuario_entrega_dev_hash: string | null;
  observaciones: string;
  firmas_png: Record<string, string>;
  created_at: string;
}

/** Campos que cubren las dos firmas de la entrega (prestamoCamposClaveEntrega). */
export function camposClaveEntregaPrestamo(
  r: Pick<PrestamoFila, "fecha_entrega" | "equipo_descripcion" | "equipo_placa" | "usuario_recibe_nombre" | "func_entrega_nombre">
): Record<string, string> {
  return {
    fecha_entrega: r.fecha_entrega ?? "",
    equipo_descripcion: r.equipo_descripcion ?? "",
    equipo_placa: r.equipo_placa ?? "",
    usuario_recibe_nombre: r.usuario_recibe_nombre ?? "",
    func_entrega_nombre: r.func_entrega_nombre ?? "",
  };
}

/** Campos que cubren las dos firmas de la devolución (prestamoCamposClaveDevolucion): independientes de la entrega. */
export function camposClaveDevolucionPrestamo(
  r: Pick<PrestamoFila, "fecha_devolucion" | "gestion_recibe_nombre" | "usuario_entrega_dev_nombre">
): Record<string, string> {
  return {
    fecha_devolucion: r.fecha_devolucion ?? "",
    gestion_recibe_nombre: r.gestion_recibe_nombre ?? "",
    usuario_entrega_dev_nombre: r.usuario_entrega_dev_nombre ?? "",
  };
}

/** Los cuatro lados de firma: dos de la entrega y dos de la devolución, cada par con su propio hash de integridad. */
export const LADOS_PRESTAMO = [
  { lado: "usuario_recibe", ruta: "firma_usuario_recibe_ruta", hash: "firma_usuario_recibe_hash", clave: "entrega" },
  { lado: "func_entrega", ruta: "firma_func_entrega_ruta", hash: "firma_func_entrega_hash", clave: "entrega" },
  { lado: "gestion_recibe", ruta: "firma_gestion_recibe_ruta", hash: "firma_gestion_recibe_hash", clave: "devolucion" },
  { lado: "usuario_entrega_dev", ruta: "firma_usuario_entrega_dev_ruta", hash: "firma_usuario_entrega_dev_hash", clave: "devolucion" },
] as const satisfies readonly LadoDef[];

export type LadoPrestamo = (typeof LADOS_PRESTAMO)[number]["lado"];
