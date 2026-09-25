"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getHistorialVersiones, type HistorialVersiones } from "@/app/api/actions/version";
import type { CambioVersion } from "@/lib/changelog";
import { cn } from "@/lib/utils";

const ETIQUETA_ENTORNO: Record<string, string> = { dev: "Desarrollo", staging: "Pruebas (staging)", production: "Producción", local: "Local" };

function Cambio({ c }: { c: CambioVersion }) {
  return (
    <li className="text-sm">
      <span className="font-medium">{c.area}</span> — {c.descripcion}
      {c.incompatible && <span className="ml-1 text-destructive">⚠️ Cambio incompatible.</span>}
      {(c.roles || c.migraciones) && (
        <span className="block text-xs text-muted-foreground">
          {c.roles ? `Roles: ${c.roles}` : ""}
          {c.roles && c.migraciones ? " · " : ""}
          {c.migraciones ? `Migración: ${c.migraciones}` : ""}
        </span>
      )}
    </li>
  );
}

/** «v0.8.0 · a1b2c3d» al pie del menú; al pulsarlo se abre el historial de versiones. */
export function VersionMenu({ colapsado }: { colapsado?: boolean }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const sha = (process.env.NEXT_PUBLIC_COMMIT_SHA ?? "").slice(0, 7);
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<HistorialVersiones | null>(null);
  const [cargando, setCargando] = useState(false);

  async function abrir() {
    setAbierto(true);
    if (datos || cargando) return;
    setCargando(true);
    try {
      setDatos(await getHistorialVersiones());
    } catch {
      setDatos({ versionActual: version, entorno: "local", versiones: [], pendientes: [] });
    }
    setCargando(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void abrir()}
        title="Ver historial de versiones"
        className={cn("mt-2 block w-full text-center text-[11px] text-muted-foreground hover:underline", colapsado && "lg:hidden")}
      >
        {`v${version}${sha ? ` · ${sha}` : ""}`}
      </button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>SISMANTO v{version}</DialogTitle>
            <DialogDescription>
              {ETIQUETA_ENTORNO[datos?.entorno ?? ""] ?? "Historial"} {sha ? `· commit ${sha}` : ""} — qué cambió en cada versión.
            </DialogDescription>
          </DialogHeader>

          {cargando && <p className="text-sm text-muted-foreground">Cargando…</p>}

          {datos && datos.pendientes.length > 0 && (
            <section className="rounded-md border border-dashed p-3">
              <h3 className="text-sm font-semibold">Pendiente de publicar</h3>
              <p className="mb-2 text-xs text-muted-foreground">Ya está en este entorno, pero aún no tiene número de versión.</p>
              <ul className="space-y-2">
                {datos.pendientes.map((p, i) => (
                  <Cambio key={i} c={p} />
                ))}
              </ul>
            </section>
          )}

          {datos && datos.versiones.length === 0 && !cargando && (
            <p className="text-sm text-muted-foreground">Todavía no hay versiones publicadas en el historial.</p>
          )}

          {datos?.versiones.map((v) => (
            <section key={v.version} className="space-y-2">
              <h3 className="text-base font-semibold">
                v{v.version} <span className="text-sm font-normal text-muted-foreground">— {v.fecha}</span>
              </h3>
              {v.migraciones && <p className="text-xs text-muted-foreground">Migraciones incluidas: {v.migraciones}.</p>}
              {v.secciones.map((s) => (
                <div key={s.titulo}>
                  <h4 className="text-sm font-medium">{s.titulo}</h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {s.cambios.map((c, i) => (
                      <Cambio key={i} c={c} />
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
