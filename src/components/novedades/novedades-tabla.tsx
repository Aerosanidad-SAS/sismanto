"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort } from "@/lib/utils";
import {
  updateIncidentPrioridad,
  closeIncident,
  getMantenimientosPorVehiculo,
} from "@/app/api/actions/incidents";

function getSeverityBadgeVariant(severidad: string) {
  switch (severidad) {
    case "ALTA":
      return "destructive";
    case "MEDIA":
      return "default";
    case "BAJA":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusBadgeVariant(estado: string) {
  switch (estado) {
    case "CERRADO":
      return "success";
    case "EN_PROCESO":
      return "default";
    case "ABIERTO":
      return "destructive";
    default:
      return "outline";
  }
}

export interface NovedadRow {
  id: number;
  vehicle_id: string;
  fecha_reporte: string;
  descripcion: string;
  severidad: string;
  /** Prioridad administrativa (columna nueva en BD) */
  prioridad?: string | null;
  reportado_por: string;
  estado: string;
  afecta_operatividad: boolean | null;
  fecha_cierre?: string | null;
  vehicles?: { placa: string };
}

interface NovedadesTablaProps {
  novedades: NovedadRow[];
  isAdmin: boolean;
  /** Puede cerrar novedades (ADMIN, ANALISTA, REGULACION, MANTENIMIENTO) */
  puedeCerrar: boolean;
  /** Puede además crear un mantenimiento nuevo desde el cierre (ADMIN, ANALISTA, MANTENIMIENTO) */
  puedeCrearMantenimiento: boolean;
}

type PasoCierre = "elegir" | "existente" | "nota";

export function NovedadesTabla({ novedades, isAdmin, puedeCerrar, puedeCrearMantenimiento }: NovedadesTablaProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  const [cerrando, setCerrando] = useState<NovedadRow | null>(null);
  const [paso, setPaso] = useState<PasoCierre>("elegir");
  const [mantenimientos, setMantenimientos] = useState<
    { id_manto: number; fecha: string; tipo: string; descripcion_trabajo: string | null }[]
  >([]);
  const [mantenimientoElegido, setMantenimientoElegido] = useState("");
  const [notaCierre, setNotaCierre] = useState("");
  const [cargandoMantenimientos, setCargandoMantenimientos] = useState(false);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);
  const [guardandoCierre, setGuardandoCierre] = useState(false);

  const handlePrioridad = async (incidentId: number, raw: string) => {
    let prioridad: "BAJA" | "MEDIA" | "ALTA" | null;
    if (raw === "__none__") prioridad = null;
    else prioridad = raw as "BAJA" | "MEDIA" | "ALTA";

    setBusyId(incidentId);
    const res = await updateIncidentPrioridad(incidentId, prioridad);
    setBusyId(null);
    if (res.error) alert(res.error);
    else router.refresh();
  };

  const abrirCierre = (novedad: NovedadRow) => {
    setCerrando(novedad);
    setPaso("elegir");
    setMantenimientos([]);
    setMantenimientoElegido("");
    setNotaCierre("");
    setErrorCierre(null);
  };

  const cerrarDialogo = () => {
    setCerrando(null);
    setGuardandoCierre(false);
  };

  const irAExistente = async () => {
    if (!cerrando) return;
    setPaso("existente");
    setCargandoMantenimientos(true);
    const data = await getMantenimientosPorVehiculo(cerrando.vehicle_id);
    setMantenimientos(data);
    setCargandoMantenimientos(false);
  };

  const irANuevo = () => {
    if (!cerrando) return;
    router.push(`/mantenimientos/nuevo?vehicleId=${cerrando.vehicle_id}&incidentId=${cerrando.id}`);
  };

  const confirmarExistente = async () => {
    if (!cerrando || !mantenimientoElegido) return;
    setGuardandoCierre(true);
    setErrorCierre(null);
    const res = await closeIncident(cerrando.id, { mantenimientoId: Number(mantenimientoElegido) });
    setGuardandoCierre(false);
    if (res.error) {
      setErrorCierre(res.error);
      return;
    }
    cerrarDialogo();
    router.refresh();
  };

  const confirmarNota = async () => {
    if (!cerrando) return;
    setGuardandoCierre(true);
    setErrorCierre(null);
    const res = await closeIncident(cerrando.id, { notaCierre: notaCierre });
    setGuardandoCierre(false);
    if (res.error) {
      setErrorCierre(res.error);
      return;
    }
    cerrarDialogo();
    router.refresh();
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha Reporte</TableHead>
          <TableHead>Vehículo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Clasif. reporte</TableHead>
          <TableHead>Prioridad (admin)</TableHead>
          <TableHead>Reportado Por</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Afecta Operatividad</TableHead>
          <TableHead>Fecha Cierre</TableHead>
          {puedeCerrar && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {novedades.map((novedad) => (
          <TableRow key={novedad.id}>
            <TableCell>{formatDateShort(novedad.fecha_reporte)}</TableCell>
            <TableCell className="font-medium">
              <Link
                href={`/vehiculos/${novedad.vehicle_id}`}
                className="text-primary hover:underline"
              >
                {novedad.vehicles?.placa}
              </Link>
            </TableCell>
            <TableCell className="max-w-md">
              <p className="truncate">{novedad.descripcion}</p>
            </TableCell>
            <TableCell>
              <Badge variant={getSeverityBadgeVariant(novedad.severidad)}>{novedad.severidad}</Badge>
            </TableCell>
            <TableCell className="min-w-[9rem]">
              {isAdmin ? (
                <Select
                  value={novedad.prioridad ?? "__none__"}
                  onValueChange={(v) => handlePrioridad(novedad.id, v)}
                  disabled={busyId === novedad.id}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                  </SelectContent>
                </Select>
              ) : novedad.prioridad ? (
                <Badge variant={getSeverityBadgeVariant(novedad.prioridad)}>{novedad.prioridad}</Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
            <TableCell>{novedad.reportado_por}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(novedad.estado)}>{novedad.estado}</Badge>
            </TableCell>
            <TableCell>
              {novedad.afecta_operatividad ? (
                <Badge variant="destructive">Sí</Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </TableCell>
            <TableCell>
              {novedad.fecha_cierre ? formatDateShort(novedad.fecha_cierre) : "—"}
            </TableCell>
            {puedeCerrar && (
              <TableCell className="text-right">
                {novedad.estado !== "CERRADO" && (
                  <Button variant="outline" size="sm" onClick={() => abrirCierre(novedad)}>
                    Cerrar
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>

    <Dialog open={Boolean(cerrando)} onOpenChange={(open) => !open && cerrarDialogo()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar novedad</DialogTitle>
          <DialogDescription>
            {cerrando ? `${cerrando.vehicles?.placa ?? ""} — ${cerrando.descripcion}` : ""}
          </DialogDescription>
        </DialogHeader>

        {paso === "elegir" && (
          <div className="space-y-4">
            <p className="text-sm">¿El cierre de esta novedad se asocia a un mantenimiento?</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={irAExistente}>
                Sí — ligar a un mantenimiento ya registrado
              </Button>
              {puedeCrearMantenimiento && (
                <Button variant="outline" onClick={irANuevo}>
                  Sí — registrar un mantenimiento nuevo
                </Button>
              )}
              <Button variant="outline" onClick={() => setPaso("nota")}>
                No — dejar una nota y cerrar
              </Button>
            </div>
          </div>
        )}

        {paso === "existente" && (
          <div className="space-y-4">
            {cargandoMantenimientos ? (
              <p className="text-sm text-muted-foreground">Cargando mantenimientos del vehículo…</p>
            ) : mantenimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este vehículo no tiene mantenimientos registrados todavía. Usa la opción de registrar uno nuevo.
              </p>
            ) : (
              <Select value={mantenimientoElegido} onValueChange={setMantenimientoElegido}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el mantenimiento…" />
                </SelectTrigger>
                <SelectContent>
                  {mantenimientos.map((m) => (
                    <SelectItem key={m.id_manto} value={String(m.id_manto)}>
                      {formatDateShort(m.fecha)} — {m.tipo}
                      {m.descripcion_trabajo ? ` — ${m.descripcion_trabajo.slice(0, 40)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errorCierre && <p className="text-sm text-destructive">{errorCierre}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaso("elegir")} disabled={guardandoCierre}>
                Atrás
              </Button>
              <Button onClick={confirmarExistente} disabled={!mantenimientoElegido || guardandoCierre}>
                {guardandoCierre ? "Cerrando…" : "Cerrar novedad"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {paso === "nota" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Textarea
                value={notaCierre}
                onChange={(e) => setNotaCierre(e.target.value)}
                placeholder="Por qué se cierra esta novedad…"
                rows={3}
              />
            </div>
            {errorCierre && <p className="text-sm text-destructive">{errorCierre}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaso("elegir")} disabled={guardandoCierre}>
                Atrás
              </Button>
              <Button onClick={confirmarNota} disabled={notaCierre.trim().length < 5 || guardandoCierre}>
                {guardandoCierre ? "Cerrando…" : "Cerrar novedad"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
