"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cambiarOperadoresDelDia, getNovedadesAbiertas, setTitulares, type NovedadAbierta, type ProgramacionDelDia, type TrasladoServicios, type VehiculoProgramado } from "@/app/api/actions/programacion";
import { getServiciosMovibles, reasignarServiciosAVehiculo } from "@/app/api/actions/regulacion";
import { MIN_CARACTERES_RAZON, RAZONES_CAMBIO, RAZONES_CON_NOVEDAD, planificarCambioDelDia, validarRazon, vehiculosDeOrigen, type RazonCodigo } from "@/lib/cambio-vehiculo";
import { conductoresEnVariosVehiculos } from "@/lib/programacion-diaria";
import { sumarDias } from "@/lib/fechas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NINGUNO = "__ninguno__";
const SIN_NOVEDAD = "__sin_novedad__";

interface TrasladoPendiente extends TrasladoServicios {
  placaOrigen: string;
  placaDestino: string;
  servicioIds: number[];
}

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
  const [razonCodigo, setRazonCodigo] = useState<string>("");
  const [razonTexto, setRazonTexto] = useState("");
  const [novedadId, setNovedadId] = useState(SIN_NOVEDAD);
  const [novedades, setNovedades] = useState<NovedadAbierta[]>([]);
  // Reasignación de servicios: cola de traslados por confirmar (uno a la vez) y diálogo del botón por vehículo.
  const [traslados, setTraslados] = useState<TrasladoPendiente[]>([]);
  const [reasignando, setReasignando] = useState<VehiculoProgramado | null>(null);
  const [destinoId, setDestinoId] = useState("");

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
    setRazonCodigo("");
    setRazonTexto("");
    setNovedadId(SIN_NOVEDAD);
    setNovedades([]);
    setEditando(v);
  };

  const elegidos = [c1, c2].filter((x) => x !== NINGUNO);

  // Qué implica el cambio que se está armando: si retira o reemplaza a alguien programado, o trae a alguien de
  // otro vehículo, la razón es obligatoria.
  const plan = useMemo(() => {
    if (!editando) return null;
    const enOtro = new Map<string, string>();
    for (const v of datos.vehiculos) if (v.vehicleId !== editando.vehicleId) for (const id of v.operadores) enOtro.set(id, v.vehicleId);
    return planificarCambioDelDia(editando.operadores, elegidos, enOtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando, c1, c2, datos.vehiculos]);
  const requiereRazon = plan?.requiereRazon ?? false;
  const origenes = useMemo(() => (editando && plan ? vehiculosDeOrigen(editando.vehicleId, plan) : []), [editando, plan]);
  const origenesClave = origenes.join(",");

  // Novedades abiertas de los vehículos de origen, solo cuando la razón suele tener una detrás.
  useEffect(() => {
    setNovedadId(SIN_NOVEDAD);
    if (!requiereRazon || !RAZONES_CON_NOVEDAD.includes(razonCodigo as RazonCodigo) || origenesClave === "") { setNovedades([]); return; }
    let vigente = true;
    getNovedadesAbiertas(origenesClave.split(",")).then((n) => { if (vigente) setNovedades(n); });
    return () => { vigente = false; };
  }, [requiereRazon, razonCodigo, origenesClave]);

  const placa = (id: string) => placaDe.get(id) ?? "";

  /** Tras guardar: arma la cola de «¿mover los N servicios sin iniciar?» para cada traslado de conductores. */
  const prepararTraslados = async (lista: TrasladoServicios[]) => {
    const cola: TrasladoPendiente[] = [];
    for (const t of lista) {
      const movibles = await getServiciosMovibles(t.origenId, datos.fecha);
      if (movibles.length > 0) cola.push({ ...t, placaOrigen: placa(t.origenId), placaDestino: placa(t.destinoId), servicioIds: movibles.map((m) => m.id) });
    }
    setTraslados(cola);
  };

  const confirmarTraslado = () => {
    const t = traslados[0];
    if (!t) return; // el diálogo se cierra solo (onOpenChange) y avanza la cola
    startTransition(async () => {
      const r = await reasignarServiciosAVehiculo(t.origenId, t.destinoId, t.servicioIds);
      if ("error" in r && r.error) toast.error(r.error);
      else toast.success("Se movieron " + r.movidos + " servicios de " + t.placaOrigen + " a " + t.placaDestino + ".");
      router.refresh();
    });
  };

  const abrirReasignar = (v: VehiculoProgramado) => {
    setDestinoId("");
    setError(null);
    setReasignando(v);
  };

  const revisarReasignacion = () => {
    if (!reasignando || !destinoId) return;
    startTransition(async () => {
      setError(null);
      const movibles = await getServiciosMovibles(reasignando.vehicleId, datos.fecha);
      if (movibles.length === 0) { setError("La " + reasignando.placa + " no tiene servicios sin iniciar para este día."); return; }
      setTraslados([{ origenId: reasignando.vehicleId, destinoId, placaOrigen: reasignando.placa, placaDestino: placa(destinoId), servicioIds: movibles.map((m) => m.id) }]);
      setReasignando(null);
    });
  };

  const guardar = (modo: "dia" | "titulares") => {
    if (!editando) return;
    if (requiereRazon) {
      const sinRazon = validarRazon({ razonCodigo, razonTexto });
      if (sinRazon) { setError(sinRazon); return; }
    }
    const cambio = requiereRazon
      ? { razonCodigo, razonTexto, incidentId: novedadId === SIN_NOVEDAD ? null : Number(novedadId) }
      : undefined;
    startTransition(async () => {
      setError(null);
      if (modo === "titulares") {
        const r = await setTitulares(editando.vehicleId, elegidos);
        if ("error" in r && r.error) { setError(r.error); return; }
      }
      // Fijar titulares también ajusta el día de hoy, para que lo programado y lo registrado coincidan.
      const d = await cambiarOperadoresDelDia(editando.vehicleId, datos.fecha, elegidos, modo === "titulares" ? "Cambio de titulares" : nota, cambio);
      if ("error" in d && d.error) { setError(d.error); return; }
      setEditando(null);
      const movidos = "traslados" in d ? d.traslados ?? [] : [];
      if (movidos.length > 0) await prepararTraslados(movidos);
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
                  {datos.editable ? <Button size="sm" variant="outline" disabled={pending} onClick={() => abrirReasignar(v)}>Reasignar servicios</Button> : null}
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
            {requiereRazon ? (
              <div className="space-y-3 rounded-md border p-3">
                <p className="text-sm">
                  Este cambio retira o mueve a un conductor ya programado. Queda registrado el porqué para el historial y para conectarlo con una novedad.
                </p>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Razón del cambio</p>
                  <Select value={razonCodigo} onValueChange={setRazonCodigo}>
                    <SelectTrigger aria-label="Razón del cambio"><SelectValue placeholder="Elige la razón" /></SelectTrigger>
                    <SelectContent>
                      {RAZONES_CAMBIO.map((r) => <SelectItem key={r.codigo} value={r.codigo}>{r.etiqueta}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  aria-label="Detalle de la razón"
                  placeholder={razonCodigo === "OTRA" ? "Cuéntanos la razón (mínimo " + MIN_CARACTERES_RAZON + " caracteres)" : "Detalle (mínimo " + MIN_CARACTERES_RAZON + " caracteres), por ejemplo: frenos en taller"}
                  value={razonTexto}
                  onChange={(e) => setRazonTexto(e.target.value)}
                />
                {novedades.length > 0 ? (
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Novedad relacionada (opcional)</p>
                    <Select value={novedadId} onValueChange={setNovedadId}>
                      <SelectTrigger aria-label="Novedad relacionada"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SIN_NOVEDAD}>Ninguna</SelectItem>
                        {novedades.map((n) => <SelectItem key={n.id} value={String(n.id)}>{n.placa} · #{n.id} · {n.descripcion}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            ) : (
              <Input aria-label="Motivo del cambio (opcional)" placeholder="Motivo del cambio (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />
            )}
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={pending || elegidos.length === 0} onClick={() => guardar("dia")}>Solo este día</Button>
              <Button disabled={pending || elegidos.length === 0} onClick={() => guardar("titulares")}>Fijar como titulares</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reasignando !== null} onOpenChange={(abierto) => !abierto && setReasignando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasignando?.placa} — reasignar servicios</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Los servicios sin iniciar de este día pasan a otro vehículo, con la tripulación que ese vehículo tenga hoy. Los que ya salieron no se mueven.
            </p>
            <Select value={destinoId} onValueChange={setDestinoId}>
              <SelectTrigger aria-label="Vehículo de destino"><SelectValue placeholder="Elige el vehículo de destino" /></SelectTrigger>
              <SelectContent>
                {datos.vehiculos.filter((v) => v.vehicleId !== reasignando?.vehicleId && v.estado_actual === "OPERATIVO").map((v) => <SelectItem key={v.vehicleId} value={v.vehicleId}>{v.placa}</SelectItem>)}
              </SelectContent>
            </Select>
            {error && reasignando ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end">
              <Button disabled={pending || !destinoId} onClick={revisarReasignacion}>Revisar servicios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={traslados.length > 0}
        onOpenChange={(abierto) => !abierto && setTraslados((cola) => cola.slice(1))}
        title={traslados[0] ? "Mover los " + traslados[0].servicioIds.length + " servicios sin iniciar de " + traslados[0].placaOrigen + " a " + traslados[0].placaDestino : ""}
        description="Los servicios pertenecen al vehículo: pasan a la tripulación vigente del vehículo de destino. Los que ya iniciaron desplazamiento se quedan donde están."
        confirmLabel="Mover servicios"
        cancelLabel="No mover"
        onConfirm={confirmarTraslado}
      />
    </Card>
  );
}
