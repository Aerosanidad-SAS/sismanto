import { z } from "zod";
import { EMERGENCIAS_TIPO, PROCEDIMIENTOS } from "@/lib/captacion";

// Captación: registro de «solo procedimiento» (ambulancias externas y otros procedimientos sin paciente), migración 144.
// Un envío = un lote de líneas «procedimiento + cantidad (1–99)»; cada línea es una fila y las une `lote`.
// Todo lo de aquí es puro (sin base de datos) para poder probarlo con datos inventados.

/** Procedimientos que se pueden registrar solos: los del catálogo de captación, sin NINGUNO / NO APLICA. */
export const PROCEDIMIENTOS_EXTERNOS: readonly string[] = PROCEDIMIENTOS.filter((p) => p !== "NINGUNO" && p !== "NO APLICA");

export const CANTIDAD_MIN = 1;
export const CANTIDAD_MAX = 99;

const lineaSchema = z.object({
  procedimiento: z
    .string()
    .trim()
    .refine((p) => PROCEDIMIENTOS_EXTERNOS.includes(p), "Selecciona un procedimiento de la lista"),
  cantidad: z.coerce
    .number({ invalid_type_error: `La cantidad va de ${CANTIDAD_MIN} a ${CANTIDAD_MAX}` })
    .int(`La cantidad va de ${CANTIDAD_MIN} a ${CANTIDAD_MAX}`)
    .min(CANTIDAD_MIN, `La cantidad va de ${CANTIDAD_MIN} a ${CANTIDAD_MAX}`)
    .max(CANTIDAD_MAX, `La cantidad va de ${CANTIDAD_MIN} a ${CANTIDAD_MAX}`),
});

/**
 * Obligatorios fijos: fecha, aeropuerto y al menos una línea. No pasa por los campos obligatorios configurables de la
 * captación completa (migración 086). `lote` lo genera el formulario (llave de idempotencia ante un doble clic); si no
 * viene, el servidor lo crea.
 */
export const captacionProcedimientosSchema = z
  .object({
    lote: z.string().uuid("Lote inválido").optional(),
    // "yyyy-MM-ddTHH:mm" en hora de Colombia (el servidor lo convierte con aTimestamptzColombia)
    fecha_atencion: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha y hora inválidas"),
    aeropuerto_atencion: z.string().trim().min(1, "Selecciona el aeropuerto").max(150, "Máximo 150 caracteres"),
    emergencia_tipo: z
      .string()
      .trim()
      .refine((v) => v === "" || (EMERGENCIAS_TIPO as readonly string[]).includes(v), "Tipo de emergencia inválido")
      .optional()
      .transform((v) => (v ? v : undefined)),
    notas: z
      .string()
      .trim()
      .max(2000, "Máximo 2000 caracteres")
      .optional()
      .transform((v) => (v ? v : undefined)),
    lineas: z.array(lineaSchema).min(1, "Agrega al menos un procedimiento").max(30, "Máximo 30 líneas"),
  })
  .superRefine((d, ctx) => {
    const vistos = new Set<string>();
    d.lineas.forEach((l, i) => {
      if (vistos.has(l.procedimiento)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lineas", i, "procedimiento"],
          message: "Procedimiento repetido: suma las cantidades en una sola línea",
        });
      }
      vistos.add(l.procedimiento);
    });
  });

export type CaptacionProcedimientosInput = z.input<typeof captacionProcedimientosSchema>;
export type CaptacionProcedimientosDatos = z.output<typeof captacionProcedimientosSchema>;

/**
 * ¿El INSERT falló porque ese lote ya estaba guardado? Es la violación de unicidad (23505) del índice
 * (lote, procedimiento) de la migración 144; el esquema ya impide repetir un procedimiento dentro de un envío.
 */
export function esEnvioRepetido(error: { code?: string | null } | null | undefined): boolean {
  return error?.code === "23505";
}

/** Una fila de `captacion_procedimientos` tal como la lista la lee. */
export interface FilaProcedimientoGuardada {
  id: number;
  lote: string;
  fecha_atencion: string;
  aeropuerto_atencion: string;
  procedimiento: string;
  cantidad: number;
  emergencia_tipo: string | null;
  notas: string | null;
  nombre_registrado_por: string | null;
  created_at: string;
}

export interface LoteProcedimientos {
  lote: string;
  fecha_atencion: string;
  aeropuerto_atencion: string;
  emergencia_tipo: string | null;
  notas: string | null;
  nombre_registrado_por: string | null;
  lineas: { id: number; procedimiento: string; cantidad: number }[];
  totalCantidad: number;
}

/** Une las líneas de un mismo lote en un registro; los lotes salen en el orden en que aparece su primera línea. */
export function agruparPorLote(filas: readonly FilaProcedimientoGuardada[]): LoteProcedimientos[] {
  const grupos = new Map<string, LoteProcedimientos>();
  for (const f of filas) {
    let g = grupos.get(f.lote);
    if (!g) {
      g = {
        lote: f.lote,
        fecha_atencion: f.fecha_atencion,
        aeropuerto_atencion: f.aeropuerto_atencion,
        emergencia_tipo: f.emergencia_tipo,
        notas: f.notas,
        nombre_registrado_por: f.nombre_registrado_por,
        lineas: [],
        totalCantidad: 0,
      };
      grupos.set(f.lote, g);
    }
    g.lineas.push({ id: f.id, procedimiento: f.procedimiento, cantidad: f.cantidad });
    g.totalCantidad += f.cantidad;
  }
  return [...grupos.values()];
}
