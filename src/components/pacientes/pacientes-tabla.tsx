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
import { patientSchema, type PatientFormData } from "@/lib/validations";
import { crearPaciente, actualizarPaciente, eliminarPaciente } from "@/app/api/actions/pacientes";

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
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return "—";
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return `${edad}`;
}

// Campos de texto simples del formulario (los obligatorios van aparte)
const CAMPOS_OPCIONALES: { name: keyof PatientFormData; label: string; type?: string }[] = [
  { name: "nombre2", label: "Segundo nombre" },
  { name: "apellido2", label: "Segundo apellido" },
  { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
  { name: "sexo", label: "Sexo" },
  { name: "rh", label: "RH" },
  { name: "estatura", label: "Estatura" },
  { name: "eps", label: "EPS" },
  { name: "celular", label: "Celular" },
  { name: "correo", label: "Correo", type: "email" },
  { name: "direccion", label: "Dirección" },
  { name: "barrio", label: "Barrio" },
  { name: "localidad", label: "Localidad" },
  { name: "departamento", label: "Departamento" },
  { name: "ciudad", label: "Ciudad" },
];

interface PacientesTablaProps {
  pacientes: PacienteRow[];
  puedeEditar: boolean;
}

export function PacientesTabla({ pacientes, puedeEditar }: PacientesTablaProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PacienteRow | null>(null);
  const [eliminando, setEliminando] = useState<PacienteRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter(
      (p) =>
        p.cedula.toLowerCase().includes(q) ||
        nombreCompleto(p).toLowerCase().includes(q) ||
        (p.eps ?? "").toLowerCase().includes(q) ||
        (p.ciudad ?? "").toLowerCase().includes(q)
    );
  }, [pacientes, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    reset({ tipo_documento: "CC" } as PatientFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (p: PacienteRow) => {
    setEditando(p);
    setError(null);
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
      departamento: p.departamento ?? "",
      ciudad: p.ciudad ?? "",
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
        <Input
          placeholder="Buscar por documento, nombre, EPS o ciudad…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-sm"
        />
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
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 8 : 7} className="text-center text-muted-foreground">
                  Sin pacientes registrados
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((p) => (
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
                <Label htmlFor="tipo_documento">Tipo de documento *</Label>
                <Input id="tipo_documento" placeholder="CC / TI / CE / PP" {...register("tipo_documento")} />
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
