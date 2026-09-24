"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateShort } from "@/lib/utils";
import { SEXO_OPCIONES, assessmentSchema, type AssessmentFormData } from "@/lib/validations";
import { aTextoLocalColombia } from "@/lib/hora-colombia";
import {
  ESTADO_VALORACION_OPCIONES,
  VALORACION_OPCIONES,
  clasificarValoracion,
  edadEnAnios,
  estadoLegible,
  nombreCompletoPaciente,
} from "@/lib/valoraciones-lista";
import { crearValoracion, actualizarValoracion } from "@/app/api/actions/valoraciones";
import { buscarPacientePorCedula } from "@/app/api/actions/pacientes";

export interface ValoracionRow {
  id: number;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  aerolinea: string | null;
  fecha_hora_vuelo: string | null;
  acompanante: string | null;
  origen: string | null;
  destino: string | null;
  hc: string | null;
  concepto_medico: string | null;
  tiempo_estimado: string | null;
  recomendaciones: string | null;
  valoracion: string | null;
  medico: string | null;
  pasajero: string | null;
  estado: string | null;
  created_at: string;
}

/** Campos de texto simples. Género, valoración y estado son selects cerrados (como en SISRES); médico y pasajero los pone el servidor. */
const CAMPOS_TEXTO: { name: keyof AssessmentFormData; label: string; type?: string }[] = [
  { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
  { name: "aerolinea", label: "Aerolínea" },
  { name: "fecha_hora_vuelo", label: "Fecha y hora del vuelo", type: "datetime-local" },
  { name: "acompanante", label: "Acompañante" },
  { name: "origen", label: "Origen" },
  { name: "destino", label: "Destino" },
  { name: "tiempo_estimado", label: "Tiempo estimado del vuelo" },
];

/** Hoy en hora de Colombia (YYYY-MM-DD). */
const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

interface ValoracionesTablaProps {
  valoraciones: ValoracionRow[];
  puedeEditar: boolean;
  /** Texto de la búsqueda actual (parámetro `q` de la URL); la búsqueda se hace en el servidor. */
  busqueda: string;
}

export function ValoracionesTabla({ valoraciones, puedeEditar, busqueda }: ValoracionesTablaProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ValoracionRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [avisoPaciente, setAvisoPaciente] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, getValues, formState } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
  });

  const generoSeleccionado = watch("genero") ?? "";
  const valoracionSeleccionada = watch("valoracion") ?? "";
  const estadoSeleccionado = watch("estado") ?? "";
  const edadCalculada = edadEnAnios(watch("fecha_nacimiento") || null, hoyBogota());
  // Si el registro trae un género fuera de la lista (datos viejos), se conserva como opción para no perderlo al editar.
  const opcionesGenero: string[] = [...SEXO_OPCIONES];
  if (generoSeleccionado && !opcionesGenero.includes(generoSeleccionado)) opcionesGenero.push(generoSeleccionado);

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    setAvisoPaciente(null);
    reset({ estado: "ACTIVO" } as AssessmentFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (v: ValoracionRow) => {
    setEditando(v);
    setError(null);
    setAvisoPaciente(null);
    reset({
      cedula: v.cedula,
      nombre_completo: v.nombre_completo,
      fecha_nacimiento: v.fecha_nacimiento ?? "",
      genero: v.genero ?? "",
      aerolinea: v.aerolinea ?? "",
      fecha_hora_vuelo: aTextoLocalColombia(v.fecha_hora_vuelo),
      acompanante: v.acompanante ?? "",
      origen: v.origen ?? "",
      destino: v.destino ?? "",
      hc: v.hc ?? "",
      concepto_medico: v.concepto_medico ?? "",
      tiempo_estimado: v.tiempo_estimado ?? "",
      recomendaciones: v.recomendaciones ?? "",
      // Se normaliza el texto viejo ("apto " → APTO); si no es APTO ni NO APTO (p. ej. "PENDIENTE") no se precarga y obliga a elegir de la lista.
      valoracion: clasificarValoracion(v.valoracion) === "OTRO" ? "" : clasificarValoracion(v.valoracion),
      estado: estadoLegible(v.estado),
    });
    setDialogOpen(true);
  };

  /** Igual que el botón "Buscar" de registroValoracion.php: trae nombre, fecha de nacimiento y género del maestro de pacientes. */
  const buscarPaciente = async () => {
    const cedula = (getValues("cedula") ?? "").trim();
    setAvisoPaciente(null);
    if (cedula.length < 4) {
      setAvisoPaciente("Escribe el documento del paciente para buscarlo.");
      return;
    }
    setBuscandoPaciente(true);
    try {
      // El tipo generado de `patients` está desactualizado (ver database.types.ts): se tipa lo que se usa.
      const p = (await buscarPacientePorCedula(cedula)) as {
        nombre1: string;
        nombre2: string | null;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: string | null;
        sexo: string | null;
      } | null;
      if (!p) {
        setAvisoPaciente("No hay un paciente con ese documento en el maestro: completa los datos a mano.");
        return;
      }
      setValue("nombre_completo", nombreCompletoPaciente(p), { shouldValidate: true });
      setValue("fecha_nacimiento", p.fecha_nacimiento ?? "");
      if (p.sexo && (SEXO_OPCIONES as readonly string[]).includes(p.sexo)) setValue("genero", p.sexo);
      setAvisoPaciente("Datos del paciente cargados.");
    } catch {
      setAvisoPaciente("No se pudo buscar el paciente. Intenta de nuevo.");
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const onSubmit = async (values: AssessmentFormData) => {
    setGuardando(true);
    setError(null);
    try {
      const res = editando ? await actualizarValoracion(editando.id, values) : await crearValoracion(values);
      if (res.error) {
        setError(res.error);
        return;
      }
    } catch {
      setError("No se pudo guardar la valoración. Intenta de nuevo.");
      return;
    } finally {
      setGuardando(false);
    }
    setDialogOpen(false);
    router.refresh();
  };

  const hoyIso = hoyBogota();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/valoraciones" method="get" role="search" className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            name="q"
            defaultValue={busqueda}
            maxLength={80}
            placeholder="Buscar por documento, nombre, médico o aerolínea…"
            aria-label="Buscar valoraciones"
            className="sm:max-w-sm"
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {busqueda && (
            <Link href="/valoraciones" className="text-sm text-muted-foreground underline">
              Limpiar
            </Link>
          )}
        </form>
        {puedeEditar && <Button onClick={abrirNuevo}>Nueva valoración</Button>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Aerolínea</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Vuelo</TableHead>
              <TableHead>Valoración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Médico</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {valoraciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 12 : 11} className="text-center text-muted-foreground">
                  {busqueda ? "Sin resultados para la búsqueda" : "Sin valoraciones registradas"}
                </TableCell>
              </TableRow>
            )}
            {valoraciones.map((v) => {
              const concepto = clasificarValoracion(v.valoracion);
              return (
                <TableRow key={v.id}>
                  <TableCell>{formatDateShort(v.created_at)}</TableCell>
                  <TableCell className="font-medium">{v.cedula}</TableCell>
                  <TableCell>{v.nombre_completo}</TableCell>
                  <TableCell>{edadEnAnios(v.fecha_nacimiento, hoyIso) === "" ? "—" : edadEnAnios(v.fecha_nacimiento, hoyIso)}</TableCell>
                  <TableCell>{v.aerolinea ?? "—"}</TableCell>
                  <TableCell>{v.origen ?? "—"}</TableCell>
                  <TableCell>{v.destino ?? "—"}</TableCell>
                  <TableCell>{v.fecha_hora_vuelo ? formatDateShort(v.fecha_hora_vuelo) : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={concepto === "NO APTO" ? "destructive" : concepto === "APTO" ? "success" : "outline"}>
                      {v.valoracion ?? "Sin concepto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={estadoLegible(v.estado) === "INACTIVO" ? "destructive" : "outline"}>
                      {estadoLegible(v.estado) || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.medico ?? "—"}</TableCell>
                  {puedeEditar && (
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => abrirEdicion(v)}>
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar valoración" : "Nueva valoración"}</DialogTitle>
            <DialogDescription>
              Concepto de aptitud médica para vuelo.
              {!editando && " El médico queda registrado con tu usuario."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="cedula">Documento del paciente *</Label>
                <div className="flex gap-2">
                  <Input id="cedula" {...register("cedula")} />
                  <Button type="button" variant="outline" onClick={buscarPaciente} disabled={buscandoPaciente}>
                    {buscandoPaciente ? "Buscando…" : "Buscar"}
                  </Button>
                </div>
                {avisoPaciente && <p className="text-xs text-muted-foreground">{avisoPaciente}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="nombre_completo">Nombre completo *</Label>
                <Input id="nombre_completo" {...register("nombre_completo")} />
              </div>
              {CAMPOS_TEXTO.map((campo) => (
                <div key={campo.name} className="space-y-1">
                  <Label htmlFor={campo.name}>{campo.label}</Label>
                  <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
                </div>
              ))}
              <div className="space-y-1">
                <Label htmlFor="edad">Edad</Label>
                <Input id="edad" value={edadCalculada === "" ? "" : `${edadCalculada} años`} readOnly disabled placeholder="Se calcula con la fecha de nacimiento" />
              </div>
              <div className="space-y-1">
                <Label>Género</Label>
                <Select value={generoSeleccionado} onValueChange={(v) => setValue("genero", v)}>
                  <SelectTrigger aria-label="Género">
                    <SelectValue placeholder="Seleccione la opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesGenero.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Valoración</Label>
                <Select value={valoracionSeleccionada} onValueChange={(v) => setValue("valoracion", v, { shouldValidate: true })}>
                  <SelectTrigger aria-label="Valoración">
                    <SelectValue placeholder="Seleccione la opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALORACION_OPCIONES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select value={estadoSeleccionado} onValueChange={(v) => setValue("estado", v, { shouldValidate: true })}>
                  <SelectTrigger aria-label="Estado">
                    <SelectValue placeholder="Seleccione la opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_VALORACION_OPCIONES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="hc">N° de historia clínica</Label>
              <Input id="hc" {...register("hc")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="concepto_medico">Concepto médico</Label>
              <Textarea id="concepto_medico" rows={3} {...register("concepto_medico")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="recomendaciones">Recomendaciones</Label>
              <Textarea id="recomendaciones" rows={3} {...register("recomendaciones")} />
            </div>

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
