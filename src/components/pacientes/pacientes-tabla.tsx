"use client";

import { edadEn, esDia, hoyBogota } from "@/lib/fechas";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { PacienteFormDialog, type PacienteRow } from "@/components/pacientes/paciente-form-dialog";
import { eliminarPaciente } from "@/app/api/actions/pacientes";

export type { PacienteRow };

function nombreCompleto(p: PacienteRow) {
  return [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(" ");
}

function calcularEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return "—";
  const nacimiento = fechaNacimiento.slice(0, 10);
  if (!esDia(nacimiento)) return "—";
  return `${edadEn(nacimiento, hoyBogota())}`;
}

interface PacientesTablaProps {
  pacientes: PacienteRow[];
  puedeEditar: boolean;
  /** Quién puede desactivar pacientes. En SISRES el Regulador no puede (PARIDAD_REGULACION.md, PAC-10). */
  puedeDesactivar: boolean;
  /** Catálogo real de EPS (tabla `eps`, migración 058) — mismo select cerrado que SISRES. */
  epsOptions: string[];
  /** Texto de la búsqueda actual (parámetro `q` de la URL); la búsqueda se hace en el servidor. */
  busqueda: string;
  /** Campos opcionales que el administrador volvió obligatorios (migración 101): se marcan con *. */
  obligatorios?: string[];
}

export function PacientesTabla({ pacientes, puedeEditar, puedeDesactivar, epsOptions, busqueda, obligatorios = [] }: PacientesTablaProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PacienteRow | null>(null);
  const [eliminando, setEliminando] = useState<PacienteRow | null>(null);

  const abrirNuevo = () => {
    setEditando(null);
    setDialogOpen(true);
  };

  const abrirEdicion = (p: PacienteRow) => {
    setEditando(p);
    setDialogOpen(true);
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
                      {puedeDesactivar && (
                        <Button variant="destructive" size="sm" onClick={() => setEliminando(p)}>
                          Eliminar
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

      <PacienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editando={editando}
        epsOptions={epsOptions}
        obligatorios={obligatorios}
        onGuardado={() => router.refresh()}
      />

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
