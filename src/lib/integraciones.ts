// Parámetros de integraciones externas editables por el ADMIN (migración 104). Puro: el catálogo y cómo se muestran.
// La lectura real (con la clave de servicio y el respaldo en variables de entorno) está en integraciones-servidor.ts.
import { CAMPOS_CORREO } from "@/lib/correo-config";

export interface CampoIntegracion {
  clave: string;
  etiqueta: string;
  ayuda: string;
  /** Secreto: nunca se devuelve completo a la pantalla, solo sus últimos 4 caracteres. */
  secreto: boolean;
  /** Variable de entorno que se usa si el valor no está configurado en la aplicación. */
  env: string;
  porDefecto?: string;
  /** Mensaje de error si el valor no sirve para este campo, o null si está bien (se comprueba al guardar). */
  validar?: (valor: string) => string | null;
}

export const GRUPOS_INTEGRACION: { grupo: string; titulo: string; descripcion: string; campos: CampoIntegracion[] }[] = [
  {
    grupo: "protrack",
    titulo: "Rastreo GPS — ProTrack365",
    descripcion: "Ubicación en vivo de la ambulancia asignada a un servicio, por el IMEI del GPS de cada vehículo.",
    campos: [
      { clave: "protrack_cuenta", etiqueta: "Cuenta", ayuda: "Nombre de la cuenta en ProTrack365 (en SISRES: AEROSANIDAD).", secreto: false, env: "PROTRACK_ACCOUNT", porDefecto: "AEROSANIDAD" },
      { clave: "protrack_api_key", etiqueta: "Llave de la API", ayuda: "La entrega ProTrack365. Solo la lee el servidor; en pantalla solo se ven sus últimos 4 caracteres.", secreto: true, env: "PROTRACK_API_KEY" },
    ],
  },
  {
    grupo: "whatsapp_ubicacion",
    titulo: "Aviso «su vehículo va en camino» (WhatsApp)",
    descripcion: "Plantilla aprobada en Meta que se envía al paciente con el enlace para ver la ambulancia.",
    campos: [
      { clave: "wa_plantilla_ubicacion", etiqueta: "Nombre de la plantilla", ayuda: "Tal como está aprobada en Meta (en SISRES: ubicacion_vehiculo). Un parámetro: el enlace.", secreto: false, env: "WHATSAPP_PLANTILLA_UBICACION", porDefecto: "ubicacion_vehiculo" },
      { clave: "wa_plantilla_ubicacion_idioma", etiqueta: "Idioma de la plantilla", ayuda: "Código de idioma de la plantilla en Meta (en SISRES: es).", secreto: false, env: "WHATSAPP_PLANTILLA_UBICACION_IDIOMA", porDefecto: "es" },
    ],
  },
  {
    grupo: "google_maps",
    titulo: "Google Maps — cotización de rutas",
    descripcion: "Mapa, autocompletado de direcciones, trazo de la ruta y mapa estático del PDF de la cotización.",
    campos: [
      {
        clave: "google_maps_api_key",
        etiqueta: "Llave de la API de Google Maps",
        ayuda: "Con Maps JavaScript, Places, Directions y Static Maps habilitadas. Restrínjala por dominio en Google Cloud: el navegador la usa para dibujar el mapa.",
        secreto: true,
        env: "GOOGLE_MAPS_API_KEY",
      },
    ],
  },
];

/** Grupos de «Configuración general» (no se muestran en Integraciones). */
export const GRUPOS_CONFIG_GENERAL: { grupo: string; titulo: string; descripcion: string; campos: CampoIntegracion[] }[] = [
  {
    grupo: "correo",
    titulo: "Correo saliente (SMTP)",
    descripcion:
      "Desde dónde sale el correo del sistema: recuperar contraseña, tickets, avisos de vencimientos y de NO APTO. Lo que escriba aquí tiene prioridad sobre las variables de entorno del servidor.",
    campos: CAMPOS_CORREO,
  },
];

export const CAMPOS_INTEGRACION: CampoIntegracion[] = [
  ...GRUPOS_INTEGRACION.flatMap((g) => g.campos),
  ...GRUPOS_CONFIG_GENERAL.flatMap((g) => g.campos),
];

export function campoIntegracion(clave: string): CampoIntegracion | undefined {
  return CAMPOS_INTEGRACION.find((c) => c.clave === clave);
}

/** «••••1234» para mostrar un secreto sin revelarlo. Vacío si no hay valor. */
export function enmascarar(valor: string | null | undefined): string {
  if (!valor) return "";
  return `••••${valor.slice(-4)}`;
}

/** Estado de un campo para la pantalla: el valor visible (o enmascarado) y de dónde sale. */
export interface EstadoCampoIntegracion {
  clave: string;
  visible: string;
  origen: "aplicacion" | "entorno" | "por_defecto" | "sin_configurar";
}
