"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type ChecklistEstado = "OK" | "FALLA" | "NO_APLICA";

export interface ChecklistItem {
  id: number;
  categoria: string;
  descripcion: string;
  cantidad_esperada: string | null;
  orden: number;
  activo: boolean;
  /** NULL = aplica a todos los tipos de vehículo (migración 096). */
  tipos_vehiculo?: string[] | null;
}

export interface ChecklistItemState {
  estado: ChecklistEstado;
  cantidadOk?: number;
  observacion?: string;
}

export type ChecklistState = Record<number, ChecklistItemState>;

/** Agrupa por categoría conservando el orden de llegada. */
export function agruparPorCategoria(items: ChecklistItem[]): [string, ChecklistItem[]][] {
  const m = new Map<string, ChecklistItem[]>();
  for (const it of items) m.set(it.categoria, [...(m.get(it.categoria) ?? []), it]);
  return Array.from(m.entries());
}

/** Convierte el estado de pantalla al payload de las acciones; lo no tocado cuenta como OK. */
export function checklistPayload(items: ChecklistItem[], state: ChecklistState) {
  return items.map((it) => {
    const st = state[it.id];
    return {
      checklistItemId: it.id,
      estado: st?.estado ?? ("OK" as const),
      cantidadOk: st?.cantidadOk,
      observacion: st?.observacion,
    };
  });
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  state: ChecklistItemState | undefined;
  onChange: (next: ChecklistItemState) => void;
  fallaPlaceholder?: string;
  /** Si se pasa, muestra "Reportar novedad de este ítem" cuando está en FALLA. */
  onReportarNovedad?: () => void;
  /** El ítem arranca «sin responder» (nada se da por OK). Sin esto, lo no tocado se muestra y se guarda como OK. */
  exigirRespuesta?: boolean;
  /** Marca el ítem como pendiente (borde y texto) cuando está sin responder; se activa tras un envío incompleto. */
  resaltarPendiente?: boolean;
}

export function ChecklistItemRow({
  item,
  state,
  onChange,
  fallaPlaceholder = "Describe la falla",
  onReportarNovedad,
  exigirRespuesta = false,
  resaltarPendiente = false,
}: ChecklistItemRowProps) {
  const uid = useId();
  const idDescripcion = `${uid}-desc`;
  const idCantidad = `${uid}-cant`;
  const idObservacion = `${uid}-obs`;
  const expectedNum = item.cantidad_esperada ? Number(item.cantidad_esperada) : NaN;
  const isNumericQty = Number.isFinite(expectedNum) && expectedNum > 0;
  const sinResponder = exigirRespuesta && !state;
  const st: ChecklistItemState = state ?? { estado: "OK" };
  const enFalla = st.estado === "FALLA" && !sinResponder;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        enFalla ? "border-red-300 bg-red-50/50" : "border-border bg-card",
        sinResponder && resaltarPendiente && "border-warning bg-warning-soft"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p id={idDescripcion} className="text-sm font-medium text-foreground">
            {item.descripcion}
          </p>
          <p className="text-xs text-muted-foreground">Esperado: {item.cantidad_esperada || "OK"}</p>
        </div>
        <span
          className={cn(
            "text-xs font-semibold",
            enFalla ? "text-red-700" : sinResponder && resaltarPendiente ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {enFalla ? "ALERTA" : sinResponder ? "Sin responder" : "—"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {isNumericQty ? (
          <div className="space-y-2">
            <Label htmlFor={idCantidad} className="text-xs">
              ¿Cuántos están OK?
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={idCantidad}
                type="number"
                inputMode="numeric"
                min={0}
                max={expectedNum}
                value={sinResponder ? "" : st.cantidadOk ?? expectedNum}
                onChange={(e) => {
                  const v = parseInt(e.target.value || "0", 10);
                  const clamped = Math.max(0, Math.min(expectedNum, Number.isNaN(v) ? 0 : v));
                  onChange({ ...st, cantidadOk: clamped, estado: clamped < expectedNum ? "FALLA" : "OK" });
                }}
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">de {expectedNum}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label id={`${uid}-estado`} className="text-xs">
              Estado
            </Label>
            <RadioGroup
              value={sinResponder ? "" : st.estado}
              aria-labelledby={`${idDescripcion} ${uid}-estado`}
              onValueChange={(v) => onChange({ ...st, estado: v as ChecklistEstado })}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { v: "OK", label: "OK" },
                { v: "FALLA", label: "Falla" },
                { v: "NO_APLICA", label: "N/A" },
              ].map((opt) => (
                <label key={opt.v} className="flex min-h-11 items-center gap-2 text-sm">
                  <RadioGroupItem value={opt.v} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Sin responder no se pide observación: escribirla daría el ítem por contestado sin que lo sea. */}
        {!sinResponder && (
          <div className="space-y-2">
            <Label htmlFor={idObservacion} className="text-xs">
              Observación
            </Label>
            <Input
              id={idObservacion}
              value={st.observacion ?? ""}
              placeholder={enFalla ? fallaPlaceholder : "Opcional"}
              onChange={(e) => onChange({ ...st, observacion: e.target.value })}
            />
          </div>
        )}
      </div>

      {enFalla && onReportarNovedad && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={onReportarNovedad}>
            Reportar novedad de este ítem
          </Button>
        </div>
      )}
    </div>
  );
}
