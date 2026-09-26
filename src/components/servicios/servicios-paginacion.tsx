import Link from "next/link";
import { cn, formatNumber } from "@/lib/utils";
import { filtrosAQuery, SERVICIOS_POR_PAGINA, type FiltrosServicios } from "@/lib/servicios-lista";

/** "Mostrando 1–100 de 11.153 · Página 1 de 112" con « ‹ 1 2 3 › », como SISRES. */
export function ServiciosPaginacion({
  filtros,
  pagina,
  total,
}: {
  filtros: FiltrosServicios;
  pagina: number;
  total: number;
}) {
  const paginas = Math.max(1, Math.ceil(total / SERVICIOS_POR_PAGINA));
  const actual = Math.min(pagina, paginas);
  const desde = total === 0 ? 0 : (actual - 1) * SERVICIOS_POR_PAGINA + 1;
  const hasta = Math.min(actual * SERVICIOS_POR_PAGINA, total);

  // Ventana de hasta 5 páginas alrededor de la actual.
  const inicio = Math.max(1, Math.min(actual - 2, paginas - 4));
  const numeros = Array.from({ length: Math.min(5, paginas) }, (_, i) => inicio + i);

  const boton = (p: number, contenido: React.ReactNode, etiqueta: string, activo = false, deshabilitado = false) =>
    deshabilitado ? (
      <span
        aria-hidden
        className="flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm text-muted-foreground opacity-50"
      >
        {contenido}
      </span>
    ) : (
      <Link
        href={`/servicios${filtrosAQuery(filtros, p)}`}
        aria-label={etiqueta}
        aria-current={activo ? "page" : undefined}
        className={cn(
          "flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm",
          activo ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
        )}
      >
        {contenido}
      </Link>
    );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <p className="text-sm text-muted-foreground">
        Mostrando{" "}
        <strong className="text-foreground">
          {formatNumber(desde)}–{formatNumber(hasta)}
        </strong>{" "}
        de <strong className="text-foreground">{formatNumber(total)}</strong> · Página {actual} de {paginas}
      </p>
      {paginas > 1 && (
        <nav aria-label="Páginas de servicios" className="flex flex-wrap gap-1">
          {boton(1, "«", "Primera página", false, actual === 1)}
          {boton(actual - 1, "‹", "Página anterior", false, actual === 1)}
          {numeros.map((n) => (
            <span key={n}>{boton(n, n, `Página ${n}`, n === actual)}</span>
          ))}
          {boton(actual + 1, "›", "Página siguiente", false, actual === paginas)}
          {boton(paginas, "»", "Última página", false, actual === paginas)}
        </nav>
      )}
    </div>
  );
}
