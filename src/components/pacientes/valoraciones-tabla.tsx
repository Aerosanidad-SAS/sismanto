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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateShort } from "@/lib/utils";
import { assessmentSchema, type AssessmentFormData } from "@/lib/validations";
import { crearValoracion, actualizarValoracion } from "@/app/api/actions/valoraciones";

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

const CAMPOS_TEXTO: { name: keyof AssessmentFormData; label: string; type?: string }[] = [
  { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
  { name: "genero", label: "Género" },
  { name: "aerolinea", label: "Aerolínea" },
  { name: "fecha_hora_vuelo", label: "Fecha y hora del vuelo", type: "datetime-local" },
  { name: "acompanante", label: "Acompañante" },
  { name: "origen", label: "Origen" },
  { name: "destino", label: "Destino" },
  { name: "tiempo_estimado", label: "Tiempo estimado" },
  { name: "valoracion", label: "Valoración (APTO / NO APTO)" },
  { name: "medico", label: "Médico" },
  { name: "pasajero", label: "Pasajero" },
  { name: "estado", label: "Estado" },
];

interface ValoracionesTablaProps {
  valoraciones: ValoracionRow[];
  puedeEditar: boolean;
}

export function ValoracionesTabla({ valoraciones, puedeEditar }: ValoracionesTablaProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ValoracionRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
  });

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return valoraciones;
    return valoraciones.filter(
      (v) =>
        v.cedula.toLowerCase().includes(q) ||
        v.nombre_completo.toLowerCase().includes(q) ||
        (v.aerolinea ?? "").toLowerCase().includes(q) ||
        (v.medico ?? "").toLowerCase().includes(q)
    );
  }, [valoraciones, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setError(null);
    reset({} as AssessmentFormData);
    setDialogOpen(true);
  };

  const abrirEdicion = (v: ValoracionRow) => {
    setEditando(v);
    setError(null);
    reset({
      cedula: v.cedula,
      nombre_completo: v.nombre_completo,
      fecha_nacimiento: v.fecha_nacimiento ?? "",
      genero: v.genero ?? "",
      aerolinea: v.aerolinea ?? "",
      fecha_hora_vuelo: v.fecha_hora_vuelo ? v.fecha_hora_vuelo.slice(0, 16) : "",
      acompanante: v.acompanante ?? "",
      origen: v.origen ?? "",
      destino: v.destino ?? "",
      hc: v.hc ?? "",
      concepto_medico: v.concepto_medico ?? "",
      tiempo_estimado: v.tiempo_estimado ?? "",
      recomendaciones: v.recomendaciones ?? "",
      valoracion: v.valoracion ?? "",
      medico: v.medico ?? "",
      pasajero: v.pasajero ?? "",
      estado: v.estado ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: AssessmentFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarValoracion(editando.id, values) : await crearValoracion(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por documento, nombre, aerolínea o médico…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-sm"
        />
        {puedeEditar && <Button onClick={abrirNuevo}>Nueva valoración</Button>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Aerolínea</TableHead>
              <TableHead>Vuelo</TableHead>
              <TableHead>Valoración</TableHead>
              <TableHead>Médico</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 8 : 7} className="text-center text-muted-foreground">
                  Sin valoraciones registradas
                </TableCell>
              </TableRow>
            )}
            {filtradas.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{formatDateShort(v.created_at)}</TableCell>
                <TableCell className="font-medium">{v.cedula}</TableCell>
                <TableCell>{v.nombre_completo}</TableCell>
                <TableCell>{v.aerolinea ?? "—"}</TableCell>
                <TableCell>{v.fecha_hora_vuelo ? formatDateShort(v.fecha_hora_vuelo) : "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      (v.valoracion ?? "").toUpperCase().includes("NO")
                        ? "destructive"
                        : (v.valoracion ?? "").toUpperCase().includes("APTO")
                          ? "success"
                          : "outline"
                    }
                  >
                    {v.valoracion ?? "Sin concepto"}
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar valoración" : "Nueva valoración"}</DialogTitle>
            <DialogDescription>Concepto de aptitud médica para vuelo.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="cedula">Documento del paciente *</Label>
                <Input id="cedula" {...register("cedula")} />
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
            </div>

            <div className="space-y-1">
              <Label htmlFor="hc">Historia clínica (resumen)</Label>
              <Textarea id="hc" rows={2} {...register("hc")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="concepto_medico">Concepto médico</Label>
              <Textarea id="concepto_medico" rows={2} {...register("concepto_medico")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="recomendaciones">Recomendaciones</Label>
              <Textarea id="recomendaciones" rows={2} {...register("recomendaciones")} />
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
