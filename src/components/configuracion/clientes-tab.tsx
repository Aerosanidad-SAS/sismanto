"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientSchema, type ClientFormData } from "@/lib/validations";
import { crearCliente, actualizarCliente, eliminarCliente } from "@/app/api/actions/clientes";

export interface ClienteRow {
  id: number;
  tipo_documento: string;
  numero: string;
  digito_verificacion: string | null;
  nombre: string;
  sector: string | null;
  direccion: string | null;
  departamento: string | null;
  ciudad: string | null;
  telefono1: string | null;
  telefono2: string | null;
  telefono3: string | null;
  correo: string | null;
}

const CAMPOS: { name: keyof ClientFormData; label: string; type?: string }[] = [
  { name: "sector", label: "Sector" },
  { name: "direccion", label: "Dirección" },
  { name: "departamento", label: "Departamento" },
  { name: "ciudad", label: "Ciudad" },
  { name: "telefono1", label: "Teléfono 1" },
  { name: "telefono2", label: "Teléfono 2" },
  { name: "telefono3", label: "Teléfono 3" },
  { name: "correo", label: "Correo", type: "email" },
];

interface ClientesTabProps {
  clientes: ClienteRow[];
}

export function ClientesTab({ clientes }: ClientesTabProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ClienteRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.numero.toLowerCase().includes(q)
    );
  }, [clientes, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    reset({ tipo_documento: "NIT" } as ClientFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (c: ClienteRow) => {
    setEditando(c);
    setError(null);
    reset({
      tipo_documento: c.tipo_documento,
      numero: c.numero,
      digito_verificacion: c.digito_verificacion ?? "",
      nombre: c.nombre,
      sector: c.sector ?? "",
      direccion: c.direccion ?? "",
      departamento: c.departamento ?? "",
      ciudad: c.ciudad ?? "",
      telefono1: c.telefono1 ?? "",
      telefono2: c.telefono2 ?? "",
      telefono3: c.telefono3 ?? "",
      correo: c.correo ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: ClientFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarCliente(editando.id, values) : await crearCliente(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogOpen(false);
    router.refresh();
  };

  const handleEliminar = async (c: ClienteRow) => {
    if (!confirm(`¿Desactivar el cliente ${c.nombre}?`)) return;
    const res = await eliminarCliente(c.id);
    if (res.error) alert(res.error);
    else router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nombre o NIT…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-sm"
        />
        <Button onClick={abrirNuevo}>Nuevo cliente</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIT / Documento</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin clientes registrados
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.numero}
                  {c.digito_verificacion ? `-${c.digito_verificacion}` : ""}
                </TableCell>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>{c.sector ?? "—"}</TableCell>
                <TableCell>{c.ciudad ?? "—"}</TableCell>
                <TableCell>{c.telefono1 ?? "—"}</TableCell>
                <TableCell>{c.correo ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicion(c)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleEliminar(c)}>
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
            <DialogDescription>
              Aseguradoras y pagadores de servicios médicos (origen SISRES).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="tipo_documento">Tipo de documento *</Label>
                <Input id="tipo_documento" placeholder="NIT / CC" {...register("tipo_documento")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="numero">Número *</Label>
                <Input id="numero" {...register("numero")} disabled={Boolean(editando)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="digito_verificacion">Dígito de verificación</Label>
                <Input id="digito_verificacion" {...register("digito_verificacion")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre / razón social *</Label>
                <Input id="nombre" {...register("nombre")} />
              </div>
              {CAMPOS.map((campo) => (
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
    </div>
  );
}
