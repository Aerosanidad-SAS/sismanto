import { requireRole } from "@/app/api/actions/auth";
import { getEstadoIntegraciones } from "@/app/api/actions/integraciones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IntegracionesForm } from "@/components/admin/integraciones-form";

export default async function IntegracionesPage() {
  await requireRole(["ADMIN"]);
  const estado = await getEstadoIntegraciones();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Integraciones</h1>
        <p className="mt-2 text-muted-foreground">
          Credenciales y parámetros de los servicios externos. Si un campo queda vacío se usa la variable de entorno del
          servidor, si existe. Las llaves nunca se muestran completas.
        </p>
      </div>
      {"error" in estado ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.error}</AlertDescription>
        </Alert>
      ) : (
        <IntegracionesForm estado={estado} />
      )}
    </div>
  );
}
