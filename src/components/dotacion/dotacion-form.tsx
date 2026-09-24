"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { getSupplyCheckForToday, submitSupplyCheck } from "@/app/api/actions/ovem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  agruparPorCategoria,
  checklistPayload,
  ChecklistItemRow,
  type ChecklistItem,
  type ChecklistState,
} from "@/components/ovem/checklist-item-row";

/**
 * Dotación e insumos al recibir la ambulancia. Se guarda aparte del
 * preoperacional: un faltante de insumos no marca el vehículo como no apto.
 */
export function DotacionForm({ vehicleId, placa, items }: { vehicleId: string; placa: string; items: ChecklistItem[] }) {
  const router = useRouter();
  const [state, setState] = useState<ChecklistState>({});
  const [observaciones, setObservaciones] = useState("");
  const [guardadaHoy, setGuardadaHoy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setState({});
    setObservaciones("");
    setGuardadaHoy(false);
    setError(null);
    setSuccess(null);
    getSupplyCheckForToday(vehicleId).then((previa) => {
      if (!previa) return;
      setGuardadaHoy(true);
      setObservaciones(previa.observaciones ?? "");
      const map: ChecklistState = {};
      for (const it of previa.items as any[]) {
        map[it.checklist_item_id] = {
          estado: it.estado,
          cantidadOk: it.cantidad_ok ?? undefined,
          observacion: it.observacion ?? undefined,
        };
      }
      setState(map);
    });
  }, [vehicleId]);

  const grupos = useMemo(() => agruparPorCategoria(items), [items]);
  const faltantes = items.filter((it) => state[it.id]?.estado === "FALLA").length;

  const guardar = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await submitSupplyCheck({
      vehicleId,
      observaciones: observaciones || undefined,
      items: checklistPayload(items, state),
    });
    if ("error" in result && result.error) {
      setError(result.error);
    } else {
      setGuardadaHoy(true);
      setSuccess(
        faltantes === 0
          ? "Dotación completa, guardada."
          : `Guardada con ${faltantes} faltante${faltantes === 1 ? "" : "s"}. Avisa a Regulación antes de salir.`
      );
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5" />
          Dotación e insumos — {placa}
        </CardTitle>
        <CardDescription>
          Verifica lo que recibes. Lo que no marques como falla queda como completo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay catálogo de dotación configurado. Avisa a coordinación.
          </p>
        )}

        {grupos.map(([categoria, lista]) => (
          <div key={categoria} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">{categoria.replaceAll("_", " ")}</h3>
            <div className="space-y-2">
              {lista.map((it) => (
                <ChecklistItemRow
                  key={it.id}
                  item={it}
                  state={state[it.id]}
                  fallaPlaceholder="Qué falta o qué está vencido"
                  onChange={(next) => setState((prev) => ({ ...prev, [it.id]: next }))}
                />
              ))}
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <>
            <div>
              <Label htmlFor="dotacion-obs">Observaciones</Label>
              <Textarea
                id="dotacion-obs"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Lotes próximos a vencer, reposiciones pendientes…"
                className="mt-1"
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button onClick={guardar} disabled={loading} className="h-11 w-full sm:w-auto">
              {loading ? "Guardando…" : guardadaHoy ? "Actualizar dotación" : "Guardar dotación"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
