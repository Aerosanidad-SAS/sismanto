"use client";

import { edadEn, esDia, hoyBogota, normalizarDia } from "@/lib/fechas";
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
import { CatalogCombobox } from "@/components/forms/catalog-combobox";
import { DateField } from "@/components/forms/date-field";
import {
  patientSchema,
  type PatientFormData,
  TIPOS_DOCUMENTO,
  TIPOS_DOCUMENTO_SOLO_ADULTO,
  TIPOS_DOCUMENTO_SOLO_MENOR,
  SEXO_OPCIONES,
  RH_OPCIONES,
} from "@/lib/validations";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO, resolverCiudad } from "@/lib/colombia-geo";
import { crearPaciente, actualizarPaciente, eliminarPaciente } from "@/app/api/actions/pacientes";

/** null = no se pudo determinar (sin fecha de nacimiento o fecha inválida) */
function calcularEdadNumero(fechaNacimiento: string | undefined): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = normalizarDia(fechaNacimiento.slice(0, 10));
  if (!esDia(nacimiento)) return null;
  return edadEn(nacimiento, hoyBogota());
}

export interface PacienteRow {
  id: number;
  cedula: string;
  tipo_documento: string;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  barrio: string | null;
  localidad: string | null;
  departamento: string | null;
  ciudad: string | null;
  rh: string | null;
  sexo: string | null;
  estatura: string | null;
  eps: string | null;
  celular: string | null;
  correo: string | null;
}

function nombreCompleto(p: PacienteRow) {
  return [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(" ");
}

function calcularEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return "—";
  const nacimiento = fechaNacimiento.slice(0, 10);
  if (!esDia(nacimiento)) return "—";
  return `${edadEn(nacimiento, hoyBogota())}`;
}

// Campos de texto simples del formulario (los que tienen catálogo real —
// tipo_documento, sexo, rh, departamento, ciudad, EPS — se renderizan
// aparte más abajo). Ciudad va en cascada por departamento, igual que
// registroPacientes.php en SISRES (PARIDAD_REGULACION.md, PAC-06).
const CAMPOS_OPCIONALES: { name: keyof PatientFormData; label: string; type?: string }[] = [
  { name: "nombre2", label: "Segundo nombre" },
  { name: "apellido2", label: "Segundo apellido" },
  { name: "celular", label: "Celular" },
  { name: "correo", label: "Correo", type: "email" },
  { name: "direccion", label: "Dirección" },
  { name: "barrio", label: "Barrio" },
  { name: "localidad", label: "Localidad" },
];

interface PacientesTablaProps {
  pacientes: PacienteRow[];
  puedeEditar: boolean;
  /** Catálogo real de EPS (tabla `eps`, migración 058) — mismo select
   * cerrado que SISRES. */
  epsOptions: string[];
  /** Texto de la búsqueda actual (parámetro `q` de la URL); la búsqueda se hace en el servidor. */
  busqueda: string;
}

export function PacientesTabla({ pacientes, puedeEditar, epsOptions, busqueda }: PacientesTablaProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PacienteRow | null>(null);
  const [eliminando, setEliminando] = useState<PacienteRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const tipoDocumentoSeleccionado = watch("tipo_documento");
  const sexoSeleccionado = watch("sexo");
  const rhSeleccionado = watch("rh");
  const departamentoSeleccionado = watch("departamento");
  const ciudadSeleccionada = watch("ciudad");
  const epsSeleccionada = watch("eps");
  // Ciudad en cascada: solo las del departamento ya elegido (mismo criterio
  // que servicios-tabla.tsx). Si cambia el departamento, se limpia la ciudad
  // para no dejar una que ya no corresponde.
  const ciudadesDisponibles = departamentoSeleccionado
    ? MUNICIPIOS_POR_DEPARTAMENTO[departamentoSeleccionado] ?? []
    : [];
  const handleDepartamento = (v: string) => {
    setValue("departamento", v);
    setValue("ciudad", "");
  };
  const edadCalculada = calcularEdadNumero(watch("fecha_nacimiento"));
  const esMenorDeEdad = edadCalculada !== null && edadCalculada < 18;
  const tiposDocumentoDisponibles = TIPOS_DOCUMENTO.filter((t) => {
    if (edadCalculada === null) return true; // sin fecha de nacimiento, no se restringe
    if (esMenorDeEdad) return !(TIPOS_DOCUMENTO_SOLO_ADULTO as readonly string[]).includes(t);
    return !(TIPOS_DOCUMENTO_SOLO_MENOR as readonly string[]).includes(t);
  });

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    reset({ tipo_documento: "" } as unknown as PatientFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (p: PacienteRow) => {
    setEditando(p);
    setError(null);
    // Pacientes históricos con ciudad en texto libre y sin departamento:
    // si la ciudad está en el catálogo, se completa el departamento para
    // que la cascada quede coherente. Si no hay match, se conserva tal cual.
    const ubicacion = p.departamento ? null : resolverCiudad(p.ciudad);
    reset({
      cedula: p.cedula,
      tipo_documento: p.tipo_documento,
      nombre1: p.nombre1,
      nombre2: p.nombre2 ?? "",
      apellido1: p.apellido1,
      apellido2: p.apellido2 ?? "",
      fecha_nacimiento: p.fecha_nacimiento ?? "",
      direccion: p.direccion ?? "",
      barrio: p.barrio ?? "",
      localidad: p.localidad ?? "",
      departamento: ubicacion?.departamento ?? p.departamento ?? "",
      ciudad: ubicacion?.ciudad ?? p.ciudad ?? "",
      rh: p.rh ?? "",
      sexo: p.sexo ?? "",
      estatura: p.estatura ?? "",
      eps: p.eps ?? "",
      celular: p.celular ?? "",
      correo: p.correo ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: PatientFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarPaciente(editando.id, values) : await crearPaciente(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogOpen(false);
    router.refresh();
  };

  const confirmarEliminar = async () => {
    if (!eliminando) return;
    const res = await eliminarPaciente(eliminando.id);
    setEliminando(null);
    if (res.error) alert(res.error);
    else router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/pacientes" method="get" role="search" className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            name="q"
            defaultValue={busqueda}
            maxLength={80}
            placeholder="Buscar por documento, nombre, EPS o ciudad…"
            aria-label="Buscar pacientes"
            className="sm:max-w-sm"
          />
          <Button type="submit" variant="outline">Buscar</Button>
          {busqueda && (
            <Link href="/pacientes" className="text-sm text-muted-foreground underline">
              Limpiar
            </Link>
          )}
        </form>
        {puedeEditar && <Button onClick={abrirNuevo}>Nuevo paciente</Button>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>EPS</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Ciudad</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 8 : 7} className="text-center text-muted-foreground">
                  {busqueda ? "Sin resultados para la búsqueda" : "Sin pacientes registrados"}
                </TableCell>
              </TableRow>
            )}
            {pacientes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{p.tipo_documento}</Badge> {p.cedula}
                </TableCell>
                <TableCell>{nombreCompleto(p)}</TableCell>
                <TableCell>{calcularEdad(p.fecha_nacimiento)}</TableCell>
                <TableCell>{p.sexo ?? "—"}</TableCell>
                <TableCell>{p.eps ?? "—"}</TableCell>
                <TableCell>{p.celular ?? "—"}</TableCell>
                <TableCell>{p.ciudad ?? "—"}</TableCell>
                {puedeEditar && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrirEdicion(p)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setEliminando(p)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
            <DialogDescription>
              El documento de identidad no puede repetirse entre pacientes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fecha_nacimiento_primero">Fecha de nacimiento</Label>
                <DateField
                  id="fecha_nacimiento_primero"
                  value={watch("fecha_nacimiento") ?? ""}
                  onChange={(v) => setValue("fecha_nacimiento", v)}
                />
                <p className="text-xs text-muted-foreground">
                  {esMenorDeEdad
                    ? "Menor de edad — cédula no disponible como tipo de documento."
                    : edadCalculada !== null
                      ? "Mayor de edad."
                      : "Complétala primero: filtra qué tipos de documento aplican."}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tipo_documento">Tipo de documento *</Label>
                <Select
                  value={tipoDocumentoSeleccionado ?? ""}
                  onValueChange={(v) => setValue("tipo_documento", v as PatientFormData["tipo_documento"], { shouldValidate: true })}
                >
                  <SelectTrigger id="tipo_documento">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumentoDisponibles.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cedula">Número de documento *</Label>
                <Input id="cedula" {...register("cedula")} disabled={Boolean(editando)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nombre1">Primer nombre *</Label>
                <Input id="nombre1" {...register("nombre1")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apellido1">Primer apellido *</Label>
                <Input id="apellido1" {...register("apellido1")} />
              </div>
              <div className="space-y-1">
                <Label>Sexo</Label>
                <Select
                  value={sexoSeleccionado ?? ""}
                  onValueChange={(v) => setValue("sexo", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEXO_OPCIONES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>RH</Label>
                <Select
                  value={rhSeleccionado ?? ""}
                  onValueChange={(v) => setValue("rh", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {RH_OPCIONES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="estatura">Estatura</Label>
                <div className="relative">
                  <Input id="estatura" placeholder="Ej: 168" className="pr-12" {...register("estatura")} />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    cm
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="departamento">Departamento</Label>
                <CatalogCombobox
                  id="departamento"
                  options={[...DEPARTAMENTOS_COLOMBIA]}
                  value={departamentoSeleccionado ?? ""}
                  onChange={handleDepartamento}
                  placeholder="Selecciona o busca…"
                  allowCustom={false}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ciudad">Ciudad</Label>
                <CatalogCombobox
                  id="ciudad"
                  options={ciudadesDisponibles as string[]}
                  value={ciudadSeleccionada ?? ""}
                  onChange={(v) => setValue("ciudad", v)}
                  placeholder={departamentoSeleccionado ? "Escribe para buscar la ciudad…" : "Primero elige el departamento"}
                  allowCustom={false}
                  disabled={!departamentoSeleccionado}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="eps">EPS</Label>
                <CatalogCombobox
                  id="eps"
                  options={epsOptions}
                  value={epsSeleccionada ?? ""}
                  onChange={(v) => setValue("eps", v)}
                  placeholder="Selecciona o busca…"
                  allowCustom={false}
                />
              </div>
              {CAMPOS_OPCIONALES.map((campo) => (
                <div key={campo.name} className="space-y-1">
                  <Label htmlFor={campo.name}>{campo.label}</Label>
                  <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
                </div>
              ))}
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

      <AlertDialog open={Boolean(eliminando)} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              {eliminando ? `${nombreCompleto(eliminando)} (${eliminando.cedula})` : ""} dejará de
              aparecer en el listado. Su historial de servicios se conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEliminar}>Desactivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
