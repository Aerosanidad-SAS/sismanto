/**
 * Lógica pura del aviso proactivo de vencimientos de equipos biomédicos
 * (docs/PARIDAD_SISTEMA.md §2.3, equivalente a includes/alertasInventarioNotificacion.php
 * de SISRES para el área BIOMEDICA). Reusa los hitos de `expiry-digest.ts`
 * (30/15/7/3/1 días, una vez cada uno; diario mientras esté vencido) — los
 * 4 campos de equipos biomédicos son fechas puntuales, igual que los
 * documentos de vehículo, así que el mismo bucket aplica sin cambios.
 *
 * Sin acceso a base de datos — así se puede probar sin Supabase ni cron.
 */

import { bucketDocumento, claveDocumento } from "./expiry-digest";

export type ItemTypeBiomedico = "MANTENIMIENTO" | "CALIBRACION" | "PARCHE_ADULTO" | "PARCHE_PEDIATRICO";

const ETIQUETA_ITEM: Record<ItemTypeBiomedico, string> = {
  MANTENIMIENTO: "Mantenimiento",
  CALIBRACION: "Calibración",
  PARCHE_ADULTO: "Parche (adulto)",
  PARCHE_PEDIATRICO: "Parche (pediátrico)",
};

export interface EquipoVencimientos {
  id: number;
  placa_equipo: string;
  equipo: string;
  proximo_mantenimiento: string | null;
  proxima_calibracion: string | null;
  // Migración 065 (PR #15) — puede no existir todavía si esa migración no se ha aplicado.
  vencimiento_parche_adulto: string | null;
  vencimiento_parche_pediatrico: string | null;
}

export interface AlertaBiomedica {
  equipmentId: number;
  placa: string;
  equipo: string;
  itemType: ItemTypeBiomedico;
  milestone: string;
  fechaVencimiento: string;
  diasRestantes: number;
}

/** Días calendario entre hoy y la fecha (negativo si ya pasó). */
function diasHasta(fecha: string, hoyIso: string): number {
  return Math.round((Date.parse(fecha.slice(0, 10)) - Date.parse(hoyIso)) / 86_400_000);
}

/** Recorre los 4 campos de vencimiento de un equipo y devuelve los que están en algún hito hoy. */
export function alertasEquipoBiomedico(e: EquipoVencimientos, hoyIso: string): AlertaBiomedica[] {
  const campos: [ItemTypeBiomedico, string | null][] = [
    ["MANTENIMIENTO", e.proximo_mantenimiento],
    ["CALIBRACION", e.proxima_calibracion],
    ["PARCHE_ADULTO", e.vencimiento_parche_adulto],
    ["PARCHE_PEDIATRICO", e.vencimiento_parche_pediatrico],
  ];
  const alertas: AlertaBiomedica[] = [];
  for (const [itemType, fecha] of campos) {
    if (!fecha) continue;
    const diasRestantes = diasHasta(fecha, hoyIso);
    const bucket = bucketDocumento(diasRestantes);
    if (!bucket) continue;
    alertas.push({
      equipmentId: e.id,
      placa: e.placa_equipo,
      equipo: e.equipo,
      itemType,
      milestone: claveDocumento(bucket, fecha.slice(0, 10), hoyIso),
      fechaVencimiento: fecha.slice(0, 10),
      diasRestantes,
    });
  }
  return alertas;
}

// ── Correo ───────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function filaAlerta(a: AlertaBiomedica): string {
  const texto = a.diasRestantes <= 0 ? `vencido hace ${Math.abs(a.diasRestantes)} d` : `vence en ${a.diasRestantes} d`;
  const color = a.diasRestantes <= 0 ? "#B91C1C" : a.diasRestantes <= 7 ? "#B45309" : "#1D4ED8";
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(a.placa)}</strong></td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(a.equipo)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(ETIQUETA_ITEM[a.itemType])}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.fechaVencimiento}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:${color};font-weight:600">${texto}</td>
  </tr>`;
}

/** Cuerpo HTML del correo con todas las alertas del día (un solo correo, sin recorte por rol/centro). */
export function armarCorreoVencimientosBiomedico(alertas: AlertaBiomedica[]): string {
  return `<div style="font-family:sans-serif;color:#111827">
    <p>Equipos biomédicos con mantenimiento, calibración o parche próximos a vencer o ya vencidos.</p>
    <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <thead><tr style="text-align:left;color:#6b7280">
        <th style="padding:6px 10px">Placa</th><th style="padding:6px 10px">Equipo</th>
        <th style="padding:6px 10px">Ítem</th><th style="padding:6px 10px">Vence</th><th style="padding:6px 10px">Estado</th>
      </tr></thead>
      <tbody>${alertas.map(filaAlerta).join("")}</tbody>
    </table>
    <p style="margin-top:20px;font-size:12px;color:#6b7280">
      Aviso automático de Aeromanto. Este equipo/ítem no vuelve a avisar por el mismo motivo
      hasta que cambie de hito (o todos los días mientras esté vencido).
    </p>
  </div>`;
}

export function asuntoCorreoVencimientosBiomedico(alertas: AlertaBiomedica[]): string {
  const vencidos = alertas.filter((a) => a.diasRestantes <= 0).length;
  if (vencidos > 0) return `⚠️ Aeromanto: ${vencidos} vencimiento${vencidos === 1 ? "" : "s"} biomédico${vencidos === 1 ? "" : "s"} urgente${vencidos === 1 ? "" : "s"}`;
  return `Aeromanto: ${alertas.length} vencimiento${alertas.length === 1 ? "" : "s"} biomédico${alertas.length === 1 ? "" : "s"} próximo${alertas.length === 1 ? "" : "s"}`;
}
