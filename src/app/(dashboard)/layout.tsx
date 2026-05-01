"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
    ? ALL_NAV.filter(
        (n) =>
          n.roles.includes(profile.role_codigo) ||
          (profile.role_codigo === "SUPERADMIN" && n.roles.includes("ADMIN"))
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    router.replace("/pending");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Aeromanto</h1>
          </div>
          <div className="flex items-center h-12 px-4 border-b border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500 truncate">{profile.nombre_completo || profile.email}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{profile.role_codigo}</span>
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
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <form action={signOut}>
              <button type="submit" className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
