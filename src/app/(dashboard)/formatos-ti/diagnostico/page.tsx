import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/app/api/actions/auth";
import { listarDiagnosticos } from "@/app/api/actions/formatos-ti-diagnostico";
import { DiagnosticoTabla } from "@/components/formatos-ti/diagnostico-tabla";
import { FormatosPaginacion } from "@/components/formatos-ti/formatos-paginacion";
import { ROLES_FORMATOS_TI, paramPagina, paramTexto } from "@/lib/formatos-ti/comun";

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole([...ROLES_FORMATOS_TI]);
  const tipo = paramTexto(searchParams, "tipo");
  const filtros = {
    q: paramTexto(searchParams, "q"),
    tipo: ["PREVENTIVO", "CORRECTIVO"].includes(tipo) ? tipo : "",
    sede: paramTexto(searchParams, "sede", 100),
  };
  const pagina = paramPagina(searchParams);
  const { filas, total, sedes, error } = await listarDiagnosticos({ ...filtros, pagina });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Diagnóstico de mantenimiento de equipos</h1>
        <p className="mt-2 text-muted-foreground">
          Formato G-TECN-F 047 del Sistema Integrado de Gestión, con listado de chequeo, repuestos y firma digital.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos registrados</CardTitle>
          <CardDescription>Solo Administración y Analista (área de Sistemas)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista: {error}
            </p>
          )}
          <DiagnosticoTabla filas={filas} sedes={sedes} filtros={filtros} />
          <FormatosPaginacion ruta="/formatos-ti/diagnostico" filtros={filtros} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
