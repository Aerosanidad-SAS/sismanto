// Etiquetas y formato compartidos por las pantallas de soporte técnico.

export const ETIQUETA_ESTADO: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};
export const ETIQUETA_PRIORIDAD: Record<string, string> = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta", URGENTE: "Urgente" };
export const ETIQUETA_EVENTO: Record<string, string> = {
  CREACION: "Ticket creado",
  ASIGNACION: "Tomado por un técnico",
  CONTACTO: "Primer contacto",
  CAMBIO_ESTADO: "Cambio de estado",
  CAMBIO_PRIORIDAD: "Cambio de prioridad",
  CIERRE_CONFIRMADO: "Cierre",
  REAPERTURA: "Ticket reabierto",
};

export function varianteEstado(estado: string) {
  if (estado === "CERRADO") return "success" as const;
  if (estado === "EN_PROCESO") return "warning" as const;
  if (estado === "RESUELTO") return "secondary" as const;
  return "default" as const;
}
export function variantePrioridad(prioridad: string) {
  if (prioridad === "URGENTE") return "destructive" as const;
  if (prioridad === "ALTA") return "warning" as const;
  if (prioridad === "MEDIA") return "secondary" as const;
  return "outline" as const;
}

// La operación es en Colombia y el navegador puede estar en otra zona: se muestra siempre hora de Bogotá.
export function fechaHora(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));
}
