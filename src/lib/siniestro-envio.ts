/**
 * Lógica pura del envío del siniestro vial desde el celular: fecha, borrador local y aviso final. Vive aparte del
 * formulario para probarla sin navegador. Un siniestro ocurre en la vía, donde la señal falla: lo escrito no se pierde.
 */

/** `datetime-local` → ISO con zona. null si está vacío o es inválido (`new Date("").toISOString()` lanza RangeError). */
export function fechaHoraAIso(valor: string): string | null {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ─── Borrador (localStorage por conductor y vehículo) ─── */

const PREFIJO = "sismanto_ovem_siniestro_";
/** Un siniestro se puede reportar días después; pasada una semana el borrador ya no es de este caso. */
export const VIGENCIA_BORRADOR_MS = 7 * 24 * 60 * 60 * 1000;

/** Campos de texto y Sí/No del formulario. Las fotos no se guardan: un `File` no cabe en localStorage. */
export const CAMPOS_BORRADOR = {
  fechaHora: "string",
  lugar: "string",
  descripcion: "string",
  pacienteABordo: "boolean",
  hayLesionados: "boolean",
  lesionadosDetalle: "string",
  hayTerceros: "boolean",
  terceroPlaca: "string",
  terceroNombre: "string",
  terceroCedula: "string",
  terceroTelefono: "string",
  terceroAseguradora: "string",
  sinTerceroMotivo: "string",
  abogadoNombre: "string",
  abogadoTelefono: "string",
  abogadoCedula: "string",
  abogadoCorreo: "string",
  sinAbogado: "boolean",
  sinAbogadoMotivo: "string",
  sinDocumentos: "boolean",
  sinDocumentosMotivo: "string",
  intervinoAutoridad: "boolean",
  numeroIpat: "string",
  vehiculoOperativo: "boolean",
} as const;

export type CampoBorrador = keyof typeof CAMPOS_BORRADOR;
export type BorradorSiniestro = { [K in CampoBorrador]: (typeof CAMPOS_BORRADOR)[K] extends "boolean" ? boolean : string };

/** Un borrador es de UNA persona y un vehículo: en un teléfono compartido no se mezclan conductores. */
export function claveBorradorSiniestro(userId: string, vehicleId: string): string {
  return `${PREFIJO}${userId}_${vehicleId}`;
}

export function serializarBorradorSiniestro(b: BorradorSiniestro, ahora: number): string {
  return JSON.stringify({ guardadoAt: ahora, campos: b });
}

/** Devuelve solo los campos válidos del borrador; null si está dañado, vacío de forma o vencido. */
export function leerBorradorSiniestro(raw: string | null, ahora: number): Partial<BorradorSiniestro> | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { guardadoAt?: unknown; campos?: Record<string, unknown> } | null;
    if (!o || typeof o.guardadoAt !== "number" || !o.campos || typeof o.campos !== "object") return null;
    if (ahora - o.guardadoAt > VIGENCIA_BORRADOR_MS) return null;
    const out: Record<string, string | boolean> = {};
    for (const [k, tipo] of Object.entries(CAMPOS_BORRADOR)) {
      const v = o.campos[k];
      if (typeof v === tipo) out[k] = v as string | boolean;
    }
    return Object.keys(out).length > 0 ? (out as Partial<BorradorSiniestro>) : null;
  } catch {
    return null;
  }
}

/** ¿Hay algo escrito que valga la pena guardar? Un formulario intacto no deja borrador. */
export function borradorTieneTexto(b: BorradorSiniestro): boolean {
  return (Object.keys(CAMPOS_BORRADOR) as CampoBorrador[]).some((k) => CAMPOS_BORRADOR[k] === "string" && k !== "fechaHora" && String(b[k]).trim() !== "");
}

/* ─── Aviso al terminar ─── */

export interface ResultadoNoApto {
  /** Se abrió (o ya existía) la solicitud de NO APTO: el vehículo queda bloqueado hasta que Coordinación la resuelva. */
  solicitudNoApto: boolean;
  /** El siniestro la exigía y no se pudo registrar: hay que avisar a Regulación por otro medio. */
  noAptoFallo: boolean;
}

export function avisoSiniestroReportado(placa: string, r: ResultadoNoApto): string {
  const base = `Siniestro de ${placa} reportado. Regulación ya lo ve en novedades.`;
  if (r.noAptoFallo) {
    return `${base} OJO: no se pudo registrar la solicitud de NO APTO. Llama a Regulación para avisar que la ambulancia no debe seguir operando.`;
  }
  if (r.solicitudNoApto) {
    return `${base} Se pidió el NO APTO: Coordinación debe avalarlo y mientras tanto la ambulancia queda bloqueada.`;
  }
  return base;
}

/**
 * Borra los borradores de siniestro de este teléfono. Con `soloVencidos` deja los vigentes (limpieza al abrir el portal);
 * sin él borra todos (al cerrar sesión: el borrador trae cédulas y teléfonos de terceros y no debe quedar en un equipo compartido).
 */
export function limpiarBorradoresSiniestro(
  storage: Pick<Storage, "length" | "key" | "getItem" | "removeItem">,
  ahora: number,
  soloVencidos: boolean
): void {
  const claves: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && k.startsWith(PREFIJO)) claves.push(k);
  }
  for (const k of claves) {
    if (!soloVencidos || leerBorradorSiniestro(storage.getItem(k), ahora) === null) storage.removeItem(k);
  }
}
