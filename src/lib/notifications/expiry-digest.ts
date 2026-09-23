/**
 * Lógica pura del aviso proactivo de vencimientos (F-15 del PRD):
 * a qué hito corresponde un vencimiento hoy, y cómo armar el correo.
 * Sin acceso a base de datos — así se puede probar sin Supabase ni cron.
 */

export type ItemType = "SOAT" | "TECNICOMECANICA" | "PASE_AEROPORTUARIO" | "MANTENIMIENTO";

const ETIQUETA_DOCUMENTO: Record<Extract<ItemType, "SOAT" | "TECNICOMECANICA" | "PASE_AEROPORTUARIO">, string> = {
  SOAT: "SOAT",
  TECNICOMECANICA: "Técnico-mecánica",
  PASE_AEROPORTUARIO: "Pase aeroportuario",
};

/**
 * Hito de un documento según los días que faltan (o que ya pasaron).
 * Los umbrales 30/15/7/3/1 son de una sola vez cada uno (el `milestone` que
 * arma `claveDocumento` incluye la fecha de vencimiento); vencido avisa todos
 * los días hasta que se renueve.
 */
export function bucketDocumento(diasRestantes: number): "30" | "15" | "7" | "3" | "1" | "VENCIDO" | null {
  if (diasRestantes <= 0) return "VENCIDO";
  if (diasRestantes <= 1) return "1";
  if (diasRestantes <= 3) return "3";
  if (diasRestantes <= 7) return "7";
  if (diasRestantes <= 15) return "15";
  if (diasRestantes <= 30) return "30";
  return null;
}

/** Milestone de un documento: hito + fecha de vencimiento (o de hoy, si es diario). */
export function claveDocumento(bucket: NonNullable<ReturnType<typeof bucketDocumento>>, fechaVencimiento: string, hoyIso: string): string {
  return bucket === "VENCIDO" ? `VENCIDO:${hoyIso}` : `${bucket}:${fechaVencimiento}`;
}

/**
 * Hito de un ítem del plan de mantenimiento: NARANJA es de una sola vez por
 * ciclo (el `milestone` incluye el último mantenimiento realizado, así que un
 * ciclo nuevo puede volver a avisar); ROJA avisa todos los días.
 */
export function bucketMantenimiento(nivelAlerta: string | null): "NARANJA" | "ROJA" | null {
  if (nivelAlerta === "ROJA") return "ROJA";
  if (nivelAlerta === "NARANJA") return "NARANJA";
  return null;
}

export function claveMantenimiento(bucket: "NARANJA" | "ROJA", cicloKey: string, hoyIso: string): string {
  return bucket === "ROJA" ? `ROJA:${hoyIso}` : `NARANJA:${cicloKey}`;
}

export interface AlertaDocumento {
  vehicleId: string;
  placa: string;
  itemType: Extract<ItemType, "SOAT" | "TECNICOMECANICA" | "PASE_AEROPORTUARIO">;
  itemKey: "DOC";
  milestone: string;
  fechaVencimiento: string;
  diasRestantes: number;
}

export interface AlertaMantenimiento {
  vehicleId: string;
  placa: string;
  itemType: "MANTENIMIENTO";
  itemKey: string;
  milestone: string;
  descripcion: string;
  categoria: string | null;
  kmRestantes: number | null;
  diasRestantes: number | null;
  nivelAlerta: "NARANJA" | "ROJA";
}

export type Alerta = AlertaDocumento | AlertaMantenimiento;

export interface VehiculoVencimientos {
  id: string;
  placa: string;
  vencimiento_soat: string | null;
  vencimiento_tecnicomecanica: string | null;
  vencimiento_rtm: string | null;
  fecha_pase_aeroportuario: string | null;
}

/** Días calendario entre hoy y la fecha (negativo si ya pasó). */
function diasHasta(fecha: string, hoyIso: string): number {
  return Math.round((Date.parse(fecha.slice(0, 10)) - Date.parse(hoyIso)) / 86_400_000);
}

/** Recorre los 3 documentos de un vehículo y devuelve los que están en algún hito hoy. */
export function alertasDocumentosVehiculo(v: VehiculoVencimientos, hoyIso: string): AlertaDocumento[] {
  const documentos: [AlertaDocumento["itemType"], string | null][] = [
    ["SOAT", v.vencimiento_soat],
    ["TECNICOMECANICA", v.vencimiento_tecnicomecanica || v.vencimiento_rtm],
    ["PASE_AEROPORTUARIO", v.fecha_pase_aeroportuario],
  ];
  const alertas: AlertaDocumento[] = [];
  for (const [itemType, fecha] of documentos) {
    if (!fecha) continue;
    const diasRestantes = diasHasta(fecha, hoyIso);
    const bucket = bucketDocumento(diasRestantes);
    if (!bucket) continue;
    alertas.push({
      vehicleId: v.id,
      placa: v.placa,
      itemType,
      itemKey: "DOC",
      milestone: claveDocumento(bucket, fecha.slice(0, 10), hoyIso),
      fechaVencimiento: fecha.slice(0, 10),
      diasRestantes,
    });
  }
  return alertas;
}

export interface FilaMantenimiento {
  vehicle_id: string;
  placa: string;
  plan_item_id: number;
  descripcion: string;
  categoria: string | null;
  km_restantes: number | null;
  dias_restantes: number | null;
  km_ultimo: number | null;
  ultimo_mantenimiento: string | null;
  nivel_alerta: string | null;
}

export function alertaMantenimientoFila(fila: FilaMantenimiento, hoyIso: string): AlertaMantenimiento | null {
  const bucket = bucketMantenimiento(fila.nivel_alerta);
  if (!bucket) return null;
  const cicloKey = fila.km_ultimo != null ? `km${fila.km_ultimo}` : fila.ultimo_mantenimiento ?? "sin-historial";
  return {
    vehicleId: fila.vehicle_id,
    placa: fila.placa,
    itemType: "MANTENIMIENTO",
    itemKey: String(fila.plan_item_id),
    milestone: claveMantenimiento(bucket, cicloKey, hoyIso),
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    kmRestantes: fila.km_restantes,
    diasRestantes: fila.dias_restantes,
    nivelAlerta: bucket,
  };
}

// ── Correo ───────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function filaDocumento(a: AlertaDocumento): string {
  const texto = a.diasRestantes <= 0 ? `vencido hace ${Math.abs(a.diasRestantes)} d` : `vence en ${a.diasRestantes} d`;
  const color = a.diasRestantes <= 0 ? "#B91C1C" : a.diasRestantes <= 7 ? "#B45309" : "#1D4ED8";
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(a.placa)}</strong></td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(ETIQUETA_DOCUMENTO[a.itemType])}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.fechaVencimiento}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:${color};font-weight:600">${texto}</td>
  </tr>`;
}

function filaMantenimiento(a: AlertaMantenimiento): string {
  const restante =
    a.kmRestantes != null ? `${a.kmRestantes} km` : a.diasRestantes != null ? `${a.diasRestantes} d` : "—";
  const color = a.nivelAlerta === "ROJA" ? "#B91C1C" : "#B45309";
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(a.placa)}</strong></td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(a.descripcion)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(a.categoria ?? "—")}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:${color};font-weight:600">${restante} restantes</td>
  </tr>`;
}

/** Cuerpo HTML del correo con las alertas que le corresponden a este destinatario. */
export function armarCorreoVencimientos(alertas: Alerta[], alcance: string): string {
  const documentos = alertas.filter((a): a is AlertaDocumento => a.itemType !== "MANTENIMIENTO");
  const mantenimiento = alertas.filter((a): a is AlertaMantenimiento => a.itemType === "MANTENIMIENTO");

  const seccionDocumentos = documentos.length
    ? `<h3 style="margin:20px 0 8px;font-family:sans-serif;color:#111827">Documentos del vehículo</h3>
       <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px">
         <thead><tr style="text-align:left;color:#6b7280">
           <th style="padding:6px 10px">Placa</th><th style="padding:6px 10px">Documento</th>
           <th style="padding:6px 10px">Vence</th><th style="padding:6px 10px">Estado</th>
         </tr></thead>
         <tbody>${documentos.map(filaDocumento).join("")}</tbody>
       </table>`
    : "";

  const seccionMantenimiento = mantenimiento.length
    ? `<h3 style="margin:20px 0 8px;font-family:sans-serif;color:#111827">Plan de mantenimiento</h3>
       <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px">
         <thead><tr style="text-align:left;color:#6b7280">
           <th style="padding:6px 10px">Placa</th><th style="padding:6px 10px">Ítem</th>
           <th style="padding:6px 10px">Categoría</th><th style="padding:6px 10px">Estado</th>
         </tr></thead>
         <tbody>${mantenimiento.map(filaMantenimiento).join("")}</tbody>
       </table>`
    : "";

  return `<div style="font-family:sans-serif;color:#111827">
    <p>Vencimientos y mantenimiento pendiente${escapeHtml(alcance)}.</p>
    ${seccionDocumentos}
    ${seccionMantenimiento}
    <p style="margin-top:20px;font-size:12px;color:#6b7280">
      Aviso automático de Aeromanto. Este vehículo/ítem no vuelve a avisar por el mismo motivo
      hasta que cambie de fase (o todos los días mientras esté vencido/ROJA).
    </p>
  </div>`;
}

export function asuntoCorreoVencimientos(alertas: Alerta[]): string {
  const vencidos = alertas.filter((a) => (a.itemType !== "MANTENIMIENTO" ? a.diasRestantes <= 0 : a.nivelAlerta === "ROJA")).length;
  if (vencidos > 0) return `⚠️ Aeromanto: ${vencidos} vencimiento${vencidos === 1 ? "" : "s"} urgente${vencidos === 1 ? "" : "s"}`;
  return `Aeromanto: ${alertas.length} vencimiento${alertas.length === 1 ? "" : "s"} próximo${alertas.length === 1 ? "" : "s"}`;
}
