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
import { PatientSearchCombobox, nombreCompletoDe } from "@/components/forms/patient-search-combobox";
import { DateTimeField } from "@/components/forms/date-time-field";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO, resolverCiudad } from "@/lib/colombia-geo";
import { PRESTADORES_SISRES } from "@/lib/catalogos-sisres";
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
  ETAPAS_SERVICIO,
  MOTIVO_EXTERNO_OPCIONES,
  MOTIVO_INTERNO_OPCIONES,
  ESTADO_SERVICIO_OPCIONES,
} from "@/lib/validations";
import {
  crearServicioMedico,
  actualizarServicioMedico,
  cambiarEtapaServicio,
  eliminarServicioMedico,
  getCatalogoCie,
} from "@/app/api/actions/servicios-medicos";
import type { PacienteTypeahead } from "@/app/api/actions/pacientes";

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
// 84% del total. "TAB SENCILLO" no se ofrece como opción (Daniel, 2026-07-30:
// es el mismo TAB SIMPLE, variante de captura duplicada) — pero sigue
// existiendo en PERFIL_FORMULARIO_SERVICIO (validations.ts) para que los
// servicios históricos que ya tienen ese valor sigan abriendo bien.
const TIPOS_SERVICIO = [
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
  { name: "condicion", label: "Condición", placeholder: "Condición del paciente", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "medio_asignacion", label: "Medio de asignación", placeholder: "Cómo llegó la solicitud (llamada, WhatsApp, correo…)", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "poliza", label: "Póliza", placeholder: "Número de póliza", perfiles: ["MEDICINA_DOMICILIARIA", "TELEMEDICINA"] },
  { name: "motivo_consulta", label: "Motivo de consulta", placeholder: "Motivo de la consulta de telemedicina", perfiles: ["TELEMEDICINA"] },
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
// motivo_externo/motivo_interno (catálogos fijos) y estado_servicio
// (ACTIVO/INACTIVO) ya no están acá: SISRES los resuelve con <select>, no
// texto libre — se renderizan aparte, más abajo.
const CAMPOS_CIERRE: CampoDef[] = [
  { name: "ciudad_registro", label: "Ciudad de registro", placeholder: "Ciudad donde se registra el servicio" },
  { name: "turno_facturacion", label: "Turno de facturación", placeholder: "Turno en que se factura el servicio", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "deducible", label: "Deducible", placeholder: "Valor o porcentaje del deducible", perfiles: ["MEDICINA_DOMICILIARIA", "TELEMEDICINA"] },
  { name: "incapa", label: "INCAPA", placeholder: "Información INCAPA", perfiles: ["MEDICINA_DOMICILIARIA"] },
  { name: "situacion", label: "Situación", placeholder: "Situación del servicio", perfiles: ["TRASLADO", "TELEMEDICINA"] },
  { name: "tiempo_a_restar", label: "Tiempo a restar (min)", type: "number", placeholder: "0", perfiles: ["TRASLADO"] },
  { name: "funcionario_aseguradora", label: "Funcionario aseguradora", placeholder: "Nombre del funcionario", perfiles: ["TELEMEDICINA"] },
  { name: "codigo_telemedicina", label: "Código", placeholder: "Código de telemedicina", perfiles: ["TELEMEDICINA"] },
  { name: "correo_electronico", label: "Correo electrónico", type: "email", placeholder: "correo@ejemplo.com", perfiles: ["TELEMEDICINA"] },
];

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
  /** Rol de quien ve la tabla — determina si los campos de logística quedan bloqueados al editar. */
  viewerRole?: string | null;
}

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
  viewerRole,
  viewerNombreCompleto,
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
  // Etapa inicial — solo aplica al crear (SISRES: registroServicios.php la
  // pide como select obligatorio; editarServicio.php es otro flujo, la
  // etapa de un servicio existente se cambia desde "Cambiar etapa" en la
  // tabla). Se maneja fuera del schema de react-hook-form/zod a propósito:
  // así nunca se cuela en el payload de actualizarServicioMedico y pisa la
  // etapa real de un servicio ya existente.
  const [etapaInicial, setEtapaInicial] = useState<string>("");

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

  const seleccionarPaciente = (paciente: PacienteTypeahead) => {
    setError(null);
    setValue("patient_id", paciente.id);
    setValue("nombre_completo", nombreCompletoDe(paciente));
    setCedulaBusqueda(`${paciente.cedula} — ${nombreCompletoDe(paciente)}`);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    setCedulaBusqueda("");
    setCieLabel("");
    setEtapaInicial("");
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
    setDialogOpen(true);
  };

  const abrirEdicion = (s: ServicioRow) => {
    setEditando(s);
    setError(null);
    setCedulaBusqueda(s.patients?.cedula ? `${s.patients.cedula} — ${s.nombre_completo}` : "");
    setCieLabel("");
    setEtapaInicial("");
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
    if (!editando && !etapaInicial) {
      setError("Debes seleccionar la etapa del servicio");
      return;
    }
    setGuardando(true);
    setError(null);
    const res = editando
      ? await actualizarServicioMedico(editando.id, values)
      : await crearServicioMedico(values, etapaInicial);
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

  // Borrado físico — igual que SISRES (delete.php, tabla=servicios: DELETE
  // real, no soft delete). RLS de medical_services (migración 054) ya lo
  // restringe a ADMIN a nivel de base de datos; el botón solo se muestra
  // acá para ese rol para no ofrecer una acción que el servidor va a
  // rechazar.
  const puedeEliminar = viewerRole === "ADMIN";
  const handleEliminar = async (servicio: ServicioRow) => {
    if (!confirm(`¿Está seguro que desea eliminar el registro con id ${servicio.id}?`)) return;
    setBusyId(servicio.id);
    const res = await eliminarServicioMedico(servicio.id);
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
              {puedeCambiarEtapaLibre && <TableHead>Cambiar etapa</TableHead>}
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6 + (puedeCambiarEtapaLibre ? 1 : 0) + (puedeEditar ? 1 : 0)}
                  className="text-center text-muted-foreground"
                >
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
                {puedeCambiarEtapaLibre && (
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
                  <TableCell className="text-right space-x-2">
                    {puedeEditarServicio(s) ? (
                      <Button variant="outline" size="sm" onClick={() => abrirEdicion(s)}>
                        Editar
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Finalizado — bloqueado</span>
                    )}
                    {puedeEliminar && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={busyId === s.id}
                        onClick={() => handleEliminar(s)}
                      >
                        Eliminar
                      </Button>
                    )}
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
              {editando?.etapa === "FINALIZADO" && (
                <span className="mt-1 block font-medium text-amber-700">
                  Este servicio ya está FINALIZADO — cualquier cambio que guardes queda registrado
                  en el log de auditoría (quién, cuándo, qué valores tenía antes y después).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-1 rounded-md border bg-muted/30 p-3">
              <Label>Tipo de servicio *</Label>
              <CatalogCombobox
                options={tiposServicioDisponibles}
                value={tipoSeleccionado ?? ""}
                onChange={(v) => setValue("tipo_servicio", v, { shouldValidate: true })}
                placeholder="Escribe para buscar el tipo…"
                allowCustom={false}
                disabled={campoBloqueado("tipo_servicio")}
              />
              <p className="text-xs text-muted-foreground">
                Lo primero que hay que elegir: define qué campos siguen abajo.
              </p>
            </section>

            {!editando && (
              <section className="space-y-1">
                <Label>Etapa del servicio *</Label>
                <Select value={etapaInicial} onValueChange={setEtapaInicial}>
                  <SelectTrigger>
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
                  Permite registrar directamente un servicio que ya sucedió (ej. FALLIDO, NO
                  EFECTIVO) sin tener que pasarlo primero por PROGRAMADO.
                </p>
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Paciente</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label>Buscar paciente</Label>
                  <PatientSearchCombobox
                    valueLabel={cedulaBusqueda || undefined}
                    onSelect={seleccionarPaciente}
                    disabled={soloLecturaLogistica}
                  />
                  <p className="text-xs text-muted-foreground">
                    Por cédula o nombre — si no aparece, es un paciente nuevo: escribe el nombre a la derecha.
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="nombre_completo">Nombre completo *</Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Nombre completo del paciente"
                    disabled={soloLecturaLogistica}
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
                    <Select value={vehiculoSeleccionado ?? ""} onValueChange={handleVehiculo} disabled={campoBloqueado("vehicle_id")}>
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
                      disabled={campoBloqueado("medico_user_id")}
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
                  <DateTimeField
                    id="fecha_hora_programacion"
                    value={watch("fecha_hora_programacion") ?? ""}
                    onChange={(v) => setValue("fecha_hora_programacion", v)}
                    disabled={campoBloqueado("fecha_hora_programacion")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Turno</Label>
                  <Select
                    value={turnoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("turno_programacion", v)}
                    disabled={campoBloqueado("turno_programacion")}
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
                      disabled={campoBloqueado(campo.name)}
                      {...register(campo.name)}
                    />
                  </div>
                ))}
                {perfil === "TRASLADO" && (
                  <div className="space-y-1">
                    <Label>Prestador</Label>
                    <CatalogCombobox
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
                      onChange={handleDepartamentoOrigen}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                      disabled={campoBloqueado("departamento_origen")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ciudad origen</Label>
                    <CatalogCombobox
                      options={ciudadesOrigen as string[]}
                      value={ciudadOrigenSeleccionada ?? ""}
                      onChange={(v) => setValue("ciudad_origen", v)}
                      placeholder={departamentoOrigenSeleccionado ? "Escribe para buscar la ciudad…" : "Primero elige el departamento"}
                      allowCustom={false}
                      disabled={campoBloqueado("ciudad_origen") || !departamentoOrigenSeleccionado}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Departamento destino</Label>
                    <CatalogCombobox
                      options={[...DEPARTAMENTOS_COLOMBIA]}
                      value={departamentoDestinoSeleccionado ?? ""}
                      onChange={handleDepartamentoDestino}
                      placeholder="Selecciona o busca…"
                      allowCustom={false}
                      disabled={campoBloqueado("departamento_destino")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ciudad destino</Label>
                    <CatalogCombobox
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
                      <Label>Perímetro</Label>
                      <Select
                        value={perimetroSeleccionado ?? ""}
                        onValueChange={(v) => setValue("perimetro", v)}
                        disabled={campoBloqueado("perimetro")}
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
                    disabled={campoBloqueado("valor_servicio")}
                    {...register("valor_servicio", { valueAsNumber: true, setValueAs: (v) => (Number.isNaN(v) ? undefined : v) })}
                  />
                </div>
                {/* SISRES fija método de pago en "N/A" (oculto) para el Regulador al
                    registrar — no lo decide en este punto del flujo. */}
                {!(esRegulador && !editando) && (
                  <div className="space-y-1">
                    <Label>Método de pago</Label>
                    <Select
                      value={metodoPagoSeleccionado ?? ""}
                      onValueChange={(v) => setValue("metodo_pago", v)}
                      disabled={campoBloqueado("metodo_pago")}
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
                )}
                <div className="space-y-1">
                  <Label>Cliente / aseguradora</Label>
                  <CatalogCombobox
                    options={clientes}
                    value={clienteSeleccionado ?? ""}
                    onChange={(v) => setValue("cliente", v)}
                    placeholder="Selecciona o busca…"
                    disabled={campoBloqueado("cliente")}
                  />
                </div>
                {perfil === "TRASLADO" && (
                  <div className="space-y-1">
                    <Label>Proveedor</Label>
                    <CatalogCombobox
                      options={PRESTADORES_SISRES as string[]}
                      value={proveedorSeleccionado ?? ""}
                      onChange={(v) => setValue("proveedor", v)}
                      placeholder="Escribe para buscar el proveedor…"
                      allowCustom={false}
                      disabled={campoBloqueado("proveedor")}
                    />
                  </div>
                )}
                {paraPerfil(CAMPOS_CIERRE, perfil).map((campo) => (
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
                <div className="space-y-1">
                  <Label>Usuario que recibe</Label>
                  <Select
                    value={usuarioRecibeSeleccionado ?? ""}
                    onValueChange={(v) => setValue("usuario_recibe", v)}
                    disabled={campoBloqueado("usuario_recibe")}
                  >
                    <SelectTrigger>
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
                  <Label>Usuario que despacha</Label>
                  <Select
                    value={usuarioDespachaSeleccionado ?? ""}
                    onValueChange={(v) => setValue("usuario_despacha", v)}
                    disabled={campoBloqueado("usuario_despacha")}
                  >
                    <SelectTrigger>
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
                  <Label>Motivo externo</Label>
                  <Select
                    value={motivoExternoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("motivo_externo", v)}
                    disabled={campoBloqueado("motivo_externo")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTIVO_EXTERNO_OPCIONES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Motivo interno</Label>
                  <Select
                    value={motivoInternoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("motivo_interno", v)}
                    disabled={campoBloqueado("motivo_interno")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTIVO_INTERNO_OPCIONES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Estado del servicio</Label>
                  <Select
                    value={estadoServicioSeleccionado ?? ""}
                    onValueChange={(v) => setValue("estado_servicio", v)}
                    disabled={campoBloqueado("estado_servicio")}
                  >
                    <SelectTrigger>
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
