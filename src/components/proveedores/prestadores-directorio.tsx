"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DirectorioTabla } from "@/components/directorio/directorio-tabla";
import { actualizarPrestador, crearPrestador } from "@/app/api/actions/prestadores";
import { AREAS_PRESTADOR, prestadorSchema, type PrestadorFormData } from "@/lib/prestadores";

type Fila = Record<string, string | number | boolean | null>;

const COLUMNAS = [
  { campo: "nombre", titulo: "Nombre" },
  { campo: "numero", titulo: "Documento" },
  { campo: "area", titulo: "Área" },
  { campo: "ciudad", titulo: "Ciudad" },
  { campo: "telefono1", titulo: "Teléfono" },
  { campo: "correo", titulo: "Correo" },
  { campo: "estado", titulo: "Estado" },
];

// Los filtros que agregó SISRES a mostrarProveedores.php (2026-08-28), más el estado.
const FILTROS = [
  { campo: "ciudad", titulo: "Ciudad" },
  { campo: "area", titulo: "Área" },
  { campo: "estado", titulo: "Estado" },
];

const CAMPOS_TEXTO: { name: keyof PrestadorFormData; label: string; type?: string }[] = [
  { name: "sector", label: "Sector comercial" },
  { name: "direccion", label: "Dirección" },
  { name: "departamento", label: "Departamento" },
  { name: "ciudad", label: "Ciudad" },
  { name: "telefono1", label: "Teléfono 1" },
  { name: "telefono2", label: "Teléfono 2" },
  { name: "telefono3", label: "Teléfono 3" },
  { name: "correo", label: "Correo", type: "email" },
];

const CLASE_SELECT = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export function PrestadoresDirectorio({ filas, puedeEditar }: { filas: Fila[]; puedeEditar: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<PrestadorFormData>({ resolver: zodResolver(prestadorSchema) });

  function abrir(fila: Fila | null) {
    setEditando(fila);
    setError(null);
    reset(
      fila
        ? {
            tipo_documento: texto(fila.tipo_documento),
            numero: texto(fila.numero),
            digito_verificacion: texto(fila.digito_verificacion),
            nombre: texto(fila.nombre),
            sector: texto(fila.sector),
            direccion: texto(fila.direccion),
            departamento: texto(fila.departamento),
            ciudad: texto(fila.ciudad),
            telefono1: texto(fila.telefono1),
            telefono2: texto(fila.telefono2),
            telefono3: texto(fila.telefono3),
            correo: texto(fila.correo),
            area: texto(fila.area),
            activo: Boolean(fila.activo),
          }
        : { tipo_documento: "NIT", activo: true }
    );
    setAbierto(true);
  }

  async function onSubmit(valores: PrestadorFormData) {
    setGuardando(true);
    setError(null);
    const r = editando ? await actualizarPrestador(Number(editando.id), valores) : await crearPrestador(valores);
    setGuardando(false);
    if ("error" in r && r.error) return setError(r.error);
    setAbierto(false);
    router.refresh();
  }

  const primerError = Object.values(formState.errors)[0]?.message;

  return (
    <div className="space-y-4">
      {puedeEditar && (
        <div className="flex justify-end">
          <Button onClick={() => abrir(null)}>
            <Plus className="mr-1 h-4 w-4" />
            Nuevo prestador
          </Button>
        </div>
      )}
      <DirectorioTabla
        filas={filas}
        columnas={COLUMNAS}
        filtros={FILTROS}
        vacio="Todavía no hay prestadores cargados (llegan con la migración de datos de SISRES)."
        accion={
          puedeEditar
            ? (fila) => (
                <Button variant="outline" size="sm" onClick={() => abrir(fila)}>
                  Editar
                </Button>
              )
            : undefined
        }
      />

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar prestador" : "Nuevo prestador"}</DialogTitle>
            <DialogDescription>Prestador o proveedor de servicios de salud.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="pr-tipo">Tipo de documento</Label>
                <Input id="pr-tipo" placeholder="NIT / CC" {...register("tipo_documento")} />
              </div>
              <div className="grid grid-cols-[1fr_5rem] gap-2">
                <div className="space-y-1">
                  <Label htmlFor="pr-numero">Número *</Label>
                  <Input id="pr-numero" inputMode="numeric" {...register("numero")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pr-dv">DV</Label>
                  <Input id="pr-dv" inputMode="numeric" maxLength={2} {...register("digito_verificacion")} />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="pr-nombre">Nombre / razón social *</Label>
                <Input id="pr-nombre" {...register("nombre")} />
              </div>
              {CAMPOS_TEXTO.map((c) => (
                <div key={c.name} className="space-y-1">
                  <Label htmlFor={`pr-${c.name}`}>{c.label}</Label>
                  <Input id={`pr-${c.name}`} type={c.type ?? "text"} {...register(c.name)} />
                </div>
              ))}
              <div className="space-y-1">
                <Label htmlFor="pr-area">Área</Label>
                <select id="pr-area" className={CLASE_SELECT} {...register("area")}>
                  <option value="">—</option>
                  {AREAS_PRESTADOR.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" {...register("activo")} />
                Activo
              </label>
            </div>
            {(error || primerError) && <p className="text-sm text-destructive">{error ?? String(primerError)}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
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
