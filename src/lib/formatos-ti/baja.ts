/**
 * Baja de Dispositivos Informáticos y Biomédicos, G-TECN-F 020
 * (SISRES: registroBaja.php, includes/bajaCamposConfig.php, includes/insertarBaja.php).
 */
import { z } from "zod";
import type { LadoDef } from "./firmas-registro";

export const TIPOS_BAJA = ["INFORMATICO", "BIOMEDICO"] as const;
export type TipoBaja = (typeof TIPOS_BAJA)[number];

export const CAUSAS_BAJA: Record<string, string> = {
  DANIO: "Daño",
  CAMBIO_TECNOLOGIA: "Cambio de tecnología",
  ROBO: "Robo",
  REPOSICION: "Reposición",
  OTROS: "Otros",
};

export const TELECOM_BAJA: Record<string, string> = {
  NINGUNO: "Ninguno",
  TABLETS: "Tablets",
  RADIO: "Radio",
  CELULAR: "Celular",
  TELEFONO_IP: "Teléfono IP",
  CAMARA: "Cámara",
};

/** "Cables y cargadores": casillas sí/no más un detalle libre (`otro_detalle`). */
export const ACCESORIOS_BAJA: Record<string, string> = {
  cable_potencia: "Cable de potencia",
  cargador: "Cargador",
  cable_usb: "Cable USB",
  transformador: "Transformador",
  regulador_voltaje: "Regulador de voltaje",
  cable_vga: "Cable VGA",
  cable_red_telefonica: "Cable de red telefónica",
};

const txt = (max: number) => z.string().trim().max(max).default("");
const req = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const fechaOpc = (msg: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, msg)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null));
const causas = Object.keys(CAUSAS_BAJA) as [string, ...string[]];
const telecoms = Object.keys(TELECOM_BAJA) as [string, ...string[]];

/**
 * Obligatorios como en SISRES por defecto: nombre del equipo, marca, serie, causa y responsable. Además, dos reglas
 * propias del formato: la causa "Otros" exige su detalle, y Fecha ingreso/N° inventario (Informático) y
 * Sede/Ubicación (Biomédico) son excluyentes según el tipo.
 */
export const bajaSchema = z
  .object({
    tipo_equipo: z.enum(TIPOS_BAJA, { errorMap: () => ({ message: "Elige el tipo de equipo" }) }),
    fecha_ingreso_reporte: fechaOpc("Fecha de ingreso/reporte inválida"),
    numero_inventario: txt(50),
    sede: txt(100),
    ubicacion_sanidad: txt(150),
    mayor_dos_anios: z.boolean().default(false),
    nombre_equipo: req(150, "Nombre del equipo requerido"),
    marca: req(100, "Marca requerida"),
    modelo: txt(100),
    serie: req(100, "Serie requerida"),
    causa_baja: z.enum(causas, { errorMap: () => ({ message: "Elige la causa de la baja" }) }),
    causa_baja_detalle: txt(255),
    concepto_tecnico_radicado: txt(150),
    proveedor_garantia: txt(150),
    denuncio: txt(150),
    costo_historico: txt(50),
    fecha_compra: fechaOpc("Fecha de compra inválida"),
    telecom_tipo: z.enum(telecoms).default("NINGUNO"),
    telecom_marca: txt(100),
    telecom_modelo: txt(100),
    telecom_imei: txt(50),
    telecom_operador: txt(60),
    accesorios: z.record(z.string(), z.union([z.boolean(), z.string().max(255)])).default({}),
    observaciones: txt(1000),
    responsable_nombre: req(150, "Nombre del responsable requerido"),
  })
  .superRefine((d, ctx) => {
    if (d.causa_baja === "OTROS" && d.causa_baja_detalle === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["causa_baja_detalle"],
        message: "El detalle de la causa es obligatorio si la causa es Otros",
      });
    }
  })
  .transform((d) => {
    const informatico = d.tipo_equipo === "INFORMATICO";
    const conTelecom = d.telecom_tipo !== "NINGUNO";
    // Solo se guardan los accesorios del catálogo (casillas) y el detalle libre.
    const accesorios: Record<string, boolean | string> = {};
    for (const k of Object.keys(ACCESORIOS_BAJA)) accesorios[k] = d.accesorios[k] === true;
    accesorios.otro_detalle = typeof d.accesorios.otro_detalle === "string" ? d.accesorios.otro_detalle.trim() : "";
    return {
      ...d,
      accesorios,
      // Los campos del otro tipo se limpian (como insertarBaja.php).
      fecha_ingreso_reporte: informatico ? d.fecha_ingreso_reporte : null,
      numero_inventario: informatico ? d.numero_inventario : "",
      sede: informatico ? "" : d.sede,
      ubicacion_sanidad: informatico ? "" : d.ubicacion_sanidad,
      // Telecomunicaciones: sin tipo no hay marca/modelo/IMEI/operador.
      telecom_marca: conTelecom ? d.telecom_marca : "",
      telecom_modelo: conTelecom ? d.telecom_modelo : "",
      telecom_imei: conTelecom ? d.telecom_imei : "",
      telecom_operador: conTelecom ? d.telecom_operador : "",
    };
  });
export type BajaEntrada = z.input<typeof bajaSchema>;
export type BajaDatos = z.output<typeof bajaSchema>;

/** Fila de `ti_baja_equipo` para la lista y el PDF. */
export interface BajaFila {
  id: number;
  numero_orden: string;
  tipo_equipo: TipoBaja;
  fecha_ingreso_reporte: string | null;
  numero_inventario: string | null;
  sede: string | null;
  ubicacion_sanidad: string | null;
  mayor_dos_anios: boolean;
  nombre_equipo: string;
  marca: string;
  modelo: string;
  serie: string;
  causa_baja: string;
  causa_baja_detalle: string;
  concepto_tecnico_radicado: string;
  proveedor_garantia: string;
  denuncio: string;
  costo_historico: string;
  fecha_compra: string | null;
  telecom_tipo: string;
  telecom_marca: string;
  telecom_modelo: string;
  telecom_imei: string;
  telecom_operador: string;
  accesorios: Record<string, boolean | string>;
  observaciones: string;
  responsable_nombre: string;
  firma_responsable_ruta: string;
  firma_responsable_hash: string;
  firmas_png: Record<string, string>;
  created_at: string;
}

/** Campos que cubre la firma del responsable (bajaCamposClave). */
export function camposClaveBaja(
  r: Pick<BajaFila, "tipo_equipo" | "nombre_equipo" | "marca" | "modelo" | "serie" | "causa_baja" | "causa_baja_detalle" | "responsable_nombre">
): Record<string, string> {
  return {
    tipo_equipo: r.tipo_equipo ?? "",
    nombre_equipo: r.nombre_equipo ?? "",
    marca: r.marca ?? "",
    modelo: r.modelo ?? "",
    serie: r.serie ?? "",
    causa_baja: r.causa_baja ?? "",
    causa_baja_detalle: r.causa_baja_detalle ?? "",
    responsable_nombre: r.responsable_nombre ?? "",
  };
}

/** Una sola firma: la del responsable. */
export const LADOS_BAJA = [
  { lado: "responsable", ruta: "firma_responsable_ruta", hash: "firma_responsable_hash", clave: "baja" },
] as const satisfies readonly LadoDef[];

export type LadoBaja = (typeof LADOS_BAJA)[number]["lado"];
