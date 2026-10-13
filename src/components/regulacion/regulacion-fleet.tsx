"use client";

import { hoyBogota } from "@/lib/fechas";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  toggleVehicleStatus,
  asignarTripulacion,
  getTripulacionDeAyer,
  unassignVehicle,
} from "@/app/api/actions/regulacion";
import { ROLES_TRIPULACION } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogCombobox } from "@/components/forms/catalog-combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, UserPlus, UserMinus, History, Undo2 } from "lucide-react";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type TripulacionUser = { user_id: string; nombre_completo: string | null; email: string | null };

interface RegulacionFleetProps {
  fleet: any[];
  ovemUsers: TripulacionUser[];
  medicoUsers: TripulacionUser[];
  auxiliarUsers: TripulacionUser[];
  /** Tarjetas de disponibles / fuera de servicio. El tablero de Regulación las oculta. */
  mostrarResumen?: boolean;
}

const ROL_LABEL: Record<string, string> = {
  OVEM: "OVEM",
  MEDICO: "Médico",
  AUXILIAR_ENFERMERIA: "Auxiliar",
};

type Rol = (typeof ROLES_TRIPULACION)[number];
type Tripulacion = Record<Rol, string>;
const TRIPULACION_VACIA: Tripulacion = { OVEM: "", MEDICO: "", AUXILIAR_ENFERMERIA: "" };

/** Etiqueta visible de una persona; si dos comparten nombre se añade el correo para distinguirlas. */
function opcionesDe(users: TripulacionUser[]): { label: string; id: string }[] {
  const nombres = users.map((u) => u.nombre_completo || u.email || u.user_id);
  return users.map((u, i) => {
    const base = nombres[i];
    const repetido = nombres.filter((n) => n === base).length > 1;
    return { id: u.user_id, label: repetido && u.email ? `${base} (${u.email})` : base };
  });
}

function VehicleTile({
  v,
  tone,
  onToggle,
  onAssignClick,
  requestUnassign,
  loading,
}: {
  v: any;
  tone: "available" | "fds";
  onToggle: (v: any) => void;
  onAssignClick: (id: string) => void;
  requestUnassign: (assignmentId: number) => void;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-2.5 text-xs shadow-sm min-h-[7.5rem]",
        tone === "available" ? "border-success/30 bg-success-soft" : "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-tight">{v.placa}</div>
          <div className="truncate text-xs text-muted-foreground">{v.marca || v.modelo || "—"}</div>
        </div>
        <VehicleEstadoBadge
          vehicleId={v.id}
          estado={v.estado_actual}
          puedeEditar={false}
          etiqueta={v.estado_actual === "OPERATIVO" ? "Operativo" : "Fuera de servicio"}
          className="shrink-0 px-1.5 py-0"
        />
      </div>
      <div className="mt-1.5 min-h-[2.25rem] flex-1 text-xs text-muted-foreground">
        {v.assignments?.length > 0 ? (
          <div className="space-y-0.5">
            {v.assignments.map((a: any) => (
              <div key={a.id} className="flex items-center gap-1">
                <span className="shrink-0 font-medium text-foreground/70">{ROL_LABEL[a.rol_en_turno] ?? a.rol_en_turno}:</span>
                <span className="min-w-0 truncate">{a.driver?.nombre_completo || a.driver?.email || "—"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0 text-destructive"
                  onClick={() => requestUnassign(a.id)}
                  disabled={loading}
                  aria-label={`Desasignar a ${a.driver?.nombre_completo || a.driver?.email || "esta persona"} (${ROL_LABEL[a.rol_en_turno] ?? a.rol_en_turno})`}
                  title="Quitar de la tripulación"
                >
                  <UserMinus className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <span className="italic">Sin tripulación asignada</span>
        )}
      </div>
      <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 flex-1 min-w-[6.5rem] px-2",
            v.estado_actual === "OPERATIVO"
              ? "border-warning/60 text-foreground hover:bg-warning-soft"
              : "border-success/60 text-foreground hover:bg-success-soft"
          )}
          onClick={() => onToggle(v)}
          disabled={loading}
        >
          {v.estado_actual === "OPERATIVO" ? "Marcar fuera de servicio" : "Marcar operativo"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 px-2"
          onClick={() => onAssignClick(v.id)}
          disabled={loading}
          title="Asignar o cambiar tripulación"
        >
          <UserPlus className="mr-1 h-4 w-4" aria-hidden />
          Tripulación
        </Button>
      </div>
    </div>
  );
}

export function RegulacionFleet({
  fleet,
  ovemUsers,
  medicoUsers,
  auxiliarUsers,
  mostrarResumen = true,
}: RegulacionFleetProps) {
  const router = useRouter();
  const [assigningVehicle, setAssigningVehicle] = useState<string | null>(null);
  const [crew, setCrew] = useState<Tripulacion>(TRIPULACION_VACIA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mensaje dentro del diálogo de tripulación: el diálogo cubre la página, un error fuera de él no se ve.
  const [dialogMsg, setDialogMsg] = useState<{ tipo: "error" | "info"; texto: string } | null>(null);
  const [unassignAssignmentId, setUnassignAssignmentId] = useState<number | null>(null);
  const [confirmFds, setConfirmFds] = useState<{ id: string; placa: string } | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; deshacer?: () => void } | null>(null);
  const hoy = hoyBogota();

  const USERS_POR_ROL: Record<Rol, TripulacionUser[]> = {
    OVEM: ovemUsers,
    MEDICO: medicoUsers,
    AUXILIAR_ENFERMERIA: auxiliarUsers,
  };
  const opciones: Record<Rol, { label: string; id: string }[]> = {
    OVEM: opcionesDe(ovemUsers),
    MEDICO: opcionesDe(medicoUsers),
    AUXILIAR_ENFERMERIA: opcionesDe(auxiliarUsers),
  };

  // El aviso con "Deshacer" se retira solo.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 10_000);
    return () => clearTimeout(t);
  }, [aviso]);

  const openUnassignDialog = (assignmentId: number) => {
    setUnassignAssignmentId(assignmentId);
  };

  /** Quién está hoy en cada rol de un vehículo. */
  const tripulacionDe = (vehicleId: string | null): Tripulacion => {
    const actual: Tripulacion = { ...TRIPULACION_VACIA };
    const v = fleet.find((x) => x.id === vehicleId);
    for (const a of (v?.assignments ?? []) as any[]) {
      if (a.rol_en_turno in actual) actual[a.rol_en_turno as Rol] = a.user_id;
    }
    return actual;
  };

  const vehiculoEnEdicion = fleet.find((v) => v.id === assigningVehicle);
  const tripulacionActual = tripulacionDe(assigningVehicle);
  const rolesConCambio = ROLES_TRIPULACION.filter((r) => crew[r] && crew[r] !== tripulacionActual[r]);

  const abrirAsignar = (vehicleId: string) => {
    setCrew(tripulacionDe(vehicleId));
    setDialogMsg(null);
    setAssigningVehicle(vehicleId);
  };

  const cerrarAsignar = () => {
    setAssigningVehicle(null);
    setDialogMsg(null);
  };

  const elegirPersona = (rol: Rol, label: string) => {
    const id = opciones[rol].find((o) => o.label === label)?.id ?? "";
    setCrew((prev) => ({ ...prev, [rol]: id }));
    setDialogMsg(null);
  };

  const disponibles = fleet.filter((v) => v.estado_actual === "OPERATIVO");
  const fueraServicio = fleet.filter((v) => v.estado_actual === "FUERA_DE_SERVICIO");

  const conOvemHoy = disponibles.filter((v) => Array.isArray(v.assignments) && v.assignments.length > 0);
  const sinOvem = disponibles.filter((v) => !v.assignments || v.assignments.length === 0);

  const placasFds = fueraServicio
    .map((v) => String(v.placa || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const cambiarEstado = async (
    vehicleId: string,
    placa: string,
    nuevo: "OPERATIVO" | "FUERA_DE_SERVICIO",
    conDeshacer = true
  ) => {
    setLoading(true);
    setError(null);
    setAviso(null);
    const result = await toggleVehicleStatus(vehicleId, nuevo);
    if (result?.error) setError(result.error);
    else {
      if (conDeshacer) {
        const previo = nuevo === "OPERATIVO" ? "FUERA_DE_SERVICIO" : "OPERATIVO";
        setAviso({
          texto: `${placa} quedó ${nuevo === "OPERATIVO" ? "operativo" : "fuera de servicio"}.`,
          deshacer: () => void cambiarEstado(vehicleId, placa, previo, false),
        });
      }
      router.refresh();
    }
    setLoading(false);
  };

  /** Pasar a fuera de servicio pide confirmación; volver a operativo es directo y se puede deshacer. */
  const handleToggle = (v: any) => {
    if (v.estado_actual === "OPERATIVO") setConfirmFds({ id: v.id, placa: v.placa });
    else void cambiarEstado(v.id, v.placa, "OPERATIVO");
  };

  const handleAssign = async () => {
    if (!assigningVehicle || rolesConCambio.length === 0) return;
    setLoading(true);
    setDialogMsg(null);
    let fallo: string | null = null;
    let reasignados = 0;
    const liberados = new Set<string>();
    // Secuencial: cada asignación desactiva la anterior del mismo rol y reasigna servicios no iniciados.
    for (const rol of rolesConCambio) {
      const result = await asignarTripulacion(assigningVehicle, crew[rol], rol, hoy);
      if (result?.error) {
        fallo = `${ROL_LABEL[rol]}: ${result.error}`;
        break;
      }
      reasignados += "reasignados" in result ? result.reasignados ?? 0 : 0;
      if ("liberados" in result) result.liberados?.forEach((placa) => liberados.add(placa));
    }
    if (fallo) setDialogMsg({ tipo: "error", texto: fallo });
    else {
      cerrarAsignar();
      // DEU-01: antes los servicios PROGRAMADO sin iniciar se reasignaban en silencio, sin decir cuántos.
      const avisos: string[] = [];
      if (reasignados > 0) {
        avisos.push(`Los ${reasignados} servicio${reasignados === 1 ? "" : "s"} PROGRAMADO sin iniciar de este vehículo pasaron a la nueva tripulación.`);
      }
      // Una persona no puede estar en dos vehículos: avisar de dónde quedó libre su puesto.
      if (liberados.size > 0) {
        avisos.push(`Quedó libre su puesto en ${[...liberados].join(", ")}: una persona solo puede estar en un vehículo.`);
      }
      if (avisos.length > 0) setAviso({ texto: avisos.join(" ") });
    }
    // Si falló a medias, lo ya guardado debe verse reflejado.
    router.refresh();
    setLoading(false);
  };

  const repetirDeAyer = async () => {
    if (!assigningVehicle) return;
    setLoading(true);
    setDialogMsg(null);
    const result = await getTripulacionDeAyer(assigningVehicle);
    if ("error" in result && result.error) {
      setDialogMsg({ tipo: "error", texto: result.error });
    } else if ("tripulacion" in result) {
      const ayer = result.tripulacion ?? {};
      const siguiente: Tripulacion = { ...crew };
      let encontrados = 0;
      for (const rol of ROLES_TRIPULACION) {
        const id = ayer[rol];
        // Solo si la persona sigue activa con ese rol.
        if (id && USERS_POR_ROL[rol].some((u) => u.user_id === id)) {
          siguiente[rol] = id;
          encontrados++;
        }
      }
      if (encontrados === 0) {
        setDialogMsg({ tipo: "info", texto: "Ayer este vehículo no tenía tripulación registrada." });
      } else {
        setCrew(siguiente);
        setDialogMsg({ tipo: "info", texto: "Tripulación de ayer cargada. Revísala y pulsa «Guardar tripulación»." });
      }
    }
    setLoading(false);
  };

  const confirmUnassign = async () => {
    const id = unassignAssignmentId;
    if (id == null) return;
    setLoading(true);
    setError(null);
    const result = await unassignVehicle(id);
    setUnassignAssignmentId(null);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {mostrarResumen && (
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                Disponibles
                <HelpTrigger text="Vehículos en estado operativo (listos para despacho). Se desglosan abajo entre los que tienen OVEM asignado hoy y los que no." />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success tabular-nums">{disponibles.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Unidades operativas en inventario</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
            <div className="min-w-0 space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <XCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
                Fuera de servicio
                <HelpTrigger text="Vehículos marcados como no disponibles para despacho (mantenimiento, falla u otra causa). Las placas listadas corresponden al estado actual." />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-destructive tabular-nums">{fueraServicio.length}</div>
            {placasFds.length > 0 ? (
              <div className="max-h-28 overflow-y-auto rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1.5">
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Placas</p>
                <div className="flex flex-wrap gap-1">
                  {placasFds.map((p) => (
                    <Badge key={p} variant="destructive" className="font-mono text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Ninguna unidad fuera de servicio.</p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {error && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted p-3 text-sm"
        >
          <span>{aviso.texto}</span>
          {aviso.deshacer && (
            <Button type="button" variant="outline" size="sm" disabled={loading} onClick={aviso.deshacer}>
              <Undo2 className="mr-1 h-4 w-4" aria-hidden />
              Deshacer
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wide">
                Flota
                <HelpTrigger text="Vista operativa: a la izquierda, disponibles separados por si tienen tripulación asignada hoy (OVEM/médico/auxiliar) o no. A la derecha, unidades fuera de servicio en tarjetas compactas." />
              </CardTitle>
              <CardDescription className="mt-1 max-w-3xl text-xs leading-relaxed">
                Izquierda: disponibles en dos bloques (con tripulación hoy / sin tripulación). Derecha: fuera de servicio. Usa el botón de estado de cada tarjeta para
                marcar la unidad operativa o fuera de servicio, y el botón Tripulación para asignar OVEM, médico y auxiliar de una vez.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5 min-w-0">
              <section>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Con tripulación (en operación hoy)</h3>
                  <HelpTrigger text="Vehículos disponibles con al menos una persona (OVEM, médico o auxiliar) con asignación activa cuya vigencia incluye la fecha de hoy." />
                  <Badge variant="secondary" className="text-xs">
                    {conOvemHoy.length}
                  </Badge>
                </div>
                {conOvemHoy.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No hay disponibles con tripulación asignada en este momento.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {conOvemHoy.map((v: any) => (
                      <VehicleTile
                        key={v.id}
                        v={v}
                        tone="available"
                        onToggle={handleToggle}
                        onAssignClick={abrirAsignar}
                        requestUnassign={openUnassignDialog}
                        loading={loading}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Disponibles sin tripulación</h3>
                  <HelpTrigger text="Operativos en sistema pero sin nadie asignado para hoy: no salen a trabajar hasta que se les asigne tripulación desde esta pantalla." />
                  <Badge variant="outline" className="text-xs">
                    {sinOvem.length}
                  </Badge>
                </div>
                {sinOvem.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Todos los disponibles tienen tripulación asignada, o no hay disponibles.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {sinOvem.map((v: any) => (
                      <VehicleTile
                        key={v.id}
                        v={v}
                        tone="available"
                        onToggle={handleToggle}
                        onAssignClick={abrirAsignar}
                        requestUnassign={openUnassignDialog}
                        loading={loading}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Fuera de servicio</h3>
                <HelpTrigger text="Unidades no disponibles para despacho. Puedes devolverlas a disponible con el botón «Marcar operativo» de cada tarjeta." />
                <Badge variant="destructive" className="text-xs">
                  {fueraServicio.length}
                </Badge>
              </div>
              {fueraServicio.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No hay vehículos fuera de servicio.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {fueraServicio.map((v: any) => (
                    <VehicleTile
                      key={v.id}
                      v={v}
                      tone="fds"
                      onToggle={handleToggle}
                      onAssignClick={abrirAsignar}
                      requestUnassign={openUnassignDialog}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={unassignAssignmentId != null} onOpenChange={(o) => !o && setUnassignAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar de la tripulación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta persona dejará de estar asignada a esta unidad para la vigencia actual. Puedes asignar a otra persona después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={() => void confirmUnassign()}
            >
              {loading ? "Procesando…" : "Desasignar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFds != null} onOpenChange={(o) => !o && setConfirmFds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar {confirmFds?.placa} fuera de servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              La unidad deja de estar disponible para despacho. Podrás devolverla a operativa con «Marcar operativo» o con «Deshacer» en el aviso que aparece después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={() => {
                const objetivo = confirmFds;
                setConfirmFds(null);
                if (objetivo) void cambiarEstado(objetivo.id, objetivo.placa, "FUERA_DE_SERVICIO");
              }}
            >
              Marcar fuera de servicio
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!assigningVehicle} onOpenChange={(abierto) => !abierto && cerrarAsignar()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tripulación{vehiculoEnEdicion ? ` — ${vehiculoEnEdicion.placa}` : ""}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Elige quién va en cada rol y guarda una sola vez. Los roles que dejes como están no cambian. Para quitar a alguien usa el botón de desasignar de la tarjeta.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {ROLES_TRIPULACION.map((rol) => {
              const id = `tripulacion-${rol}`;
              const seleccion = opciones[rol].find((o) => o.id === crew[rol])?.label ?? "";
              return (
                <div key={rol}>
                  <label htmlFor={id} className="text-sm font-medium">
                    {ROL_LABEL[rol] ?? rol}
                  </label>
                  <div className="mt-1">
                    {opciones[rol].length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay usuarios activos con este rol.</p>
                    ) : (
                      <CatalogCombobox
                        id={id}
                        options={opciones[rol].map((o) => o.label)}
                        value={seleccion}
                        onChange={(label) => elegirPersona(rol, label)}
                        allowCustom={false}
                        placeholder={`Selecciona ${ROL_LABEL[rol]?.toLowerCase() ?? "persona"}`}
                        disabled={loading}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {dialogMsg && (
              <p
                role={dialogMsg.tipo === "error" ? "alert" : "status"}
                className={cn(
                  "rounded-md border p-3 text-sm",
                  dialogMsg.tipo === "error"
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : "bg-muted text-foreground"
                )}
              >
                {dialogMsg.texto}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => void repetirDeAyer()} disabled={loading}>
                <History className="mr-1 h-4 w-4" aria-hidden />
                Repetir tripulación de ayer
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cerrarAsignar}>
                  Cancelar
                </Button>
                <Button onClick={handleAssign} disabled={rolesConCambio.length === 0 || loading}>
                  {loading ? "Guardando…" : "Guardar tripulación"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
