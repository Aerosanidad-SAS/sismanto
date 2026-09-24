import { Card, CardContent } from "@/components/ui/card";
import { getDirectorioProveedores } from "@/app/api/actions/directorios";
import { DirectorioTabla } from "@/components/directorio/directorio-tabla";

export default async function ProveedoresPage() {
  const proveedores = await getDirectorioProveedores();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Proveedores</h1>
        <p className="mt-2 text-muted-foreground">Prestadores y proveedores de servicios de salud.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <DirectorioTabla
            filas={proveedores}
            columnas={[
              { campo: "nombre", titulo: "Nombre" },
              { campo: "numero", titulo: "Documento" },
              { campo: "area", titulo: "Área" },
              { campo: "ciudad", titulo: "Ciudad" },
              { campo: "telefono1", titulo: "Teléfono" },
              { campo: "correo", titulo: "Correo" },
            ]}
            // Los mismos filtros que agregó SISRES a mostrarProveedores.php (2026-08-28).
            filtros={[
              { campo: "ciudad", titulo: "Ciudad" },
              { campo: "area", titulo: "Área" },
            ]}
            vacio="Todavía no hay proveedores cargados (llegan con la migración de datos de SISRES)."
          />
        </CardContent>
      </Card>
    </div>
  );
}
