import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServiciosMedicos } from "@/app/api/actions/servicios-medicos";
import { getClientes } from "@/app/api/actions/clientes";
import { getProfile } from "@/app/api/actions/auth";
import { ServiciosTabla } from "@/components/servicios/servicios-tabla";

const ROLES_EDICION = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA"];

async function getVehiculosActivos() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("vehicles")
      .select("id, placa")
      .eq("estado_actual", "OPERATIVO")
      .order("placa");
    return data || [];
  } catch {
    return [];
  }
}

export default async function ServiciosPage() {
  const [profile, servicios, vehiculos, clientes] = await Promise.all([
    getProfile(),
    getServiciosMedicos(),
    getVehiculosActivos(),
    getClientes(),
  ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");

  const programados = servicios.filter((s) => s.etapa === "PROGRAMADO").length;
  const enCurso = servicios.filter((s) => s.etapa === "CURSO").length;
  const finalizados = servicios.filter((s) => s.etapa === "FINALIZADO").length;
  const cerradosSinExito = servicios.filter((s) =>
    ["CANCELADO", "FALLIDO", "NO EFECTIVO"].includes(s.etapa)
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Servicios médicos</h1>
        <p className="mt-2 text-muted-foreground">
          Despacho y seguimiento de traslados y servicios asistenciales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{programados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{enCurso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finalizados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelados / fallidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cerradosSinExito}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de servicios</CardTitle>
          <CardDescription>
            Últimos 500 servicios. El cambio rápido de etapa usa guarda optimista: si otro usuario
            ya movió el servicio, el cambio se rechaza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiciosTabla
            servicios={servicios}
            vehiculos={vehiculos}
            clientes={clientes.map((c) => c.nombre)}
            puedeEditar={puedeEditar}
          />
        </CardContent>
      </Card>
    </div>
  );
}
