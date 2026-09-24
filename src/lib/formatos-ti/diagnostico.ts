/**
 * Diagnóstico de Mantenimiento de Equipos Informáticos, G-TECN-F 047
 * (SISRES: registroDiagnostico.php, includes/diagnosticoCamposConfig.php).
 */
import { z } from "zod";
import { OPCIONES_CHEQUEO } from "./comun";
import type { LadoDef } from "./firmas-registro";

export const TIPOS_MTTO = ["PREVENTIVO", "CORRECTIVO"] as const;
export type TipoMtto = (typeof TIPOS_MTTO)[number];

/** Diagnóstico inicial: 4 ítems SI / NO / N-A. */
export const OPCIONES_DIAGNOSTICO = ["SI", "NO", "N-A"] as const;
export const CATALOGO_DIAGNOSTICO: Record<string, string> = {
  problemas_encender: "Presenta problemas al encender",
  problemas_pantalla: "Presenta problemas al visualizar pantalla",
  problemas_escribir: "Presenta problemas al escribir",
  algun_problema: "Presenta algún problema",
};

/** Listado de chequeo: 14 ítems BUENO / MALO / N-A. */
export const CATALOGO_CHEQUEO_DIAGNOSTICO: Record<string, string> = {
  revision_funcionamiento: "Revisión de funcionamiento",
  inspeccion_visual: "Inspección visual del equipo",
  revision_sistema_electrico: "Revisión del sistema eléctrico",
  revision_pantalla: "Revisión de la pantalla",
  revision_disco_duro: "Revisión de disco duro",
  revision_teclado: "Revisión del teclado",
  verificacion_voltaje: "Verificación de voltaje y corriente",
  monitor: "Monitor",
  revision_mouse: "Revisión del mouse",
  limpieza_tarjeta: "Limpieza de tarjeta electrónica",
  limpieza_interna_externa: "Limpieza interna y externa",
  revision_memoria_ram: "Revisión de memoria RAM",
  revision_accesorios: "Revisión de accesorios",
  verificacion_final: "Verificación final",
};

/** Resultado del mantenimiento: casillas, en el orden del formato. */
export const RESULTADOS_DIAGNOSTICO = [
  ["equipo_apto_uso", "Equipo apto para el uso"],
  ["equipo_averiado", "Equipo averiado"],
  ["requirio_reparacion", "Requirió reparación"],
  ["partes_buen_estado", "Partes en buen estado"],
] as const;

export const MAX_REPUESTOS = 30;

const txt = (max: number) => z.string().trim().max(max).default("");
const req = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const fecha = (msg: string) => z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, msg);
const fechaOpc = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de la orden inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

export const repuestoSchema = z.object({
  repuesto: z.string().trim().max(150),
  referencia_serial: z.string().trim().max(150).default(""),
  cantidad: z.coerce.number().int("La cantidad debe ser entera").min(1, "La cantidad mínima es 1").max(9999).default(1),
});

/** Obligatorios como en SISRES por defecto: fecha, equipo, placa, tipo de mantenimiento y quien realizó. */
export const diagnosticoSchema = z
  .object({
    fecha_diagnostico: fecha("Fecha del diagnóstico requerida"),
    equipo: req(100, "Equipo requerido"),
    marca: txt(100),
    modelo: txt(100),
    usuario_equipo: txt(150),
    serial: txt(100),
    ubicacion: txt(150),
    responsable_equipo: txt(150),
    fecha_orden: fechaOpc,
    sede: txt(100),
    placa: req(40, "Placa requerida"),
    codigo_institucional: txt(50),
    tipo_mtto: z.enum(TIPOS_MTTO, { errorMap: () => ({ message: "Elige el tipo de mantenimiento" }) }),
    diagnostico: z.record(z.string(), z.enum(OPCIONES_DIAGNOSTICO)).default({}),
    descripcion_falla: txt(1000),
    checklist: z.record(z.string(), z.enum(OPCIONES_CHEQUEO)).default({}),
    equipo_apto_uso: z.boolean().default(false),
    equipo_averiado: z.boolean().default(false),
    requirio_reparacion: z.boolean().default(false),
    partes_buen_estado: z.boolean().default(false),
    observaciones: txt(1000),
    realizo_nombre: req(150, "Nombre de quien realizó requerido"),
    realizo_cargo: txt(100),
    reviso_nombre: txt(150),
    reviso_cargo: txt(100),
    repuestos: z.array(repuestoSchema).max(MAX_REPUESTOS, `Máximo ${MAX_REPUESTOS} repuestos`).default([]),
  })
  .transform((d) => ({
    ...d,
    // Solo se guardan claves del catálogo (un cliente no puede colar claves ajenas).
    diagnostico: Object.fromEntries(Object.entries(d.diagnostico).filter(([k]) => k in CATALOGO_DIAGNOSTICO)),
    checklist: Object.fromEntries(Object.entries(d.checklist).filter(([k]) => k in CATALOGO_CHEQUEO_DIAGNOSTICO)),
    // Filas de repuestos sin nombre se descartan (como insertarDiagnostico.php).
    repuestos: d.repuestos.filter((r) => r.repuesto !== ""),
  }));
export type DiagnosticoEntrada = z.input<typeof diagnosticoSchema>;
export type DiagnosticoDatos = z.output<typeof diagnosticoSchema>;

export interface RepuestoFila {
  id?: number;
  repuesto: string;
  referencia_serial: string;
  cantidad: number;
}

/** Fila de `ti_diagnostico` para la lista y el PDF. */
export interface DiagnosticoFila {
  id: number;
  numero_orden: string;
  fecha_diagnostico: string;
  equipo: string;
  marca: string;
  modelo: string;
  usuario_equipo: string;
  serial: string;
  ubicacion: string;
  responsable_equipo: string;
  fecha_orden: string | null;
  sede: string;
  placa: string;
  codigo_institucional: string;
  tipo_mtto: TipoMtto;
  diagnostico: Record<string, string>;
  descripcion_falla: string;
  checklist: Record<string, string>;
  equipo_apto_uso: boolean;
  equipo_averiado: boolean;
  requirio_reparacion: boolean;
  partes_buen_estado: boolean;
  observaciones: string;
  realizo_nombre: string;
  realizo_cargo: string;
  firma_realizo_ruta: string;
  firma_realizo_hash: string;
  reviso_nombre: string;
  reviso_cargo: string;
  firma_reviso_ruta: string;
  firma_reviso_hash: string;
  firmas_png: Record<string, string>;
  created_at: string;
}

/** Campos que cubren las dos firmas (diagnosticoCamposClave). */
export function camposClaveDiagnostico(
  r: Pick<
    DiagnosticoFila,
    | "fecha_diagnostico" | "equipo" | "marca" | "modelo" | "serial" | "placa" | "tipo_mtto"
    | "descripcion_falla" | "realizo_nombre" | "reviso_nombre"
  >
): Record<string, string> {
  return {
    fecha_diagnostico: r.fecha_diagnostico ?? "",
    equipo: r.equipo ?? "",
    marca: r.marca ?? "",
    modelo: r.modelo ?? "",
    serial: r.serial ?? "",
    placa: r.placa ?? "",
    tipo_mtto: r.tipo_mtto ?? "",
    descripcion_falla: r.descripcion_falla ?? "",
    realizo_nombre: r.realizo_nombre ?? "",
    reviso_nombre: r.reviso_nombre ?? "",
  };
}

/** Los dos lados de firma: ambos cubren el mismo juego de campos clave. */
export const LADOS_DIAGNOSTICO = [
  { lado: "realizo", ruta: "firma_realizo_ruta", hash: "firma_realizo_hash", clave: "diagnostico" },
  { lado: "reviso", ruta: "firma_reviso_ruta", hash: "firma_reviso_hash", clave: "diagnostico" },
] as const satisfies readonly LadoDef[];

export type LadoDiagnostico = (typeof LADOS_DIAGNOSTICO)[number]["lado"];
