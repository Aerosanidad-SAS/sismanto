import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/app/api/actions/auth";
import { listarAuditoria } from "@/app/api/actions/auditoria";
import {
  ACCIONES_AUDITORIA,
  AUDITORIA_POR_PAGINA,
  ENTIDADES_AUDITORIA,
  auditoriaAQuery,
  leerFiltrosAuditoria,
} from "@/lib/auditoria-lista";
import { cn, formatNumber } from "@/lib/utils";

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const VARIANTE: Record<string, "default" | "secondary" | "destructive" | "success" | "outline"> = {
  INSERTAR: "success",
  MODIFICAR: "default",
  ELIMINAR: "destructive",
  ERROR: "destructive",
  LOGIN: "secondary",
  LOGOUT: "outline",
  NOTIFICAR: "secondary",
  EXPORTAR: "secondary",
};

/** "24/09/2026 09:15:03" en hora de Colombia. */
function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default async function AuditoriaPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  await requireRole(["ADMIN"]);
  const filtros = leerFiltrosAuditoria(searchParams);
  const { filas, total, error } = await listarAuditoria(filtros);

  const paginas = Math.max(1, Math.ceil(total / AUDITORIA_POR_PAGINA));
  const actual = Math.min(filtros.pagina, paginas);
  const hayFiltros = !!(filtros.usuario || filtros.accion || filtros.entidad || filtros.desde || filtros.hasta);
  const enlace = (p: number) => `/auditoria${auditoriaAQuery(filtros, p)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Bitácora de auditoría</h1>
        <p className="mt-2 text-muted-foreground">Quién hizo qué y cuándo. Registro inmutable: nadie puede editarlo ni borrarlo desde la aplicación.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatNumber(total)} eventos</CardTitle>
          <CardDescription>Solo el Administrador. Horas en hora de Colombia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <Input name="usuario" defaultValue={filtros.usuario} placeholder="Usuario" aria-label="Usuario" />
            <select name="accion" defaultValue={filtros.accion} className={CLASE_SELECT} aria-label="Acción">
              <option value="">Todas las acciones</option>
              {ACCIONES_AUDITORIA.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select name="entidad" defaultValue={filtros.entidad} className={CLASE_SELECT} aria-label="Módulo">
              <option value="">Todos los módulos</option>
              {ENTIDADES_AUDITORIA.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <Input type="date" name="desde" defaultValue={filtros.desde} aria-label="Desde" />
            <Input type="date" name="hasta" defaultValue={filtros.hasta} aria-label="Hasta" />
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Filtrar
              </Button>
              {hayFiltros && (
                <Button asChild variant="ghost">
                  <Link href="/auditoria">Limpiar</Link>
                </Button>
              )}
            </div>
          </form>

          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la bitácora: {error}
            </p>
          )}

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {hayFiltros ? "Sin eventos para esos filtros." : "Todavía no hay eventos registrados."}
                    </TableCell>
                  </TableRow>
                )}
                {filas.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="whitespace-nowrap">{fechaHora(f.at)}</TableCell>
                    <TableCell>{f.user_label || "—"}</TableCell>
                    <TableCell>{f.role || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={VARIANTE[f.action] ?? "outline"}>{f.action}</Badge>
                    </TableCell>
                    <TableCell>{f.entity}</TableCell>
                    <TableCell>{f.entity_id || "—"}</TableCell>
                    <TableCell className="max-w-md">{f.detail || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{f.ip || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Página {actual} de {paginas}
            </p>
            {paginas > 1 && (
              <nav aria-label="Páginas de la bitácora" className="flex gap-1">
                {[
                  { p: actual - 1, txt: "‹ Anterior", off: actual === 1 },
                  { p: actual + 1, txt: "Siguiente ›", off: actual === paginas },
                ].map((b) =>
                  b.off ? (
                    <span key={b.txt} aria-hidden className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground opacity-50">
                      {b.txt}
                    </span>
                  ) : (
                    <Link key={b.txt} href={enlace(b.p)} className={cn("flex h-9 items-center rounded-md border bg-background px-3 text-sm hover:bg-muted")}>
                      {b.txt}
                    </Link>
                  )
                )}
              </nav>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
