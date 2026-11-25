"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatoInstante } from "@/lib/fechas";
import { confirmarServicios, getServiciosPorConfirmar, type ServicioPorConfirmar } from "@/app/api/actions/servicios-confirmacion";

const tripulacionTexto = (s: ServicioPorConfirmar) =>
  [s.ovem && `OVEM ${s.ovem}`, s.medico && `médico ${s.medico}`, s.auxiliar && `auxiliar ${s.auxiliar}`].filter(Boolean).join(" · ") || "sin tripulación";

/**
 * Tras guardar la tripulación de un móvil (#383): lista los servicios PROGRAMADO de hoy en adelante de ese móvil, con la
 * tripulación que tiene cada uno, para que el regulador los confirme (uno por uno o «Confirmar todos», viendo la lista antes).
 * Si no hay ninguno por confirmar no muestra nada.
 */
export function ConfirmarServiciosMovil({ vehiculo, onCerrar }: { vehiculo: { id: string; placa: string } | null; onCerrar: () => void }) {
  const router = useRouter();
  const [lista, setLista] = useState<ServicioPorConfirmar[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setLista(null);
    setError(null);
    if (!vehiculo) return;
    let activo = true;
    getServiciosPorConfirmar(vehiculo.id)
      .then((filas) => {
        if (!activo) return;
        if (filas.length === 0) onCerrar();
        else setLista(filas);
      })
      .catch(() => activo && setError("No se pudieron cargar los servicios por confirmar. Revisa tu señal e inténtalo de nuevo."));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculo?.id]);

  const confirmar = async (ids: number[]) => {
    setGuardando(true);
    setError(null);
    const r = await confirmarServicios(ids);
    setGuardando(false);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    const quedan = (lista ?? []).filter((s) => !ids.includes(s.id));
    setLista(quedan);
    router.refresh();
    if (quedan.length === 0) onCerrar();
  };

  const abierto = vehiculo !== null && (lista !== null || error !== null);
  return (
    <Dialog open={abierto} onOpenChange={(a) => !a && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar servicios programados{vehiculo ? ` — ${vehiculo.placa}` : ""}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Los servicios no se mueven solos al cambiar la tripulación. Revisa que cada uno quedó con la tripulación y el móvil que lo van a
            hacer, y confírmalo. Si no es así, edítalo antes.
          </p>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {lista && (
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {lista.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    #{s.id} · {s.tipo_servicio}
                    {s.fecha_hora_programacion ? ` · ${formatoInstante(s.fecha_hora_programacion)}` : " · sin hora"}
                  </p>
                  <p className="text-muted-foreground">{tripulacionTexto(s)}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/servicios?numero=${s.id}&editar=1`}>Editar</Link>
                  </Button>
                  <Button size="sm" disabled={guardando} onClick={() => void confirmar([s.id])}>
                    Confirmar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCerrar}>
            Después
          </Button>
          {lista && lista.length > 1 && (
            <Button disabled={guardando} onClick={() => void confirmar(lista.map((s) => s.id))}>
              {guardando ? "Confirmando…" : `Confirmar todos (${lista.length})`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
