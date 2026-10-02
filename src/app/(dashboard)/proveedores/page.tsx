import { Card, CardContent } from "@/components/ui/card";
import { getProfile } from "@/app/api/actions/auth";
import { getDirectorioProveedores } from "@/app/api/actions/directorios";
import { PrestadoresDirectorio } from "@/components/proveedores/prestadores-directorio";
import { puedeEditarPrestadores } from "@/lib/prestadores";


export const metadata = { title: "Proveedores" };

export default async function ProveedoresPage() {
  const [proveedores, profile] = await Promise.all([getDirectorioProveedores(), getProfile()]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Proveedores</h1>
        <p className="mt-2 text-muted-foreground">Prestadores y proveedores de servicios de salud.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <PrestadoresDirectorio filas={proveedores} puedeEditar={puedeEditarPrestadores(profile?.role_codigo)} />
        </CardContent>
      </Card>
    </div>
  );
}
