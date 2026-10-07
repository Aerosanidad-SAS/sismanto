"use client";

import { edadEn, esDia, hoyBogota, normalizarDia } from "@/lib/fechas";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { conAsterisco } from "@/lib/campos-obligatorios";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO, resolverCiudad } from "@/lib/colombia-geo";
import { crearPaciente, actualizarPaciente } from "@/app/api/actions/pacientes";

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

interface PacienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = paciente nuevo. */
  editando: PacienteRow | null;
  /** Documento con el que arranca un paciente nuevo (por ejemplo, el que la persona ya buscó). */
  cedulaInicial?: string;
  /** Catálogo real de EPS (tabla `eps`, migración 058) — mismo select cerrado que SISRES. */
  epsOptions: string[];
  /** Campos opcionales que el administrador volvió obligatorios (migración 101): se marcan con *. */
  obligatorios?: string[];
  /** Se llama después de guardar; `creado` trae la fila del paciente nuevo (no viene al editar). */
  onGuardado: (creado?: PacienteRow) => void;
}

/** Formulario de alta y edición de pacientes: lo usan /pacientes y el formulario de Nuevo servicio. */
export function PacienteFormDialog({
  open,
  onOpenChange,
  editando,
  cedulaInicial,
  epsOptions,
  obligatorios = [],
  onGuardado,
}: PacienteFormDialogProps) {
  const etq = (etiqueta: string, campo: string) => conAsterisco(etiqueta, campo, obligatorios);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  // Cada vez que se abre: formulario limpio (nuevo) o con los datos del paciente (edición).
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editando) {
      reset({ tipo_documento: "", cedula: cedulaInicial ?? "" } as unknown as PatientFormData);
      return;
    }
    // Pacientes históricos con ciudad en texto libre y sin departamento:
    // si la ciudad está en el catálogo, se completa el departamento para
    // que la cascada quede coherente. Si no hay match, se conserva tal cual.
    const ubicacion = editando.departamento ? null : resolverCiudad(editando.ciudad);
    reset({
      cedula: editando.cedula,
      tipo_documento: editando.tipo_documento,
      nombre1: editando.nombre1,
      nombre2: editando.nombre2 ?? "",
      apellido1: editando.apellido1,
      apellido2: editando.apellido2 ?? "",
      fecha_nacimiento: editando.fecha_nacimiento ?? "",
      direccion: editando.direccion ?? "",
      barrio: editando.barrio ?? "",
      localidad: editando.localidad ?? "",
      departamento: ubicacion?.departamento ?? editando.departamento ?? "",
      ciudad: ubicacion?.ciudad ?? editando.ciudad ?? "",
      rh: editando.rh ?? "",
      sexo: editando.sexo ?? "",
      estatura: editando.estatura ?? "",
      eps: editando.eps ?? "",
      celular: editando.celular ?? "",
      correo: editando.correo ?? "",
    });
  }, [open, editando, cedulaInicial, reset]);

  const tipoDocumentoSeleccionado = watch("tipo_documento");
  const sexoSeleccionado = watch("sexo");
  const rhSeleccionado = watch("rh");
  const departamentoSeleccionado = watch("departamento");
  const ciudadSeleccionada = watch("ciudad");
  const epsSeleccionada = watch("eps");
  // Ciudad en cascada: solo las del departamento ya elegido (mismo criterio
  // que servicios-tabla.tsx). Si cambia el departamento, se limpia la ciudad
  // para no dejar una que ya no corresponde.
  const ciudadesDisponibles = departamentoSeleccionado ? MUNICIPIOS_POR_DEPARTAMENTO[departamentoSeleccionado] ?? [] : [];
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

  const onSubmit = async (values: PatientFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarPaciente(editando.id, values) : await crearPaciente(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onOpenChange(false);
    onGuardado("data" in res ? (res.data as PacienteRow) : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
          <DialogDescription>
            El documento de identidad no puede repetirse entre pacientes (mínimo 5 caracteres).
          </DialogDescription>
        </DialogHeader>

        {/* stopPropagation: este formulario puede abrirse desde dentro del formulario de servicio, y un submit
            no debe llegar al <form> de afuera (React propaga el evento por el árbol de componentes aunque el
            diálogo se pinte en un portal). */}
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="fecha_nacimiento_primero">{etq("Fecha de nacimiento", "fecha_nacimiento")}</Label>
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
              <Label>{etq("Sexo", "sexo")}</Label>
              <Select value={sexoSeleccionado ?? ""} onValueChange={(v) => setValue("sexo", v)}>
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
              <Label>{etq("RH", "rh")}</Label>
              <Select value={rhSeleccionado ?? ""} onValueChange={(v) => setValue("rh", v)}>
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
              <Label htmlFor="estatura">{etq("Estatura", "estatura")}</Label>
              <div className="relative">
                <Input id="estatura" placeholder="Ej: 168" className="pr-12" {...register("estatura")} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="departamento">{etq("Departamento", "departamento")}</Label>
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
              <Label htmlFor="ciudad">{etq("Ciudad", "ciudad")}</Label>
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
              <Label htmlFor="eps">{etq("EPS", "eps")}</Label>
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
                <Label htmlFor={campo.name}>{etq(campo.label, campo.name)}</Label>
                <Input id={campo.name} type={campo.type ?? "text"} {...register(campo.name)} />
              </div>
            ))}
          </div>

          {(error || Object.values(formState.errors)[0]?.message) && (
            <p className="text-sm text-destructive">{error ?? String(Object.values(formState.errors)[0]?.message)}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
