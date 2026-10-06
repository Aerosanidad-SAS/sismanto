import { requireRole } from "@/app/api/actions/auth";
import { getModulosOcultosPorRol } from "@/app/api/actions/permisos";
import { PermisosModulos } from "@/components/admin/permisos-modulos";

export default async function PermisosPage() {
  await requireRole(["ADMIN"]);
  const ocultos = await getModulosOcultosPorRol();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Permisos por rol</h1>
        <p className="mt-2 text-muted-foreground">
          Elige qué módulos del menú ve cada rol. Si alguien abre un módulo oculto, el sistema lo lleva a otro que sí
          tenga. Esto solo restringe la interfaz: qué datos puede leer o cambiar cada rol lo sigue decidiendo la base
          de datos, y desde aquí no se le puede dar a un rol un módulo que no tenga por diseño. El Administrador siempre
          ve todo.
        </p>
      </div>
      <PermisosModulos inicial={ocultos} />
    </div>
  );
}
