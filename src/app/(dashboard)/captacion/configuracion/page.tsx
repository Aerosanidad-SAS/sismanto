import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getCamposObligatorios } from "@/app/api/actions/captacion";
import { ConfiguracionCaptacion } from "@/components/captacion/configuracion-captacion";

export default async function ConfiguracionCaptacionPage() {
  // Solo Administrador (SISRES: «Configurar Captación» es del cargo 1).
  await requireRole(["ADMIN"]);
  const obligatorios = await getCamposObligatorios();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/captacion" className="text-sm text-muted-foreground underline">
          ← Volver a las captaciones
        </Link>
        <h1 className="mt-2 text-3xl">Configurar captación</h1>
        <p className="mt-2 text-muted-foreground">Elige qué campos opcionales del formulario deben llenarse siempre.</p>
      </div>
      <ConfiguracionCaptacion obligatorios={obligatorios} />
    </div>
  );
}
