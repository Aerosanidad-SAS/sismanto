"use client";

import { useState } from "react";
import { cambiarEtapaVarios } from "@/app/api/actions/servicios-medicos";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { MOTIVO_MAX, MOTIVO_MIN } from "@/lib/servicios-etapas";

type Accion = "FINALIZADO" | "CANCELADO";

/**
 * Barra de la selección múltiple de Servicios: finalizar o cancelar los elegidos. Cada servicio pasa por las mismas reglas que
 * uno solo (finalizar exige las horas reales de cada tramo; cancelar, un motivo) y los que no cumplen vuelven con su razón.
 */
export function AccionesEnBloque({ ids, onLimpiar, onListo }: { ids: number[]; onLimpiar: () => void; onListo: () => void }) {
  const [accion, setAccion] = useState<Accion | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enCurso, setEnCurso] = useState(false);
  if (ids.length === 0) return null;

  const cancelando = accion === "CANCELADO";
  const motivoValido = !cancelando || (motivo.trim().length >= MOTIVO_MIN && motivo.trim().length <= MOTIVO_MAX);
  const cerrar = () => {
    if (enCurso) return;
    setAccion(null);
    setMotivo("");
  };

  const confirmar = async () => {
    if (!accion) return;
    setEnCurso(true);
    const res = await cambiarEtapaVarios(ids, accion, cancelando ? motivo.trim() : undefined);
    setEnCurso(false);
    if (res.error) {
      toast({ title: "No se pudo aplicar", description: res.error, tone: "error" });
      return;
    }
    const { aplicados, fallidos } = res;
    const verbo = accion === "FINALIZADO" ? (aplicados === 1 ? "finalizado" : "finalizados") : aplicados === 1 ? "cancelado" : "cancelados";
    if (fallidos.length === 0) {
      toast({ title: `${aplicados} ${aplicados === 1 ? "servicio" : "servicios"} ${verbo}`, tone: "success" });
    } else {
      const detalle = fallidos.slice(0, 3).map((f) => `#${f.id}: ${f.error}`).join(" · ");
      toast({
        title: `${aplicados} ${verbo}, ${fallidos.length} sin cambios`,
        description: fallidos.length > 3 ? `${detalle} · y ${fallidos.length - 3} más` : detalle,
        tone: aplicados > 0 ? "warning" : "error",
        duration: 15_000,
      });
    }
    setAccion(null);
    setMotivo("");
    onListo();
  };

  return (
    <>
      <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground">
        <span className="font-semibold">
          {ids.length} {ids.length === 1 ? "servicio seleccionado" : "servicios seleccionados"}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setAccion("FINALIZADO")}>
            Finalizar seleccionados
          </Button>
          <Button type="button" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => setAccion("CANCELADO")}>
            Cancelar seleccionados
          </Button>
          <Button type="button" variant="ghost" className="text-white underline hover:bg-white/10 hover:text-white" onClick={onLimpiar}>
            Limpiar selección
          </Button>
        </div>
      </div>

      <AlertDialog open={accion !== null} onOpenChange={(abierto) => !abierto && cerrar()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelando ? "Cancelar" : "Finalizar"} {ids.length} {ids.length === 1 ? "servicio" : "servicios"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelando
                ? "Pasan a CANCELADO y cada uno queda en la bitácora con tu nombre y este motivo. Solo un administrador puede reabrirlos."
                : "Para finalizar hacen falta la llegada y la salida reales de cada tramo. Los que no las tengan no se tocan y te digo cuáles. Solo un administrador puede reabrir los finalizados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelando && (
            <div className="space-y-1.5">
              <Label htmlFor="motivo-bloque">Motivo (el mismo para todos)</Label>
              <Textarea id="motivo-bloque" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={MOTIVO_MAX} rows={3} />
              <p className="text-xs text-muted-foreground">Mínimo {MOTIVO_MIN} caracteres.</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enCurso}>Volver</AlertDialogCancel>
            <Button type="button" onClick={confirmar} disabled={enCurso || !motivoValido}>
              {enCurso ? "Aplicando…" : cancelando ? "Cancelar servicios" : "Finalizar servicios"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
