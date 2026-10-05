"use client";

import type { ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useState,
  useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { VersionMenu } from "@/components/version/version-dialog";
import { usePathname,
  useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, type UserProfile, type UserRole } from "@/app/api/actions/auth";
import { getCompanyBranding } from "@/app/api/actions/company-settings";
import { Button } from "@/components/ui/button";
import { RoleSwitcher, RoleSwitchBanner } from "@/components/dev/role-switcher";
import { NAV_GROUPS } from "@/lib/navegacion";
import { moduloVisible } from "@/lib/permisos";
import { getRedirectFor } from "./role-redirects";
import { ShellContentSkeleton } from "./skeletons";

// El color del rol es solo un punto decorativo: el nombre del rol ya es texto y se lee con contraste AA.
const ROLE_DOT_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-[#7F7FF4]",
  REGULACION: "bg-[#2BB6C7]",
  GERENCIAL: "bg-[#1B6368]",
  OVEM: "bg-[#9C9B99]",
  MANTENIMIENTO: "bg-[#666564]",
  COORDINACION: "bg-[#0E7490]",
  ANALISTA: "bg-[#8B5CF6]",
  MEDICO: "bg-[#16A34A]",
  AUXILIAR_ENFERMERIA: "bg-[#65A30D]",
  VISTA: "bg-[#94A3B8]",
  TECNICO: "bg-[#0F766E]",
  AEROPUERTO: "bg-[#B45309]",
};

const SIDEBAR_COLLAPSE_KEY = "aeromanto-sidebar-collapsed";
/** Secciones del menú desplegadas por el usuario ({ [label]: boolean }); se recuerdan entre visitas. */
const NAV_OPEN_GROUPS_KEY = "sismanto-nav-open-groups";

/** Roles whose daily work fits in a handful of links: the menu is a flat list, with no collapsible sections. */
const FLAT_MENU_ROLES: readonly UserRole[] = ["OVEM", "REGULACION"];

function isActiveHref(pathname: string | null, href: string): boolean {
  return pathname === href || (href !== "/" && Boolean(pathname?.startsWith(href)));
}

/**
 * Client shell of the dashboard (menu, drawer, collapse state). The profile and the modules hidden for the role arrive
 * from the server layout, so there is no "Cargando…" screen and no profile effect: the menu paints with the first HTML.
 */
export function DashboardShell({
  profile,
  ocultos,
  children,
}: {
  profile: UserProfile;
  /** Modules the administrator hid from this role (Administración → Permisos). */
  ocultos: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Rutas que no son de este rol (o módulo oculto por el administrador): se sale a la que sí le toca. Es una función
  // pura de (rol, ruta, ocultos): mientras dura la redirección se muestra un esqueleto, no contenido ajeno.
  const redirectTo = getRedirectFor(profile.role_codigo, pathname, ocultos);
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

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

  const navGroups = useMemo(() => {
    const visible = NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((n) => moduloVisible(n, profile.role_codigo, ocultos)),
    })).filter((g) => g.items.length > 0);
    if (!FLAT_MENU_ROLES.includes(profile.role_codigo)) return visible;
    return [{ label: null, items: visible.flatMap((g) => g.items) }];
  }, [profile.role_codigo, ocultos]);

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

  const showCollapsedChrome = sidebarCollapsed;

  return (
    <div className="min-h-screen bg-background min-h-[100dvh]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      {/* Backdrop solo móvil / tablet cuando el drawer está abierto */}
      <button
        type="button"
        aria-label="Cerrar menú"
        tabIndex={-1}
        aria-hidden={!mobileNavOpen}
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
          mobileNavOpen ? "translate-x-0" : "-translate-x-full invisible lg:visible lg:translate-x-0",
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
                <span className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tracking-wide text-foreground">
                  <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", ROLE_DOT_COLORS[profile.role_codigo])} />
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
                    "text-[11px] font-semibold uppercase tracking-wider text-foreground",
                    "hover:bg-muted transition-colors",
                    showCollapsedChrome && "lg:hidden"
                  )}
                >
                  <span className={cn(groupHasActive && !open && "text-accent")}>{label}</span>
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
                      aria-current={isActive ? "page" : undefined}
                      title={showCollapsedChrome ? `${item.name}: ${item.hint}` : item.hint}
                      className={cn(
                        "flex items-center rounded-lg transition-colors touch-manipulation min-h-[44px] lg:min-h-10",
                        showCollapsedChrome
                          ? "lg:justify-center lg:px-2 lg:py-3"
                          : "px-4 py-3.5 lg:py-3",
                        isActive ? "bg-accent text-accent-foreground" : "text-foreground active:bg-muted hover:bg-muted lg:hover:bg-muted"
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
          id="contenido"
          tabIndex={-1}
          className={cn(
            "outline-none",
            "mx-auto w-full max-w-[100vw]",
            /* Padding contenido más cómodo en móvil; tablas pueden usar overflow-x-auto en cada página */
            "px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          )}
        >
          <div className="max-w-[1600px] mx-auto">{redirectTo ? <ShellContentSkeleton /> : children}</div>
        </main>
      </div>
    </div>
  );
}
