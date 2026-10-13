"use client";

import { useId, useState } from "react";
import { Check, MessageSquare, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { esItemDeInventario } from "@/lib/inventario-preop";
import { detalleItem } from "@/lib/documentos-preop";

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

/** Columnas de la tabla: ítem · OK · Falla · Obs. Con 285 px útiles en un celular de 360, 136 px van a los tres botones y el ítem tiene ~150 px (2 líneas). */
const COLUMNAS = "grid grid-cols-[minmax(0,1fr)_2.75rem_3rem_2.75rem] items-center gap-1";

/** Cabecera de la tabla, una vez por categoría. */
export function CabeceraTablaChecklist() {
  return (
    <div className={cn(COLUMNAS, "px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground")} aria-hidden="true">
      <span>Ítem</span>
      <span className="text-center">OK</span>
      <span className="text-center">Falla</span>
      <span className="text-center">Obs.</span>
    </div>
  );
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

/**
 * Una fila de la tabla del preoperacional: ítem | OK | Falla | Obs. Un toque en OK responde; Falla (y Obs.) abren una hoja
 * donde se describe y, si el ítem se cuenta, se dice cuántos están bien. Nada aparece ni desaparece dentro de la fila.
 */
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
  const idObservacion = `${uid}-obs`;
  const expectedNum = item.cantidad_esperada ? Number(item.cantidad_esperada) : NaN;
  const esConteo = Number.isFinite(expectedNum) && expectedNum > 0;
  const sinResponder = exigirRespuesta && !state;
  const st: ChecklistItemState = state ?? { estado: "OK" };
  const esInventario = faltanteNoEsFalla && esItemDeInventario(item);
  const hay = st.cantidadOk ?? expectedNum;
  const incompleto = esInventario && !sinResponder && st.estado === "OK" && hay < expectedNum;
  const enFalla = st.estado === "FALLA" && !sinResponder;
  const marcaOk = !sinResponder && st.estado === "OK" && !incompleto;
  const marcaFalla = enFalla || incompleto;
  const noAplica = !sinResponder && st.estado === "NO_APLICA";
  const tieneObs = Boolean(st.observacion?.trim());
  const pendiente = sinResponder && resaltarPendiente;

  // Hoja (modal) de observación; para ítems contados también pide cuántos están bien.
  const [abierta, setAbierta] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [cuantos, setCuantos] = useState(esConteo ? expectedNum : 0);
  /** La hoja se abrió desde «Falla»: guardar sin contar de menos o sin describir no tiene sentido. */
  const [desdeFalla, setDesdeFalla] = useState(false);

  const abrir = (porFalla: boolean) => {
    setBorrador(st.observacion ?? "");
    // Desde «Falla» en un ítem contado se propone «uno menos» para no teclear.
    setCuantos(esConteo ? Math.min(expectedNum, porFalla && !marcaFalla ? Math.max(0, expectedNum - 1) : hay) : 0);
    setDesdeFalla(porFalla);
    setAbierta(true);
  };

  const marcarOk = () => onChange({ ...st, estado: "OK", cantidadOk: esConteo ? expectedNum : st.cantidadOk });

  const textoRequerido = desdeFalla && !(esConteo && esInventario && cuantos < expectedNum) && !(esConteo && cuantos >= expectedNum);
  const puedeGuardar = !textoRequerido || borrador.trim().length > 0;

  const guardar = () => {
    const obs = borrador.trim() || undefined;
    if (esConteo) {
      const n = Math.max(0, Math.min(expectedNum, cuantos));
      // Faltan unidades: equipo contado = faltante (sigue OK); funcionamiento (luces…) = falla.
      onChange({ estado: n >= expectedNum || esInventario ? "OK" : "FALLA", cantidadOk: n, observacion: obs });
    } else {
      onChange({ ...st, estado: desdeFalla || st.estado === "FALLA" ? "FALLA" : st.estado, observacion: obs });
    }
    setAbierta(false);
  };

  const celda = "flex h-12 w-full items-center justify-center rounded-md border-2 text-base font-bold leading-none transition-colors";

  return (
    <div
      id={`checklist-item-${item.id}`}
      className={cn(
        "scroll-mt-20 border-b py-2",
        marcaFalla && !incompleto && "bg-red-50/60",
        incompleto && "bg-warning-soft",
        pendiente && "bg-warning-soft"
      )}
    >
      <div className={COLUMNAS}>
        <div className="min-w-0 pl-1">
          <p id={idDescripcion} className="text-[15px] font-medium leading-tight text-foreground">
            {item.descripcion}
          </p>
          {detalleItem(item.descripcion) && <p className="text-xs leading-tight text-muted-foreground">{detalleItem(item.descripcion)}</p>}
          {esConteo && !sinResponder && marcaFalla && (
            <p className="text-xs font-semibold leading-tight text-foreground">
              {hay} de {expectedNum}
              {incompleto ? " · faltante" : ""}
            </p>
          )}
          {pendiente && <p className="text-xs font-semibold leading-tight text-foreground">Sin responder</p>}
          {noAplica && <p className="text-xs leading-tight text-muted-foreground">No aplica</p>}
        </div>

        <button
          type="button"
          aria-pressed={marcaOk}
          aria-label={`OK: ${item.descripcion}`}
          onClick={marcarOk}
          className={cn(celda, marcaOk ? "border-success bg-success text-success-foreground" : "border-input bg-background text-foreground")}
        >
          OK
        </button>

        <button
          type="button"
          aria-pressed={marcaFalla}
          aria-label={`${esConteo ? "Falla o faltante" : "Falla"}: ${item.descripcion}`}
          onClick={() => abrir(true)}
          className={cn(
            celda,
            "px-0 text-sm",
            marcaFalla
              ? incompleto
                ? "border-warning-foreground bg-warning text-warning-foreground"
                : "border-red-700 bg-red-700 text-white"
              : "border-input bg-background text-foreground"
          )}
        >
          {incompleto ? "Falta" : "Falla"}
        </button>

        <button
          type="button"
          disabled={sinResponder}
          aria-label={tieneObs ? `Ver observación de ${item.descripcion}` : `Agregar observación a ${item.descripcion}`}
          onClick={() => abrir(false)}
          className={cn(celda, "border-input bg-background text-foreground disabled:opacity-100 disabled:text-muted-foreground")}
        >
          {tieneObs ? <Check className="h-5 w-5" aria-hidden="true" /> : <MessageSquare className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {enFalla && onReportarNovedad && (
        <div className="mt-2 flex flex-wrap gap-2 pl-1">
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={onReportarNovedad}>
            Reportar novedad de este ítem
          </Button>
        </div>
      )}

      <Dialog open={abierta} onOpenChange={setAbierta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item.descripcion}</DialogTitle>
            <DialogDescription>
              {esConteo
                ? "Dinos cuántos están bien y, si falta o falla algo, descríbelo."
                : desdeFalla
                  ? "Describe la falla: se reporta sola como novedad."
                  : "Observación opcional."}
            </DialogDescription>
          </DialogHeader>

          {esConteo && (
            <div className="flex items-center justify-center gap-4" role="group" aria-label="¿Cuántos están bien?">
              <Button type="button" variant="outline" className="h-14 w-14" onClick={() => setCuantos((c) => Math.max(0, c - 1))} aria-label="Uno menos">
                <Minus className="h-6 w-6" aria-hidden="true" />
              </Button>
              <p className="min-w-24 text-center text-2xl font-bold" aria-live="polite">
                {cuantos} de {expectedNum}
              </p>
              <Button type="button" variant="outline" className="h-14 w-14" onClick={() => setCuantos((c) => Math.min(expectedNum, c + 1))} aria-label="Uno más">
                <Plus className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
          )}

          <Label htmlFor={idObservacion} className="sr-only">
            Observación
          </Label>
          <Textarea
            id={idObservacion}
            autoFocus={!esConteo}
            rows={3}
            value={borrador}
            placeholder={textoRequerido ? fallaPlaceholder : "Opcional"}
            onChange={(e) => setBorrador(e.target.value)}
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {!esConteo && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  onChange({ ...st, estado: "NO_APLICA", observacion: borrador.trim() || undefined });
                  setAbierta(false);
                }}
              >
                No aplica
              </Button>
            )}
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setAbierta(false)}>
              Cancelar
            </Button>
            <Button type="button" className="min-h-11" onClick={guardar} disabled={!puedeGuardar}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
