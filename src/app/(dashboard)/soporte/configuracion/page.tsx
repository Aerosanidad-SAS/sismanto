import { requireRole } from "@/app/api/actions/auth";
import {
  getCatalogosConfig,
  getConfigTickets,
  getCorreosGestores,
  getDisponibilidad,
} from "@/app/api/actions/tickets-config";
import { ConfiguracionSoporte } from "@/components/soporte/configuracion-soporte";

export default async function ConfiguracionSoportePage() {
  // Solo Administrador (act_configurar_catalogos_ticket en SISRES).
  await requireRole(["ADMIN"]);

  const [config, catalogos, correos, disponibilidad] = await Promise.all([
    getConfigTickets(),
    getCatalogosConfig(),
    getCorreosGestores(),
    getDisponibilidad(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Configuración de soporte</h1>
        <p className="mt-2 text-muted-foreground">Catálogos, SLA, horario laboral, correos y disponibilidad del soporte técnico.</p>
      </div>
      <ConfiguracionSoporte
        config={config}
        catalogos={catalogos ?? { sedes: [], areas: [], categorias: [] }}
        correos={correos}
        disponibilidad={disponibilidad}
      />
    </div>
  );
}
