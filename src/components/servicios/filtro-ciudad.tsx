"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CIUDADES_SERVICIO, prefijoCiudad } from "@/lib/servicios-lista";
import { cn } from "@/lib/utils";

const OPCIONES = [{ clave: "", nombre: "Ambas" }, ...CIUDADES_SERVICIO];

/** Selector segmentado Ambas / Bogotá / Medellín. Solo dibuja; quien lo usa decide qué hacer con la elección. */
export function FiltroCiudad({
  valor,
  onChange,
  className,
  conEtiqueta = true,
}: {
  valor: string;
  onChange: (clave: string) => void;
  className?: string;
  /** Muestra «Ciudad» encima (en franjas de filtros con etiquetas). */
  conEtiqueta?: boolean;
}) {
  const idEtiqueta = useId();
  return (
    <div className={cn("space-y-1", className)}>
      {conEtiqueta && (
        <span id={idEtiqueta} className="block text-[11px] font-medium leading-none text-muted-foreground">
          Ciudad
        </span>
      )}
      <div
        role="radiogroup"
        aria-label={conEtiqueta ? undefined : "Ciudad"}
        aria-labelledby={conEtiqueta ? idEtiqueta : undefined}
        className="inline-flex h-8 overflow-hidden rounded-md border border-input"
      >
        {OPCIONES.map((c) => {
          const activa = valor === c.clave;
          return (
            <button
              key={c.clave || "ambas"}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => onChange(c.clave)}
              className={cn("px-3 text-sm transition-colors", activa ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
            >
              {c.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Versión atada a la URL (`?ciudad=bogota|medellin`): la elección se conserva al recargar y al compartir el enlace, y la
 * página (servidor) filtra con ella. Conserva el resto de parámetros y vuelve a la página 1.
 */
export function FiltroCiudadUrl({ className, conEtiqueta = false }: { className?: string; conEtiqueta?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const actual = search.get("ciudad") ?? "";
  const valor = prefijoCiudad(actual) ? actual : "";

  return (
    <FiltroCiudad
      valor={valor}
      conEtiqueta={conEtiqueta}
      className={className}
      onChange={(clave) => {
        const sp = new URLSearchParams(search.toString());
        if (clave) sp.set("ciudad", clave);
        else sp.delete("ciudad");
        sp.delete("pagina");
        const qs = sp.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      }}
    />
  );
}
