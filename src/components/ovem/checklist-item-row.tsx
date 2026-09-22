"use client";

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
}

export function ChecklistItemRow({
  item,
  state,
  onChange,
  fallaPlaceholder = "Describa la falla",
  onReportarNovedad,
}: ChecklistItemRowProps) {
  const expectedNum = item.cantidad_esperada ? Number(item.cantidad_esperada) : NaN;
  const isNumericQty = Number.isFinite(expectedNum) && expectedNum > 0;
  const st = state ?? { estado: "OK" as const };
  const enFalla = st.estado === "FALLA";

  return (
    <div className={cn("rounded-lg border p-3", enFalla ? "border-red-300 bg-red-50/50" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{item.descripcion}</p>
          <p className="text-xs text-muted-foreground">Esperado: {item.cantidad_esperada || "OK"}</p>
        </div>
        <span className={cn("text-xs font-semibold", enFalla ? "text-red-700" : "text-muted-foreground")}>
          {enFalla ? "ALERTA" : "—"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {isNumericQty ? (
          <div className="space-y-2">
            <Label className="text-xs">¿Cuántos están OK?</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={expectedNum}
                value={st.cantidadOk ?? expectedNum}
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
            <Label className="text-xs">Estado</Label>
            <RadioGroup
              value={st.estado}
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
                  <span className="text-xs">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Observación</Label>
          <Input
            value={st.observacion ?? ""}
            placeholder={enFalla ? fallaPlaceholder : "Opcional"}
            onChange={(e) => onChange({ ...st, observacion: e.target.value })}
          />
        </div>
      </div>

      {enFalla && onReportarNovedad && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReportarNovedad}>
            Reportar novedad de este ítem
          </Button>
        </div>
      )}
    </div>
  );
}
