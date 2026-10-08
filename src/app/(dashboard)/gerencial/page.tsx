import { esDia, hoyBogota, sumarDias, sumarMeses } from "@/lib/fechas";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { getEstadisticasServiciosPorCiudad, getResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { getAlertasBiomedicos } from "@/app/api/actions/inventario-biomedico";
import { getCostosPorVehiculo } from "@/app/api/actions/dashboard-metrics";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, KpiCaption, KpiValue } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { ServiciosPorCiudadChart } from "@/components/gerencial/gerencial-charts";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import { CostoPorVehiculoCard } from "@/components/dashboard/costo-por-vehiculo-card";
import { DashboardTabs, type DashboardTabDef } from "@/components/dashboard/dashboard-tabs";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { FiltroCiudadUrl } from "@/components/servicios/filtro-ciudad";
import { prefijoCiudad } from "@/lib/servicios-lista";
import { puedeVerPestanaDashboard } from "@/lib/dashboard-tabs";
import { Activity, Ambulance, DollarSign, Truck } from "lucide-react";

export const metadata = { title: "Gerencial" };

const ROLES_PERMITIDOS = ["ADMIN", "GERENCIAL"];
interface VencimientoFila {
  placa: string;
  fecha: string;
}

// "2026-01-15" → "15 ene 2026" (mismo formato que usa Dashboard para el período de Costo).
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;
const formatFechaCortaPeriodo = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MESES_CORTOS[m - 1]} ${y}`;
};

async function getDatosGerenciales() {
  const supabase = createClient();

  const hoyIso = hoyBogota();

  const [{ data: vehiclesRaw }, estadisticasCiudad, resumenHoy, biomedicos, { data: revenueRaw }, { data: centrosRaw }] = await Promise.all([
    supabase.from("vehicles").select("placa, estado_actual, centro_operativo, vencimiento_soat, vencimiento_rtm, vencimiento_tecnicomecanica, fecha_pase_aeroportuario"),
    getEstadisticasServiciosPorCiudad(),
    getResumenOperativoDiario({ desde: hoyIso, hasta: hoyIso }),
    getAlertasBiomedicos(),
    supabase
      .from("vehicle_service_revenue")
      .select("periodo, monto")
      .gte("periodo", sumarMeses(hoyIso, -3)),
    supabase.from("operational_centers").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  const vehicles = (vehiclesRaw ?? []).filter((v) => !isReferenceSparkCombustionPlaca(v.placa));

  const hoy = hoyIso;
  const limite = sumarDias(hoy, 30);
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
    resumenHoy,
    biomedicos,
    ingresos3Meses,
    centros: centrosRaw ?? [],
  };
}

export default async function GerencialPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const pedida = uno(searchParams.ciudad);
  const ciudad = prefijoCiudad(pedida) ? (pedida as string) : "";
  const profile = await getProfile();
  if (!profile || !ROLES_PERMITIDOS.includes(profile.role_codigo)) {
    redirect("/");
  }

  const datos = await getDatosGerenciales();

  const defaultInicio = "2024-01-01";
  const defaultFin = hoyBogota();
  const inicioParam = uno(searchParams.inicio)?.trim();
  const finParam = uno(searchParams.fin)?.trim();
  const fechaInicio = esDia(inicioParam) ? inicioParam! : defaultInicio;
  const fechaFin = esDia(finParam) ? finParam! : defaultFin;
  const tipoCosto = (uno(searchParams.tipoCosto) as "AMBOS" | "PREVENTIVO" | "CORRECTIVO") || "AMBOS";
  const costoCentroParam = uno(searchParams.costoCentro);
  const costoCentroId = costoCentroParam ? parseInt(costoCentroParam, 10) : undefined;
  const centroValidoCosto = costoCentroId != null && !Number.isNaN(costoCentroId) ? costoCentroId : undefined;
  const costoPlacas = uno(searchParams.costoPlacas) || "";
  const costoBusqueda = uno(searchParams.costoBusqueda) || "";

  const puedeVerServicios = puedeVerPestanaDashboard("servicios", profile.role_codigo);
  const puedeVerBiomedicos = puedeVerPestanaDashboard("biomedicos", profile.role_codigo);
  const puedeVerFinanciero = puedeVerPestanaDashboard("financiero", profile.role_codigo);

  const costos = puedeVerFinanciero
    ? await getCostosPorVehiculo(fechaInicio, fechaFin, tipoCosto, {
        centroOperativoId: centroValidoCosto,
        placasCsv: costoPlacas,
        textoTrabajo: costoBusqueda,
      })
    : [];

  const contenidoOperacion = (
    <div className="space-y-8">
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
    </div>
  );

  const contenidoServicios = (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">Servicios — Bogotá y Medellín</h2>
          <HelpTrigger text="Segmentado por ciudad de registro: la del CRA al que está asignado el usuario de Regulación que recibió la solicitud (un servicio de Medellín a Chocó recibido por el CRA Medellín cuenta como Medellín). Es texto libre, sin catálogo cerrado." />
        </div>
        <FiltroCiudadUrl />
      </div>
      <ResumenOperativo inicial={datos.resumenHoy} ciudad={ciudad} />
      <ServiciosPorCiudadChart inicial={datos.estadisticasCiudad} ciudad={ciudad} />
    </section>
  );

  const contenidoBiomedicos = (
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
  );

  const contenidoFinanciero = (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
          <KpiCard
            title="Costo"
            icon={DollarSign}
            help={<HelpTrigger text="Costo total de operación (mantenimiento + combustible + costos fijos prorrateados) para el período elegido." />}
          >
            <KpiValue>{formatCurrency(costos.reduce((sum, c) => sum + c.costoTotal, 0))}</KpiValue>
            <KpiCaption>
              {formatFechaCortaPeriodo(fechaInicio)} – {formatFechaCortaPeriodo(fechaFin)}
            </KpiCaption>
          </KpiCard>
        </div>
        <CostoPorVehiculoCard
          datos={costos}
          tipo={tipoCosto}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          centros={datos.centros}
          centroIdFiltro={centroValidoCosto}
          placasFiltro={costoPlacas}
          textoTrabajo={costoBusqueda}
        />
      </section>

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

  const tabs: DashboardTabDef[] = [
    {
      key: "operacion",
      label: "Vehículos y Operación",
      icon: <Truck className="h-4 w-4" aria-hidden />,
      content: contenidoOperacion,
    },
    ...(puedeVerServicios
      ? [{ key: "servicios", label: "Servicios", icon: <Ambulance className="h-4 w-4" aria-hidden />, content: contenidoServicios }]
      : []),
    ...(puedeVerBiomedicos
      ? [{ key: "biomedicos", label: "Biomédicos", icon: <Activity className="h-4 w-4" aria-hidden />, content: contenidoBiomedicos }]
      : []),
    ...(puedeVerFinanciero
      ? [{ key: "financiero", label: "Financiero", icon: <DollarSign className="h-4 w-4" aria-hidden />, content: contenidoFinanciero }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Tablero ejecutivo</h1>
        <p className="mt-2 text-muted-foreground">
          Vista de alto nivel para Gerencia y Junta Directiva — servicios, flota, vencimientos, equipos
          biomédicos e ingresos.
        </p>
      </div>

      <DashboardTabs tabs={tabs} defaultTab="servicios" />
    </div>
  );
}
