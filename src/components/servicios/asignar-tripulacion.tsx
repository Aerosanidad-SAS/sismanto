"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import { asignarTripulacion } from "@/app/api/actions/regulacion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hoyBogota } from "@/lib/fechas";
import { ETIQUETA_ROL, mensajeTripulacionFaltante, type RolTripulacion } from "@/lib/servicio-detalle";

export type PersonaTripulacion = { user_id: string; nombre_completo: string | null; email: string | null };

const nombreDe = (p: PersonaTripulacion) => p.nombre_completo || p.email || p.user_id;
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

interface Props {
  vehicleId: string;
  tipoServicio: string;
  /** Lo que le falta al móvil para este servicio (`tripulacionPorCompletar`). */
  faltan: RolTripulacion[];
  candidatos: Record<RolTripulacion, PersonaTripulacion[]>;
  /** Solo Regulación, Analista y Administración arman tripulación; los demás ven el aviso sin el botón. */
  puedeAsignar: boolean;
  /** Se llama por cada persona que quedó asignada, para que el formulario la ponga en el servicio. */
  onAsignada: (rol: RolTripulacion, persona: PersonaTripulacion) => void;
}

/**
 * Un solo aviso con lo que falta en el móvil según el tipo de servicio, y el modo de resolverlo ahí mismo: un selector por
 * cada rol que falta y «Guardar tripulación». Usa la misma acción que el tablero de Regulación (`asignarTripulacion`).
 */
export function AsignarTripulacion({ vehicleId, tipoServicio, faltan, candidatos, puedeAsignar, onAsignada }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [elegidos, setElegidos] = useState<Partial<Record<RolTripulacion, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  if (faltan.length === 0) {
    return confirmacion ? (
      <p role="status" className="flex items-start gap-1.5 rounded-md bg-success-soft px-2 py-1 text-xs font-medium text-foreground">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {confirmacion}
      </p>
    ) : null;
  }

  const completo = faltan.every((r) => Boolean(elegidos[r]));

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const liberados: string[] = [];
    for (const rol of faltan) {
      const persona = candidatos[rol].find((p) => p.user_id === elegidos[rol]);
      if (!persona) continue;
      const r = await asignarTripulacion(vehicleId, persona.user_id, rol, hoyBogota());
      if ("error" in r && r.error) {
        setError(`${mayuscula(ETIQUETA_ROL[rol])}: ${r.error}`);
        setGuardando(false);
        return;
      }
      if ("success" in r) {
        liberados.push(...(r.liberados ?? []));
      }
      onAsignada(rol, persona);
    }
    setGuardando(false);
    setAbierto(false);
    setElegidos({});
    // Se avisa lo que la asignación deja pendiente, para que no sea una sorpresa.
    setConfirmacion(
      "Tripulación asignada." +
        " Los servicios programados de este móvil quedan por confirmar en la sala de control." +
        (liberados.length > 0 ? ` Salió de: ${[...new Set(liberados)].join(", ")}.` : "")
    );
  };

  return (
    <div className="space-y-2 rounded-md bg-warning-soft px-2 py-1.5 text-xs text-warning-foreground">
      <p className="font-medium">{mensajeTripulacionFaltante(tipoServicio, faltan)}</p>

      {puedeAsignar && !abierto && (
        <Button type="button" variant="outline" size="sm" onClick={() => setAbierto(true)}>
          <UserPlus className="mr-1 h-4 w-4" aria-hidden="true" /> Asignar tripulación
        </Button>
      )}

      {puedeAsignar && abierto && (
        <div className="space-y-2 rounded-md border bg-background p-2 text-foreground">
          {faltan.map((rol) => {
            const lista = candidatos[rol];
            return (
              <div key={rol} className="space-y-1">
                <Label htmlFor={`tripulacion-${rol}`}>{mayuscula(ETIQUETA_ROL[rol])}</Label>
                {lista.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No hay personas activas con este rol en tu centro.</p>
                ) : (
                  <Select value={elegidos[rol] ?? ""} onValueChange={(v) => setElegidos((e) => ({ ...e, [rol]: v }))}>
                    <SelectTrigger id={`tripulacion-${rol}`}>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {lista.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {nombreDe(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" disabled={guardando} onClick={() => { setAbierto(false); setError(null); }}>
              Cancelar
            </Button>
            <Button type="button" size="sm" disabled={!completo || guardando} onClick={guardar}>
              {guardando ? "Guardando…" : "Guardar tripulación"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
