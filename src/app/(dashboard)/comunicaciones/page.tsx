import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampanas } from "@/app/api/actions/campanas";
import { getProfile } from "@/app/api/actions/auth";
import { CampanasPanel } from "@/components/comunicaciones/campanas-panel";

const ROLES_EDICION = ["ADMIN", "COORDINACION", "ANALISTA"];

// procesarLoteCampana pausa 2 s entre envíos reales: un lote tarda ~10 s,
// más que el tiempo por defecto de una función en Vercel.
export const maxDuration = 60;

export default async function ComunicacionesPage() {
  const [profile, campanas] = await Promise.all([getProfile(), getCampanas()]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const whatsappConfigurado = Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  const completadas = campanas.filter((c) => c.estado === "COMPLETADA").length;
  const enProceso = campanas.filter((c) => c.estado === "EN_PROCESO").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Comunicaciones</h1>
        <p className="mt-2 text-muted-foreground">
          Campañas de WhatsApp con plantillas aprobadas de Meta.
          {!whatsappConfigurado &&
            " Este entorno no tiene credenciales de WhatsApp: los envíos se simulan (modo staging)."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campanas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{enProceso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completadas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campañas WhatsApp</CardTitle>
          <CardDescription>
            Cada campaña usa una plantilla aprobada en el WhatsApp Business Manager de Meta. El
            procesamiento va por lotes de 5 destinatarios, con una pausa entre envíos para respetar
            los límites de Meta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampanasPanel campanas={campanas} puedeEditar={puedeEditar} />
        </CardContent>
      </Card>
    </div>
  );
}
