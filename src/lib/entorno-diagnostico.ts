// Estado de las variables de entorno de un despliegue: SOLO nombres y si tienen valor. Puro, para probarlo.
//
// Nunca devuelve un valor (ni su largo): el único dato que sale de cada variable es «falta», «vacía» o «con valor», y
// si el valor trae comillas o espacios en los bordes, que es el error más común al copiarlo de un archivo PHP o de un
// panel (el valor queda mal y la conexión falla sin explicar por qué).

import { proveedorCorreo } from "@/lib/notifications/proveedor-correo";

export type EstadoVariable = "con_valor" | "vacia" | "falta";
export type Importancia = "requerida" | "opcional" | "debe_faltar_en_produccion";

export interface DefinicionVariable {
  nombre: string;
  importancia: Importancia;
  paraQue: string;
}

export interface GrupoVariables {
  titulo: string;
  variables: DefinicionVariable[];
}

export const GRUPOS_ENTORNO: GrupoVariables[] = [
  {
    titulo: "Base de datos y sesión",
    variables: [
      { nombre: "NEXT_PUBLIC_SUPABASE_URL", importancia: "requerida", paraQue: "Dirección de la base de datos" },
      { nombre: "NEXT_PUBLIC_SUPABASE_ANON_KEY", importancia: "requerida", paraQue: "Llave pública de la base de datos" },
      { nombre: "SUPABASE_SERVICE_ROLE_KEY", importancia: "requerida", paraQue: "Llave de servicio: recuperar contraseña, bitácora, cargas masivas" },
    ],
  },
  {
    titulo: "Correo saliente (SMTP: HostGator u otro)",
    variables: [
      { nombre: "SMTP_HOST", importancia: "requerida", paraQue: "Servidor de correo, p. ej. mail.sudominio.com" },
      { nombre: "SMTP_USER", importancia: "requerida", paraQue: "Usuario del buzón (el correo completo)" },
      { nombre: "SMTP_PASS", importancia: "requerida", paraQue: "Clave del buzón" },
      { nombre: "NOTIFICATIONS_MAIL_FROM", importancia: "requerida", paraQue: "Correo remitente (el mismo del usuario SMTP)" },
      { nombre: "SMTP_PORT", importancia: "opcional", paraQue: "Puerto; si falta se usa 465" },
      { nombre: "SMTP_SECURE", importancia: "opcional", paraQue: "true/false; si falta se deduce del puerto" },
    ],
  },
  {
    titulo: "Correo por Microsoft Graph (alternativa al SMTP)",
    variables: [
      { nombre: "AZURE_TENANT_ID", importancia: "opcional", paraQue: "Solo si se envía por Microsoft 365" },
      { nombre: "AZURE_CLIENT_ID", importancia: "opcional", paraQue: "Solo si se envía por Microsoft 365" },
      { nombre: "AZURE_CLIENT_SECRET", importancia: "opcional", paraQue: "Solo si se envía por Microsoft 365" },
    ],
  },
  {
    titulo: "Enlaces y avisos programados",
    variables: [
      { nombre: "NEXT_PUBLIC_APP_URL", importancia: "opcional", paraQue: "Dirección pública para los enlaces de los correos de tickets; sin ella salen sin enlace" },
      { nombre: "CRON_SECRET", importancia: "requerida", paraQue: "Protege los avisos programados (vencimientos, equipos)" },
      { nombre: "ALERTA_NO_APTO_CORREOS", importancia: "opcional", paraQue: "Correos extra que reciben el aviso de vehículo NO APTO" },
    ],
  },
  {
    titulo: "Facturas, IA y OneDrive",
    variables: [
      { nombre: "ANTHROPIC_API_KEY", importancia: "opcional", paraQue: "Lectura de facturas y chat de IA" },
      { nombre: "ONEDRIVE_USER", importancia: "opcional", paraQue: "Buzón de OneDrive de las facturas" },
      { nombre: "GRAPH_WEBHOOK_SECRET", importancia: "opcional", paraQue: "Aviso de archivos nuevos en OneDrive" },
    ],
  },
  {
    titulo: "WhatsApp",
    variables: [
      { nombre: "WHATSAPP_TOKEN", importancia: "opcional", paraQue: "Avisos de etapa al paciente (también se puede cargar en Integraciones)" },
      { nombre: "WHATSAPP_PHONE_NUMBER_ID", importancia: "opcional", paraQue: "Número desde el que se envía" },
      { nombre: "WHATSAPP_APP_SECRET", importancia: "opcional", paraQue: "Obligatoria para recibir respuestas (webhook)" },
    ],
  },
  {
    titulo: "Seguridad",
    variables: [
      {
        nombre: "ROLE_SWITCHER_ENABLED",
        importancia: "debe_faltar_en_produccion",
        paraQue: "«Ver como» del administrador. Solo para pruebas locales: en producción NO debe existir",
      },
    ],
  },
];

type Entorno = Record<string, string | undefined>;

export function estadoDe(valor: string | undefined): EstadoVariable {
  if (valor === undefined) return "falta";
  return valor.trim() === "" ? "vacia" : "con_valor";
}

/** Comillas o espacios en los bordes del valor (sin devolver el valor). */
export function tieneBordesSospechosos(valor: string | undefined): boolean {
  if (!valor) return false;
  return /^[\s"'`]|[\s"'`]$/.test(valor);
}

export type Veredicto = "bien" | "falta" | "revisar" | "opcional_sin_poner" | "sobra";

export interface FilaVariable extends DefinicionVariable {
  estado: EstadoVariable;
  bordesSospechosos: boolean;
  veredicto: Veredicto;
}

export function evaluarVariable(def: DefinicionVariable, env: Entorno): FilaVariable {
  const valor = env[def.nombre];
  const estado = estadoDe(valor);
  const bordesSospechosos = estado === "con_valor" && tieneBordesSospechosos(valor);
  let veredicto: Veredicto;
  if (def.importancia === "debe_faltar_en_produccion") {
    veredicto = estado === "con_valor" ? "sobra" : "bien";
  } else if (estado !== "con_valor") {
    veredicto = def.importancia === "requerida" ? "falta" : "opcional_sin_poner";
  } else {
    veredicto = bordesSospechosos ? "revisar" : "bien";
  }
  return { ...def, estado, bordesSospechosos, veredicto };
}

export interface ResumenCorreo {
  proveedor: "smtp" | "graph" | "ninguno";
  /** Variables del SMTP que faltan o están vacías (para saber qué completar). */
  faltanSmtp: string[];
  recuperacionDisponible: boolean;
}

const VARIABLES_SMTP = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "NOTIFICATIONS_MAIL_FROM"];

export function resumenCorreo(env: Entorno): ResumenCorreo {
  const proveedor = proveedorCorreo(env);
  return {
    proveedor,
    faltanSmtp: VARIABLES_SMTP.filter((n) => estadoDe(env[n]) !== "con_valor"),
    // Es la misma condición de recuperar-contrasena.ts: la llave de servicio y algún proveedor de correo.
    recuperacionDisponible: estadoDe(env.SUPABASE_SERVICE_ROLE_KEY) === "con_valor" && proveedor !== "ninguno",
  };
}

export interface DiagnosticoEntorno {
  grupos: { titulo: string; filas: FilaVariable[] }[];
  correo: ResumenCorreo;
  /** Cuántas variables requeridas faltan o están vacías. */
  requeridasPendientes: number;
}

export function diagnosticarEntorno(env: Entorno): DiagnosticoEntorno {
  const grupos = GRUPOS_ENTORNO.map((g) => ({ titulo: g.titulo, filas: g.variables.map((v) => evaluarVariable(v, env)) }));
  const requeridasPendientes = grupos.flatMap((g) => g.filas).filter((f) => f.veredicto === "falta").length;
  return { grupos, correo: resumenCorreo(env), requeridasPendientes };
}
