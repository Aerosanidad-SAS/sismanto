import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/app/api/actions/auth";
import { listarBajas } from "@/app/api/actions/formatos-ti-baja";
import { BajaTabla } from "@/components/formatos-ti/baja-tabla";
import { FormatosPaginacion } from "@/components/formatos-ti/formatos-paginacion";
import { CAUSAS_BAJA } from "@/lib/formatos-ti/baja";
import { ROLES_FORMATOS_TI, paramPagina, paramTexto } from "@/lib/formatos-ti/comun";

export default async function BajaPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole([...ROLES_FORMATOS_TI]);
  const tipo = paramTexto(searchParams, "tipo");
  const causa = paramTexto(searchParams, "causa");
  const filtros = {
    q: paramTexto(searchParams, "q"),
    tipo: ["INFORMATICO", "BIOMEDICO"].includes(tipo) ? tipo : "",
    causa: causa in CAUSAS_BAJA ? causa : "",
  };
  const pagina = paramPagina(searchParams);
  const { filas, total, error } = await listarBajas({ ...filtros, pagina });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Baja de dispositivos informáticos y biomédicos</h1>
        <p className="mt-2 text-muted-foreground">Formato G-TECN-F 020 del Sistema Integrado de Gestión, con firma digital del responsable.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bajas registradas</CardTitle>
          <CardDescription>Solo Administración y Analista (área de Sistemas)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista: {error}
            </p>
          )}
          <BajaTabla filas={filas} filtros={filtros} />
          <FormatosPaginacion ruta="/formatos-ti/baja" filtros={filtros} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
