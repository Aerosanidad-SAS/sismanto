import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getCamposObligatoriosModulo } from "@/app/api/actions/campos-obligatorios";
import { ConfiguracionCamposObligatorios } from "@/components/admin/configuracion-campos-obligatorios";
import { MODULOS_CAMPOS, MODULOS_CONFIGURABLES, esModuloCampos } from "@/lib/campos-obligatorios";
import { cn } from "@/lib/utils";

interface Props {
  searchParams: { modulo?: string };
}

export default async function CamposObligatoriosPage({ searchParams }: Props) {
  // Solo Administrador (SISRES: act_configurar_campos_* por módulo).
  await requireRole(["ADMIN"]);
  const modulo = searchParams.modulo && esModuloCampos(searchParams.modulo) ? searchParams.modulo : MODULOS_CONFIGURABLES[0];
  const obligatorios = await getCamposObligatoriosModulo(modulo);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Campos obligatorios</h1>
        <p className="mt-2 text-muted-foreground">
          Marca qué campos opcionales de cada formulario deben llenarse siempre. Se aplica desde el próximo registro o
          edición. (Captación aeroportuaria tiene su propia configuración en su módulo.)
        </p>
      </div>
      {MODULOS_CONFIGURABLES.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="Módulo">
          {MODULOS_CONFIGURABLES.map((m) => (
            <Link
              key={m}
              href={`/admin/campos-obligatorios?modulo=${m}`}
              className={cn("rounded-md border px-3 py-1.5 text-sm", m === modulo ? "bg-muted font-medium" : "hover:bg-muted")}
            >
              {MODULOS_CAMPOS[m].etiqueta}
            </Link>
          ))}
        </nav>
      )}
      <ConfiguracionCamposObligatorios key={modulo} modulo={modulo} obligatorios={obligatorios} />
    </div>
  );
}
