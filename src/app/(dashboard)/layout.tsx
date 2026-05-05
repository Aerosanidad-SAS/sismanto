"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Truck,
  Wrench,
  AlertTriangle,
  BarChart3,
  Settings,
  Fuel,
  ClipboardCheck,
  Radio,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfile, signOut, type UserRole } from "@/app/api/actions/auth";

const ALL_NAV = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "GERENCIAL", "REGULACION"] as UserRole[] },
  { name: "Vehículos", href: "/vehiculos", icon: Truck, roles: ["ADMIN", "REGULACION"] as UserRole[] },
  { name: "Mantenimientos", href: "/mantenimientos", icon: Wrench, roles: ["ADMIN"] as UserRole[] },
  { name: "Novedades", href: "/novedades", icon: AlertTriangle, roles: ["ADMIN", "REGULACION"] as UserRole[] },
  { name: "KPIs", href: "/kpis", icon: BarChart3, roles: ["ADMIN", "GERENCIAL"] as UserRole[] },
  { name: "Consumo", href: "/consumo", icon: Fuel, roles: ["ADMIN", "GERENCIAL"] as UserRole[] },
  { name: "Regulación", href: "/regulacion", icon: Radio, roles: ["ADMIN", "REGULACION"] as UserRole[] },
  { name: "Portal OVEM", href: "/ovem", icon: ClipboardCheck, roles: ["ADMIN", "OVEM"] as UserRole[] },
  { name: "Configuración", href: "/configuracion", icon: Settings, roles: ["ADMIN"] as UserRole[] },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, roles: ["ADMIN"] as UserRole[] },
];

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-[#7F7FF4] text-white",
  REGULACION: "bg-[#2BB6C7] text-white",
  GERENCIAL: "bg-[#1B6368] text-white",
  OVEM: "bg-[#9C9B99] text-white",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setLoading(false);
      if (p) {
        if (p.role_codigo === "OVEM" && (pathname === "/" || pathname === "/kpis" || pathname === "/consumo")) {
          router.replace("/ovem");
        }
        if (p.role_codigo === "GERENCIAL" && !["/", "/kpis", "/consumo"].includes(pathname) && !pathname.startsWith("/admin")) {
          router.replace("/");
        }
      }
    });
  }, [pathname, router]);

  const navItems = profile
    ? ALL_NAV.filter((n) => n.roles.includes(profile.role_codigo))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    router.replace("/pending");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          <div className="h-20 px-6 border-b border-border flex items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <p className="font-[var(--font-bebas-neue)] uppercase tracking-[0.02em] text-xl text-primary">Aero</p>
                <p className="font-[var(--font-bebas-neue)] uppercase tracking-[0.02em] text-xl text-accent">Manto</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3">
              <div className="h-9 w-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                {(profile.nombre_completo || profile.email).trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile.nombre_completo || profile.email}</p>
                <span
                  className={cn(
                    "inline-flex mt-1 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                    ROLE_BADGE_STYLES[profile.role_codigo]
                  )}
                >
                  {profile.role_codigo}
                </span>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-[#2BB6C7] text-white" : "text-[#666564] hover:bg-[#F4EFE6]"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center w-full px-4 py-2 text-sm text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="pl-72">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
