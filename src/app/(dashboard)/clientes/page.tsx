import { Card, CardContent } from "@/components/ui/card";
import { getDirectorioClientes } from "@/app/api/actions/directorios";
import { DirectorioTabla } from "@/components/directorio/directorio-tabla";

export default async function ClientesPage() {
  const clientes = await getDirectorioClientes();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Clientes</h1>
        <p className="mt-2 text-muted-foreground">Clientes y aseguradoras. Para crear o editar, Configuración.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <DirectorioTabla
            filas={clientes}
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
        </CardContent>
      </Card>
    </div>
  );
}
