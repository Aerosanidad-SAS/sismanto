import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getNotificacionesInventario } from "@/app/api/actions/inventario-notificaciones";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificacionesInventario } from "@/components/equipos/notificaciones-inventario";

export default async function NotificacionesInventarioPage() {
  // Solo Administrador (SISRES: act_configurar_notificaciones_inventario, cargo 1).
  await requireRole(["ADMIN"]);
  const config = await getNotificacionesInventario();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/equipos" className="text-sm text-muted-foreground underline">
          ← Volver a equipos biomédicos
        </Link>
        <h1 className="mt-2 text-3xl">Avisos de vencimiento del inventario</h1>
        <p className="mt-2 text-muted-foreground">
          Cada día se envía un correo por área con los mantenimientos, calibraciones y parches que están por vencer (30,
          15, 7, 3 y 1 días antes) o ya vencidos. Aquí se elige a quién le llega el de cada área.
        </p>
      </div>
      {"error" in config ? (
        <Alert variant="destructive">
          <AlertDescription>{String(config.error)}</AlertDescription>
        </Alert>
      ) : (
        <NotificacionesInventario inicial={config} />
      )}
    </div>
  );
}
