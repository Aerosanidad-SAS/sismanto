/**
 * Acta de Entrega de Equipos (SISRES: registroActaEntrega.php, includes/actaEntregaCamposConfig.php).
 * Fusiona los formatos G-TECN-F 028 (Celular) y F 031 (General) con un selector de tipo.
 */
import { z } from "zod";
import { OPCIONES_CHEQUEO } from "./comun";

export const TIPOS_ACTA_ENTREGA = ["CELULAR", "GENERAL"] as const;
export type TipoActaEntrega = (typeof TIPOS_ACTA_ENTREGA)[number];

/** Pruebas de funcionalidad: catálogo distinto según el tipo, como en los PDF originales. */
export const CHECKLIST_ACTA_ENTREGA: Record<TipoActaEntrega, Record<string, string>> = {
  CELULAR: {
    prueba_on_off: "Prueba ON/OFF",
    sonido: "Sonido",
    sistema_operativo: "Sistema Operativo",
    conectividad_wifi: "Conectividad / WiFi",
    aplicaciones: "Aplicaciones",
    teclado: "Teclado",
    pantalla_tactil: "Pantalla Táctil",
    llamadas: "Llamadas",
    cargador: "Cargador",
    mensajes_sms: "Mensajes SMS",
  },
  GENERAL: {
    prueba_on_off: "Prueba ON/OFF",
    sonido: "Sonido",
    sistema_operativo: "Sistema Operativo",
    conectividad_wifi: "Conectividad / WiFi",
    aplicaciones: "Aplicaciones",
    teclado: "Teclado",
    pantalla: "Pantalla",
    placa_equipo: "Placa del Equipo",
    cargador: "Cargador",
    estado_fisico_equipo: "Estado Físico del Equipo",
  },
};

/** Campos que solo existen en un acta de CELULAR. */
export const CAMPOS_SOLO_CELULAR = ["equipo_imei", "equipo_sim", "equipo_activo", "equipo_tarjeta_sd", "equipo_operador"] as const;

const txt = (max: number) => z.string().trim().max(max).default("");
const req = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const fechaOpc = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

/** Campos obligatorios: los mismos que SISRES marca por defecto (func_nombre, func_cedula, equipo_placa, entrega_nombre, recibe_nombre). */
export const actaEntregaSchema = z
  .object({
    tipo_equipo: z.enum(TIPOS_ACTA_ENTREGA, { errorMap: () => ({ message: "Elige el tipo de equipo" }) }),
    func_nombre: req(150, "Nombre del funcionario requerido"),
    func_cedula: req(30, "Cédula del funcionario requerida"),
    func_cargo: txt(100),
    func_sede: txt(100),
    func_correo: z
      .string()
      .trim()
      .max(150)
      .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Correo inválido")
      .default(""),
    equipo_referencia: txt(100),
    equipo_marca: txt(100),
    equipo_modelo: txt(100),
    equipo_placa: req(40, "Placa del equipo requerida"),
    equipo_imei: txt(40),
    equipo_sim: txt(40),
    equipo_activo: txt(40),
    equipo_tarjeta_sd: txt(40),
    equipo_operador: txt(60),
    checklist: z.record(z.string(), z.enum(OPCIONES_CHEQUEO)).default({}),
    lugar_entrega: txt(150),
    entrega_nombre: req(150, "Nombre de quien entrega requerido"),
    recibe_nombre: req(150, "Nombre de quien recibe requerido"),
    observaciones: txt(500),
    // Devolución: solo CELULAR, se completa editando el acta.
    fecha_devolucion: fechaOpc,
    lugar_devolucion: z.string().trim().max(150).optional().or(z.literal("")),
    devolucion_entrega_nombre: z.string().trim().max(150).optional().or(z.literal("")),
    devolucion_recibe_nombre: z.string().trim().max(150).optional().or(z.literal("")),
  })
  .transform((d) => {
    const celular = d.tipo_equipo === "CELULAR";
    // Solo se guardan las pruebas del catálogo del tipo elegido (un cliente no puede colar claves ajenas).
    const catalogo = CHECKLIST_ACTA_ENTREGA[d.tipo_equipo];
    const checklist = Object.fromEntries(Object.entries(d.checklist).filter(([k]) => k in catalogo));
    return {
      ...d,
      checklist,
      // Lo exclusivo de Celular se limpia si el tipo es General (como insertarActaEntrega.php).
      equipo_imei: celular ? d.equipo_imei : "",
      equipo_sim: celular ? d.equipo_sim : "",
      equipo_activo: celular ? d.equipo_activo : "",
      equipo_tarjeta_sd: celular ? d.equipo_tarjeta_sd : "",
      equipo_operador: celular ? d.equipo_operador : "",
      fecha_devolucion: celular ? d.fecha_devolucion : null,
      lugar_devolucion: celular ? d.lugar_devolucion || null : null,
      devolucion_entrega_nombre: celular ? d.devolucion_entrega_nombre || null : null,
      devolucion_recibe_nombre: celular ? d.devolucion_recibe_nombre || null : null,
    };
  });
export type ActaEntregaEntrada = z.input<typeof actaEntregaSchema>;
export type ActaEntregaDatos = z.output<typeof actaEntregaSchema>;

/** Fila de `ti_acta_entrega` tal como la usan la lista y el PDF. */
export interface ActaEntregaFila {
  id: number;
  numero_orden: string;
  tipo_equipo: TipoActaEntrega;
  func_nombre: string;
  func_cedula: string;
  func_cargo: string;
  func_sede: string;
  func_correo: string;
  equipo_referencia: string;
  equipo_marca: string;
  equipo_modelo: string;
  equipo_placa: string;
  equipo_imei: string;
  equipo_sim: string;
  equipo_activo: string;
  equipo_tarjeta_sd: string;
  equipo_operador: string;
  checklist: Record<string, string>;
  fecha_entrega: string;
  lugar_entrega: string;
  entrega_nombre: string;
  firma_entrega_ruta: string;
  firma_entrega_hash: string;
  recibe_nombre: string;
  firma_recibe_ruta: string;
  firma_recibe_hash: string;
  fecha_devolucion: string | null;
  lugar_devolucion: string | null;
  devolucion_entrega_nombre: string | null;
  firma_devolucion_entrega_ruta: string | null;
  firma_devolucion_entrega_hash: string | null;
  devolucion_recibe_nombre: string | null;
  firma_devolucion_recibe_ruta: string | null;
  firma_devolucion_recibe_hash: string | null;
  observaciones: string;
  firmas_png: Record<string, string>;
  created_at: string;
}

type ClaveEntrega = Pick<
  ActaEntregaFila,
  | "tipo_equipo" | "func_nombre" | "func_cedula" | "func_cargo" | "func_sede"
  | "equipo_referencia" | "equipo_marca" | "equipo_modelo" | "equipo_placa"
  | "fecha_entrega" | "lugar_entrega" | "entrega_nombre" | "recibe_nombre"
>;

/**
 * Campos que cubren las firmas de entrega/recibe (actaEntregaCamposClaveEntrega). Si cualquiera cambia
 * después de firmar, la firma se muestra "Modificada".
 */
export function camposClaveEntrega(r: ClaveEntrega): Record<string, string> {
  return {
    tipo_equipo: r.tipo_equipo ?? "",
    func_nombre: r.func_nombre ?? "",
    func_cedula: r.func_cedula ?? "",
    func_cargo: r.func_cargo ?? "",
    func_sede: r.func_sede ?? "",
    equipo_referencia: r.equipo_referencia ?? "",
    equipo_marca: r.equipo_marca ?? "",
    equipo_modelo: r.equipo_modelo ?? "",
    equipo_placa: r.equipo_placa ?? "",
    fecha_entrega: r.fecha_entrega ?? "",
    lugar_entrega: r.lugar_entrega ?? "",
    entrega_nombre: r.entrega_nombre ?? "",
    recibe_nombre: r.recibe_nombre ?? "",
  };
}

/** Campos que cubren las firmas de devolución (actaEntregaCamposClaveDevolucion). */
export function camposClaveDevolucion(
  r: Pick<ActaEntregaFila, "fecha_devolucion" | "lugar_devolucion" | "devolucion_entrega_nombre" | "devolucion_recibe_nombre">
): Record<string, string> {
  return {
    fecha_devolucion: r.fecha_devolucion ?? "",
    lugar_devolucion: r.lugar_devolucion ?? "",
    devolucion_entrega_nombre: r.devolucion_entrega_nombre ?? "",
    devolucion_recibe_nombre: r.devolucion_recibe_nombre ?? "",
  };
}

/** Los cuatro lados de firma de un acta: clave, columnas y campos que cubre cada uno. */
export const LADOS_ACTA_ENTREGA = [
  { lado: "entrega", ruta: "firma_entrega_ruta", hash: "firma_entrega_hash", clave: "entrega" },
  { lado: "recibe", ruta: "firma_recibe_ruta", hash: "firma_recibe_hash", clave: "entrega" },
  { lado: "devolucion_entrega", ruta: "firma_devolucion_entrega_ruta", hash: "firma_devolucion_entrega_hash", clave: "devolucion" },
  { lado: "devolucion_recibe", ruta: "firma_devolucion_recibe_ruta", hash: "firma_devolucion_recibe_hash", clave: "devolucion" },
] as const;

export type LadoActaEntrega = (typeof LADOS_ACTA_ENTREGA)[number]["lado"];

/** Etiqueta legible de cada lado (para el listado y el PDF). */
export const ETIQUETA_LADO_ACTA: Record<LadoActaEntrega, string> = {
  entrega: "Entrega",
  recibe: "Recibe",
  devolucion_entrega: "Devolución · entrega",
  devolucion_recibe: "Devolución · recibe",
};
