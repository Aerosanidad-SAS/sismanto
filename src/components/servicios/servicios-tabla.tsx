"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateShort } from "@/lib/utils";
import { CatalogCombobox } from "@/components/forms/catalog-combobox";
import { AsyncCombobox } from "@/components/forms/async-combobox";
import { DEPARTAMENTOS_COLOMBIA } from "@/lib/colombia-geo";
import {
  medicalServiceSchema,
  type MedicalServiceFormData,
  type EtapaServicio,
  TURNO_OPCIONES,
  AISLAMIENTO_OPCIONES,
  FINALIDAD_TRASLADO_OPCIONES,
  METODO_PAGO_OPCIONES,
  PERIMETRO_OPCIONES,
  PERFIL_FORMULARIO_SERVICIO,
  perfilFormularioServicio,
} from "@/lib/validations";
import {
  crearServicioMedico,
  actualizarServicioMedico,
  cambiarEtapaServicio,
  getCatalogoCie,
} from "@/app/api/actions/servicios-medicos";
import { buscarPacientePorCedula } from "@/app/api/actions/pacientes";

const ENTREGA_DOMICILIO = "ENTREGA EN DOMICILIO";

export interface ServicioRow {
  id: number;
  patient_id: number | null;
  nombre_completo: string;
  fecha_hora_registro: string;
  tipo_servicio: string;
  vehicle_id: string | null;
  movil_placa: string | null;
  etapa: string;
  ciudad_origen: string | null;
  ciudad_destino: string | null;
  tiempo_total: number | null;
  valor_servicio: number | null;
  cliente: string | null;
  patients?: { cedula: string; nombre1: string; apellido1: string } | null;
  vehicles?: { placa: string } | null;
  [key: string]: unknown;
}

const ETAPA_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  PROGRAMADO: "default",
  CURSO: "secondary",
  FINALIZADO: "success",
  CANCELADO: "destructive",
  FALLIDO: "destructive",
  "NO EFECTIVO": "outline",
  DUPLICADO: "outline",
};

// SISRES no restringe a qué etapa se puede mover un servicio (Ronda 2,
// pregunta 3) — cualquier etapa distinta a la actual es una opción válida.
const ETAPAS_DESTINO = (etapaActual: string): EtapaServicio[] =>
  (Object.keys(ETAPA_BADGE) as EtapaServicio[]).filter((e) => e !== etapaActual);

// Tipos de servicio reales — verificados contra los 20.101 registros de
// producción de SISRES (Ronda 2, pregunta 2). MEDICINA DOMICILIARIA es el
// 84% del total; TAB SIMPLE y TAB SENCILLO son variantes de captura
// distintas pero ambas viven en datos reales, no se puede descartar ninguna.
const TIPOS_SERVICIO = [
  "MEDICINA DOMICILIARIA",
  "TAB SIMPLE",
  "TAB DOBLE",
  "TAB SENCILLO",
  "TAM SIMPLE",
  "TAM DOBLE",
  "TELEMEDICINA",
  "ENFERMERIA DOMICILIARIA",
  "TRASLADO AEREO",
];

type Perfil = keyof typeof PERFIL_FORMULARIO_SERVICIO;
type CampoDef = { name: keyof MedicalServiceFormData; label: string; type?: string; placeholder?: string; perfiles?: Perfil[] };
/** undefined en `perfiles` = visible en los 3 perfiles. */
const paraPerfil = (campos: CampoDef[], perfil: Perfil | null) =>
  campos.filter((c) => !c.perfiles || (perfil !== null && c.perfiles.includes(perfil)));

// Campos con catálogo real (dropdown/combobox) se renderizan aparte, más
// abajo — estas listas son solo los que quedan como texto libre. La
// asignación de cada campo a su perfil sigue la lista que pasó Regulación
// (QA 2026-07-22) — puede necesitar ajustes finos una vez que Regulación
// lo pruebe en vivo, no es un mapeo 100% cerrado todavía.
// Prestador queda como texto libre — en SISRES sale de la misma tabla
// `proveedores` que "Proveedor" (ver nota en CAMPOS_CIERRE), pendiente del
// export real de León.
const CAMPOS_PROGRAMACION: CampoDef[] = [
  { name: "fecha_hora_programacion", label: "Fecha/hora de programación", type: "datetime-local" },
  { name: "autorizacion", label: "Autorización", placeholder: "Número de autorización" },
  { name: "asesor", label: "Asesor quien solicita", placeholder: "Nombre del asesor", perfiles: ["TRASLADO"] },
  { name: "prestador", label: "Prestador", placeholder: "Catálogo pendiente — ver bolsa de QA", perfiles: ["TRASLADO"] },
  { name: "soporte", label: "Soporte", placeholder: "Oxígeno, ventilación, máscaras, control de líquidos…", perfiles: ["TRASLADO"] },
  { name: "condicion", label: "Condición", placeholder: "Condición del paciente", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "medio_asignacion", label: "Medio de asignación", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "poliza", label: "Póliza", perfiles: ["MEDICINA_DOMICILIARIA", "TELEMEDICINA"] },
  { name: "motivo_consulta", label: "Motivo de consulta", perfiles: ["TELEMEDICINA"] },
];

// Ciudad origen/destino quedan como texto libre (catálogo pendiente — ver
// QA_HALLAZGOS.md, requiere el export real de subregiones de León). Toda
// esta sección solo aplica a Medicina Domiciliaria y Traslado — Telemedicina
// no tiene ruta física.
const CAMPOS_RUTA: CampoDef[] = [
  { name: "ciudad_origen", label: "Ciudad origen", placeholder: "Catálogo pendiente — ver bolsa de QA" },
  { name: "direccion_origen", label: "Dirección origen", placeholder: "Dirección exacta de origen" },
  { name: "fecha_hora_llegada_origen", label: "Llegada a origen", type: "datetime-local" },
  { name: "fecha_hora_salida_origen", label: "Salida de origen", type: "datetime-local" },
  { name: "direccion_intermedia", label: "Dirección intermedia (opcional)", placeholder: "Solo si el traslado tiene punto intermedio", perfiles: ["TRASLADO"] },
  { name: "fecha_hora_llegada_intermedia", label: "Llegada intermedia", type: "datetime-local", perfiles: ["TRASLADO"] },
  { name: "fecha_hora_salida_intermedia", label: "Salida intermedia", type: "datetime-local", perfiles: ["TRASLADO"] },
  { name: "ciudad_destino", label: "Ciudad destino", placeholder: "Catálogo pendiente — ver bolsa de QA" },
  { name: "direccion_destino", label: "Dirección destino", placeholder: "Dirección exacta de destino" },
  { name: "fecha_hora_llegada_destino", label: "Llegada a destino", type: "datetime-local" },
  { name: "fecha_hora_salida_destino", label: "Salida de destino", type: "datetime-local", perfiles: ["TRASLADO"] },
];

// Prestador/Proveedor quedan como texto libre: en SISRES ambos salen de la
// misma tabla `proveedores`, que todavía no se migró a Aeromanto — hace
// falta el export real de León (ver QA_HALLAZGOS.md), no un catálogo propio.
const CAMPOS_CIERRE: CampoDef[] = [
  { name: "proveedor", label: "Proveedor", placeholder: "Catálogo pendiente — ver bolsa de QA", perfiles: ["TRASLADO"] },
  { name: "usuario_recibe", label: "Usuario que recibe", placeholder: "Quién recibe el servicio" },
  { name: "usuario_despacha", label: "Usuario que despacha", placeholder: "Quién despacha el servicio" },
  { name: "motivo_externo", label: "Motivo externo", placeholder: "Motivo externo (si aplica)" },
  { name: "motivo_interno", label: "Motivo interno", placeholder: "Motivo interno (si aplica)" },
  { name: "estado_servicio", label: "Estado del servicio", placeholder: "Estado del servicio" },
  { name: "ciudad_registro", label: "Ciudad de registro", placeholder: "Ciudad donde se registra el servicio" },
  { name: "turno_facturacion", label: "Turno de facturación", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "deducible", label: "Deducible", perfiles: ["MEDICINA_DOMICILIARIA", "TELEMEDICINA"] },
  { name: "incapa", label: "INCAPA", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "situacion", label: "Situación", perfiles: ["TRASLADO", "TELEMEDICINA"] },
  { name: "tiempo_a_restar", label: "Tiempo a restar (min)", type: "number", perfiles: ["TRASLADO"] },
  { name: "funcionario_aseguradora", label: "Funcionario aseguradora", perfiles: ["TELEMEDICINA"] },
  { name: "codigo_telemedicina", label: "Código", perfiles: ["TELEMEDICINA"] },
  { name: "correo_electronico", label: "Correo electrónico", type: "email", perfiles: ["TELEMEDICINA"] },
];

type PersonaTripulacion = { user_id: string; nombre_completo: string | null; email: string | null };

interface ServiciosTablaProps {
  servicios: ServicioRow[];
  vehiculos: { id: string; placa: string }[];
  clientes: string[];
  puedeEditar: boolean;
  /** Médicos activos disponibles para asignar directo a un servicio (sin vehículo/OVEM) — típico de Medicina Domiciliaria con prestador externo. */
  medicosDisponibles: PersonaTripulacion[];
  /** Tripulación activa hoy por vehículo (armada en Regulación) — para autocompletar al elegir móvil. */
  tripulacionPorVehiculo: Record<
    string,
    { ovem?: PersonaTripulacion; medico?: PersonaTripulacion; auxiliar?: PersonaTripulacion }
  >;
  /** Ciudad del usuario logueado — default de "ciudad origen" en un servicio nuevo. */
  ciudadDefault?: string | null;
}

const nombrePersona = (p?: PersonaTripulacion | null) => p?.nombre_completo || p?.email || null;

export function ServiciosTabla({
  servicios,
  vehiculos,
  clientes,
  puedeEditar,
  medicosDisponibles,
  tripulacionPorVehiculo,
  ciudadDefault,
}: ServiciosTablaProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState<string>("TODAS");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ServicioRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");

  const { register, handleSubmit, reset, setValue, watch, formState } =
    useForm<MedicalServiceFormData>({ resolver: zodResolver(medicalServiceSchema) });

  const [cieLabel, setCieLabel] = useState("");

  const tipoSeleccionado = watch("tipo_servicio");
  const vehiculoSeleccionado = watch("vehicle_id");
  const turnoSeleccionado = watch("turno_programacion");
  const cieSeleccionado = watch("cie_codigo");
  const aislamientoSeleccionado = watch("requiere_aislamiento");
  const finalidadSeleccionada = watch("finalidad_traslado");
  const aceptaIpsSeleccionado = watch("acepta_ips");
  const departamentoOrigenSeleccionado = watch("departamento_origen");
  const departamentoDestinoSeleccionado = watch("departamento_destino");
  const perimetroSeleccionado = watch("perimetro");
  const metodoPagoSeleccionado = watch("metodo_pago");
  const clienteSeleccionado = watch("cliente");
  const medicoIndependienteSeleccionado = watch("medico_user_id");

  // Perfil del formulario según el tipo de servicio — define qué secciones
  // se muestran (Regulación, QA 2026-07-22): Medicina/Enfermería
  // Domiciliaria, Traslado en ambulancia (TAM/TAB/Aéreo), o Telemedicina.
  const perfil = perfilFormularioServicio(tipoSeleccionado ?? "");
  const requiereRuta = perfil !== "TELEMEDICINA";
  const requiereMedicoIndependiente = perfil === "MEDICINA_DOMICILIARIA" || perfil === "TELEMEDICINA";

  const buscarCie = async (q: string) => {
    const resultados = await getCatalogoCie(q);
    return resultados.map((r) => ({ value: r.codigo, label: `${r.codigo} — ${r.descripcion}` }));
  };

  // Al elegir móvil, autocompletar la tripulación ya armada para ese
  // vehículo (Regulación → pantalla de Flota) — no hace falta reescribirla acá.
  const handleVehiculo = (vehicleId: string) => {
    setValue("vehicle_id", vehicleId === "__none__" ? "" : vehicleId);
    const tripulacion = tripulacionPorVehiculo[vehicleId];
    setValue("ovem_user_id", tripulacion?.ovem?.user_id ?? "");
    setValue("auxiliar_user_id", tripulacion?.auxiliar?.user_id ?? "");
    // El médico de la tripulación del vehículo solo aplica al perfil de
    // Traslado — en Medicina Domiciliaria el médico se elige aparte
    // (puede ser un prestador externo sin vehículo).
    if (perfil === "TRASLADO") setValue("medico_user_id", tripulacion?.medico?.user_id ?? "");
  };

  const tripulacionVehiculoActual = vehiculoSeleccionado ? tripulacionPorVehiculo[vehiculoSeleccionado] : undefined;

  const filtrados = useMemo(() => {
    let lista = servicios;
    if (filtroEtapa !== "TODAS") lista = lista.filter((s) => s.etapa === filtroEtapa);
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(
      (s) =>
        s.nombre_completo.toLowerCase().includes(q) ||
        (s.patients?.cedula ?? "").toLowerCase().includes(q) ||
        (s.vehicles?.placa ?? s.movil_placa ?? "").toLowerCase().includes(q) ||
        s.tipo_servicio.toLowerCase().includes(q) ||
        (s.cliente ?? "").toLowerCase().includes(q)
    );
  }, [servicios, busqueda, filtroEtapa]);

  const buscarPaciente = async () => {
    if (!cedulaBusqueda.trim()) return;
    const paciente = await buscarPacientePorCedula(cedulaBusqueda.trim());
    if (!paciente) {
      setError("Paciente no encontrado — regístralo primero en el módulo Pacientes");
      return;
    }
    setError(null);
    setValue("patient_id", paciente.id);
    setValue(
      "nombre_completo",
      [paciente.nombre1, paciente.nombre2, paciente.apellido1, paciente.apellido2]
        .filter(Boolean)
        .join(" ")
    );
  };

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    setCedulaBusqueda("");
    setCieLabel("");
    reset({ tipo_servicio: "", ciudad_origen: ciudadDefault ?? "" } as MedicalServiceFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (s: ServicioRow) => {
    setEditando(s);
    setError(null);
    setCedulaBusqueda(s.patients?.cedula ?? "");
    setCieLabel("");
    const str = (k: string) => (s[k] ? String(s[k]) : "");
    const fecha = (k: string) => (s[k] ? String(s[k]).slice(0, 16) : "");
    reset({
      patient_id: s.patient_id ?? undefined,
      nombre_completo: s.nombre_completo,
      tipo_servicio: s.tipo_servicio,
      vehicle_id: s.vehicle_id ?? "",
      ovem_user_id: str("ovem_user_id"),
      medico_user_id: str("medico_user_id"),
      auxiliar_user_id: str("auxiliar_user_id"),
      fecha_hora_inicio_desplazamiento: fecha("fecha_hora_inicio_desplazamiento"),
      fecha_hora_programacion: fecha("fecha_hora_programacion"),
      turno_programacion: str("turno_programacion"),
      autorizacion: str("autorizacion"),
      asesor: str("asesor"),
      prestador: str("prestador"),
      cie_codigo: str("cie_codigo"),
      requiere_aislamiento: str("requiere_aislamiento"),
      soporte: str("soporte"),
      departamento_origen: str("departamento_origen"),
      ciudad_origen: str("ciudad_origen"),
      departamento_destino: str("departamento_destino"),
      ciudad_destino: str("ciudad_destino"),
      perimetro: str("perimetro"),
      direccion_origen: str("direccion_origen"),
      fecha_hora_llegada_origen: fecha("fecha_hora_llegada_origen"),
      fecha_hora_salida_origen: fecha("fecha_hora_salida_origen"),
      direccion_intermedia: str("direccion_intermedia"),
      fecha_hora_llegada_intermedia: fecha("fecha_hora_llegada_intermedia"),
      fecha_hora_salida_intermedia: fecha("fecha_hora_salida_intermedia"),
      direccion_destino: str("direccion_destino"),
      fecha_hora_llegada_destino: fecha("fecha_hora_llegada_destino"),
      fecha_hora_salida_destino: fecha("fecha_hora_salida_destino"),
      finalidad_traslado: str("finalidad_traslado"),
      acepta_ips: str("acepta_ips"),
      valor_servicio: s.valor_servicio ?? undefined,
      metodo_pago: str("metodo_pago"),
      cliente: str("cliente"),
      proveedor: str("proveedor"),
      medico: str("medico"),
      auxiliar: str("auxiliar"),
      ovem: str("ovem"),
      usuario_recibe: str("usuario_recibe"),
      usuario_despacha: str("usuario_despacha"),
      novedad_servicio: str("novedad_servicio"),
      observaciones: str("observaciones"),
      motivo_externo: str("motivo_externo"),
      motivo_interno: str("motivo_interno"),
      estado_servicio: str("estado_servicio"),
      ciudad_registro: str("ciudad_registro"),
      condicion: str("condicion"),
      medio_asignacion: str("medio_asignacion"),
      turno_facturacion: str("turno_facturacion"),
      deducible: str("deducible"),
      incapa: str("incapa"),
      situacion: str("situacion"),
      tiempo_a_restar: (s.tiempo_a_restar as number | null) ?? undefined,
      poliza: str("poliza"),
      funcionario_aseguradora: str("funcionario_aseguradora"),
      codigo_telemedicina: str("codigo_telemedicina"),
      correo_electronico: str("correo_electronico"),
      motivo_consulta: str("motivo_consulta"),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: MedicalServiceFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando
      ? await actualizarServicioMedico(editando.id, values)
      : await crearServicioMedico(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogOpen(false);
    router.refresh();
  };

  const handleEtapa = async (servicio: ServicioRow, etapaNueva: string) => {
    setBusyId(servicio.id);
    const res = await cambiarEtapaServicio(servicio.id, servicio.etapa, etapaNueva);
    setBusyId(null);
    if (res.error) alert(res.error);
    else router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por paciente, placa, tipo o cliente…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="sm:w-72"
          />
          <Select value={filtroEtapa} onValueChange={setFiltroEtapa}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas las etapas</SelectItem>
              {Object.keys(ETAPA_BADGE).map((etapa) => (
                <SelectItem key={etapa} value={etapa}>
                  {etapa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {puedeEditar && <Button onClick={abrirNuevo}>Nuevo servicio</Button>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registro</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Móvil</TableHead>
              <TableHead>Origen → Destino</TableHead>
              <TableHead>Etapa</TableHead>
              {puedeEditar && <TableHead>Cambiar etapa</TableHead>}
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 8 : 6} className="text-center text-muted-foreground">
                  Sin servicios registrados
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{formatDateShort(s.fecha_hora_registro)}</TableCell>
                <TableCell>
                  <div className="font-medium">{s.nombre_completo}</div>
                  <div className="text-xs text-muted-foreground">{s.patients?.cedula ?? "sin enlace"}</div>
                </TableCell>
                <TableCell className="max-w-40">
                  <p className="truncate text-sm">{s.tipo_servicio}</p>
                </TableCell>
                <TableCell>{s.vehicles?.placa ?? s.movil_placa ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {(s.ciudad_origen ?? "—") + " → " + (s.ciudad_destino ?? "—")}
                </TableCell>
                <TableCell>
                  <Badge variant={ETAPA_BADGE[s.etapa] ?? "outline"}>{s.etapa}</Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell className="min-w-[10rem]">
                    <Select
                      disabled={busyId === s.id}
                      onValueChange={(v) => handleEtapa(s, v)}
                      value=""
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={busyId === s.id ? "Guardando…" : "Mover a…"} />
                      </SelectTrigger>
                      <SelectContent>
                        {ETAPAS_DESTINO(s.etapa).map((etapa) => (
                          <SelectItem key={etapa} value={etapa}>
                            {etapa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                {puedeEditar && (
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicion(s)}>
                      Editar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar servicio #${editando.id}` : "Nuevo servicio"}</DialogTitle>
            <DialogDescription>
              Los tiempos (oportunidad, origen, intermedia, destino y total) se calculan
              automáticamente a partir de las fechas de llegada/salida.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-1 rounded-md border bg-muted/30 p-3">
              <Label>Tipo de servicio *</Label>
              <CatalogCombobox
                options={TIPOS_SERVICIO}
                value={tipoSeleccionado ?? ""}
                onChange={(v) => setValue("tipo_servicio", v, { shouldValidate: true })}
                placeholder="Escribe para buscar el tipo…"
                allowCustom={false}
              />
              <p className="text-xs text-muted-foreground">
                Lo primero que hay que elegir: define qué campos siguen abajo.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Paciente</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label>Documento</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cedulaBusqueda}
                      onChange={(e) => setCedulaBusqueda(e.target.value)}
                      placeholder="Cédula"
                    />
                    <Button type="button" variant="outline" onClick={buscarPaciente}>
                      Buscar
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="nombre_completo">Nombre completo *</Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Nombre completo del paciente"
                    {...register("nombre_completo")}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Servicio</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {perfil !== "TELEMEDICINA" && (
                  <div className="space-y-1">
                    <Label>Móvil (ambulancia){perfil === "MEDICINA_DOMICILIARIA" ? " — opcional" : ""}</Label>
                    <Select value={vehiculoSeleccionado ?? ""} onValueChange={handleVehiculo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sin asignar</SelectItem>
                        {vehiculos.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {vehiculoSeleccionado && (
                      <p className="text-xs text-muted-foreground">
                        Tripulación de hoy: {[
                          nombrePersona(tripulacionVehiculoActual?.ovem) && `OVEM ${nombrePersona(tripulacionVehiculoActual?.ovem)}`,
                          perfil === "TRASLADO" && nombrePersona(tripulacionVehiculoActual?.medico) && `Médico ${nombrePersona(tripulacionVehiculoActual?.medico)}`,
                          nombrePersona(tripulacionVehiculoActual?.auxiliar) && `Auxiliar ${nombrePersona(tripulacionVehiculoActual?.auxiliar)}`,
                        ].filter(Boolean).join(" · ") || "sin nadie asignado — armar en Regulación"}
                      </p>
                    )}
                  </div>
                )}
                {requiereMedicoIndependiente && (
                  <div className="space-y-1">
                    <Label>Médico{perfil === "TELEMEDICINA" ? " *" : " (prestador, opcional si va en la ambulancia)"}</Label>
                    <Select
                      value={medicoIndependienteSeleccionado ?? ""}
                      onValueChange={(v) => setValue("medico_user_id", v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sin asignar</SelectItem>
                        {medicosDisponibles.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {nombrePersona(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="fecha_hora_programacion">Fecha/hora de programación</Label>
                  <Input
                    id="fecha_hora_programacion"
                    type="datetime-local"
                    {...register("fecha_hora_programacion")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Turno</Label>
                  <Select
                    value={turnoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("turno_programacion", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {TURNO_OPCIONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t === "DIA" ? "Diurno" : "Nocturno"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {paraPerfil(CAMPOS_PROGRAMACION, perfil).filter((c) => c.name !== "fecha_hora_programacion").map((campo) => (
                  <div key={campo.name} className="space-y-1">
                    <Label htmlFor={campo.name}>{campo.label}</Label>
                    <Input
                      id={campo.name}
                      type={campo.type ?? "text"}
                      placeholder={campo.placeholder}
                      {...register(campo.name)}
                    />
                  </div>
                ))}
                {perfil !== "TELEMEDICINA" && (
                  <div className="space-y-1">
                    <Label>Código CIE-10</Label>
                    <AsyncCombobox
                      value={cieSeleccionado ?? ""}
                      valueLabel={cieLabel || undefined}
                      onChange={(v, label) => {
                        setValue("cie_codigo", v);
                        setCieLabel(label);
                      }}
                      search={buscarCie}
                      placeholder="Escribe el código o diagnóstico…"
                    />
                  </div>
                )}
                {perfil === "TRASLADO" && (
                  <>
                    <div className="space-y-1">
                      <Label>Requiere aislamiento</Label>
                      <Select
                        value={aislamientoSeleccionado ?? ""}
                        onValueChange={(v) => setValue("requiere_aislamiento", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {AISLAMIENTO_OPCIONES.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Finalidad del traslado</Label>
                      <Select
                        value={finalidadSeleccionada ?? ""}
                        onValueChange={(v) => setValue("finalidad_traslado", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {FINALIDAD_TRASLADO_OPCIONES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Persona que recibe en IPS</Label>
                      <CatalogCombobox
                        options={[ENTREGA_DOMICILIO]}
                        value={aceptaIpsSeleccionado ?? ""}
                        onChange={(v) => setValue("acepta_ips", v)}
                        placeholder="Nombre de quien recibe…"
                        allowCustom
                      />
                      <p className="text-xs text-muted-foreground">
                        Si el destino es el domicilio del paciente, selecciona &quot;{ENTREGA_DOMICILIO}&quot;.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {requiereRuta && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Ruta y tiempos</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Departamento origen</Label>
                    <CatalogCombobox
                      options={[...DEPARTAMENTOS_COLOMBIA]}
                      value={departamentoOrigenSeleccionado ?? ""}
                      onChange={(v) => setValue("departamento_origen", v)}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Departamento destino</Label>
                    <CatalogCombobox
                      options={[...DEPARTAMENTOS_COLOMBIA]}
                      value={departamentoDestinoSeleccionado ?? ""}
                      onChange={(v) => setValue("departamento_destino", v)}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                    />
                  </div>
                  {paraPerfil(CAMPOS_RUTA, perfil).map((campo) => (
                    <div key={campo.name} className="space-y-1">
                      <Label htmlFor={campo.name}>{campo.label}</Label>
                      <Input
                        id={campo.name}
                        type={campo.type ?? "text"}
                        placeholder={campo.placeholder}
                        {...register(campo.name)}
                      />
                    </div>
                  ))}
                  {perfil === "TRASLADO" && (
                    <div className="space-y-1">
                      <Label>Perímetro</Label>
                      <Select
                        value={perimetroSeleccionado ?? ""}
                        onValueChange={(v) => setValue("perimetro", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIMETRO_OPCIONES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Cierre y facturación</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="valor_servicio">Valor del servicio</Label>
                  <Input
                    id="valor_servicio"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...register("valor_servicio", { valueAsNumber: true, setValueAs: (v) => (Number.isNaN(v) ? undefined : v) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Método de pago</Label>
                  <Select
                    value={metodoPagoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("metodo_pago", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {METODO_PAGO_OPCIONES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Cliente / aseguradora</Label>
                  <CatalogCombobox
                    options={clientes}
                    value={clienteSeleccionado ?? ""}
                    onChange={(v) => setValue("cliente", v)}
                    placeholder="Selecciona o busca…"
                  />
                </div>
                {paraPerfil(CAMPOS_CIERRE, perfil).map((campo) => (
                  <div key={campo.name} className="space-y-1">
                    <Label htmlFor={campo.name}>{campo.label}</Label>
                    <Input
                      id={campo.name}
                      type={campo.type ?? "text"}
                      placeholder={campo.placeholder}
                      {...register(campo.name)}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="novedad_servicio">Novedad del servicio</Label>
                <Textarea
                  id="novedad_servicio"
                  rows={2}
                  placeholder="Novedades presentadas durante el servicio"
                  {...register("novedad_servicio")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  rows={2}
                  placeholder="Observaciones adicionales"
                  {...register("observaciones")}
                />
              </div>
            </section>

            {(error || Object.values(formState.errors)[0]?.message) && (
              <p className="text-sm text-destructive">
                {error ?? String(Object.values(formState.errors)[0]?.message)}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
