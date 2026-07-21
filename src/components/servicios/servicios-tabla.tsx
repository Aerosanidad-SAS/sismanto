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
import {
  medicalServiceSchema,
  type MedicalServiceFormData,
  type EtapaServicio,
} from "@/lib/validations";
import {
  crearServicioMedico,
  actualizarServicioMedico,
  cambiarEtapaServicio,
} from "@/app/api/actions/servicios-medicos";
import { buscarPacientePorCedula } from "@/app/api/actions/pacientes";

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

const CAMPOS_PROGRAMACION: { name: keyof MedicalServiceFormData; label: string; type?: string }[] = [
  { name: "fecha_hora_programacion", label: "Fecha/hora de programación", type: "datetime-local" },
  { name: "turno_programacion", label: "Turno" },
  { name: "autorizacion", label: "Autorización" },
  { name: "asesor", label: "Asesor" },
  { name: "prestador", label: "Prestador" },
  { name: "cie_codigo", label: "Código CIE-10" },
  { name: "requiere_aislamiento", label: "Requiere aislamiento (SI/NO)" },
  { name: "soporte", label: "Soporte" },
  { name: "finalidad_traslado", label: "Finalidad del traslado" },
  { name: "acepta_ips", label: "IPS que acepta" },
];

const CAMPOS_RUTA: { name: keyof MedicalServiceFormData; label: string; type?: string }[] = [
  { name: "departamento_origen", label: "Departamento origen" },
  { name: "ciudad_origen", label: "Ciudad origen" },
  { name: "direccion_origen", label: "Dirección origen" },
  { name: "fecha_hora_llegada_origen", label: "Llegada a origen", type: "datetime-local" },
  { name: "fecha_hora_salida_origen", label: "Salida de origen", type: "datetime-local" },
  { name: "direccion_intermedia", label: "Dirección intermedia (opcional)" },
  { name: "fecha_hora_llegada_intermedia", label: "Llegada intermedia", type: "datetime-local" },
  { name: "fecha_hora_salida_intermedia", label: "Salida intermedia", type: "datetime-local" },
  { name: "departamento_destino", label: "Departamento destino" },
  { name: "ciudad_destino", label: "Ciudad destino" },
  { name: "direccion_destino", label: "Dirección destino" },
  { name: "fecha_hora_llegada_destino", label: "Llegada a destino", type: "datetime-local" },
  { name: "fecha_hora_salida_destino", label: "Salida de destino", type: "datetime-local" },
  { name: "perimetro", label: "Perímetro" },
];

const CAMPOS_CIERRE: { name: keyof MedicalServiceFormData; label: string; type?: string }[] = [
  { name: "metodo_pago", label: "Método de pago" },
  { name: "cliente", label: "Cliente / aseguradora" },
  { name: "proveedor", label: "Proveedor" },
  { name: "medico", label: "Médico" },
  { name: "auxiliar", label: "Auxiliar" },
  { name: "ovem", label: "OVEM (conductor)" },
  { name: "usuario_recibe", label: "Usuario que recibe" },
  { name: "usuario_despacha", label: "Usuario que despacha" },
  { name: "motivo_externo", label: "Motivo externo" },
  { name: "motivo_interno", label: "Motivo interno" },
  { name: "estado_servicio", label: "Estado del servicio" },
  { name: "ciudad_registro", label: "Ciudad de registro" },
];

interface ServiciosTablaProps {
  servicios: ServicioRow[];
  vehiculos: { id: string; placa: string }[];
  puedeEditar: boolean;
}

export function ServiciosTabla({ servicios, vehiculos, puedeEditar }: ServiciosTablaProps) {
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

  const tipoSeleccionado = watch("tipo_servicio");
  const vehiculoSeleccionado = watch("vehicle_id");

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
    reset({ tipo_servicio: "" } as MedicalServiceFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (s: ServicioRow) => {
    setEditando(s);
    setError(null);
    setCedulaBusqueda(s.patients?.cedula ?? "");
    const str = (k: string) => (s[k] ? String(s[k]) : "");
    const fecha = (k: string) => (s[k] ? String(s[k]).slice(0, 16) : "");
    reset({
      patient_id: s.patient_id ?? undefined,
      nombre_completo: s.nombre_completo,
      tipo_servicio: s.tipo_servicio,
      vehicle_id: s.vehicle_id ?? "",
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
                  <Input id="nombre_completo" {...register("nombre_completo")} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Servicio</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Tipo de servicio *</Label>
                  <Select
                    value={tipoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("tipo_servicio", v, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_SERVICIO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Móvil (ambulancia)</Label>
                  <Select
                    value={vehiculoSeleccionado ?? ""}
                    onValueChange={(v) => setValue("vehicle_id", v === "__none__" ? "" : v)}
                  >
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
                </div>
                {CAMPOS_PROGRAMACION.map((campo) => (
                  <div key={campo.name} className="space-y-1">
                    <Label htmlFor={campo.name}>{campo.label}</Label>
                    <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Ruta y tiempos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {CAMPOS_RUTA.map((campo) => (
                  <div key={campo.name} className="space-y-1">
                    <Label htmlFor={campo.name}>{campo.label}</Label>
                    <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Cierre y facturación</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="valor_servicio">Valor del servicio</Label>
                  <Input
                    id="valor_servicio"
                    type="number"
                    step="0.01"
                    {...register("valor_servicio", { valueAsNumber: true, setValueAs: (v) => (Number.isNaN(v) ? undefined : v) })}
                  />
                </div>
                {CAMPOS_CIERRE.map((campo) => (
                  <div key={campo.name} className="space-y-1">
                    <Label htmlFor={campo.name}>{campo.label}</Label>
                    <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="novedad_servicio">Novedad del servicio</Label>
                <Textarea id="novedad_servicio" rows={2} {...register("novedad_servicio")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea id="observaciones" rows={2} {...register("observaciones")} />
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
