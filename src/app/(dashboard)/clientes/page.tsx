import { Card, CardContent } from "@/components/ui/card";
import { getDirectorioClientes } from "@/app/api/actions/directorios";
import { getClientes } from "@/app/api/actions/clientes";
import { getProfile } from "@/app/api/actions/auth";
import { DirectorioTabla } from "@/components/directorio/directorio-tabla";
import { ClientesTab, type ClienteRow } from "@/components/configuracion/clientes-tab";
import { puedeDesactivarCliente, puedeEscribirClientes } from "@/lib/clientes-reglas";

export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const profile = await getProfile();
  // Quien puede registrar y editar (Admin, Analista y Regulación, como en SISRES) ve la tabla con acciones; el resto,
  // el directorio de consulta.
  const puedeEscribir = puedeEscribirClientes(profile?.role_codigo);
  const clientes = puedeEscribir ? ((await getClientes()) as ClienteRow[]) : await getDirectorioClientes();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Clientes</h1>
        <p className="mt-2 text-muted-foreground">
          Clientes y aseguradoras.{puedeEscribir ? "" : " Para crear o editar, Configuración."}
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {puedeEscribir ? (
            <ClientesTab clientes={clientes as ClienteRow[]} puedeEliminar={puedeDesactivarCliente(profile?.role_codigo)} />
          ) : (
            <DirectorioTabla
              filas={clientes as Record<string, string | number | null>[]}
              columnas={[
                { campo: "nombre", titulo: "Nombre" },
                { campo: "numero", titulo: "Documento" },
                { campo: "sector", titulo: "Sector" },
                { campo: "ciudad", titulo: "Ciudad" },
                { campo: "telefono1", titulo: "Teléfono" },
                { campo: "correo", titulo: "Correo" },
              ]}
              filtros={[{ campo: "ciudad", titulo: "Ciudad" }]}
              vacio="Todavía no hay clientes cargados."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
