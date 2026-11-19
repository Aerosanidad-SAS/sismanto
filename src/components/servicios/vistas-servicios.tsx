import Link from "next/link";
import { cn } from "@/lib/utils";

export type VistaServicios = "hoy" | "estancados" | "todos";

/** Vista activa según los filtros de la URL; null si la persona armó otro rango a mano. */
export function vistaActiva(
  filtros: { desde?: string; hasta?: string; sinGestionar?: string; sinGestionarUnidad?: string; etapa?: string },
  hoy: string,
  dias: number
): VistaServicios | null {
  const otros = Boolean(filtros.etapa);
  if (filtros.sinGestionar === String(dias) && (filtros.sinGestionarUnidad ?? "dia") === "dia" && !filtros.desde && !filtros.hasta) return "estancados";
  if (filtros.desde === hoy && filtros.hasta === hoy && !filtros.sinGestionar && !otros) return "hoy";
  if (!filtros.desde && !filtros.hasta && !filtros.sinGestionar && !otros) return "todos";
  return null;
}

/**
 * Vistas de la pantalla Servicios (diseño «Sala de control»): Hoy y Estancados (abiertos de más de 3 días), con su conteo.
 * Cada una es un enlace que fija los filtros de siempre, así que se combina con la búsqueda, el cliente y el tipo.
 */
export function VistasServicios({
  activa,
  hoy,
  dias,
  conteo,
}: {
  activa: VistaServicios | null;
  hoy: string;
  dias: number;
  conteo: { hoy: number; estancados: number };
}) {
  const vistas: { clave: VistaServicios; etiqueta: string; href: string; n: number | null }[] = [
    { clave: "hoy", etiqueta: "Hoy", href: `/servicios?desde=${hoy}&hasta=${hoy}`, n: conteo.hoy },
    { clave: "estancados", etiqueta: `Estancados (más de ${dias} días)`, href: `/servicios?sinGestionar=${dias}&sinGestionarUnidad=dia`, n: conteo.estancados },
    { clave: "todos", etiqueta: "Todos", href: "/servicios", n: null },
  ];
  return (
    <nav aria-label="Vista" className="flex flex-wrap gap-2">
      {vistas.map((v) => (
        <Link
          key={v.clave}
          href={v.href}
          aria-current={activa === v.clave ? "page" : undefined}
          className={cn(
            "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium",
            activa === v.clave ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-muted"
          )}
        >
          {v.etiqueta}
          {v.n !== null && (
            <span
              className={cn(
                "min-w-[1.375rem] rounded-full px-1.5 text-center text-xs font-semibold leading-5 tabular-nums",
                activa === v.clave ? "bg-white/20" : "bg-muted"
              )}
            >
              {v.n}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
