"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-utils";
import { NAV_GROUPS } from "@/lib/navegacion";
import { ROLES_CONFIGURABLES } from "@/lib/permisos";
import { guardarModulosOcultos } from "@/app/api/actions/permisos";

const NOMBRE_ROL: Partial<Record<UserRole, string>> = {
  OVEM: "OVEM",
  REGULACION: "Regulación",
  GERENCIAL: "Gerencial",
  MANTENIMIENTO: "Mantenimiento",
  COORDINACION: "Coordinación",
  ANALISTA: "Analista",
  MEDICO: "Médico",
  AUXILIAR_ENFERMERIA: "Auxiliar de enfermería",
  VISTA: "Vista",
  TECNICO: "Técnico",
  AEROPUERTO: "Aeropuerto",
};

export function PermisosModulos({ inicial }: { inicial: Record<string, string[]> }) {
  const [guardados, setGuardados] = useState(inicial);
  const [rol, setRol] = useState<UserRole>(ROLES_CONFIGURABLES[0]);
  const [ocultos, setOcultos] = useState<string[]>(inicial[ROLES_CONFIGURABLES[0]] ?? []);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cambios = [...ocultos].sort().join("|") !== [...(guardados[rol] ?? [])].sort().join("|");
  const grupos = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(rol)) })).filter(
    (g) => g.items.length > 0
  );

  function elegirRol(r: UserRole) {
    if (cambios && !window.confirm("Hay cambios sin guardar en este rol. ¿Descartarlos?")) return;
    setRol(r);
    setOcultos(guardados[r] ?? []);
    setMensaje(null);
  }

  function alternar(href: string, visible: boolean) {
    setOcultos((prev) => (visible ? prev.filter((h) => h !== href) : [...prev, href]));
    setMensaje(null);
  }

  async function guardar() {
    setGuardando(true);
    const r = await guardarModulosOcultos(rol, ocultos);
    setGuardando(false);
    if ("error" in r && r.error) {
      setMensaje({ tipo: "error", texto: r.error });
      return;
    }
    const nuevos = "ocultos" in r && r.ocultos ? r.ocultos : ocultos;
    setGuardados((prev) => ({ ...prev, [rol]: nuevos }));
    setMensaje({ tipo: "ok", texto: "Guardado. Quienes tengan este rol lo verán al cambiar de página." });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rol">
        {ROLES_CONFIGURABLES.map((r) => {
          const n = guardados[r]?.length ?? 0;
          return (
            <Button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === rol}
              variant={r === rol ? "default" : "outline"}
              size="sm"
              onClick={() => elegirRol(r)}
            >
              {NOMBRE_ROL[r] ?? r}
              {n > 0 && <span className="ml-1 text-xs opacity-80">({n} oculto{n === 1 ? "" : "s"})</span>}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{NOMBRE_ROL[rol] ?? rol}</CardTitle>
          <CardDescription>
            Solo aparecen los módulos que este rol tiene por diseño. Desmarca los que no debe ver en el menú.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {grupos.map((g) => (
            <fieldset key={g.label ?? "inicio"} className="space-y-2">
              <legend className="text-sm font-semibold text-muted-foreground">{g.label ?? "Inicio"}</legend>
              {g.items.map((item) => {
                const visible = !ocultos.includes(item.href);
                const id = `mod-${item.href}`;
                return (
                  <label
                    key={item.href}
                    htmlFor={id}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3",
                      !visible && "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={visible}
                      onCheckedChange={(v) => alternar(item.href, v)}
                    />
                    <span>
                      <span className="font-medium">{item.name}</span>
                      <span className="block text-sm text-muted-foreground">{item.hint}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ))}

          {mensaje && (
            <Alert variant={mensaje.tipo === "error" ? "destructive" : "default"}>
              <AlertDescription>{mensaje.texto}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={guardar} disabled={!cambios || guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={ocultos.length === 0}
              onClick={() => {
                setOcultos([]);
                setMensaje(null);
              }}
            >
              Mostrar todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
