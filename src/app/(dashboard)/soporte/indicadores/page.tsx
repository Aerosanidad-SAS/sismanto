import { requireRole } from "@/app/api/actions/auth";
import { getIndicadores } from "@/app/api/actions/tickets-config";
import { IndicadoresSoporte } from "@/components/soporte/indicadores-soporte";

export default async function IndicadoresSoportePage({ searchParams }: { searchParams: { desde?: string; hasta?: string } }) {
  await requireRole(["ADMIN", "ANALISTA", "COORDINACION"]);
  const indicadores = await getIndicadores(searchParams.desde, searchParams.hasta);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Indicadores de soporte</h1>
        <p className="mt-2 text-muted-foreground">Tiempos en horas laborales, según el horario configurado.</p>
      </div>
      {indicadores ? (
        <IndicadoresSoporte datos={indicadores} desde={searchParams.desde} hasta={searchParams.hasta} />
      ) : (
        <p className="text-muted-foreground">No se pudieron cargar los indicadores.</p>
      )}
    </div>
  );
}
