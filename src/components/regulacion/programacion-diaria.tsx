"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cambiarOperadoresDelDia, setTitulares, type ProgramacionDelDia, type VehiculoProgramado } from "@/app/api/actions/programacion";
import { conductoresEnVariosVehiculos } from "@/lib/programacion-diaria";
import { sumarDias } from "@/lib/fechas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NINGUNO = "__ninguno__";

export function ProgramacionDiaria({ datos }: { datos: ProgramacionDelDia }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [vista, setVista] = useState<"vehiculo" | "conductor">("vehiculo");
  const [editando, setEditando] = useState<VehiculoProgramado | null>(null);
  const [c1, setC1] = useState(NINGUNO);
  const [c2, setC2] = useState(NINGUNO);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nombre = useMemo(() => new Map(datos.conductores.map((c) => [c.user_id, c.nombre])), [datos.conductores]);
  const nombreDe = (id: string) => nombre.get(id) ?? "Conductor";
  const placaDe = useMemo(() => new Map(datos.vehiculos.map((v) => [v.vehicleId, v.placa])), [datos.vehiculos]);

  const irAlDia = (dia: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("dia", dia);
    startTransition(() => router.push(pathname + "?" + p.toString()));
  };

  const abrir = (v: VehiculoProgramado) => {
    const base = v.operadores.length > 0 ? v.operadores : v.titulares;
    setC1(base[0] ?? NINGUNO);
    setC2(base[1] ?? NINGUNO);
    setNota("");
    setError(null);
    setEditando(v);
  };

  const elegidos = [c1, c2].filter((x) => x !== NINGUNO);

  const guardar = (modo: "dia" | "titulares") => {
    if (!editando) return;
    startTransition(async () => {
      setError(null);
      const r = modo === "titulares"
        ? await setTitulares(editando.vehicleId, elegidos)
        : await cambiarOperadoresDelDia(editando.vehicleId, datos.fecha, elegidos, nota);
      if ("error" in r && r.error) { setError(r.error); return; }
      if (modo === "titulares") {
        // Fijar titulares también ajusta el día de hoy, para que lo programado y lo registrado coincidan.
        const d = await cambiarOperadoresDelDia(editando.vehicleId, datos.fecha, elegidos, "Cambio de titulares");
        if ("error" in d && d.error) { setError(d.error); return; }
      }
      setEditando(null);
      router.refresh();
    });
  };

  const porConductor = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const v of datos.vehiculos) for (const id of v.operadores) mapa.set(id, [...(mapa.get(id) ?? []), v.vehicleId]);
    return Array.from(mapa.entries()).sort((a, b) => nombreDe(a[0]).localeCompare(nombreDe(b[0])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos.vehiculos, nombre]);

  const repetidos = useMemo(
    () => new Set(conductoresEnVariosVehiculos(datos.vehiculos.flatMap((v) => v.operadores.map((user_id) => ({ fecha: datos.fecha, vehicle_id: v.vehicleId, user_id, origen: "TITULAR" as const }))))),
    [datos.vehiculos, datos.fecha],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Programación del día</CardTitle>
            <CardDescription>
              1 o 2 conductores titulares por vehículo; ajusta el día cuando la operación lo pida. Cada día queda registrado para revisar después quién operó qué vehículo.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" disabled={pending} onClick={() => irAlDia(sumarDias(datos.fecha, -1))} aria-label="Día anterior">←</Button>
            <Input type="date" className="w-40" value={datos.fecha} onChange={(e) => e.target.value && irAlDia(e.target.value)} aria-label="Día de la programación" />
            <Button variant="outline" size="sm" disabled={pending} onClick={() => irAlDia(sumarDias(datos.fecha, 1))} aria-label="Día siguiente">→</Button>
            <Button variant={vista === "vehiculo" ? "default" : "outline"} size="sm" aria-pressed={vista === "vehiculo"} onClick={() => setVista("vehiculo")}>Por vehículo</Button>
            <Button variant={vista === "conductor" ? "default" : "outline"} size="sm" aria-pressed={vista === "conductor"} onClick={() => setVista("conductor")}>Por conductor</Button>
          </div>
        </div>
        {!datos.editable ? <p className="text-sm text-muted-foreground">Día pasado: es historial y solo se consulta.</p> : null}
      </CardHeader>
      <CardContent>
        {vista === "vehiculo" ? (
          <ul className="divide-y">
            {datos.vehiculos.map((v) => (
              <li key={v.vehicleId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <span className="font-medium">{v.placa}</span>
                  {v.estado_actual !== "OPERATIVO" ? <Badge variant="outline" className="ml-2">{v.estado_actual.replace(/_/g, " ").toLowerCase()}</Badge> : null}
                  <p className="text-sm text-muted-foreground">
                    Titulares: {v.titulares.length > 0 ? v.titulares.map(nombreDe).join(" · ") : "sin asignar"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{v.operadores.length > 0 ? v.operadores.map(nombreDe).join(" · ") : "Sin operador"}</span>
                  {v.difiereDeTitulares ? <Badge>Cambio del día</Badge> : null}
                  {datos.editable ? <Button size="sm" variant="outline" disabled={pending} onClick={() => abrir(v)}>Editar</Button> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : porConductor.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nadie tiene vehículo programado este día.</p>
        ) : (
          <ul className="divide-y">
            {porConductor.map(([id, vehiculos]) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-medium">{nombreDe(id)}</span>
                <span className="text-sm">
                  {vehiculos.map((vid) => placaDe.get(vid) ?? "").join(" · ")}
                  {repetidos.has(id) ? <Badge variant="outline" className="ml-2">En varios vehículos</Badge> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={editando !== null} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando?.placa} — conductores</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[{ valor: c1, set: setC1, etiqueta: "Conductor 1" }, { valor: c2, set: setC2, etiqueta: "Conductor 2 (opcional)" }].map((f) => (
              <div key={f.etiqueta}>
                <p className="mb-1 text-sm text-muted-foreground">{f.etiqueta}</p>
                <Select value={f.valor} onValueChange={f.set}>
                  <SelectTrigger aria-label={f.etiqueta}><SelectValue placeholder="Elige un conductor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NINGUNO}>Ninguno</SelectItem>
                    {datos.conductores.filter((c) => c.user_id === f.valor || c.user_id !== (f.valor === c1 ? c2 : c1)).map((c) => <SelectItem key={c.user_id} value={c.user_id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Input aria-label="Motivo del cambio (opcional)" placeholder="Motivo del cambio (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={pending || elegidos.length === 0} onClick={() => guardar("dia")}>Solo este día</Button>
              <Button disabled={pending || elegidos.length === 0} onClick={() => guardar("titulares")}>Fijar como titulares</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
