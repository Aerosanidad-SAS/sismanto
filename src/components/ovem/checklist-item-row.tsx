"use client";

import { useId, useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { esItemDeInventario } from "@/lib/inventario-preop";

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
  /**
   * El equipo contado incompleto (extintor, chalecos…) es un faltante, no una falla: queda OK con menos unidades y el
   * servidor abre una novedad leve. Sin esto, contar de menos pasa el ítem a FALLA (dotación y demás usos).
   */
  faltanteNoEsFalla?: boolean;
}

export function ChecklistItemRow({
  item,
  state,
  onChange,
  fallaPlaceholder = "Describe la falla",
  onReportarNovedad,
  exigirRespuesta = false,
  resaltarPendiente = false,
  faltanteNoEsFalla = false,
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
  const esInventario = faltanteNoEsFalla && esItemDeInventario(item);
  const incompleto = esInventario && !sinResponder && st.estado === "OK" && (st.cantidadOk ?? expectedNum) < expectedNum;

  // La observación vive en una hoja que se abre con un botón: nunca aparece un campo nuevo que empuje el resto de la lista.
  const [obsAbierta, setObsAbierta] = useState(false);
  const [borrador, setBorrador] = useState("");
  const tieneObs = Boolean(st.observacion?.trim());
  const obsFalta = enFalla && !tieneObs;
  const abrirObs = () => {
    setBorrador(st.observacion ?? "");
    setObsAbierta(true);
  };
  /** Cambia la respuesta; si pasa a FALLA sin explicación, abre la hoja para describirla (la falla exige descripción). */
  const cambiar = (next: ChecklistItemState) => {
    onChange(next);
    const pasoAFalla = next.estado === "FALLA" && (sinResponder || st.estado !== "FALLA");
    if (pasoAFalla && !next.observacion?.trim()) {
      setBorrador("");
      setObsAbierta(true);
    }
  };
  const guardarObs = () => {
    onChange({ ...st, observacion: borrador.trim() || undefined });
    setObsAbierta(false);
  };
  const botonObs = (
    <Button
      type="button"
      variant={obsFalta ? "default" : "outline"}
      className="min-h-11 shrink-0 gap-1.5 px-3"
      disabled={sinResponder}
      onClick={abrirObs}
      aria-label={obsFalta ? `Describir la falla de ${item.descripcion}` : `Observación de ${item.descripcion}`}
    >
      {tieneObs ? <Check className="h-4 w-4" aria-hidden="true" /> : <MessageSquare className="h-4 w-4" aria-hidden="true" />}
      {obsFalta ? "Describir" : tieneObs ? "Con obs." : "Obs."}
    </Button>
  );

  return (
    <div
      id={`checklist-item-${item.id}`}
      className={cn(
        "scroll-mt-20 rounded-lg border p-3",
        enFalla ? "border-red-300 bg-red-50/50" : incompleto ? "border-warning bg-warning-soft" : "border-border bg-card",
        sinResponder && resaltarPendiente && "border-warning bg-warning-soft"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p id={idDescripcion} className="min-w-0 text-base font-medium leading-snug text-foreground">
          {item.descripcion}
        </p>
        <span
          className={cn(
            "shrink-0 text-xs font-semibold",
            enFalla ? "text-red-700" : incompleto || (sinResponder && resaltarPendiente) ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {enFalla ? "ALERTA" : incompleto ? "Faltante" : sinResponder ? "Sin responder" : "—"}
        </span>
      </div>

      {isNumericQty ? (
        <div className="mt-3">
          <Label htmlFor={idCantidad} className="text-sm">
            ¿Cuántos están OK?
          </Label>
          <div className="mt-1 flex items-center gap-2">
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
                // Equipo contado: menos unidades = faltante (sigue OK). Funcionamiento (luces…): menos = falla.
                cambiar({ ...st, cantidadOk: clamped, estado: clamped < expectedNum && !esInventario ? "FALLA" : "OK" });
              }}
              className="h-11 w-20 text-center text-base"
            />
            <span className="text-sm text-muted-foreground">de {expectedNum}</span>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 shrink-0 px-3"
              onClick={() => cambiar({ ...st, cantidadOk: expectedNum, estado: "OK" })}
              aria-label={`Están los ${expectedNum} bien: ${item.descripcion}`}
            >
              Todos
            </Button>
            <div className="ml-auto">{botonObs}</div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Label id={`${uid}-estado`} className="sr-only">
            Estado
          </Label>
          <RadioGroup
            value={sinResponder ? "" : st.estado}
            aria-labelledby={`${idDescripcion} ${uid}-estado`}
            onValueChange={(v) => cambiar({ ...st, estado: v as ChecklistEstado })}
            className="grid flex-1 grid-cols-3 gap-2"
          >
            {[
              { v: "OK", label: "OK" },
              { v: "FALLA", label: "Falla" },
              { v: "NO_APLICA", label: "N/A" },
            ].map((opt) => (
              <label key={opt.v} className="flex min-h-11 items-center gap-2 text-base">
                <RadioGroupItem value={opt.v} />
                <span>{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
          {botonObs}
        </div>
      )}

      <Dialog open={obsAbierta} onOpenChange={setObsAbierta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item.descripcion}</DialogTitle>
            <DialogDescription>{enFalla ? "Describe la falla: se reporta sola como novedad." : "Observación opcional."}</DialogDescription>
          </DialogHeader>
          <Label htmlFor={idObservacion} className="sr-only">
            Observación
          </Label>
          <Textarea
            id={idObservacion}
            autoFocus
            rows={3}
            value={borrador}
            placeholder={enFalla ? fallaPlaceholder : "Opcional"}
            onChange={(e) => setBorrador(e.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setObsAbierta(false)}>
              Cancelar
            </Button>
            <Button type="button" className="min-h-11" onClick={guardarObs} disabled={enFalla && !borrador.trim()}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
