"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDailyCheck, getDailyCheckForToday, getDailyCheckItemsForToday } from "@/app/api/actions/ovem";
import { subirFotoPreoperacional } from "@/app/api/actions/vehiculo-fotos";
import { FotosVehiculo } from "@/components/vehiculos/fotos-vehiculo";
import { SelectorFotosNuevas } from "@/components/vehiculos/selector-fotos-nuevas";
import { columnaDeLado, type FotosVehiculo as FotosVehiculoType, type LadoVehiculo } from "@/lib/vehiculo-fotos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncidentForm } from "@/components/dashboard/incident-form";
import { MisServicios } from "@/components/servicios/mis-servicios";
import {
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  ArrowLeft,
  Ambulance,
  Fuel,
  RefreshCw,
  Siren,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehiculoConDocumentos } from "@/lib/vencimientos";
import { ChecklistItemRow, agruparPorCategoria, checklistPayload, type ChecklistItem } from "./checklist-item-row";
import { validarPreoperacional } from "@/lib/preoperacional";
import { aplicaAlTipo } from "@/lib/checklist-tipo";
import {
  claveBorrador,
  evaluarKilometraje,
  idsNuevos,
  leerBorrador,
  parseKilometraje,
  resumirRespuestas,
  serializarBorrador,
  textoResumen,
  type RespuestasChecklist,
} from "@/lib/ovem-portal";
import { CombustibleForm } from "./combustible-form";
import { SiniestroForm } from "./siniestro-form";
import { DocumentosVehiculo } from "./documentos-vehiculo";
import { alertNewService, useAutoRefresh } from "./use-auto-refresh";

interface OvemPortalProps {
  userId: string;
  userName: string;
  vehicles: Array<
    VehiculoConDocumentos & {
      id: string;
      placa: string;
      marca?: string | null;
      modelo?: string | null;
      estado_actual?: string;
      centro_operativo?: string;
      tipo_vehiculo?: string | null;
    }
  >;
  checklistItems: ChecklistItem[];
  /** Hoy en hora de Colombia (YYYY-MM-DD), calculado en el servidor. */
  hoyBogota: string;
  isAdmin: boolean;
  viewerRole?: "OVEM" | "ADMIN";
  servicios?: Array<Record<string, unknown> & { id: number; etapa: string }>;
  /** Vehículos que Regulación le programó hoy a este conductor. Con uno solo se preselecciona. */
  vehiculosDeHoy?: string[];
  /** Último kilometraje conocido por vehículo, para la ayuda y el aviso al digitar. */
  ultimoKmPorVehiculo?: Record<string, number>;
}

type Flow = null | "preoperacional" | "combustible" | "novedad" | "siniestro" | "servicios";

const FLOW_LABEL: Record<Exclude<Flow, null>, string> = {
  preoperacional: "Preoperacional",
  combustible: "Tanqueo",
  novedad: "Reporte de novedad",
  siniestro: "Siniestro vial",
  servicios: "Mis servicios",
};

/** Referencia estable: un `[]` por defecto se recrearía en cada render y dispararía los efectos que dependen de él. */
const SIN_SERVICIOS: NonNullable<OvemPortalProps["servicios"]> = [];
const SIN_VEHICULOS_DE_HOY: string[] = [];
const SIN_KM: Record<string, number> = {};

/** Cómo quedó elegido el vehículo; solo para explicarlo en pantalla. */
type OrigenVehiculo = "unico" | "hoy" | "ultimo" | "manual" | null;

const claveUltimoVehiculo = (userId: string) => `sismanto_ovem_ultimo_vehiculo_${userId}`;

function leerSession(clave: string): string | null {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}
function escribirSession(clave: string, valor: string | null) {
  try {
    if (valor === null) sessionStorage.removeItem(clave);
    else sessionStorage.setItem(clave, valor);
  } catch {
    /* almacenamiento bloqueado: se pierde el borrador, no el trabajo en pantalla */
  }
}

function horaCorta(d: Date): string {
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" });
}

export function OvemPortal({
  userId,
  userName,
  vehicles,
  checklistItems,
  hoyBogota,
  isAdmin,
  viewerRole = "ADMIN",
  servicios = SIN_SERVICIOS,
  vehiculosDeHoy = SIN_VEHICULOS_DE_HOY,
  ultimoKmPorVehiculo = SIN_KM,
}: OvemPortalProps) {
  const router = useRouter();
  const serviciosActivos = useMemo(
    () => servicios.filter((s) => s.etapa === "PROGRAMADO" || s.etapa === "CURSO"),
    [servicios]
  );
  const [flow, setFlow] = useState<Flow>(null);
  // El vehículo se conserva entre flujos: se elige una vez (o llega preseleccionado) y vale para toda la sesión.
  const [vehicleId, setVehicleId] = useState<string>(() => {
    if (vehicles.length === 1) return vehicles[0].id;
    if (vehiculosDeHoy.length === 1 && vehicles.some((v) => v.id === vehiculosDeHoy[0])) return vehiculosDeHoy[0];
    return "";
  });
  const [origenVehiculo, setOrigenVehiculo] = useState<OrigenVehiculo>(() => {
    if (vehicles.length === 1) return "unico";
    if (vehiculosDeHoy.length === 1 && vehicles.some((v) => v.id === vehiculosDeHoy[0])) return "hoy";
    return null;
  });
  const [km, setKm] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [showNovedadDialog, setShowNovedadDialog] = useState(false);
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  /** Confirmación que sobrevive al volver al menú (tanqueo, siniestro). */
  const [aviso, setAviso] = useState<string | null>(null);
  const [checkItemsState, setCheckItemsState] = useState<RespuestasChecklist>({});
  const [incidentFromItem, setIncidentFromItem] = useState<null | { title: string; desc: string }>(
    null
  );
  /** Ya se intentó enviar con ítems sin responder: se resaltan. */
  const [resaltarPendientes, setResaltarPendientes] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  /** Preoperacional de hoy ya enviado: habilita el paso opcional de las 4 fotos del vehículo. */
  const [dailyCheckId, setDailyCheckId] = useState<number | null>(null);
  const [fotosPreop, setFotosPreop] = useState<FotosVehiculoType>({});
  /** Fotos elegidas en el formulario antes de enviar (mismo lugar que SISRES); se suben al confirmar el envío. */
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState<Partial<Record<LadoVehiculo, File>>>({});
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  /** `${vehicleId}|${hoy}` del borrador ya cargado; evita guardar el estado de un vehículo bajo la clave de otro. */
  const [cargadoPara, setCargadoPara] = useState<string | null>(null);
  const baselineRef = useRef<string | null>(null);

  const hoy = hoyBogota; // día de hoy en Colombia, calculado en el servidor
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const ultimoKm = vehicleId ? (ultimoKmPorVehiculo[vehicleId] ?? null) : null;

  // Vehículo de hoy primero en la lista.
  const vehiculosOrdenados = useMemo(() => {
    const deHoy = new Set(vehiculosDeHoy);
    return [...vehicles].sort((a, b) => Number(deHoy.has(b.id)) - Number(deHoy.has(a.id)));
  }, [vehicles, vehiculosDeHoy]);

  // Sin asignación de hoy: el último vehículo usado en este teléfono (se lee tras montar, no en el render del servidor).
  useEffect(() => {
    if (vehicleId) return;
    try {
      const ultimo = localStorage.getItem(claveUltimoVehiculo(userId));
      if (ultimo && vehicles.some((v) => v.id === ultimo)) {
        setVehicleId(ultimo);
        setOrigenVehiculo("ultimo");
      }
    } catch {
      /* sin localStorage: se elige a mano */
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elegirVehiculo = (id: string) => {
    setVehicleId(id);
    setOrigenVehiculo("manual");
    try {
      localStorage.setItem(claveUltimoVehiculo(userId), id);
    } catch {
      /* sin localStorage */
    }
  };

  /* ─── Refresco automático de «Mis servicios» (MOV-02) ─── */
  const refrescarServicios = viewerRole === "OVEM" && (flow === null || flow === "servicios");
  const refrescarAhora = useAutoRefresh(refrescarServicios);
  const [actualizado, setActualizado] = useState<Date | null>(null);
  const [avisoNuevo, setAvisoNuevo] = useState<string | null>(null);
  const idsPrevios = useRef<number[] | null>(null);

  // Cada vez que el servidor entrega servicios (carga o refresco) se marca la hora.
  useEffect(() => {
    setActualizado(new Date());
  }, [servicios]);

  const claveIdsActivos = serviciosActivos.map((s) => s.id).join(",");
  useEffect(() => {
    if (viewerRole !== "OVEM") return;
    const actuales = serviciosActivos.map((s) => s.id);
    const nuevos = idsNuevos(idsPrevios.current, actuales);
    idsPrevios.current = actuales;
    if (nuevos.length === 0) return;
    const detalle = serviciosActivos.find((s) => s.id === nuevos[0]);
    const tipo = detalle ? String(detalle.tipo_servicio ?? "") : "";
    setAvisoNuevo(
      nuevos.length === 1
        ? `Tienes un servicio nuevo asignado: #${nuevos[0]}${tipo ? ` · ${tipo}` : ""}.`
        : `Tienes ${nuevos.length} servicios nuevos asignados.`
    );
    alertNewService();
    // La clave de ids resume a serviciosActivos: solo reacciona cuando cambia el conjunto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveIdsActivos, viewerRole]);

  const claveCarga = vehicleId ? `${vehicleId}|${hoy}` : null;

  /* ─── Carga del preoperacional de hoy + borrador local (MOV-04) ─── */
  useEffect(() => {
    if (!vehicleId || flow !== "preoperacional") {
      setDailyCheckDone(false);
      setDailyCheckId(null);
      setFotosPreop({});
      setFotosSeleccionadas({});
      setCargadoPara(null);
      baselineRef.current = null;
      return;
    }
    let cancelado = false;
    setCargadoPara(null);
    (async () => {
      // El propio OVEM: exacto a su nombre. Quien solo supervisa (ADMIN, "Ver como" aparte): el del vehículo hoy,
      // sea quien sea que lo haya registrado — la RLS de daily_checks ya le deja ver cualquier fila.
      const propio = viewerRole === "OVEM" ? userId : undefined;
      const [dc, items] = await Promise.all([
        getDailyCheckForToday(vehicleId, propio),
        getDailyCheckItemsForToday(vehicleId, propio),
      ]);
      if (cancelado) return;
      const map: RespuestasChecklist = {};
      for (const it of items as any[]) {
        map[it.checklist_item_id] = {
          estado: it.estado,
          cantidadOk: it.cantidad_ok ?? undefined,
          observacion: it.observacion ?? undefined,
        };
      }
      const kmServidor = dc?.kilometraje_inicial ? String(dc.kilometraje_inicial) : "";
      const obsServidor = dc?.observaciones || "";
      setDailyCheckDone(Boolean(dc));
      setDailyCheckId((dc as { id?: number } | null)?.id ?? null);
      setFotosPreop((dc as FotosVehiculoType | null) ?? {});
      baselineRef.current = serializarBorrador({ km: kmServidor, observaciones: obsServidor, items: map });
      // Un borrador sin enviar de este vehículo y día gana sobre lo ya guardado en el servidor.
      const borrador = leerBorrador(leerSession(claveBorrador(vehicleId, hoy)));
      setKm(borrador ? borrador.km : kmServidor);
      setObservaciones(borrador ? borrador.observaciones : obsServidor);
      setCheckItemsState(borrador ? borrador.items : map);
      setCargadoPara(`${vehicleId}|${hoy}`);
    })();
    return () => {
      cancelado = true;
    };
  }, [vehicleId, userId, flow, hoy, viewerRole]);

  // Al cambiar de flujo se limpian los campos propios de cada uno; el vehículo se conserva.
  useEffect(() => {
    setKm("");
    setError(null);
    setSuccess(null);
    setShowNovedadDialog(false);
    setCheckItemsState({});
    setResaltarPendientes(false);
    setMostrarResumen(false);
  }, [flow]);

  const cargado = flow === "preoperacional" && claveCarga !== null && cargadoPara === claveCarga;
  const borradorActual = serializarBorrador({ km, observaciones, items: checkItemsState });
  const hayCambios = cargado && borradorActual !== baselineRef.current;

  // Guarda el borrador mientras hay cambios sin enviar; si vuelve al estado del servidor, lo borra.
  useEffect(() => {
    if (!cargado || !vehicleId) return;
    escribirSession(claveBorrador(vehicleId, hoy), borradorActual === baselineRef.current ? null : borradorActual);
  }, [cargado, vehicleId, hoy, borradorActual]);

  // Aviso del navegador si cierra la pestaña con cambios sin enviar.
  useEffect(() => {
    if (!hayCambios) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hayCambios]);

  const checklistFiltrado = useMemo(() => {
    return checklistItems.filter((it) => {
      if (viewerRole === "OVEM" && it.descripcion === "Sticker Visible") return false;
      if (it.descripcion === "Radio Base") {
        const co = selectedVehicle?.centro_operativo;
        if (!co || String(co).toUpperCase() !== "AIRPLAN") return false;
      }
      // Dos listas: ambulancia (TAB/TAM) y automóvil o van (DOMI, VAN, ADMIN). Lo que no aplica va como NO_APLICA.
      if (!aplicaAlTipo(it.tipos_vehiculo, selectedVehicle?.tipo_vehiculo)) return false;
      return true;
    });
  }, [checklistItems, viewerRole, selectedVehicle?.centro_operativo, selectedVehicle?.tipo_vehiculo]);

  const checklistItemsByCategoria = useMemo(() => agruparPorCategoria(checklistFiltrado), [checklistFiltrado]);
  const resumen = useMemo(
    () => resumirRespuestas(checklistFiltrado.map((it) => it.id), checkItemsState),
    [checklistFiltrado, checkItemsState]
  );
  const kmNumero = parseKilometraje(km);
  const avisoKm = evaluarKilometraje(kmNumero, ultimoKm).mensaje;
  const fallasResumen = checklistFiltrado.filter((it) => checkItemsState[it.id]?.estado === "FALLA");

  /** Primer paso del envío: valida y abre el resumen; no guarda nada todavía. */
  const revisarChecklist = () => {
    if (!vehicleId || flow !== "preoperacional") return;
    setError(null);
    setSuccess(null);
    if (kmNumero === undefined || kmNumero <= 0) {
      setError("El kilometraje actual es obligatorio y debe ser mayor a cero.");
      return;
    }
    if (resumen.sinResponder > 0) {
      setResaltarPendientes(true);
      setError(
        `Faltan ${resumen.sinResponder} ítem${resumen.sinResponder === 1 ? "" : "s"} por responder. Responde cada uno de forma consciente: la revisión es ítem por ítem.`
      );
      return;
    }
    const errorChecklist = validarPreoperacional(checklistItems, armarItems());
    if (errorChecklist) {
      setError(errorChecklist);
      return;
    }
    setMostrarResumen(true);
  };

  /** Ítems visibles respondidos + los ocultos por tipo de vehículo como NO_APLICA (misma regla que ya validaba el servidor). */
  const armarItems = () => {
    const idsVisibles = new Set(checklistFiltrado.map((it) => it.id));
    const visibles = checklistPayload(checklistFiltrado, checkItemsState);
    const noAplicaOcultos = checklistItems
      .filter((it) => !idsVisibles.has(it.id))
      .map((it) => ({
        checklistItemId: it.id,
        estado: "NO_APLICA" as const,
        observacion: undefined as string | undefined,
      }));
    return [...visibles, ...noAplicaOcultos];
  };

  const handleSubmitChecklist = async () => {
    if (!vehicleId || flow !== "preoperacional" || kmNumero === undefined) return;
    setMostrarResumen(false);
    setLoading(true);
    setError(null);
    setSuccess(null);
    const items = armarItems();
    try {
      const result = await submitDailyCheck({
        userId,
        vehicleId,
        fecha: hoy,
        kilometrajeInicial: kmNumero,
        kilometrajeFinal: kmNumero,
        observaciones: observaciones || undefined,
        items,
      });
      if (result?.error) setError(result.error);
      else {
        const avisoServidor = result?.hallazgos?.mensaje;
        if (avisoServidor && (result?.hallazgos?.criticos ?? 0) > 0) setError(`Checklist guardado. ${avisoServidor}`);
        else setSuccess(avisoServidor ? `Checklist guardado. ${avisoServidor}` : "Checklist completado correctamente");
        setDailyCheckDone(true);
        const dcId = result?.dailyCheckId ?? null;
        setDailyCheckId(dcId);
        // Las fotos elegidas en el formulario se suben ahora: el preoperacional recién existe, hace falta su id.
        if (dcId && Object.keys(fotosSeleccionadas).length > 0) {
          const subidas = await Promise.all(
            (Object.entries(fotosSeleccionadas) as [LadoVehiculo, File][]).map(
              async ([lado, file]) => [lado, await subirFotoPreoperacional(dcId, lado, file)] as const
            )
          );
          const nuevasFotos: FotosVehiculoType = {};
          let fallos = 0;
          for (const [lado, r] of subidas) {
            if ("ruta" in r) nuevasFotos[columnaDeLado(lado)] = r.ruta;
            else fallos++;
          }
          setFotosPreop((prev) => ({ ...prev, ...nuevasFotos }));
          setFotosSeleccionadas({});
          if (fallos > 0) {
            setError(`El checklist se guardó, pero ${fallos} foto${fallos === 1 ? "" : "s"} no se pudo subir. Vuelve a intentarlo abajo.`);
          }
        }
        // Lo enviado pasa a ser la base: ya no hay cambios pendientes ni borrador.
        baselineRef.current = serializarBorrador({ km, observaciones, items: checkItemsState });
        escribirSession(claveBorrador(vehicleId, hoy), null);
        router.refresh();
      }
    } catch {
      setError("No se pudo enviar: revisa tu señal. Tus respuestas siguen aquí; inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const goHub = () => {
    setFlow(null);
  };

  /** «Volver» con cambios sin enviar pide confirmación; el borrador queda guardado en el teléfono. */
  const pedirVolver = () => {
    if (hayCambios) setConfirmarSalida(true);
    else goHub();
  };

  const abrir = (f: Exclude<Flow, null>) => {
    setAviso(null);
    setFlow(f);
  };

  const acciones: Array<{ flow: Exclude<Flow, null>; icon: typeof Ambulance; titulo: string; detalle: string }> = [
    ...(viewerRole === "OVEM"
      ? [
          {
            flow: "servicios" as const,
            icon: Ambulance,
            titulo: "Mis servicios",
            detalle:
              serviciosActivos.length > 0
                ? `${serviciosActivos.length} servicio${serviciosActivos.length === 1 ? "" : "s"} asignado${serviciosActivos.length === 1 ? "" : "s"}`
                : "Servicios asignados por Regulación",
          },
        ]
      : []),
    { flow: "preoperacional", icon: ClipboardCheck, titulo: "Iniciar preoperacional", detalle: "Checklist diario, kilometraje y documentos" },
    { flow: "combustible", icon: Fuel, titulo: "Registrar tanqueo", detalle: "Galones, kilometraje y recibo" },
    { flow: "novedad", icon: AlertCircle, titulo: "Reportar novedad", detalle: "Falla o daño del vehículo" },
    { flow: "siniestro", icon: Siren, titulo: "Reportar siniestro", detalle: "Choque o accidente de tránsito" },
  ];

  /** Hora de la última actualización, aviso de servicio nuevo y botón manual (solo para el OVEM, en el menú y «Mis servicios»). */
  const barraActualizacion = refrescarServicios && (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {actualizado ? `Actualizado ${horaCorta(actualizado)}` : "Se actualiza cada 30 segundos"}
        </p>
        <Button type="button" variant="ghost" size="sm" className="min-h-11 gap-2" onClick={refrescarAhora}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Actualizar
        </Button>
      </div>
      <div role="status" aria-live="polite">
        {avisoNuevo && (
          <div className="flex items-start gap-2 rounded-lg border border-info bg-info-soft p-3 text-sm text-foreground">
            <p className="flex-1 font-medium">{avisoNuevo}</p>
            <button
              type="button"
              aria-label="Cerrar aviso"
              className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-black/5"
              onClick={() => setAvisoNuevo(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* Flujo inicial: opciones sin exigir asignaciones */
  if (flow === null) {
    return (
      <div className="space-y-6">
        {aviso && (
          <p className="rounded-lg border border-success bg-success-soft p-3 text-sm text-foreground" role="status">
            {aviso}
          </p>
        )}
        {barraActualizacion}
        <Card>
          <CardHeader>
            <CardTitle>¿Qué vas a hacer?</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {acciones.map(({ flow: f, icon: Icon, titulo, detalle }) => (
              <Button
                key={f}
                className={cn(
                  "h-auto min-h-24 flex-col gap-2 px-2 py-4",
                  // Con cinco acciones, siniestro ocupa la fila completa en el celular.
                  f === "siniestro" && "col-span-2 border-red-200 lg:col-span-1"
                )}
                variant="outline"
                onClick={() => abrir(f)}
              >
                <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", f === "siniestro" && "text-red-600")} />
                <span className="whitespace-normal text-center text-sm font-semibold sm:text-base">{titulo}</span>
                {/* En el celular solo queda el conteo de servicios; el resto es obvio por el título. */}
                <span
                  className={cn(
                    "whitespace-normal text-center text-xs font-normal text-muted-foreground",
                    f === "servicios" ? "block" : "hidden sm:block"
                  )}
                >
                  {detalle}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {!isAdmin && vehicles.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No hay vehículos en el sistema todavía. Si crees que es un error, contacta al administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const descripcionVehiculo =
    origenVehiculo === "hoy"
      ? "Es tu vehículo de hoy según Regulación. Cámbialo si vas a usar otro."
      : origenVehiculo === "ultimo"
        ? "Es el último que usaste. Cámbialo si vas a usar otro."
        : origenVehiculo === "manual"
          ? "Este vehículo se mantiene en las demás acciones. Cámbialo si hace falta."
          : "Elígelo una vez: se mantiene en las demás acciones.";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={pedirVolver} className="h-11 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <p className="text-sm text-muted-foreground">{FLOW_LABEL[flow]}</p>
      </div>

      {flow === "servicios" && (
        <>
          {barraActualizacion}
          <MisServicios servicios={servicios as any} />
        </>
      )}

      {flow !== "servicios" && vehicles.length === 1 && selectedVehicle && (
        <p className="text-sm text-foreground">
          Vehículo: <span className="font-semibold">{selectedVehicle.placa}</span>
          {selectedVehicle.marca ? ` — ${selectedVehicle.marca}` : ""}
        </p>
      )}

      {flow !== "servicios" && vehicles.length !== 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Vehículo</CardTitle>
            <CardDescription>{descripcionVehiculo}</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="ovem-vehiculo" className="sr-only">
              Vehículo
            </Label>
            <Select value={vehicleId} onValueChange={elegirVehiculo}>
              <SelectTrigger id="ovem-vehiculo" className="min-h-11">
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehiculosOrdenados.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa}
                    {v.marca ? ` — ${v.marca}` : ""}
                    {vehiculosDeHoy.includes(v.id) ? " · asignado hoy" : ""}
                    {v.estado_actual === "FUERA_DE_SERVICIO" ? " (fuera de servicio)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {vehicleId && selectedVehicle && flow === "preoperacional" && (
        <DocumentosVehiculo
          placa={selectedVehicle.placa}
          vehiculo={selectedVehicle}
          hoy={hoyBogota}
          esAeroportuario={String(selectedVehicle.centro_operativo ?? "").toUpperCase() === "AIRPLAN"}
        />
      )}

      {vehicleId && selectedVehicle && flow === "combustible" && (
        <CombustibleForm
          vehicleId={vehicleId}
          placa={selectedVehicle.placa}
          hoy={hoyBogota}
          ultimoKm={ultimoKm}
          onDone={() => {
            setFlow(null);
            setAviso(`Tanqueo de ${selectedVehicle.placa} registrado.`);
          }}
        />
      )}

      {vehicleId && selectedVehicle && flow === "siniestro" && (
        <SiniestroForm
          vehicleId={vehicleId}
          placa={selectedVehicle.placa}
          onDone={() => {
            setFlow(null);
            setAviso(`Siniestro de ${selectedVehicle.placa} reportado. Regulación ya lo ve en novedades.`);
          }}
        />
      )}

      {vehicleId && flow === "novedad" && (
        <Card>
          <CardHeader>
            <CardTitle>Reportar novedad</CardTitle>
            <CardDescription>
              Vehículo {selectedVehicle?.placa}. La prioridad operativa la asigna administración en el
              módulo de novedades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentForm
              vehicleId={vehicleId}
              afectaOperatividad={false}
              onSuccess={() => {
                router.refresh();
                setFlow(null);
              }}
              reportadoPorDefault={userName}
              hideSeveridad
            />
          </CardContent>
        </Card>
      )}

      {vehicleId && flow === "preoperacional" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Checklist pre-operacional diario
              </CardTitle>
              <CardDescription>Revisa los puntos antes de iniciar tu turno.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Responde cada ítem de forma independiente. Si un ítem falla, descríbela y desde ahí puedes
                reportar una novedad (ej: &quot;farola delantera sin luz media&quot;).
              </p>

              {viewerRole === "OVEM" && checklistFiltrado.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
                  <p className="text-sm text-foreground">
                    Respondidos {resumen.total - resumen.sinResponder} de {resumen.total}
                  </p>
                </div>
              )}

              {checklistFiltrado.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay ítems activos del checklist en este momento. Comunícate con coordinación o administración
                  para que configuren el preoperacional de tu centro.
                </p>
              )}

              {checklistItemsByCategoria.map(([categoria, items]) => (
                <div key={categoria} className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">
                    {categoria.replaceAll("_", " ")}
                  </h3>
                  <div className="space-y-2">
                    {items.map((it) => (
                      <ChecklistItemRow
                        key={it.id}
                        item={it}
                        state={checkItemsState[it.id]}
                        exigirRespuesta
                        resaltarPendiente={resaltarPendientes}
                        fallaPlaceholder="Describe la falla (ej: farola sin luz media)"
                        onChange={(next) => setCheckItemsState((prev) => ({ ...prev, [it.id]: next }))}
                        onReportarNovedad={() => {
                          const st = checkItemsState[it.id];
                          setIncidentFromItem({
                            title: `Reportar novedad — ${selectedVehicle?.placa}`,
                            desc:
                              `${categoria.replaceAll("_", " ")}: ${it.descripcion}. ` +
                              (st?.observacion ? `Detalle: ${st.observacion}` : "Detalle: "),
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <Label htmlFor="km-inicial">Kilometraje actual</Label>
                <span className="text-destructive"> *</span>
                <Input
                  id="km-inicial"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.\s]+"
                  enterKeyHint="next"
                  required
                  aria-describedby="km-inicial-ayuda"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="Ej: 125000"
                  className="mt-1 max-w-xs"
                />
                <p id="km-inicial-ayuda" className="mt-1 text-xs text-muted-foreground">
                  {ultimoKm ? `Último: ${ultimoKm.toLocaleString("es-CO")} km` : "Número que marca el tablero."}
                </p>
                {avisoKm && (
                  <p
                    role="status"
                    className="mt-2 rounded border border-warning bg-warning-soft p-2 text-sm text-warning-foreground"
                  >
                    {avisoKm}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="obs">Observaciones</Label>
                <Textarea
                  id="obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones del checklist..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {success && (
                <p role="status" className="text-sm text-success">
                  {success}
                </p>
              )}
              {!dailyCheckId && viewerRole === "OVEM" ? (
                // Mismo lugar que SISRES: las 4 fotos van en el formulario, antes de enviar — no un paso aparte
                // después. Solo quedan elegidas aquí; se suben de verdad al confirmar el envío (abajo).
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">Fotos del vehículo (opcional)</p>
                  <SelectorFotosNuevas
                    valores={fotosSeleccionadas}
                    onChange={(lado, file) =>
                      setFotosSeleccionadas((prev) => {
                        const next = { ...prev };
                        if (file) next[lado] = file;
                        else delete next[lado];
                        return next;
                      })
                    }
                  />
                </div>
              ) : dailyCheckId ? (
                // Ya enviado hoy: reemplazar una foto (el propio OVEM) o solo verlas (quien supervisa).
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">Fotos del vehículo{viewerRole === "OVEM" ? " (opcional)" : ""}</p>
                  <FotosVehiculo
                    fotos={fotosPreop}
                    onUpload={(lado, file) => subirFotoPreoperacional(dailyCheckId, lado, file)}
                    deshabilitado={viewerRole !== "OVEM"}
                  />
                </div>
              ) : null}
              {viewerRole === "OVEM" ? (
                <Button className="min-h-11" onClick={revisarChecklist} disabled={loading}>
                  {loading ? "Guardando..." : dailyCheckDone ? "Revisar y actualizar" : "Revisar y enviar"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Solo el OVEM del vehículo envía el preoperacional; desde este rol la vista es de consulta.
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2 sm:w-auto"
            onClick={() => setShowNovedadDialog(true)}
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Reportar novedad
          </Button>
        </>
      )}

      <Dialog open={mostrarResumen} onOpenChange={setMostrarResumen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisa antes de enviar</DialogTitle>
            <DialogDescription>
              {selectedVehicle?.placa} · {kmNumero !== undefined ? `${kmNumero.toLocaleString("es-CO")} km` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-lg font-semibold text-foreground">{textoResumen(resumen)}</p>
            {fallasResumen.length > 0 && (
              <ul className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                {fallasResumen.map((it) => (
                  <li key={it.id}>
                    <span className="font-medium">{it.descripcion}</span>
                    {checkItemsState[it.id]?.observacion ? `: ${checkItemsState[it.id]?.observacion}` : ""}
                  </li>
                ))}
              </ul>
            )}
            {avisoKm && (
              <p className="rounded border border-warning bg-warning-soft p-2 text-sm text-warning-foreground">
                Kilometraje: {avisoKm}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setMostrarResumen(false)}>
                Seguir revisando
              </Button>
              <Button type="button" className="min-h-11" onClick={handleSubmitChecklist}>
                {dailyCheckDone ? "Actualizar checklist" : "Enviar checklist"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmarSalida} onOpenChange={setConfirmarSalida}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tienes respuestas sin enviar</DialogTitle>
            <DialogDescription>
              Si sales, tus respuestas quedan guardadas en este teléfono y las recuperas al volver a este vehículo.
              No llegan a Regulación hasta que envíes el checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setConfirmarSalida(false);
                goHub();
              }}
            >
              Salir
            </Button>
            <Button type="button" className="min-h-11" onClick={() => setConfirmarSalida(false)}>
              Seguir aquí
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNovedadDialog} onOpenChange={setShowNovedadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar novedad — {selectedVehicle?.placa}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicleId}
            afectaOperatividad={false}
            onSuccess={() => {
              setShowNovedadDialog(false);
              router.refresh();
            }}
            reportadoPorDefault={userName}
            hideSeveridad
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!incidentFromItem} onOpenChange={() => setIncidentFromItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{incidentFromItem?.title || "Reportar novedad"}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicleId}
            afectaOperatividad={false}
            onSuccess={() => {
              setIncidentFromItem(null);
              router.refresh();
            }}
            reportadoPorDefault={userName}
            hideSeveridad
            initialDescripcion={incidentFromItem?.desc}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
