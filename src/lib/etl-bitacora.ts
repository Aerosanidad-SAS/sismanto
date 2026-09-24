/**
 * ETL de la bitácora de SISRES (`log_sistema`) → `audit_log` (lógica pura, sin red ni base de datos).
 *
 * - La hora de SISRES es hora de Colombia SIN zona: se convierte con America/Bogota al insertar (ver el script). Interpretada
 *   como UTC quedaría corrida 5 horas.
 * - Cada fila conserva su id de origen (`origen_id`) → importar dos veces no duplica (índice único de la migración 081).
 * - LOGIN/LOGOUT van a la entidad «login» (como registra SISMANTO) y los tickets a «tickets».
 * - Una fila que no se puede importar (acción desconocida, fecha imposible) se RECHAZA con motivo; nunca se inventa un valor.
 */
import { ACCIONES_AUDITORIA, sanearTexto } from "./auditoria-lista";
/**
 * Cargo de SISRES → rol de SISMANTO, solo para etiquetar la historia. Copia de `scripts/cargo-sisres-a-rol.ts` (PR 44):
 * unificar cuando esté en dev. Un cargo desconocido (p. ej. 0) queda sin rol, nunca con uno por defecto.
 */
const ROL_POR_CARGO: Record<string, string> = {
  "1": "ADMIN", "2": "COORDINACION", "3": "ANALISTA", "4": "REGULACION", "5": "MEDICO", "6": "AUXILIAR_ENFERMERIA",
  "7": "OVEM", "8": "VISTA", "9": "TECNICO", "10": "AEROPUERTO", "11": "AEROPUERTO", "12": "AEROPUERTO",
};
const rolParaCargoSisres = (cargo: string | undefined): string | null => ROL_POR_CARGO[(cargo ?? "").trim()] ?? null;

export type FilaLog = Record<string, string>;

export interface EntradaImportada {
  origenId: number;
  /** "YYYY-MM-DD HH:MM:SS" hora de Colombia, sin zona. */
  fechaLocal: string;
  cedula: string;
  label: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  ip: string;
}

export interface PlanBitacora {
  cargar: EntradaImportada[];
  rechazadas: { motivo: string; fila: FilaLog }[];
}

const ENTIDAD_POR_TABLA: Record<string, string> = { tickets_tecnologia: "tickets" };

/** Fecha real (rechaza 0000-00-00 y 2026-02-31). */
export function fechaLocalValida(s: string): boolean {
  const m = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/);
  if (!m) return false;
  const [a, mes, d, h, mi, se] = m.slice(1).map(Number);
  if (a < 2000 || h > 23 || mi > 59 || se > 59) return false;
  const f = new Date(Date.UTC(a, mes - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === mes - 1 && f.getUTCDate() === d;
}

export function planificarBitacora(filas: FilaLog[]): PlanBitacora {
  const cargar: EntradaImportada[] = [];
  const rechazadas: PlanBitacora["rechazadas"] = [];
  const vistos = new Set<number>();
  const rechazar = (fila: FilaLog, motivo: string) => rechazadas.push({ motivo, fila });

  for (const f of filas) {
    const id = (f.id ?? "").trim();
    if (!/^[0-9]+$/.test(id)) {
      rechazar(f, "Sin id de SISRES válido");
      continue;
    }
    const origenId = Number(id);
    if (vistos.has(origenId)) {
      rechazar(f, `Id repetido en el archivo (${id})`);
      continue;
    }
    const accion = (f.accion ?? "").trim().toUpperCase();
    if (!(ACCIONES_AUDITORIA as readonly string[]).includes(accion)) {
      rechazar(f, `Acción desconocida: ${f.accion ?? ""}`);
      continue;
    }
    const fecha = (f.fecha_hora ?? "").trim();
    if (!fechaLocalValida(fecha)) {
      rechazar(f, `Fecha inválida: ${fecha}`);
      continue;
    }
    vistos.add(origenId);

    const cedula = (f.usuario ?? "").trim();
    const nombre = (f.nombre ?? "").replace(/ +/g, " ").trim();
    const tabla = (f.tabla ?? "").trim();
    const esSesion = accion === "LOGIN" || accion === "LOGOUT";
    cargar.push({
      origenId,
      fechaLocal: fecha,
      cedula,
      label: sanearTexto(nombre || cedula || "desconocido", 150),
      role: rolParaCargoSisres(f.cargo) ?? "",
      action: accion,
      entity: sanearTexto(esSesion ? "login" : (ENTIDAD_POR_TABLA[tabla] ?? (tabla || "sisres")), 50),
      entityId: sanearTexto(f.registro_id, 100),
      detail: sanearTexto(f.detalle),
      ip: sanearTexto(f.ip, 45),
    });
  }
  return { cargar, rechazadas };
}
