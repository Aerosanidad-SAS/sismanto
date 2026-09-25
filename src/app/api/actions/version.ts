"use server";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/app/api/actions/auth";
import { leerPendiente, leerVersiones, type Pendiente, type Version } from "@/lib/changelog";

// Historial de versiones para el diálogo del menú lateral. Cualquier usuario con sesión puede verlo: el contenido
// es lo mismo que está en CHANGELOG.md (repositorio público) y está escrito para el usuario final.
// Los archivos se leen del despliegue (next.config.mjs → outputFileTracingIncludes los incluye). Si por lo que sea
// no están, se devuelve vacío: el diálogo lo dice, nunca rompe la pantalla.

export interface HistorialVersiones {
  versionActual: string;
  entorno: string;
  versiones: Version[];
  /** Cambios ya mergeados a dev que todavía no tienen versión. Solo se muestran fuera de producción. */
  pendientes: Pendiente[];
}

async function leerTexto(ruta: string): Promise<string | null> {
  try {
    return await readFile(path.join(process.cwd(), ruta), "utf8");
  } catch {
    return null;
  }
}

export async function getHistorialVersiones(): Promise<HistorialVersiones> {
  await requireAuth();
  const entorno = process.env.NEXT_PUBLIC_APP_ENV ?? "local";

  const changelog = await leerTexto("CHANGELOG.md");
  const versiones = changelog ? leerVersiones(changelog) : [];

  const pendientes: Pendiente[] = [];
  if (entorno !== "production") {
    try {
      const dir = path.join(process.cwd(), "changelog", "unreleased");
      for (const nombre of (await readdir(dir)).filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md").sort()) {
        const contenido = await leerTexto(path.join("changelog", "unreleased", nombre));
        const pendiente = contenido ? leerPendiente(contenido) : null;
        if (pendiente) pendientes.push(pendiente);
      }
    } catch {
      // sin carpeta de pendientes en este despliegue
    }
  }

  return { versionActual: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0", entorno, versiones, pendientes };
}
