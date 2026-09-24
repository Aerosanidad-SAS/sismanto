import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/app/api/actions/auth";
import { listarPrestamos } from "@/app/api/actions/formatos-ti-prestamo";
import { FormatosPaginacion } from "@/components/formatos-ti/formatos-paginacion";
import { PrestamoTabla } from "@/components/formatos-ti/prestamo-tabla";
import { ROLES_FORMATOS_TI, paramPagina, paramTexto } from "@/lib/formatos-ti/comun";

export default async function PrestamoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole([...ROLES_FORMATOS_TI]);
  const estado = paramTexto(searchParams, "estado");
  const filtros = {
    q: paramTexto(searchParams, "q"),
    estado: ["PRESTADO", "DEVUELTO"].includes(estado) ? estado : "",
  };
  const pagina = paramPagina(searchParams);
  const { filas, total, error } = await listarPrestamos({ ...filtros, pagina });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Entrega y préstamo de equipos</h1>
        <p className="mt-2 text-muted-foreground">
          Formato G-TECN-F 018 del Sistema Integrado de Gestión: entrega con dos firmas y devolución con dos firmas más.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Préstamos registrados</CardTitle>
          <CardDescription>Solo Administración y Analista (área de Sistemas)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista: {error}
            </p>
          )}
          <PrestamoTabla filas={filas} filtros={filtros} />
          <FormatosPaginacion ruta="/formatos-ti/prestamo" filtros={filtros} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
