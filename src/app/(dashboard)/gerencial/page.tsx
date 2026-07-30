import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { getEstadisticasServiciosPorCiudad } from "@/app/api/actions/estadisticas-servicios";
import { getAlertasBiomedicos } from "@/app/api/actions/inventario-biomedico";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiciosPorCiudadChart } from "@/components/gerencial/gerencial-charts";
import { HelpTrigger } from "@/components/ui/help-trigger";

const ROLES_PERMITIDOS = ["ADMIN", "GERENCIAL"];
const BOGOTA_TIME_ZONE = "America/Bogota";

const getDateIsoInTimeZone = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
};

interface VencimientoFila {
  placa: string;
  fecha: string;
}

async function getDatosGerenciales() {
  const supabase = createClient();

  const [{ data: vehiclesRaw }, estadisticasCiudad, biomedicos, { data: revenueRaw }] = await Promise.all([
    supabase.from("vehicles").select("placa, estado_actual, centro_operativo, vencimiento_soat, vencimiento_rtm, vencimiento_tecnicomecanica, fecha_pase_aeroportuario"),
    getEstadisticasServiciosPorCiudad(),
    getAlertasBiomedicos(),
    supabase
      .from("vehicle_service_revenue")
      .select("periodo, monto")
      .gte("periodo", new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().slice(0, 10)),
  ]);

  const vehicles = (vehiclesRaw ?? []).filter((v) => !isReferenceSparkCombustionPlaca(v.placa));

  const hoy = getDateIsoInTimeZone(new Date(), BOGOTA_TIME_ZONE);
  const en30Dias = new Date();
  en30Dias.setDate(en30Dias.getDate() + 30);
  const limite = getDateIsoInTimeZone(en30Dias, BOGOTA_TIME_ZONE);
  const enVentana = (fecha: string | null): fecha is string => !!fecha && fecha >= hoy && fecha <= limite;

  const vencimientosSoat: VencimientoFila[] = vehicles
    .filter((v) => enVentana(v.vencimiento_soat))
    .map((v) => ({ placa: v.placa, fecha: v.vencimiento_soat as string }));
  const vencimientosTecno: VencimientoFila[] = vehicles
    .filter((v) => enVentana(v.vencimiento_tecnicomecanica || v.vencimiento_rtm))
    .map((v) => ({ placa: v.placa, fecha: (v.vencimiento_tecnicomecanica || v.vencimiento_rtm) as string }));
  const vencimientosPase: VencimientoFila[] = vehicles
    .filter((v) => enVentana(v.fecha_pase_aeroportuario))
    .map((v) => ({ placa: v.placa, fecha: v.fecha_pase_aeroportuario as string }));

  const porCentro = new Map<string, { operativos: number; fds: number }>();
  for (const v of vehicles) {
    const c = porCentro.get(v.centro_operativo) ?? { operativos: 0, fds: 0 };
    if (v.estado_actual === "OPERATIVO") c.operativos++;
    else c.fds++;
    porCentro.set(v.centro_operativo, c);
  }

  const ingresos3Meses = (revenueRaw ?? []).reduce((sum, r) => sum + Number(r.monto || 0), 0);

  return {
    totalVehiculos: vehicles.length,
    totalOperativos: vehicles.filter((v) => v.estado_actual === "OPERATIVO").length,
    totalFds: vehicles.filter((v) => v.estado_actual === "FUERA_DE_SERVICIO").length,
    porCentro: Array.from(porCentro, ([centro, v]) => ({ centro, ...v })).sort((a, b) => a.centro.localeCompare(b.centro)),
    vencimientosSoat,
    vencimientosTecno,
    vencimientosPase,
    estadisticasCiudad,
    biomedicos,
    ingresos3Meses,
  };
}

export default async function GerencialPage() {
  const profile = await getProfile();
  if (!profile || !ROLES_PERMITIDOS.includes(profile.role_codigo)) {
    redirect("/");
  }

  const datos = await getDatosGerenciales();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Tablero ejecutivo</h1>
        <p className="mt-2 text-muted-foreground">
          Vista de alto nivel para Gerencia y Junta Directiva — servicios, flota, vencimientos, equipos
          biomédicos e ingresos.
        </p>
      </div>

      {/* Servicios por ciudad */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">Servicios — Bogotá y Medellín</h2>
          <HelpTrigger text="Segmentado por texto libre (ciudad de origen del servicio) — no hay un catálogo cerrado de ciudad todavía, así que es una cifra aproximada, no exacta." />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {datos.estadisticasCiudad.map((c) => (
            <Card key={c.ciudad}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.ciudad}</CardTitle>
                <CardDescription>Últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-bold">{c.total30dias}</p>
                  <p className="text-xs text-muted-foreground">Servicios</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{c.pctFinalizados}%</p>
                  <p className="text-xs text-muted-foreground">Finalizados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{c.tiempoTotalPromedio}</p>
                  <p className="text-xs text-muted-foreground">Min. promedio</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ServiciosPorCiudadChart datos={datos.estadisticasCiudad} />
      </section>

      {/* Estado de flota */}
      <section className="space-y-3">
        <h2 className="text-xl">Estado de flota</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total vehículos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{datos.totalVehiculos}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Operativos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">{datos.totalOperativos}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fuera de servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">{datos.totalFds}</CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por centro operativo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {datos.porCentro.map((c) => (
              <Badge key={c.centro} variant="outline" className="text-sm">
                {c.centro}: {c.operativos} operativos · {c.fds} FDS
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Vencimientos de documentos */}
      <section className="space-y-3">
        <h2 className="text-xl">Vencimientos de documentos (próximos 30 días)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">SOAT</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-amber-600">{datos.vencimientosSoat.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tecnomecánica</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-amber-600">{datos.vencimientosTecno.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                Pase aeroportuario
                <HelpTrigger text="Primera vez que este dato se usa en el sistema — la columna existía pero ningún módulo la mostraba todavía." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-amber-600">{datos.vencimientosPase.length}</CardContent>
          </Card>
        </div>
      </section>

      {/* Equipos biomédicos */}
      <section className="space-y-3">
        <h2 className="text-xl">Equipos biomédicos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Equipos activos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{datos.biomedicos.totalActivos}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vencidos / ≤15 días</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">{datos.biomedicos.totalRojas}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vencen en ≤30 días</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-amber-600">{datos.biomedicos.totalNaranjas}</CardContent>
          </Card>
        </div>
      </section>

      {/* Ingresos */}
      <section className="space-y-3">
        <h2 className="text-xl">Ingresos registrados</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Últimos 3 meses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{formatCurrency(datos.ingresos3Meses)}</p>
            <p className="text-xs text-muted-foreground">
              Carga manual mensual por vehículo (Configuración → Vehículos). La asociación automática de cada
              servicio programado por Regulación a un valor facturable, con parámetros que se definan junto con
              Contabilidad, es la siguiente fase.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
