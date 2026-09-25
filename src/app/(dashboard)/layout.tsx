"use client";

import type { ReactNode } from "react";
import {
  useEffect,
  useState,
  useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { VersionMenu } from "@/components/version/version-dialog";
import { usePathname,
  useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Wrench,
  AlertTriangle,
  BarChart3,
  Settings,
  Settings2,
  Fuel,
  ClipboardCheck,
  GraduationCap,
  Radio,
  Users,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { esRolRestringido, getDefaultRoute, rutaPermitidaARolRestringido } from "@/lib/auth-utils";
import { getProfile, signOut, type UserRole } from "@/app/api/actions/auth";
import { getCompanyBranding } from "@/app/api/actions/company-settings";
import { Button } from "@/components/ui/button";
import { RoleSwitcher, RoleSwitchBanner } from "@/components/dev/role-switcher";

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  hint: string;
};

// Navegación unificada Aeromanto + SISRES — jerarquía por dominio de trabajo
// (ver NAVEGACION_UNIFICADA.md). Cada grupo solo se muestra si el rol del
// usuario tiene al menos un ítem visible dentro.
const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null, // Inicio no lleva encabezado de grupo
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        // Regulación entra a Servicios, como en SISRES; el resumen ejecutivo no es su trabajo diario.
        roles: ["ADMIN", "GERENCIAL", "MANTENIMIENTO", "ANALISTA"],
        hint: "Resumen ejecutivo: KPIs, costos del período, disponibilidad, novedades y estado de flota.",
      },
      {
        name: "Tablero ejecutivo",
        href: "/gerencial",
        icon: TrendingUp,
        roles: ["ADMIN", "GERENCIAL"],
        hint: "Vista de alto nivel para Gerencia y Junta Directiva: servicios por ciudad, flota, vencimientos, equipos biomédicos e ingresos.",
      },
      {
        name: "Coordinación",
        href: "/coordinacion",
        roles: ["ADMIN", "COORDINACION"],
        icon: Users,
        hint: "Visión operativa CRA: estado flota, OVEM activos, novedades y próximos mantenimientos.",
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
        roles: ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "VISTA"],
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
        name: "Clientes",
        href: "/clientes",
        icon: Handshake,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Directorio de clientes y aseguradoras (consulta).",
      },
      {
        name: "Proveedores",
        href: "/proveedores",
        icon: Building2,
        roles: ["ADMIN", "REGULACION", "ANALISTA"],
        hint: "Directorio de prestadores y proveedores de servicios de salud (consulta).",
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
        roles: ["ADMIN", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "VISTA"],
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
        roles: ["ADMIN", "COORDINACION", "ANALISTA"],
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
    label: "Portal OVEM",
    items: [
      {
        name: "Portal OVEM",
        href: "/ovem",
        icon: ClipboardCheck,
        roles: ["ADMIN", "OVEM"],
        hint: "Preoperacional, checklist y kilometraje del conductor asignado.",
      },
    ],
  },
  {
    label: "Administración",
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
        name: "Bitácora",
        href: "/auditoria",
        icon: History,
        roles: ["ADMIN"],
        hint: "Quién hizo qué y cuándo (registro inmutable de auditoría).",
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
        roles: ["ADMIN", "ANALISTA", "COORDINACION", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA"],
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

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-[#7F7FF4] text-white",
  REGULACION: "bg-[#2BB6C7] text-white",
  GERENCIAL: "bg-[#1B6368] text-white",
  OVEM: "bg-[#9C9B99] text-white",
  MANTENIMIENTO: "bg-[#666564] text-white",
  COORDINACION: "bg-[#0E7490] text-white",
  ANALISTA: "bg-[#8B5CF6] text-white",
  MEDICO: "bg-[#16A34A] text-white",
  AUXILIAR_ENFERMERIA: "bg-[#65A30D] text-white",
  VISTA: "bg-[#94A3B8] text-white",
  TECNICO: "bg-[#0F766E] text-white",
  AEROPUERTO: "bg-[#B45309] text-white",
};

const SIDEBAR_COLLAPSE_KEY = "aeromanto-sidebar-collapsed";
/** Secciones del menú desplegadas por el usuario ({ [label]: boolean }); se recuerdan entre visitas. */
const NAV_OPEN_GROUPS_KEY = "sismanto-nav-open-groups";

function isActiveHref(pathname: string | null, href: string): boolean {
  return pathname === href || (href !== "/" && Boolean(pathname?.startsWith(href)));
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  /** Solo lg+: barra lateral estrecha (iconos). En móvil el drawer siempre muestra texto completo. */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1") {
        setSidebarCollapsed(true);
      }
      const saved = localStorage.getItem(NAV_OPEN_GROUPS_KEY);
      if (saved) setOpenGroups(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem(NAV_OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    getCompanyBranding().then((b) => setLogoUrl(b.logo_url));
  }, []);

  const setCollapsedPersist = useCallback((next: boolean) => {
    setSidebarCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setLoading(false);
      if (p) {
        // Roles de soporte: solo ven el soporte técnico (la barrera real es la RLS restrictiva de la migración 076).
        if (esRolRestringido(p.role_codigo) && !rutaPermitidaARolRestringido(pathname)) {
          router.replace("/soporte");
        }
        if (
          p.role_codigo === "OVEM" &&
          (pathname === "/" ||
            pathname === "/kpis" ||
            pathname === "/consumo" ||
            pathname === "/combustible")
        ) {
          router.replace("/ovem");
        }
        if (
          p.role_codigo === "MANTENIMIENTO" &&
          ["/kpis", "/consumo", "/combustible", "/configuracion", "/regulacion", "/admin", "/ovem"].some(
            (b) => pathname === b || pathname.startsWith(`${b}/`)
          )
        ) {
          router.replace("/vehiculos");
        }
        if (
          p.role_codigo === "GERENCIAL" &&
          !["/", "/kpis", "/consumo", "/combustible", "/estadisticas", "/ai-chat", "/ai-insights", "/gerencial", "/soporte"].includes(pathname) &&
          !pathname.startsWith("/admin")
        ) {
          router.replace("/");
        }
        if (
          p.role_codigo === "COORDINACION" &&
          !["/coordinacion", "/capacitaciones", "/pacientes", "/equipos", "/comunicaciones", "/estadisticas", "/ai-insights", "/soporte", "/captacion"].some(
            (b) => pathname === b || pathname.startsWith(`${b}/`)
          )
        ) {
          router.replace("/coordinacion");
        }
        // Roles clínicos de la integración SISRES y Regulación: llevarlos a su pantalla de trabajo.
        // ANALISTA queda fuera — tiene paridad con ADMIN (ver migración 046) y
        // aterriza en el dashboard como cualquier otro rol con acceso completo.
        if (
          ["MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "REGULACION"].includes(p.role_codigo) &&
          pathname === "/"
        ) {
          router.replace(getDefaultRoute(p.role_codigo));
        }
      }
    });
  }, [pathname, router]);

  /* Cerrar drawer al navegar (patrón app móvil) */
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const navGroups = profile
    ? NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((n) => n.roles.includes(profile.role_codigo)),
      }))
        .filter((g) => g.items.length > 0)
        // El OVEM entra a trabajar a su portal: va primero, antes de Formación.
        .sort((a, b) =>
          profile.role_codigo === "OVEM"
            ? Number(b.label === "Portal OVEM") - Number(a.label === "Portal OVEM")
            : 0
        )
    : [];

  // La sección de la página actual siempre se abre al navegar (las demás conservan lo que el usuario dejó).
  useEffect(() => {
    const activa = navGroups.find((g) => g.label && g.items.some((n) => isActiveHref(pathname, n.href)));
    if (activa?.label) {
      const label = activa.label;
      setOpenGroups((prev) => (prev[label] ? prev : { ...prev, [label]: true }));
    }
    // navGroups se recalcula en cada render; basta con reaccionar a la ruta y al perfil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-foreground text-center">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    router.replace("/pending");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-foreground text-center">Redirigiendo...</p>
      </div>
    );
  }

  const showCollapsedChrome = sidebarCollapsed;

  return (
    <div className="min-h-screen bg-background min-h-[100dvh]">
      {/* Backdrop solo móvil / tablet cuando el drawer está abierto */}
      <button
        type="button"
        aria-label="Cerrar menú"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity lg:hidden",
          mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Barra superior móvil: áreas seguras + objetivo táctil ≥44px */}
      <header
        className={cn(
          "lg:hidden sticky top-0 z-30 flex min-h-[3.25rem] items-center gap-3 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
          "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 border-border shadow-sm touch-manipulation"
          aria-expanded={mobileNavOpen}
          aria-controls="dashboard-sidebar"
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          {mobileNavOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative h-9 w-28 shrink-0 overflow-hidden rounded">
            <Image
              src={logoUrl ?? "/brand/alianza.png"}
              alt="Aerosanidad e Inter Assist"
              fill
              className="object-contain object-left"
              sizes="112px"
              priority
              unoptimized={Boolean(logoUrl)}
            />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="font-[var(--font-bebas-neue)] truncate text-lg uppercase tracking-wide text-primary">Aero</p>
            <p className="font-[var(--font-bebas-neue)] truncate text-lg uppercase tracking-wide text-accent -mt-0.5">Manto</p>
          </div>
        </div>
      </header>

      <aside
        id="dashboard-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card shadow-xl transition-[transform,width] duration-200 ease-out",
          /* Ancho responsive */
          "w-[min(19rem,calc(100vw-env(safe-area-inset-left)-1rem))] max-w-[100vw]",
          "lg:w-72 lg:max-w-none lg:shadow-none",
          showCollapsedChrome && "lg:!w-[4.75rem]",
          /* Drawer móvil */
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "pl-[env(safe-area-inset-left)]"
        )}
      >
        {/* Cabecera sidebar (solo desktop: logo completo + colapsar) */}
        <div
          className={cn(
            "hidden lg:flex border-b border-border shrink-0",
            showCollapsedChrome ? "h-auto flex-col items-stretch gap-1 px-2 py-3" : "h-20 items-center px-6"
          )}
        >
          <div className={cn("flex items-center gap-3 min-w-0", showCollapsedChrome && "justify-center flex-col px-0")}>
            {showCollapsedChrome ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                <Image
                  src="/brand/aerosanidad.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="relative h-10 w-44 shrink-0 overflow-hidden rounded">
                <Image
                  src={logoUrl ?? "/brand/alianza.png"}
                  alt="Aerosanidad e Inter Assist"
                  fill
                  className="object-contain object-left"
                  sizes="176px"
                  priority
                  unoptimized={Boolean(logoUrl)}
                />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 text-muted-foreground hover:text-foreground",
              showCollapsedChrome ? "mx-auto h-10 w-10" : "ml-auto"
            )}
            title={showCollapsedChrome ? "Expandir menú" : "Colapsar menú"}
            aria-label={showCollapsedChrome ? "Expandir menú lateral" : "Colapsar menú lateral"}
            onClick={() => setCollapsedPersist(!sidebarCollapsed)}
          >
            {showCollapsedChrome ? (
              <PanelLeft className="h-5 w-5" aria-hidden />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>

        {/* Logo en drawer móvil (la barra superior ya muestra marca; aquí repetimos opcional más compacto) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-border shrink-0 min-h-[3.25rem]">
          <span className="text-sm font-semibold text-muted-foreground">Menú</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 touch-manipulation"
            aria-label="Cerrar menú"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          className={cn(
            "px-3 sm:px-4 py-4 border-b border-border shrink-0",
            showCollapsedChrome && "lg:px-2 lg:flex lg:justify-center"
          )}
        >
          <div
            title={
              showCollapsedChrome
                ? `${profile.nombre_completo || profile.email || ""} · ${profile.role_codigo}`
                : undefined
            }
            className={cn(
              "flex items-center gap-3 rounded-lg bg-muted px-3 py-3 min-w-0",
              showCollapsedChrome && "lg:flex-col lg:px-2 lg:py-2 lg:justify-center lg:gap-1"
            )}
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center lg:h-10 lg:w-10">
              {(profile.nombre_completo || profile.email || "?").trim().charAt(0).toUpperCase()}
            </div>
            {!showCollapsedChrome && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{profile.nombre_completo || profile.email}</p>
                <span
                  className={cn(
                    "inline-flex mt-1 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide max-w-full truncate",
                    ROLE_BADGE_STYLES[profile.role_codigo]
                  )}
                >
                  {profile.role_codigo}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 space-y-1 overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]",
            showCollapsedChrome && "lg:px-2"
          )}
        >
          {navGroups.map((group, gi) => {
            const label = group.label;
            const open = label === null || openGroups[label] === true;
            const groupHasActive = group.items.some((n) => isActiveHref(pathname, n.href));
            const panelId = `nav-group-${gi}`;
            return (
            <div key={label ?? `grupo-${gi}`} className={cn(gi > 0 && "pt-1")}>
              {label && (
                <button
                  type="button"
                  onClick={() => toggleGroup(label)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-2 min-h-[40px] touch-manipulation",
                    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    "hover:bg-[#F4EFE6] transition-colors",
                    showCollapsedChrome && "lg:hidden"
                  )}
                >
                  <span className={cn(groupHasActive && !open && "text-[#2BB6C7]")}>{label}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
                    aria-hidden
                  />
                </button>
              )}
              <div
                id={panelId}
                className={cn(
                  "space-y-1",
                  label && "ml-4 border-l border-border pl-2",
                  label && showCollapsedChrome && "lg:ml-0 lg:border-l-0 lg:pl-0",
                  // Colapsado: oculto, salvo en la barra estrecha de iconos (lg), donde todo se ve como iconos.
                  !open && cn("hidden", showCollapsedChrome && "lg:block")
                )}
              >
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveHref(pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={showCollapsedChrome ? `${item.name}: ${item.hint}` : item.hint}
                      className={cn(
                        "flex items-center rounded-lg transition-colors touch-manipulation min-h-[44px] lg:min-h-10",
                        showCollapsedChrome
                          ? "lg:justify-center lg:px-2 lg:py-3"
                          : "px-4 py-3.5 lg:py-3",
                        isActive ? "bg-[#2BB6C7] text-white" : "text-[#666564] active:bg-muted hover:bg-[#F4EFE6] lg:hover:bg-[#F4EFE6]"
                      )}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", !showCollapsedChrome && "mr-3")} aria-hidden />
                      <span className={cn("text-sm font-medium truncate", showCollapsedChrome && "lg:sr-only")}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-auto border-t border-border p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
            showCollapsedChrome && "lg:p-2"
          )}
        >
          <RoleSwitcher collapsed={showCollapsedChrome} />
          <form action={signOut}>
            <button
              type="submit"
              title={showCollapsedChrome ? "Cerrar sesión" : undefined}
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 active:bg-red-100 transition-colors min-h-[44px] lg:min-h-auto touch-manipulation",
                showCollapsedChrome ? "lg:justify-center lg:px-2 lg:py-3" : "px-4 py-3.5 lg:py-2"
              )}
            >
              <LogOut className={cn("h-5 w-5 shrink-0", !showCollapsedChrome && "mr-3")} aria-hidden />
              <span className={cn(showCollapsedChrome && "lg:sr-only")}>Cerrar sesión</span>
            </button>
          </form>
          <VersionMenu colapsado={showCollapsedChrome} />
        </div>
      </aside>

      <div
        className={cn(
          "transition-[padding] duration-200 ease-out min-h-[100dvh]",
          /* Espacio lateral solo en escritorio cuando el sidebar está fijo visible */
          "lg:pl-72",
          showCollapsedChrome && "lg:!pl-[4.75rem]"
        )}
      >
        <RoleSwitchBanner />
        <main
          className={cn(
            "mx-auto w-full max-w-[100vw]",
            /* Padding contenido más cómodo en móvil; tablas pueden usar overflow-x-auto en cada página */
            "px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          )}
        >
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
