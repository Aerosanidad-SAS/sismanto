import { z } from "zod";

import { esDia, sumarDias, sumarMeses, type Dia } from "@/lib/fechas";

export const TIPOS_COSTO_ANUAL = ["SOAT", "POLIZA", "RTM"] as const;
export type TipoCostoAnual = (typeof TIPOS_COSTO_ANUAL)[number];

export const ETIQUETA_TIPO_COSTO: Record<TipoCostoAnual, string> = {
  SOAT: "SOAT",
  POLIZA: "Póliza",
  RTM: "Revisión técnico-mecánica",
};

/** Roles que registran y corrigen costos anuales (los mismos de las políticas RLS de `vehicle_annual_costs`). */
export const ROLES_EDITAN_COSTOS_ANUALES = ["ADMIN", "ANALISTA", "MANTENIMIENTO"] as const;

export interface CostoAnualFila {
  id: number;
  tipo: TipoCostoAnual;
  vigencia_desde: string;
  vigencia_hasta: string;
  valor: number;
  fecha_pago: string | null;
  proveedor: string | null;
  numero_documento: string | null;
  estimado: boolean;
  notas: string | null;
}

const dia = z.string().refine(esDia, "Fecha inválida");
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((s) => (s ? s : undefined));

export const costoAnualSchema = z
  .object({
    tipo: z.enum(TIPOS_COSTO_ANUAL),
    vigenciaDesde: dia,
    vigenciaHasta: dia,
    valor: z.number({ invalid_type_error: "El valor debe ser un número" }).min(0, "El valor no puede ser negativo").max(1e10, "Valor demasiado alto"),
    fechaPago: dia.optional().or(z.literal("").transform(() => undefined)),
    proveedor: textoOpcional(150),
    numeroDocumento: textoOpcional(80),
    notas: textoOpcional(500),
  })
  .refine((v) => v.vigenciaHasta >= v.vigenciaDesde, { message: "El fin de la vigencia no puede ser anterior al inicio", path: ["vigenciaHasta"] });

export type CostoAnualInput = z.input<typeof costoAnualSchema>;

/** Vigencia anual típica: 12 meses desde `desde` (1 mar 2026 → 28 feb 2027). */
export function finDeVigenciaAnual(desde: Dia): Dia {
  return sumarDias(sumarMeses(desde, 12), -1);
}
