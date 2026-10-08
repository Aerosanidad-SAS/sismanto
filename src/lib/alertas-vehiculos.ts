// Campana de alertas de documentos de los vehículos (SOAT, técnico-mecánica y pase aeroportuario), con semáforo.
// Es el «🔔 Alertas» de SISRES (includes/alertasVehiculos.php): vehículos con algún documento que vence dentro de un año
// o ya vencido; verde más de 30 días, amarillo de 16 a 30, rojo 15 o menos o vencido. Puro, para probarlo.

import { diasEntre, esDia, type Dia } from "@/lib/fechas";
import { documentosVehiculo, type DocumentoVehiculo, type VehiculoConDocumentos } from "@/lib/vencimientos";

/** Un documento solo entra en la campana si vence dentro de este plazo (o ya venció). Igual que SISRES. */
export const VENTANA_ALERTA_DIAS = 365;

export type NivelAlerta = "ROJO" | "AMARILLO" | "VERDE";

const ORDEN: Record<NivelAlerta, number> = { ROJO: 0, AMARILLO: 1, VERDE: 2 };

export function nivelAlerta(dias: number): NivelAlerta {
  if (dias <= 15) return "ROJO"; // incluye vencidos
  if (dias <= 30) return "AMARILLO";
  return "VERDE";
}

export interface AlertaDocumento {
  documento: DocumentoVehiculo;
  dias: number;
  nivel: NivelAlerta;
}

export interface AlertaVehiculo {
  placa: string;
  /** El peor nivel entre sus documentos. */
  nivel: NivelAlerta;
  docs: AlertaDocumento[];
}

/**
 * Vehículos con algún documento dentro de la ventana, los más urgentes primero (rojos, luego amarillos, luego verdes;
 * dentro de cada nivel, el que vence antes, y por último la placa). Los documentos sin fecha o con fecha inválida se
 * ignoran. SISRES los listaba por placa; aquí lo urgente va arriba porque la lista es larga.
 */
export function alertasDocumentosVehiculos(
  vehiculos: (VehiculoConDocumentos & { placa: string })[],
  hoy: Dia
): AlertaVehiculo[] {
  const alertas: AlertaVehiculo[] = [];
  for (const v of vehiculos) {
    const docs: AlertaDocumento[] = [];
    for (const [documento, fecha] of documentosVehiculo(v)) {
      const dia = (fecha ?? "").slice(0, 10);
      if (!esDia(dia)) continue;
      const dias = diasEntre(hoy, dia);
      if (dias <= VENTANA_ALERTA_DIAS) docs.push({ documento, dias, nivel: nivelAlerta(dias) });
    }
    if (docs.length === 0) continue;
    docs.sort((a, b) => a.dias - b.dias);
    alertas.push({ placa: v.placa, nivel: docs[0].nivel, docs });
  }
  return alertas.sort(
    (a, b) => ORDEN[a.nivel] - ORDEN[b.nivel] || a.docs[0].dias - b.docs[0].dias || a.placa.localeCompare(b.placa)
  );
}

/** Los que piden atención (amarillo o rojo): es el número de la campana. Los verdes se ven al abrirla, pero no cuentan. */
export function contarQuePidenAtencion(alertas: AlertaVehiculo[]): number {
  return alertas.filter((a) => a.nivel !== "VERDE").length;
}
