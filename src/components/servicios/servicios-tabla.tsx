"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightLeft, Clock, FileCheck, Lock, MapPin, MoreHorizontal, Pencil, Play, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ciudadRegistroCanonica, fechaHora24, horasEstancado, OPCIONES_CIUDAD_REGISTRO } from "@/lib/servicios-lista";
import { useUmbralesEstancado } from "./use-umbrales-estancado";
import { aTextoLocalColombia } from "@/lib/hora-colombia";
import { CatalogCombobox } from "@/components/forms/catalog-combobox";
import { AsyncCombobox } from "@/components/forms/async-combobox";
import { PatientSearchCombobox, nombreCompletoDe } from "@/components/forms/patient-search-combobox";
import { PacienteFormDialog } from "@/components/pacientes/paciente-form-dialog";
import { DateTimeField } from "@/components/forms/date-time-field";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO, resolverCiudad } from "@/lib/colombia-geo";
import { PRESTADORES_SISRES } from "@/lib/catalogos-sisres";
import {
  medicalServiceSchema,
  type MedicalServiceFormData,
  type EtapaServicio,
  PERFIL_FORMULARIO_SERVICIO,
  perfilFormularioServicio,
  ETAPAS_SERVICIO,
  ESTADO_SERVICIO_OPCIONES,
} from "@/lib/validations";
import {
  crearServicioMedico,
  actualizarServicioMedico,
  cambiarEtapaServicio,
  eliminarServicioMedico,
  getCatalogoCie,
  subirBoletaSalida,
  getUrlBoletaSalida,
} from "@/app/api/actions/servicios-medicos";
import type { PacienteTypeahead } from "@/app/api/actions/pacientes";
import { opcionesConValorActual, opcionesDeFabrica, type OpcionesServicio } from "@/lib/servicios-opciones";
import { textoChoque, type ServicioEnChoque } from "@/lib/servicios-choque";

const ENTREGA_DOMICILIO = "ENTREGA EN DOMICILIO";
// Casi todos los servicios nacen programados: las demás etapas solo se eligen al registrar uno que ya ocurrió.
const ETAPA_DEFECTO = "PROGRAMADO";

// Nombre legible de los campos validados, para el resumen de errores (no se muestran nombres técnicos).
const ETIQUETA_CAMPO: Record<string, string> = {
  nombre_completo: "Nombre completo del paciente",
  tipo_servicio: "Tipo de servicio",
  valor_servicio: "Valor del servicio",
};

const ITEM_MENU_MOVIL =
  "flex min-h-10 w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:opacity-50";

function ErrorCampo({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export interface ServicioRow {
  id: number;
  patient_id: number | null;
  nombre_completo: string;
  fecha_hora_registro: string;
  tipo_servicio: string;
  vehicle_id: string | null;
  movil_placa: string | null;
  imagen_boleta_salida: string | null;
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
// 84% del total. "TAB SENCILLO" no se ofrece como opción (Daniel, 2026-07-30:
// es el mismo TAB SIMPLE, variante de captura duplicada) — pero sigue
// existiendo en PERFIL_FORMULARIO_SERVICIO (validations.ts) para que los
// servicios históricos que ya tienen ese valor sigan abriendo bien.
export const TIPOS_SERVICIO = [
  "MEDICINA DOMICILIARIA",
  "TAB SIMPLE",
  "TAB DOBLE",
  "TAM SIMPLE",
  "TAM DOBLE",
  "TELEMEDICINA",
  "ENFERMERIA DOMICILIARIA",
  "TRASLADO AEREO",
];

// SISRES no ofrece ENFERMERIA DOMICILIARIA/TELEMEDICINA/TRASLADO AEREO al
// Regulador (cargo=4) en el formulario de registro — solo al crear
// (registroServicios.php, $esRegulador). No se aplica al editar un servicio
// ya existente (editarServicio.php es otro flujo, fuera de este alcance).
const TIPOS_SERVICIO_REGULACION = ["MEDICINA DOMICILIARIA", "TAB SIMPLE", "TAB DOBLE", "TAM SIMPLE", "TAM DOBLE"];

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
// Prestador ya no está acá: tiene catálogo real (PRESTADORES_SISRES) y se
// renderiza aparte, más abajo, como CatalogCombobox.
const CAMPOS_PROGRAMACION: CampoDef[] = [
  { name: "fecha_hora_programacion", label: "Fecha/hora de programación", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm" },
  { name: "autorizacion", label: "Autorización", placeholder: "Número de autorización" },
  { name: "asesor", label: "Asesor quien solicita", placeholder: "Nombre del asesor", perfiles: ["TRASLADO"] },
  { name: "soporte", label: "Soporte", placeholder: "Oxígeno, ventilación, máscaras, control de líquidos…", perfiles: ["TRASLADO"] },
];

// Ciudad origen/destino ya no están acá: tienen catálogo real en cascada
// (MUNICIPIOS_POR_DEPARTAMENTO) y se renderizan aparte, más abajo. Toda
// esta sección solo aplica a Medicina Domiciliaria y Traslado — Telemedicina
// no tiene ruta física.
const CAMPOS_RUTA: CampoDef[] = [
  { name: "direccion_origen", label: "Dirección origen", placeholder: "Dirección exacta de origen" },
  { name: "fecha_hora_llegada_origen", label: "Llegada a origen", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm" },
  { name: "fecha_hora_salida_origen", label: "Salida de origen", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm" },
  { name: "direccion_intermedia", label: "Dirección intermedia (opcional)", placeholder: "Solo si el traslado tiene punto intermedio", perfiles: ["TRASLADO"] },
  { name: "fecha_hora_llegada_intermedia", label: "Llegada intermedia", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm", perfiles: ["TRASLADO"] },
  { name: "fecha_hora_salida_intermedia", label: "Salida intermedia", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm", perfiles: ["TRASLADO"] },
  { name: "direccion_destino", label: "Dirección destino", placeholder: "Dirección exacta de destino" },
  { name: "fecha_hora_llegada_destino", label: "Llegada a destino", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm" },
  { name: "fecha_hora_salida_destino", label: "Salida de destino", type: "datetime-local", placeholder: "dd/mm/aaaa hh:mm", perfiles: ["TRASLADO"] },
];

// Proveedor ya no está acá: mismo catálogo real que Prestador
// (PRESTADORES_SISRES — en SISRES es la misma tabla `proveedores` para
// ambos campos), se renderiza aparte, más abajo.
// usuario_recibe/usuario_despacha (select de Reguladores reales),
// motivo_externo/motivo_interno (catálogos fijos), estado_servicio
// (ACTIVO/INACTIVO) y ciudad_registro (CRA Medellín / CRA Bogotá) ya no están
// acá: se resuelven con <select>, no texto libre — se renderizan aparte, más abajo.

type PersonaTripulacion = { user_id: string; nombre_completo: string | null; email: string | null };

interface ServiciosTablaProps {
  servicios: ServicioRow[];
  vehiculos: { id: string; placa: string }[];
  clientes: string[];
  puedeEditar: boolean;
  /** Médicos activos disponibles para asignar directo a un servicio (sin vehículo/OVEM) — típico de Medicina Domiciliaria con prestador externo. */
  medicosDisponibles: PersonaTripulacion[];
  /** Reguladores activos — reemplaza el texto libre de "usuario que recibe/despacha" por un select real (SISRES: usuarios cargo=4). */
  reguladoresDisponibles: PersonaTripulacion[];
  /** Nombre de quien ve el formulario — precarga "recibe/despacha" igual que la sesión en SISRES. */
  viewerNombreCompleto?: string | null;
  /** Tripulación activa hoy por vehículo (armada en Regulación) — para autocompletar al elegir móvil. */
  tripulacionPorVehiculo: Record<
    string,
    { ovem?: PersonaTripulacion; medico?: PersonaTripulacion; auxiliar?: PersonaTripulacion }
  >;
  /** Ciudad del usuario logueado — default de "ciudad origen" en un servicio nuevo. */
  ciudadDefault?: string | null;
  /** Ciudad de registro por defecto (la del CRA de quien registra): BOGOTA D.C. o MEDELLÍN. */
  ciudadRegistroDefault?: string;
  /** Rol de quien ve la tabla — determina si los campos de logística quedan bloqueados al editar. */
  viewerRole?: string | null;
  /** Conteo y paginación: van a la izquierda de la barra, en la misma fila que «+ Registrar». */
  barra?: ReactNode;
  /** Acciones (p. ej. Exportar) que van junto a «+ Registrar». */
  acciones?: ReactNode;
  /** Opciones vigentes de los 7 selects administrables (migración 091); sin ellas, las de fábrica. */
  opciones?: OpcionesServicio;
  /** Para crear un paciente nuevo sin salir del formulario: catálogo de EPS y campos que el ADMIN volvió obligatorios. */
  epsOptions?: string[];
  camposPacienteObligatorios?: string[];
}

const OPCIONES_FABRICA = opcionesDeFabrica();

const nombrePersona = (p?: PersonaTripulacion | null) => p?.nombre_completo || p?.email || null;

// Campos que Médico/Auxiliar de Enfermería SÍ puede tocar al editar — el
// "desenlace clínico" del servicio. Todo lo demás (logística: fecha/turno,
// móvil, tripulación, ruta, facturación...) queda bloqueado, igual que
// editarServicio.php en SISRES (Ronda 2, pregunta 4: "$esMedicoAux" bloquea
// campos de logística con readonly/campo-bloqueado, no oculta secciones).
const CAMPOS_CLINICOS_MEDICO_AUX = new Set<keyof MedicalServiceFormData>([
  "cie_codigo",
  "requiere_aislamiento",
  "finalidad_traslado",
  "acepta_ips",
  "novedad_servicio",
  "observaciones",
  "motivo_externo",
  "motivo_interno",
  "estado_servicio",
]);

export function ServiciosTabla({
  servicios,
  vehiculos,
  clientes,
  puedeEditar,
  medicosDisponibles,
  reguladoresDisponibles,
  tripulacionPorVehiculo,
  ciudadDefault,
  ciudadRegistroDefault,
  viewerRole,
  viewerNombreCompleto,
  barra,
  acciones,
  opciones = OPCIONES_FABRICA,
  epsOptions = [],
  camposPacienteObligatorios = [],
}: ServiciosTablaProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ServicioRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [pacienteNuevoAbierto, setPacienteNuevoAbierto] = useState(false);
  // Etapa inicial — solo aplica al crear (SISRES: registroServicios.php la
  // pide como select obligatorio; editarServicio.php es otro flujo, la
  // etapa de un servicio existente se cambia desde "Cambiar etapa" en la
  // tabla). Se maneja fuera del schema de react-hook-form/zod a propósito:
  // así nunca se cuela en el payload de actualizarServicioMedico y pisa la
  // etapa real de un servicio ya existente.
  const [etapaInicial, setEtapaInicial] = useState<string>(ETAPA_DEFECTO);
  const [yaOcurrido, setYaOcurrido] = useState(false);
  const [creadoMsg, setCreadoMsg] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string } | null>(null);
  // Otro servicio abierto usa el mismo vehículo o tripulante a esa hora: se pide confirmar antes de guardar.
  const [choque, setChoque] = useState<{ lista: ServicioEnChoque[]; values: MedicalServiceFormData; crearOtro: boolean } | null>(null);
  const [porEliminar, setPorEliminar] = useState<ServicioRow | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const inicioFormRef = useRef<HTMLDivElement>(null);
  // Umbral de servicios estancados configurado por el ADMIN (migración 103).
  const umbralesEstancado = useUmbralesEstancado();

  const { register, handleSubmit, reset, setValue, watch, formState } =
    useForm<MedicalServiceFormData>({ resolver: zodResolver(medicalServiceSchema) });

  const [cieLabel, setCieLabel] = useState("");

  const tipoSeleccionado = watch("tipo_servicio");
  const vehiculoSeleccionado = watch("vehicle_id");
  const turnoSeleccionado = watch("turno_programacion");
  const ciudadRegistroSeleccionada = watch("ciudad_registro");
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
  const prestadorSeleccionado = watch("prestador");
  const proveedorSeleccionado = watch("proveedor");
  const ciudadOrigenSeleccionada = watch("ciudad_origen");
  const ciudadDestinoSeleccionada = watch("ciudad_destino");
  const usuarioRecibeSeleccionado = watch("usuario_recibe");
  const usuarioDespachaSeleccionado = watch("usuario_despacha");
  const motivoExternoSeleccionado = watch("motivo_externo");
  const motivoInternoSeleccionado = watch("motivo_interno");
  const estadoServicioSeleccionado = watch("estado_servicio");

  // SISRES oculta 3 tipos de servicio para el Regulador al registrar
  // (registroServicios.php, $esRegulador) — solo al crear, no al editar uno
  // ya existente con un tipo fuera de esa lista.
  const esRegulador = viewerRole === "REGULACION";
  const tiposServicioDisponibles = !editando && esRegulador ? TIPOS_SERVICIO_REGULACION : TIPOS_SERVICIO;

  // Perfil del formulario según el tipo de servicio — define qué secciones
  // se muestran (Regulación, QA 2026-07-22): Medicina/Enfermería
  // Domiciliaria, Traslado en ambulancia (TAM/TAB/Aéreo), o Telemedicina.
  const perfil = perfilFormularioServicio(tipoSeleccionado ?? "");
  const requiereRuta = perfil !== "TELEMEDICINA";
  const requiereMedicoIndependiente = perfil === "MEDICINA_DOMICILIARIA" || perfil === "TELEMEDICINA";

  // Ciudad en cascada: solo las del departamento ya elegido (catálogo real
  // DIVIPOLA, ver colombia-geo.ts). Si cambia el departamento, se limpia la
  // ciudad para no dejar una que ya no corresponde.
  const ciudadesOrigen = departamentoOrigenSeleccionado ? MUNICIPIOS_POR_DEPARTAMENTO[departamentoOrigenSeleccionado] ?? [] : [];
  const ciudadesDestino = departamentoDestinoSeleccionado ? MUNICIPIOS_POR_DEPARTAMENTO[departamentoDestinoSeleccionado] ?? [] : [];
  const handleDepartamentoOrigen = (v: string) => {
    setValue("departamento_origen", v);
    setValue("ciudad_origen", "");
  };
  const handleDepartamentoDestino = (v: string) => {
    setValue("departamento_destino", v);
    setValue("ciudad_destino", "");
  };

  // Médico/Auxiliar solo actualiza el desenlace clínico al editar — no
  // aplica al crear (Aeromanto no usa ese flujo para ellos hoy; el que
  // crea es Regulación). Fase E (Mis servicios) ya les da la forma
  // correcta de avanzar llegada/salida — acá quedan bloqueados para no
  // poder saltárselo escribiendo el timestamp a mano.
  const esMedicoAux = viewerRole === "MEDICO" || viewerRole === "AUXILIAR_ENFERMERIA";
  const soloLecturaLogistica = esMedicoAux && editando !== null;
  const campoBloqueado = (name: keyof MedicalServiceFormData) =>
    soloLecturaLogistica && !CAMPOS_CLINICOS_MEDICO_AUX.has(name);
  const puedeCambiarEtapaLibre = puedeEditar && !esMedicoAux;

  // Candado de servicios FINALIZADO (Daniel, 2026-07-29): solo
  // ADMIN/ANALISTA/REGULACION puede volver a tocarlo — la migración 055
  // ya lo hace cumplir por RLS con log de auditoría automático; esto solo
  // evita abrir un formulario que de todos modos va a rechazar el guardado.
  const ROLES_EDITAN_FINALIZADO = ["ADMIN", "ANALISTA", "REGULACION"];
  const puedeEditarServicio = (s: ServicioRow) =>
    puedeEditar && (s.etapa !== "FINALIZADO" || ROLES_EDITAN_FINALIZADO.includes(viewerRole ?? ""));

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

  // Los filtros se aplican en el servidor (ServiciosFiltros): la tabla muestra la página tal cual.
  const filtrados = servicios;

  const seleccionarPaciente = (paciente: PacienteTypeahead) => {
    setError(null);
    setValue("patient_id", paciente.id);
    setValue("nombre_completo", nombreCompletoDe(paciente), { shouldValidate: formState.isSubmitted });
    setCedulaBusqueda(`${paciente.cedula} — ${nombreCompletoDe(paciente)}`);
  };

  const prepararNuevo = () => {
    setEditando(null);
    setError(null);
    setCreadoMsg(null);
    setCedulaBusqueda("");
    setCieLabel("");
    setEtapaInicial(ETAPA_DEFECTO);
    setYaOcurrido(false);
    // Ciudad de origen por defecto = ciudad del usuario logueado (Fase D).
    // Ahora que ciudad depende de un departamento elegido, hace falta
    // encontrar a qué departamento pertenece esa ciudad para dejar los dos
    // campos coherentes — si no se encuentra, se deja vacío en vez de un
    // valor huérfano que el candado departamento→ciudad rechazaría.
    const ubicacionDefault = resolverCiudad(ciudadDefault);
    reset({
      tipo_servicio: "",
      departamento_origen: ubicacionDefault?.departamento ?? "",
      ciudad_origen: ubicacionDefault?.ciudad ?? "",
      ciudad_registro: ciudadRegistroDefault ?? "",
      // SISRES precarga "Recibe" con la sesión y preselecciona "Despacha"
      // al mismo usuario cuando es Regulador (registroServicios.php,
      // $esRegulador) — y fuerza método de pago a N/A porque el Regulador
      // no lo decide en este punto del flujo.
      ...(esRegulador
        ? {
            usuario_recibe: viewerNombreCompleto ?? "",
            usuario_despacha: viewerNombreCompleto ?? "",
            metodo_pago: "N/A",
          }
        : {}),
    } as MedicalServiceFormData);
  };

  const abrirNuevo = () => {
    prepararNuevo();
    setDialogOpen(true);
  };

  // «Nuevo servicio» desde otras pantallas llega como /servicios?nuevo=1: abre el formulario y limpia el parámetro.
  const searchParams = useSearchParams();
  const nuevoDesdeUrl = useRef(false);
  useEffect(() => {
    if (searchParams.get("nuevo") !== "1") {
      nuevoDesdeUrl.current = false;
      return;
    }
    if (nuevoDesdeUrl.current) return;
    nuevoDesdeUrl.current = true;
    if (puedeEditar) abrirNuevo();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("nuevo");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const abrirEdicion = (s: ServicioRow) => {
    setEditando(s);
    setError(null);
    setCedulaBusqueda(s.patients?.cedula ? `${s.patients.cedula} — ${s.nombre_completo}` : "");
    setCieLabel("");
    setEtapaInicial(ETAPA_DEFECTO);
    setYaOcurrido(false);
    setCreadoMsg(null);
    const str = (k: string) => (s[k] ? String(s[k]) : "");
    // La base guarda en UTC: el formulario se precarga en hora de Colombia.
    const fecha = (k: string) => aTextoLocalColombia(s[k] as string | null);
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
    });
    setDialogOpen(true);
  };

  const enfocarCampo = (name: string) => {
    const el = document.getElementById(name);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.focus();
  };

  // RHF enfoca solo los campos registrados; el resto (combobox) se enfoca a mano por su id.
  const onInvalid = (errores: Record<string, unknown>) => {
    setError(null);
    setCreadoMsg(null);
    const primero = Object.keys(errores)[0];
    if (primero) enfocarCampo(primero);
  };

  const onSubmit = async (values: MedicalServiceFormData, crearOtro = false, confirmarChoque = false) => {
    setGuardando(true);
    setError(null);
    setCreadoMsg(null);
    const res = editando
      ? await actualizarServicioMedico(editando.id, values, confirmarChoque)
      : await crearServicioMedico(values, etapaInicial, confirmarChoque);
    setGuardando(false);
    if ("choque" in res && res.choque) {
      setChoque({ lista: res.choque, values, crearOtro });
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
    if (crearOtro && !editando) {
      const paciente = values.nombre_completo;
      prepararNuevo();
      setCreadoMsg(`Servicio de ${paciente} guardado. El formulario está listo para el siguiente.`);
      inicioFormRef.current?.scrollIntoView({ block: "start" });
      return;
    }
    setDialogOpen(false);
  };

  const listaErrores = Object.entries(formState.errors).map(([name, e]) => ({
    name,
    etiqueta: ETIQUETA_CAMPO[name] ?? name.replaceAll("_", " "),
    message: typeof e?.message === "string" ? e.message : "Campo inválido",
  }));
  const mensajeError = (name: string) => listaErrores.find((e) => e.name === name)?.message;

  const handleEtapa = async (servicio: ServicioRow, etapaNueva: string) => {
    setBusyId(servicio.id);
    const res = await cambiarEtapaServicio(servicio.id, servicio.etapa, etapaNueva);
    setBusyId(null);
    if (res.error) setAviso({ titulo: "No se pudo cambiar la etapa", mensaje: res.error });
    else router.refresh();
  };

  // Borrado físico — igual que SISRES (delete.php, tabla=servicios: DELETE
  // real, no soft delete). RLS de medical_services (migración 054) ya lo
  // restringe a ADMIN a nivel de base de datos; el botón solo se muestra
  // acá para ese rol para no ofrecer una acción que el servidor va a
  // rechazar.
  const puedeEliminar = viewerRole === "ADMIN";
  const handleEliminar = async (servicio: ServicioRow) => {
    setBusyId(servicio.id);
    const res = await eliminarServicioMedico(servicio.id);
    setBusyId(null);
    if (res.error) setAviso({ titulo: "No se pudo eliminar el servicio", mensaje: res.error });
    else router.refresh();
  };

  // Boleta de Salida — equivalente a la columna `imagen` de SISRES
  // (editarServicio.php, sección oculta para Médico/Auxiliar). Solo
  // aplica al editar: SISRES tampoco la ofrece en el registro inicial.
  const [subiendoBoleta, setSubiendoBoleta] = useState(false);
  const handleSubirBoleta = async (file: File) => {
    if (!editando) return;
    setSubiendoBoleta(true);
    const res = await subirBoletaSalida(editando.id, file);
    setSubiendoBoleta(false);
    if (res.error) {
      setAviso({ titulo: "No se pudo subir la boleta", mensaje: res.error });
      return;
    }
    setEditando({ ...editando, imagen_boleta_salida: res.ruta ?? null });
    router.refresh();
  };
  const handleVerBoleta = async () => {
    if (!editando?.imagen_boleta_salida) return;
    const url = await getUrlBoletaSalida(editando.imagen_boleta_salida);
    if (url) window.open(url, "_blank");
    else setAviso({ titulo: "No se pudo abrir la imagen", mensaje: "No se pudo generar el enlace de la imagen. Intenta de nuevo." });
  };

  const estancadoDe = (s: ServicioRow) =>
    horasEstancado(
      { etapa: s.etapa, fecha_hora_programacion: (s.fecha_hora_programacion as string | null) ?? null },
      Date.now(),
      umbralesEstancado
    );

  const insigniasEtapa = (s: ServicioRow) => {
    const estancado = estancadoDe(s);
    return (
      <>
        <Badge variant={ETAPA_BADGE[s.etapa] ?? "outline"} className="shrink-0 whitespace-nowrap px-1.5 py-0 text-xs leading-5">
          {s.etapa}
        </Badge>
        {estancado !== null && (
          <Badge
            variant="outline"
            className="shrink-0 whitespace-nowrap border-transparent bg-foreground px-1.5 py-0 text-xs leading-5 text-background"
          >
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            {estancado} h sin avanzar
          </Badge>
        )}
      </>
    );
  };

  const movilDe = (s: ServicioRow) =>
    s.vehicles?.placa && (s.etapa === "PROGRAMADO" || s.etapa === "CURSO") ? (
      <Link href={`/servicios/${s.id}/seguimiento`} className="inline-flex items-center gap-1 underline">
        <MapPin className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">Ver en el mapa (GPS) la ambulancia </span>
        {s.vehicles.placa}
      </Link>
    ) : (
      (s.vehicles?.placa ?? s.movil_placa ?? "—")
    );

  const cedulaDe = (s: ServicioRow) => s.patients?.cedula ?? (s.cedula_paciente as string | null) ?? "sin enlace";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">{barra}</div>
        <div className="flex flex-wrap items-center gap-2">
          {acciones}
          {puedeEditar && <Button onClick={abrirNuevo}>Nuevo servicio</Button>}
        </div>
      </div>

      {/* Móvil (bajo md): tarjetas con placa, paciente y estado; las acciones van en un menú. */}
      <ul className="space-y-2 md:hidden" aria-label="Servicios registrados">
        {filtrados.length === 0 && (
          <li className="rounded-md border p-4 text-center text-sm text-muted-foreground">Sin servicios registrados</li>
        )}
        {filtrados.map((s) => (
          <li key={s.id} className="rounded-md border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs tabular-nums text-muted-foreground">#{s.id}</span>
                  {insigniasEtapa(s)}
                </div>
                <p className="text-sm leading-tight">
                  <span className="font-medium">{s.nombre_completo}</span>{" "}
                  <span className="text-xs text-muted-foreground">{cedulaDe(s)}</span>
                </p>
              </div>
              {puedeEditar && (
                <Popover open={menuId === s.id} onOpenChange={(abierto) => setMenuId(abierto ? s.id : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label={`Acciones del servicio ${s.id}`}>
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-1">
                    {puedeEditarServicio(s) ? (
                      <button
                        type="button"
                        className={ITEM_MENU_MOVIL}
                        onClick={() => {
                          setMenuId(null);
                          abrirEdicion(s);
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                      </button>
                    ) : (
                      <p className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" aria-hidden="true" /> Finalizado: bloqueado
                      </p>
                    )}
                    {puedeCambiarEtapaLibre && s.etapa === "PROGRAMADO" && (
                      <button
                        type="button"
                        className={ITEM_MENU_MOVIL}
                        disabled={busyId === s.id}
                        onClick={() => {
                          setMenuId(null);
                          handleEtapa(s, "CURSO");
                        }}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" /> Marcar en curso
                      </button>
                    )}
                    {puedeCambiarEtapaLibre && (
                      <>
                        <p className="px-2 pt-2 text-xs text-muted-foreground">Cambiar etapa a</p>
                        {ETAPAS_DESTINO(s.etapa).map((etapa) => (
                          <button
                            key={etapa}
                            type="button"
                            className={ITEM_MENU_MOVIL}
                            disabled={busyId === s.id}
                            onClick={() => {
                              setMenuId(null);
                              handleEtapa(s, etapa);
                            }}
                          >
                            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" /> {etapa}
                          </button>
                        ))}
                      </>
                    )}
                    {puedeEliminar && (
                      <button
                        type="button"
                        className={`${ITEM_MENU_MOVIL} text-destructive`}
                        disabled={busyId === s.id}
                        onClick={() => {
                          setMenuId(null);
                          setPorEliminar(s);
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                      </button>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="mt-2 space-y-0.5 text-sm leading-tight">
              <p>
                <span className="text-muted-foreground">Programado: </span>
                {fechaHora24(s.fecha_hora_programacion as string | null) || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Tipo: </span>
                {s.tipo_servicio}
              </p>
              <p>
                <span className="text-muted-foreground">Móvil: </span>
                {movilDe(s)}
                {s.imagen_boleta_salida && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <FileCheck className="h-3 w-3" aria-hidden="true" /> Con boleta
                  </span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">Ruta: </span>
                {(s.ciudad_origen ?? "—") + " → " + (s.ciudad_destino ?? "—")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio (md en adelante): tabla. */}
      <div className="hidden overflow-x-auto md:block">
        <Table className="[&_td]:px-3 [&_td]:py-1.5 [&_th]:h-9 [&_th]:px-3">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>
                Programado
                <span className="block text-xs font-normal">y fecha de registro</span>
              </TableHead>
              <TableHead>Tipo / móvil</TableHead>
              <TableHead>Origen → Destino</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6 + (puedeEditar ? 1 : 0)}
                  className="text-center text-muted-foreground"
                >
                  Sin servicios registrados
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="w-12 !px-2 text-xs tabular-nums text-muted-foreground">{s.id}</TableCell>
                <TableCell>
                  <div className="flex flex-nowrap items-center gap-1">{insigniasEtapa(s)}</div>
                </TableCell>
                <TableCell className="min-w-[10.5rem]">
                  <div className="text-sm leading-tight">
                    <span className="font-medium">{s.nombre_completo}</span>{" "}
                    <span className="text-xs text-muted-foreground">{cedulaDe(s)}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  <div className="text-sm leading-tight">{fechaHora24(s.fecha_hora_programacion as string | null) || "—"}</div>
                  <div className="text-xs leading-tight text-muted-foreground">
                    Registro {fechaHora24(s.fecha_hora_registro)}
                  </div>
                </TableCell>
                <TableCell className="max-w-44">
                  <p className="break-words text-sm leading-tight">{s.tipo_servicio}</p>
                  <p className="text-xs leading-tight text-muted-foreground">Móvil {movilDe(s)}</p>
                  {s.imagen_boleta_salida && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs leading-tight text-muted-foreground">
                      <FileCheck className="h-3 w-3" aria-hidden="true" /> Con boleta de salida
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm leading-tight">
                  {(s.ciudad_origen ?? "—") + " → " + (s.ciudad_destino ?? "—")}
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {puedeCambiarEtapaLibre && s.etapa === "PROGRAMADO" && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          title="Marcar en curso"
                          aria-label={`Marcar en curso el servicio ${s.id}`}
                          disabled={busyId === s.id}
                          onClick={() => handleEtapa(s, "CURSO")}
                        >
                          <Play className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                      {puedeCambiarEtapaLibre && (
                        <Select
                          disabled={busyId === s.id}
                          onValueChange={(v) => handleEtapa(s, v)}
                          value=""
                        >
                          <SelectTrigger
                            className="h-9 w-9 justify-center p-0 [&>svg:last-child]:hidden"
                            title="Cambiar etapa"
                            aria-label="Cambiar etapa"
                          >
                            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                          </SelectTrigger>
                          <SelectContent>
                            {ETAPAS_DESTINO(s.etapa).map((etapa) => (
                              <SelectItem key={etapa} value={etapa}>
                                {etapa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {puedeEditarServicio(s) ? (
                        <Button variant="outline" size="icon" className="h-9 w-9" title="Editar" aria-label="Editar servicio" onClick={() => abrirEdicion(s)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : (
                        <span className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground">
                          <Lock className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Finalizado: bloqueado</span>
                        </span>
                      )}
                      {puedeEliminar && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          title="Eliminar"
                          aria-label="Eliminar servicio"
                          disabled={busyId === s.id}
                          onClick={() => setPorEliminar(s)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={porEliminar !== null} onOpenChange={(abierto) => !abierto && setPorEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar el servicio #{porEliminar?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Se borra el registro de {porEliminar?.nombre_completo} y no se puede recuperar. ¿Quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const objetivo = porEliminar;
                setPorEliminar(null);
                if (objetivo) handleEliminar(objetivo);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={choque !== null} onOpenChange={(abierto) => !abierto && setChoque(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ya hay un servicio a esa hora</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Este servicio comparte vehículo o tripulación con otro que sigue abierto a una hora muy cercana:</p>
                <ul className="list-disc space-y-1 pl-5">
                  {choque &&
                    textoChoque(choque.lista, (iso) => aTextoLocalColombia(iso).replace("T", " ")).map((linea) => (
                      <li key={linea}>{linea}</li>
                    ))}
                </ul>
                <p>¿Quieres guardarlo de todos modos?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const pendiente = choque;
                setChoque(null);
                if (pendiente) void onSubmit(pendiente.values, pendiente.crearOtro, true);
              }}
            >
              Guardar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={aviso !== null} onOpenChange={(abierto) => !abierto && setAviso(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{aviso?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>{aviso?.mensaje}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAviso(null)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar servicio #${editando.id}` : "Nuevo servicio"}</DialogTitle>
            <DialogDescription>
              Los tiempos (oportunidad, origen, intermedia, destino y total) se calculan
              automáticamente a partir de las fechas de llegada/salida.
              {editando?.etapa === "FINALIZADO" && (
                <span className="mt-1 block rounded-md bg-warning-soft px-2 py-1 font-medium text-warning-foreground">
                  Este servicio ya está FINALIZADO — cualquier cambio que guardes queda registrado
                  en el log de auditoría (quién, cuándo, qué valores tenía antes y después).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => onSubmit(v), onInvalid)} className="space-y-6" noValidate>
            <div ref={inicioFormRef} className="space-y-3">
              {creadoMsg && (
                <p role="status" className="rounded-md bg-success-soft px-3 py-2 text-sm font-medium text-success">
                  {creadoMsg}
                </p>
              )}
              {listaErrores.length > 0 && (
                <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="font-medium">
                    {listaErrores.length === 1 ? "Corrige este campo para guardar:" : `Corrige estos ${listaErrores.length} campos para guardar:`}
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {listaErrores.map((e) => (
                      <li key={e.name}>
                        <button type="button" className="text-left underline" onClick={() => enfocarCampo(e.name)}>
                          {e.etiqueta}
                        </button>
                        : {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <section className="space-y-1 rounded-md border bg-muted/30 p-3">
              <Label htmlFor="tipo_servicio">Tipo de servicio *</Label>
              <CatalogCombobox
                id="tipo_servicio"
                options={tiposServicioDisponibles}
                value={tipoSeleccionado ?? ""}
                onChange={(v) => setValue("tipo_servicio", v, { shouldValidate: true })}
                placeholder="Escribe para buscar el tipo…"
                allowCustom={false}
                disabled={campoBloqueado("tipo_servicio")}
              />
              <ErrorCampo id="tipo_servicio-error" message={mensajeError("tipo_servicio")} />
              <p className="text-xs text-muted-foreground">
                Lo primero que hay que elegir: define qué campos siguen abajo.
              </p>
            </section>

            {!editando && (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ya_ocurrido"
                    checked={yaOcurrido}
                    onCheckedChange={(marcado) => {
                      setYaOcurrido(marcado);
                      if (!marcado) setEtapaInicial(ETAPA_DEFECTO);
                    }}
                  />
                  <Label htmlFor="ya_ocurrido" className="font-normal">
                    Registrar un servicio que ya ocurrió
                  </Label>
                </div>
                {yaOcurrido ? (
                  <div className="space-y-1">
                    <Label htmlFor="etapa_inicial">Etapa del servicio *</Label>
                    <Select value={etapaInicial} onValueChange={setEtapaInicial}>
                      <SelectTrigger id="etapa_inicial">
                        <SelectValue placeholder="Selecciona…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETAPAS_SERVICIO.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Registra directamente un servicio que ya sucedió (por ejemplo FALLIDO o NO EFECTIVO) sin
                      pasarlo primero por PROGRAMADO.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">El servicio se registra en etapa {ETAPA_DEFECTO}.</p>
                )}
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Paciente</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label id="buscar_paciente_label">Buscar paciente</Label>
                  <div role="group" aria-labelledby="buscar_paciente_label">
                    <PatientSearchCombobox
                      valueLabel={cedulaBusqueda || undefined}
                      onSelect={seleccionarPaciente}
                      disabled={soloLecturaLogistica}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por cédula o nombre — si no aparece, créalo aquí abajo para que quede su ficha.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    disabled={soloLecturaLogistica}
                    onClick={() => setPacienteNuevoAbierto(true)}
                  >
                    <UserPlus className="mr-1 h-4 w-4" aria-hidden="true" /> Crear paciente nuevo
                  </Button>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="nombre_completo">Nombre completo *</Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Nombre completo del paciente"
                    disabled={soloLecturaLogistica}
                    aria-invalid={mensajeError("nombre_completo") ? "true" : undefined}
                    aria-describedby={mensajeError("nombre_completo") ? "nombre_completo-error" : undefined}
                    {...register("nombre_completo")}
                  />
                  <ErrorCampo id="nombre_completo-error" message={mensajeError("nombre_completo")} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Servicio</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {perfil !== "TELEMEDICINA" && (
                  <div className="space-y-1">
                    <Label htmlFor="vehicle_id">Móvil (ambulancia){perfil === "MEDICINA_DOMICILIARIA" ? " — opcional" : ""}</Label>
                    <Select value={vehiculoSeleccionado ?? ""} onValueChange={handleVehiculo} disabled={campoBloqueado("vehicle_id")}>
                      <SelectTrigger id="vehicle_id">
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
                    <Label htmlFor="medico_user_id">Médico{perfil === "TELEMEDICINA" ? " *" : " (prestador, opcional si va en la ambulancia)"}</Label>
                    <Select
                      value={medicoIndependienteSeleccionado ?? ""}
                      onValueChange={(v) => setValue("medico_user_id", v === "__none__" ? "" : v)}
                      disabled={campoBloqueado("medico_user_id")}
                    >
                      <SelectTrigger id="medico_user_id">
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
                  <DateTimeField
                    id="fecha_hora_programacion"
                    value={watch("fecha_hora_programacion") ?? ""}
                    onChange={(v) => setValue("fecha_hora_programacion", v)}
                    disabled={campoBloqueado("fecha_hora_programacion")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="turno_programacion">Turno</Label>
                  <Select
                    value={turnoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("turno_programacion", v)}
                    disabled={campoBloqueado("turno_programacion")}
                  >
                    <SelectTrigger id="turno_programacion">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesConValorActual(opciones.turno_programacion, turnoSeleccionado).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t === "DIA" ? "Diurno" : t === "NOCHE" ? "Nocturno" : t}
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
                      disabled={campoBloqueado(campo.name)}
                      {...register(campo.name)}
                    />
                  </div>
                ))}
                {perfil === "TRASLADO" && (
                  <div className="space-y-1">
                    <Label htmlFor="prestador">Prestador</Label>
                    <CatalogCombobox
                      id="prestador"
                      options={PRESTADORES_SISRES as string[]}
                      value={prestadorSeleccionado ?? ""}
                      onChange={(v) => setValue("prestador", v)}
                      placeholder="Escribe para buscar el prestador…"
                      allowCustom={false}
                      disabled={campoBloqueado("prestador")}
                    />
                  </div>
                )}
                {perfil !== "TELEMEDICINA" && (
                  <div className="space-y-1">
                    <Label htmlFor="cie_codigo">Código CIE-10</Label>
                    <AsyncCombobox
                      id="cie_codigo"
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
                      <Label htmlFor="requiere_aislamiento">Requiere aislamiento</Label>
                      <Select
                        value={aislamientoSeleccionado ?? ""}
                        onValueChange={(v) => setValue("requiere_aislamiento", v)}
                      >
                        <SelectTrigger id="requiere_aislamiento">
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesConValorActual(opciones.requiere_aislamiento, aislamientoSeleccionado).map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="finalidad_traslado">Finalidad del traslado</Label>
                      <Select
                        value={finalidadSeleccionada ?? ""}
                        onValueChange={(v) => setValue("finalidad_traslado", v)}
                      >
                        <SelectTrigger id="finalidad_traslado">
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesConValorActual(opciones.finalidad_traslado, finalidadSeleccionada).map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acepta_ips">Persona que recibe en IPS</Label>
                      <CatalogCombobox
                        id="acepta_ips"
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
                    <Label htmlFor="departamento_origen">Departamento origen</Label>
                    <CatalogCombobox
                      id="departamento_origen"
                      options={[...DEPARTAMENTOS_COLOMBIA]}
                      value={departamentoOrigenSeleccionado ?? ""}
                      onChange={handleDepartamentoOrigen}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                      disabled={campoBloqueado("departamento_origen")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ciudad_origen">Ciudad origen</Label>
                    <CatalogCombobox
                      id="ciudad_origen"
                      options={ciudadesOrigen as string[]}
                      value={ciudadOrigenSeleccionada ?? ""}
                      onChange={(v) => setValue("ciudad_origen", v)}
                      placeholder={departamentoOrigenSeleccionado ? "Escribe para buscar la ciudad…" : "Primero elige el departamento"}
                      allowCustom={false}
                      disabled={campoBloqueado("ciudad_origen") || !departamentoOrigenSeleccionado}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="departamento_destino">Departamento destino</Label>
                    <CatalogCombobox
                      id="departamento_destino"
                      options={[...DEPARTAMENTOS_COLOMBIA]}
                      value={departamentoDestinoSeleccionado ?? ""}
                      onChange={handleDepartamentoDestino}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                      disabled={campoBloqueado("departamento_destino")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ciudad_destino">Ciudad destino</Label>
                    <CatalogCombobox
                      id="ciudad_destino"
                      options={ciudadesDestino as string[]}
                      value={ciudadDestinoSeleccionada ?? ""}
                      onChange={(v) => setValue("ciudad_destino", v)}
                      placeholder={departamentoDestinoSeleccionado ? "Escribe para buscar la ciudad…" : "Primero elige el departamento"}
                      allowCustom={false}
                      disabled={campoBloqueado("ciudad_destino") || !departamentoDestinoSeleccionado}
                    />
                  </div>
                  {paraPerfil(CAMPOS_RUTA, perfil).map((campo) =>
                    campo.type === "datetime-local" ? (
                      <div key={campo.name} className="space-y-1">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <DateTimeField
                          id={campo.name}
                          value={String(watch(campo.name) ?? "")}
                          onChange={(v) => setValue(campo.name, v)}
                          disabled={campoBloqueado(campo.name)}
                        />
                      </div>
                    ) : (
                      <div key={campo.name} className="space-y-1">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <Input
                          id={campo.name}
                          type="text"
                          placeholder={campo.placeholder}
                          disabled={campoBloqueado(campo.name)}
                          {...register(campo.name)}
                        />
                      </div>
                    )
                  )}
                  {perfil === "TRASLADO" && (
                    <div className="space-y-1">
                      <Label htmlFor="perimetro">Perímetro</Label>
                      <Select
                        value={perimetroSeleccionado ?? ""}
                        onValueChange={(v) => setValue("perimetro", v)}
                        disabled={campoBloqueado("perimetro")}
                      >
                        <SelectTrigger id="perimetro">
                          <SelectValue placeholder="Selecciona…" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesConValorActual(opciones.perimetro, perimetroSeleccionado).map((p) => (
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
                    aria-invalid={mensajeError("valor_servicio") ? "true" : undefined}
                    aria-describedby={mensajeError("valor_servicio") ? "valor_servicio-error" : undefined}
                    disabled={campoBloqueado("valor_servicio")}
                    {...register("valor_servicio", {
                      setValueAs: (v) => (v === "" || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
                    })}
                  />
                  <ErrorCampo id="valor_servicio-error" message={mensajeError("valor_servicio")} />
                </div>
                {/* SISRES fija método de pago en "N/A" (oculto) para el Regulador al
                    registrar — no lo decide en este punto del flujo. */}
                {!(esRegulador && !editando) && (
                  <div className="space-y-1">
                    <Label htmlFor="metodo_pago">Método de pago</Label>
                    <Select
                      value={metodoPagoSeleccionado ?? ""}
                      onValueChange={(v) => setValue("metodo_pago", v)}
                      disabled={campoBloqueado("metodo_pago")}
                    >
                      <SelectTrigger id="metodo_pago">
                        <SelectValue placeholder="Selecciona…" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesConValorActual(opciones.metodo_pago, metodoPagoSeleccionado).map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="cliente">Cliente / aseguradora</Label>
                  <CatalogCombobox
                    id="cliente"
                    options={clientes}
                    value={clienteSeleccionado ?? ""}
                    onChange={(v) => setValue("cliente", v)}
                    placeholder="Selecciona o busca…"
                    disabled={campoBloqueado("cliente")}
                  />
                </div>
                {perfil === "TRASLADO" && (
                  <div className="space-y-1">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <CatalogCombobox
                      id="proveedor"
                      options={PRESTADORES_SISRES as string[]}
                      value={proveedorSeleccionado ?? ""}
                      onChange={(v) => setValue("proveedor", v)}
                      placeholder="Escribe para buscar el proveedor…"
                      allowCustom={false}
                      disabled={campoBloqueado("proveedor")}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="ciudad_registro">Ciudad de registro</Label>
                  <Select
                    value={ciudadRegistroCanonica(ciudadRegistroSeleccionada) ?? ciudadRegistroSeleccionada ?? ""}
                    onValueChange={(v) => setValue("ciudad_registro", v)}
                    disabled={campoBloqueado("ciudad_registro")}
                  >
                    <SelectTrigger id="ciudad_registro">
                      <SelectValue placeholder="Selecciona el CRA…" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCIONES_CIUDAD_REGISTRO.map((o) => (
                        <SelectItem key={o.valor} value={o.valor}>
                          {o.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="usuario_recibe">Usuario que recibe</Label>
                  <Select
                    value={usuarioRecibeSeleccionado ?? ""}
                    onValueChange={(v) => setValue("usuario_recibe", v)}
                    disabled={campoBloqueado("usuario_recibe")}
                  >
                    <SelectTrigger id="usuario_recibe">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {reguladoresDisponibles.map((r) => (
                        <SelectItem key={r.user_id} value={nombrePersona(r) ?? r.user_id}>
                          {nombrePersona(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="usuario_despacha">Usuario que despacha</Label>
                  <Select
                    value={usuarioDespachaSeleccionado ?? ""}
                    onValueChange={(v) => setValue("usuario_despacha", v)}
                    disabled={campoBloqueado("usuario_despacha")}
                  >
                    <SelectTrigger id="usuario_despacha">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {reguladoresDisponibles.map((r) => (
                        <SelectItem key={r.user_id} value={nombrePersona(r) ?? r.user_id}>
                          {nombrePersona(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="motivo_externo">Motivo externo</Label>
                  <Select
                    value={motivoExternoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("motivo_externo", v)}
                    disabled={campoBloqueado("motivo_externo")}
                  >
                    <SelectTrigger id="motivo_externo">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesConValorActual(opciones.motivo_externo, motivoExternoSeleccionado).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="motivo_interno">Motivo interno</Label>
                  <Select
                    value={motivoInternoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("motivo_interno", v)}
                    disabled={campoBloqueado("motivo_interno")}
                  >
                    <SelectTrigger id="motivo_interno">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesConValorActual(opciones.motivo_interno, motivoInternoSeleccionado).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="estado_servicio">Estado del servicio</Label>
                  <Select
                    value={estadoServicioSeleccionado ?? ""}
                    onValueChange={(v) => setValue("estado_servicio", v)}
                    disabled={campoBloqueado("estado_servicio")}
                  >
                    <SelectTrigger id="estado_servicio">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_SERVICIO_OPCIONES.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              {soloLecturaLogistica && (
                <p className="text-xs text-muted-foreground">
                  Como {viewerRole === "MEDICO" ? "médico" : "auxiliar de enfermería"} solo puedes actualizar el
                  desenlace clínico (diagnóstico, aislamiento, finalidad, novedades y observaciones) — los campos
                  de logística los administra Regulación.
                </p>
              )}
            </section>

            {editando && !esMedicoAux && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Boleta de salida</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Label htmlFor="boleta_salida" className="sr-only">
                    Imagen de la boleta de salida
                  </Label>
                  <Input
                    id="boleta_salida"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={subiendoBoleta}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSubirBoleta(file);
                      e.target.value = "";
                    }}
                    className="max-w-xs"
                  />
                  {subiendoBoleta && <span className="text-xs text-muted-foreground">Subiendo…</span>}
                  {editando.imagen_boleta_salida && (
                    <Button type="button" variant="outline" size="sm" onClick={handleVerBoleta}>
                      Ver / descargar
                    </Button>
                  )}
                </div>
                {!editando.imagen_boleta_salida && (
                  <p className="text-xs text-muted-foreground">Al servicio le hace falta la boleta de salida.</p>
                )}
              </section>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              {!editando && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={guardando}
                  onClick={handleSubmit((v) => onSubmit(v, true), onInvalid)}
                >
                  Guardar y crear otro
                </Button>
              )}
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Aparte del <form> de servicio a propósito: son dos formularios y no se anidan. Al guardar, el paciente nuevo
          queda elegido en el servicio (id, nombre y documento), igual que el modal de registroServicios.php en SISRES. */}
      <PacienteFormDialog
        open={pacienteNuevoAbierto}
        onOpenChange={setPacienteNuevoAbierto}
        editando={null}
        epsOptions={epsOptions}
        obligatorios={camposPacienteObligatorios}
        onGuardado={(creado) => {
          if (creado) seleccionarPaciente(creado);
        }}
      />
    </div>
  );
}
