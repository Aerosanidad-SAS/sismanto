import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/app/api/actions/auth";
import { listarActasEntrega } from "@/app/api/actions/formatos-ti-acta-entrega";
import { ActaEntregaTabla } from "@/components/formatos-ti/acta-entrega-tabla";
import { FormatosPaginacion } from "@/components/formatos-ti/formatos-paginacion";
import { ROLES_FORMATOS_TI, paramPagina, paramTexto } from "@/lib/formatos-ti/comun";

export default async function ActaEntregaPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole([...ROLES_FORMATOS_TI]);
  const filtros = {
    q: paramTexto(searchParams, "q"),
    tipo: ["CELULAR", "GENERAL"].includes(paramTexto(searchParams, "tipo")) ? paramTexto(searchParams, "tipo") : "",
    sede: paramTexto(searchParams, "sede", 100),
  };
  const pagina = paramPagina(searchParams);
  const { actas, total, sedes, error } = await listarActasEntrega({ ...filtros, pagina });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Acta de entrega de equipos</h1>
        <p className="mt-2 text-muted-foreground">
          Formatos G-TECN-F 028 (celulares) y F 031 (equipos) del Sistema Integrado de Gestión, con firma digital.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actas registradas</CardTitle>
          <CardDescription>Solo Administración y Analista (área de Sistemas)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista: {error}
            </p>
          )}
          <ActaEntregaTabla actas={actas} sedes={sedes} filtros={filtros} />
          <FormatosPaginacion ruta="/formatos-ti/acta-entrega" filtros={filtros} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
