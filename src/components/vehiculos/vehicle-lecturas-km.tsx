"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { corregirLecturaKm, listarLecturasKm, type LecturaListada } from "@/app/api/actions/correccion-km";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmtKm = (n: number) => n.toLocaleString("es-CO");
const fmtFecha = (f: string) => f.split("-").reverse().join("/");

/**
 * Solo ADMIN. El km de un vehículo solo avanza; si alguien digitó un número equivocado queda como tope y bloquea las
 * lecturas siguientes. Aquí se lista el historial y se corrige una lectura (con motivo, que queda en la auditoría).
 */
export function VehicleLecturasKm({ vehicleId, placa }: { vehicleId: string; placa: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lecturas, setLecturas] = useState<LecturaListada[] | null>(null);
  const [kmActual, setKmActual] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();

  const clave = (l: LecturaListada) => `${l.fecha}|${l.km}|${l.origen}|${l.detalle ?? ""}`;

  const cargar = () => {
    setError(null);
    startTransition(async () => {
      const r = await listarLecturasKm(vehicleId);
      if ("error" in r) setError(r.error);
      else {
        setLecturas(r.lecturas);
        setKmActual(r.kmActual);
      }
    });
  };

  const abrir = (v: boolean) => {
    setOpen(v);
    if (v) {
      setEditando(null);
      cargar();
    }
  };

  const guardar = (l: LecturaListada) => {
    setError(null);
    const n = Number(nuevo.replace(/[\s.]/g, ""));
    if (!Number.isInteger(n) || n <= 0) {
      setError("Escribe el kilometraje correcto (número entero mayor a cero).");
      return;
    }
    startTransition(async () => {
      const r = await corregirLecturaKm({ vehicleId, fecha: l.fecha, kmActual: l.km, kmNuevo: n, motivo });
      if ("error" in r) {
        setError(r.error);
        return;
      }
      setEditando(null);
      setNuevo("");
      setMotivo("");
      const lista = await listarLecturasKm(vehicleId);
      if (!("error" in lista)) {
        setLecturas(lista.lecturas);
        setKmActual(lista.kmActual);
      }
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={abrir}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2">
          <History className="h-4 w-4" aria-hidden="true" />
          Corregir lecturas de km
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Lecturas de kilometraje — {placa}</DialogTitle>
          <DialogDescription>
            Km actual del vehículo: <strong>{kmActual === null ? "sin dato" : `${fmtKm(kmActual)} km`}</strong>. Al corregir una
            lectura se cambia ese valor en todas las filas del mismo día que lo repiten (odómetro, tanqueo, preoperacional) y
            se recalcula el km actual. Queda en la auditoría con el motivo.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {lecturas === null && !error && <p className="text-sm text-muted-foreground">Cargando…</p>}

        <ul className="space-y-2">
          {(lecturas ?? []).map((l) => {
            const k = clave(l);
            return (
              <li key={k} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-semibold">{fmtKm(l.km)} km</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {fmtFecha(l.fecha)} · {l.origen}
                      {l.detalle ? ` (${l.detalle})` : ""}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-9"
                    onClick={() => {
                      setEditando(editando === k ? null : k);
                      setNuevo("");
                      setMotivo("");
                      setError(null);
                    }}
                  >
                    {editando === k ? "Cancelar" : "Corregir"}
                  </Button>
                </div>
                {editando === k && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    <div>
                      <Label htmlFor={`km-nuevo-${k}`}>Kilometraje correcto</Label>
                      <Input
                        id={`km-nuevo-${k}`}
                        inputMode="numeric"
                        className="mt-1 max-w-xs"
                        value={nuevo}
                        onChange={(e) => setNuevo(e.target.value)}
                        placeholder="Ej: 151240"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`km-motivo-${k}`}>Motivo</Label>
                      <Input
                        id={`km-motivo-${k}`}
                        className="mt-1"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: el OVEM digitó un cero de más"
                        maxLength={300}
                      />
                    </div>
                    <Button type="button" className="min-h-11" disabled={pending} onClick={() => guardar(l)}>
                      {pending ? "Guardando…" : "Guardar corrección"}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
          {lecturas !== null && lecturas.length === 0 && <li className="text-sm text-muted-foreground">Sin lecturas registradas.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
