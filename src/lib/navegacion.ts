import {
  LayoutDashboard,
  Truck,
  Wrench,
  AlertTriangle,
  BarChart3,
  Settings,
  Plug,
  Settings2,
  ShieldCheck,
  Fuel,
  ClipboardCheck,
  GraduationCap,
  Radio,
  Route,
  Users,
  MessageSquareText,
  Sparkles,
  Ambulance,
  HeartPulse,
  Stethoscope,
  Activity,
  MessageCircle,
  TrendingUp,
  PackageCheck,
  Handshake,
  Building2,
  History,
  Plane,
  PlaneTakeoff,
  FileSignature,
  HandCoins,
  Trash2,
  Headset,
  LifeBuoy,
} from "lucide-react";
import type { UserRole } from "@/lib/auth-utils";

// Menú lateral (antes dentro de (dashboard)/layout.tsx). Aquí para que lo compartan el layout, los permisos por
// módulo (src/lib/permisos.ts) y la matriz de Administración → Permisos.

export type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  hint: string;
};

// Navegación unificada Aeromanto + SISRES — jerarquía por dominio de trabajo
// (ver NAVEGACION_UNIFICADA.md). Cada grupo solo se muestra si el rol del
// usuario tiene al menos un ítem visible dentro.
export const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null, // Inicio no lleva encabezado de grupo
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        // Regulación entra a Servicios, como en SISRES; el resumen ejecutivo no es su trabajo diario.
        // COORDINACION entra aquí desde que se retiró /coordinacion: solo ve la pestaña "Vehículos y
        // Operación" (sin barra de tabs, filtrado en page.tsx vía DASHBOARD_TAB_ROLES).
        roles: ["ADMIN", "GERENCIAL", "MANTENIMIENTO", "ANALISTA", "COORDINACION"],
        hint: "Resumen ejecutivo por pestañas: vehículos y operación, servicios, equipos biomédicos y financiero.",
      },
      {
        name: "Tablero ejecutivo",
        href: "/gerencial",
        icon: TrendingUp,
        roles: ["ADMIN", "GERENCIAL"],
        hint: "Vista de alto nivel para Gerencia y Junta Directiva, por pestañas: vehículos y operación, servicios, equipos biomédicos y financiero.",
      },
      {
        // Sin cabecera de grupo propia: es el único ítem de trabajo del OVEM y debe verse primero.
        name: "Portal OVEM",
        href: "/ovem",
        icon: ClipboardCheck,
        roles: ["ADMIN", "OVEM"],
        hint: "Preoperacional, checklist y kilometraje del conductor asignado.",
      },
    ],
  },
  {
    label: "Operación",
    items: [
      {
        name: "Servicios",
        href: "/servicios",
        icon: Ambulance,
        roles: ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "VISTA", "COORDINACION"],
        hint: "Servicios registrados: filtros, registro, etapas, exportación y avisos sonoros.",
      },
      {
        name: "Sala de control",
        href: "/regulacion",
        icon: Radio,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Servicios del día, flota disponible, tripulación y vencimientos del centro.",
      },
      {
        name: "Cotizador de rutas",
        href: "/cotizaciones",
        icon: Route,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Cotiza un traslado con la ruta de Google Maps, en PDF o por correo.",
      },
      {
        name: "Dotación e insumos",
        href: "/dotacion",
        icon: PackageCheck,
        roles: ["ADMIN", "AUXILIAR_ENFERMERIA", "ANALISTA"],
        hint: "Oxígeno, medicamentos y consumibles que la auxiliar verifica al recibir la ambulancia.",
      },
    ],
  },
  {
    label: "Pacientes",
    items: [
      {
        name: "Pacientes",
        href: "/pacientes",
        icon: HeartPulse,
        roles: ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "COORDINACION", "VISTA"],
        hint: "Registro maestro de pacientes para servicios y valoraciones (origen SISRES).",
      },
      {
        name: "Valoraciones",
        href: "/valoraciones",
        icon: Stethoscope,
        roles: ["ADMIN", "MEDICO", "ANALISTA", "VISTA"],
        hint: "Conceptos de aptitud médica para vuelo (origen SISRES).",
      },
    ],
  },
  {
    label: "Flota",
    items: [
      {
        name: "Vehículos",
        href: "/vehiculos",
        icon: Truck,
        roles: ["ADMIN", "REGULACION", "MANTENIMIENTO", "ANALISTA"],
        hint: "Inventario y fichas de ambulancias; kilometraje y datos técnicos.",
      },
      {
        name: "Mantenimientos",
        href: "/mantenimientos",
        icon: Wrench,
        roles: ["ADMIN", "MANTENIMIENTO", "ANALISTA"],
        hint: "Registro e importación de órdenes de mantenimiento preventivo y correctivo.",
      },
      {
        name: "Novedades",
        href: "/novedades",
        icon: AlertTriangle,
        roles: ["ADMIN", "REGULACION", "MANTENIMIENTO", "ANALISTA"],
        hint: "Incidencias y seguimiento hasta cierre; impacto en operatividad.",
      },
      {
        name: "Combustible",
        href: "/combustible",
        icon: Fuel,
        roles: ["ADMIN", "GERENCIAL", "ANALISTA"],
        hint: "Consumo, rendimiento km/gal y cargas por vehículo y centro.",
      },
    ],
  },
  {
    label: "Equipos Biomédicos",
    items: [
      {
        name: "Inventario y hoja de vida",
        href: "/equipos",
        icon: Activity,
        roles: ["ADMIN", "MANTENIMIENTO", "ANALISTA", "VISTA"],
        hint: "Inventario, mantenimientos y hoja de vida de equipos médicos (origen SISRES).",
      },
    ],
  },
  {
    label: "Formatos TI",
    items: [
      {
        name: "Acta de entrega",
        href: "/formatos-ti/acta-entrega",
        icon: FileSignature,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Acta de entrega de equipos y celulares con firma digital (G-TECN-F 028 / 031, origen SISRES).",
      },
      {
        name: "Diagnóstico de equipos",
        href: "/formatos-ti/diagnostico",
        icon: ClipboardCheck,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Diagnóstico y mantenimiento de equipos informáticos con listado de chequeo y firma (G-TECN-F 047, origen SISRES).",
      },
      {
        name: "Baja de equipos",
        href: "/formatos-ti/baja",
        icon: Trash2,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Baja de dispositivos informáticos y biomédicos con firma del responsable (G-TECN-F 020, origen SISRES).",
      },
      {
        name: "Entrega y préstamo",
        href: "/formatos-ti/prestamo",
        icon: HandCoins,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Entrega y préstamo de equipos informáticos con entrega y devolución firmadas (G-TECN-F 018, origen SISRES).",
      },
    ],
  },
  {
    label: "Comunicaciones",
    items: [
      {
        name: "Campañas WhatsApp",
        href: "/comunicaciones",
        icon: MessageCircle,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Campañas masivas con plantillas aprobadas de Meta (origen SISRES).",
      },
    ],
  },
  {
    label: "Formación",
    items: [
      {
        name: "Capacitaciones",
        href: "/capacitaciones",
        icon: GraduationCap,
        roles: ["ADMIN", "OVEM", "COORDINACION"],
        hint: "Cursos, evaluaciones, resultados y evidencias de entrenamiento.",
      },
    ],
  },
  {
    label: "Reportes",
    items: [
      {
        name: "KPIs de flota",
        href: "/kpis",
        icon: BarChart3,
        roles: ["ADMIN", "GERENCIAL", "ANALISTA"],
        hint: "Indicadores agregados: disponibilidad, CTO, ratio P/C y tiempos de resolución.",
      },
      {
        name: "Estadísticas de servicios",
        href: "/estadisticas",
        icon: BarChart3,
        roles: ["ADMIN", "GERENCIAL", "ANALISTA", "COORDINACION"],
        hint: "Volumen, etapas, tipos y tiempos de los servicios médicos (origen SISRES).",
      },
      {
        name: "AI Insights",
        href: "/ai-insights",
        icon: Sparkles,
        roles: ["ADMIN", "GERENCIAL", "COORDINACION", "ANALISTA"],
        hint: "Análisis inteligente: patrones de combustible, novedades y disponibilidad.",
      },
      {
        name: "Chat IA",
        href: "/ai-chat",
        icon: MessageSquareText,
        roles: ["ADMIN", "GERENCIAL", "ANALISTA"],
        hint: "Consulta y registra operaciones de flota en lenguaje natural con IA.",
      },
    ],
  },
  {
    label: "Administración del sistema",
    items: [
      {
        name: "Configuración",
        href: "/configuracion",
        icon: Settings,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Parámetros generales y catálogos: proveedores, clientes, centros y carga masiva.",
      },
      {
        name: "Usuarios",
        href: "/admin/usuarios",
        icon: Users,
        roles: ["ADMIN", "ANALISTA"],
        hint: "Alta, roles y estado de cuentas del personal.",
      },
      {
        name: "Permisos",
        href: "/admin/permisos",
        icon: ShieldCheck,
        roles: ["ADMIN"],
        hint: "Qué módulos del menú ve cada rol. Solo restringe la interfaz; los datos los sigue protegiendo la base.",
      },
      {
        name: "Bitácora",
        href: "/auditoria",
        icon: History,
        roles: ["ADMIN"],
        hint: "Quién hizo qué y cuándo (registro inmutable de auditoría).",
      },
      {
        name: "Integraciones",
        href: "/admin/integraciones",
        icon: Plug,
        roles: ["ADMIN"],
        hint: "Credenciales de GPS (ProTrack365), plantilla de WhatsApp de ubicación y llave de Google Maps.",
      },
      {
        name: "Aerolíneas",
        href: "/aerolineas",
        icon: PlaneTakeoff,
        roles: ["ADMIN", "MEDICO", "ANALISTA", "VISTA"],
        hint: "Catálogo de aerolíneas para las valoraciones (origen SISRES).",
      },
      {
        name: "Aeropuertos",
        href: "/aeropuertos",
        icon: Plane,
        roles: ["ADMIN", "MEDICO", "ANALISTA", "VISTA"],
        hint: "Catálogo de aeropuertos para origen y destino de vuelo (origen SISRES).",
      },
      {
        name: "Clientes",
        href: "/clientes",
        icon: Handshake,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Clientes y aseguradoras: consulta, registro y edición.",
      },
      {
        name: "Proveedores",
        href: "/proveedores",
        icon: Building2,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Directorio de prestadores y proveedores de servicios de salud (consulta).",
      },
    ],
  },
  {
    label: "Aeroportuaria",
    items: [
      {
        name: "Captación aeroportuaria",
        href: "/captacion",
        icon: Plane,
        roles: ["ADMIN", "ANALISTA", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA"],
        hint: "Registra las atenciones en aeropuertos y genera el reporte SISPRO del mes.",
      },
    ],
  },
  {
    label: "Soporte",
    items: [
      {
        name: "Soporte técnico",
        href: "/soporte",
        icon: LifeBuoy,
        roles: ["ADMIN", "OVEM", "REGULACION", "GERENCIAL", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "TECNICO", "AEROPUERTO"],
        hint: "Reporta un problema de tecnología y sigue tu ticket hasta que se resuelva.",
      },
      {
        name: "Gestión de tickets",
        href: "/soporte/gestion",
        icon: Headset,
        roles: ["ADMIN", "COORDINACION", "ANALISTA", "TECNICO"],
        hint: "Toma, atiende y cierra los tickets de soporte técnico.",
      },
      {
        name: "Indicadores de soporte",
        href: "/soporte/indicadores",
        icon: BarChart3,
        roles: ["ADMIN", "COORDINACION", "ANALISTA", "TECNICO"],
        hint: "Tiempos de respuesta, SLA, resolución y disponibilidad del soporte.",
      },
      {
        name: "Configuración de soporte",
        href: "/soporte/configuracion",
        icon: Settings2,
        roles: ["ADMIN"],
        hint: "Catálogos, SLA, horario laboral, correos y disponibilidad.",
      },
    ],
  },
];
