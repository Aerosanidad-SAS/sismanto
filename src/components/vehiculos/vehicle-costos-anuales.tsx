"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  actualizarCostoAnual,
  eliminarCostoAnual,
  registrarCostoAnual,
} from "@/app/api/actions/costos-anuales";
import { DateField } from "@/components/forms/date-field";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ETIQUETA_TIPO_COSTO,
  finDeVigenciaAnual,
  TIPOS_COSTO_ANUAL,
  type CostoAnualFila,
  type TipoCostoAnual,
} from "@/lib/costos-anuales";
import { esDia, hoyBogota } from "@/lib/fechas";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface Props {
  vehicleId: string;
  filas: CostoAnualFila[];
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

type Formulario = {
  tipo: TipoCostoAnual;
  desde: string;
  hasta: string;
  valor: string;
  fechaPago: string;
  proveedor: string;
  numeroDocumento: string;
  notas: string;
};

const VACIO: Formulario = { tipo: "SOAT", desde: "", hasta: "", valor: "", fechaPago: "", proveedor: "", numeroDocumento: "", notas: "" };

/** Deja solo dígitos y los muestra con separador de miles (1234567 pasa a 1.234.567). */
function conMiles(texto: string): string {
  const digitos = texto.replace(/\D/g, "");
  return digitos ? Number(digitos).toLocaleString("es-CO") : "";
}

export function VehicleCostosAnuales({ vehicleId, filas, puedeEditar, puedeEliminar }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editando, setEditando] = useState<CostoAnualFila | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState<Formulario>(VACIO);
  const [finManual, setFinManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<CostoAnualFila | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const estimados = filas.filter((f) => f.estimado).length;

  const abrirNuevo = () => {
    setEditando(null);
    const hoy = hoyBogota();
    setForm({ ...VACIO, desde: hoy, hasta: finDeVigenciaAnual(hoy) });
    setFinManual(false);
    setError(null);
    setAbierto(true);
  };

  const abrirEdicion = (f: CostoAnualFila) => {
    setEditando(f);
    setForm({
      tipo: f.tipo,
      desde: f.vigencia_desde,
      hasta: f.vigencia_hasta,
      valor: conMiles(String(Math.round(f.valor))),
      fechaPago: f.fecha_pago ?? "",
      proveedor: f.proveedor ?? "",
      numeroDocumento: f.numero_documento ?? "",
      notas: f.notas ?? "",
    });
    setFinManual(true);
    setError(null);
    setAbierto(true);
  };

  const cambiarInicio = (desde: string) =>
    setForm((prev) => ({ ...prev, desde, hasta: !finManual && esDia(desde) ? finDeVigenciaAnual(desde) : prev.hasta }));

  const guardar = () => {
    setError(null);
    if (!form.valor.trim()) return setError("Escribe el valor.");
    const entrada = {
      tipo: form.tipo,
      vigenciaDesde: form.desde,
      vigenciaHasta: form.hasta,
      valor: Number(form.valor.replace(/\D/g, "")),
      fechaPago: form.fechaPago,
      proveedor: form.proveedor,
      numeroDocumento: form.numeroDocumento,
      notas: form.notas,
    };
    startTransition(async () => {
      const res = editando ? await actualizarCostoAnual(vehicleId, editando.id, entrada) : await registrarCostoAnual(vehicleId, entrada);
      if ("error" in res && res.error) return setError(res.error);
      setAbierto(false);
      router.refresh();
    });
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;
    setErrorEliminar(null);
    startTransition(async () => {
      const res = await eliminarCostoAnual(vehicleId, aEliminar.id);
      if ("error" in res && res.error) return setErrorEliminar(res.error);
      setAEliminar(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {filas.length === 0
            ? "Aún no hay costos anuales registrados para este vehículo."
            : estimados > 0
              ? `${estimados} de ${filas.length} registros son estimados: se calcularon con el valor anual antiguo. Registra el pago real y reemplaza el estimado de esas fechas.`
              : "Todos los registros son valores reales."}
        </p>
        {puedeEditar && (
          <Button type="button" size="sm" className="gap-2 shrink-0" onClick={abrirNuevo}>
            <Plus className="h-4 w-4" />
            Registrar costo
          </Button>
        )}
      </div>

      {filas.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>N.º documento</TableHead>
                <TableHead>Origen</TableHead>
                {puedeEditar && <TableHead className="w-24" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="whitespace-nowrap font-medium">{ETIQUETA_TIPO_COSTO[f.tipo]}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateShort(f.vigencia_desde)} – {formatDateShort(f.vigencia_hasta)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums">{formatCurrency(f.valor)}</TableCell>
                  <TableCell className="whitespace-nowrap">{f.fecha_pago ? formatDateShort(f.fecha_pago) : "—"}</TableCell>
                  <TableCell>{f.proveedor ?? "—"}</TableCell>
                  <TableCell>{f.numero_documento ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={f.estimado ? "warning" : "success"}>{f.estimado ? "Estimado" : "Real"}</Badge>
                  </TableCell>
                  {puedeEditar && (
                    <TableCell className="whitespace-nowrap text-right">
                      <Button type="button" variant="ghost" size="icon" aria-label="Editar" onClick={() => abrirEdicion(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {puedeEliminar && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Eliminar"
                          onClick={() => {
                            setErrorEliminar(null);
                            setAEliminar(f);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar costo anual" : "Registrar costo anual"}</DialogTitle>
            <DialogDescription>
              {editando?.estimado
                ? "Este valor es un estimado; al guardarlo quedará como real."
                : "El valor se reparte por día dentro de la vigencia. Un estimado que se solape se recorta solo."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="costo-tipo">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TipoCostoAnual }))}>
                <SelectTrigger id="costo-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_COSTO_ANUAL.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ETIQUETA_TIPO_COSTO[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="costo-desde">Vigencia desde</Label>
                <DateField id="costo-desde" value={form.desde} onChange={cambiarInicio} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costo-hasta">Vigencia hasta</Label>
                <DateField
                  id="costo-hasta"
                  value={form.hasta}
                  min={form.desde || undefined}
                  onChange={(hasta) => {
                    setFinManual(true);
                    setForm((p) => ({ ...p, hasta }));
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="costo-valor">Valor pagado (COP)</Label>
                <Input
                  id="costo-valor"
                  inputMode="numeric"
                  placeholder="1.500.000"
                  value={form.valor}
                  onChange={(e) => setForm((p) => ({ ...p, valor: conMiles(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costo-pago">Fecha de pago (opcional)</Label>
                <DateField id="costo-pago" value={form.fechaPago} onChange={(fechaPago) => setForm((p) => ({ ...p, fechaPago }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="costo-proveedor">Aseguradora / proveedor</Label>
                <Input id="costo-proveedor" maxLength={150} value={form.proveedor} onChange={(e) => setForm((p) => ({ ...p, proveedor: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costo-numero">N.º de póliza o documento</Label>
                <Input id="costo-numero" maxLength={80} value={form.numeroDocumento} onChange={(e) => setForm((p) => ({ ...p, numeroDocumento: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="costo-notas">Notas (opcional)</Label>
              <Textarea id="costo-notas" maxLength={500} rows={2} value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="button" onClick={guardar} disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={aEliminar !== null} onOpenChange={(o) => !o && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {aEliminar ? `${ETIQUETA_TIPO_COSTO[aEliminar.tipo]} · ${formatDateShort(aEliminar.vigencia_desde)} – ${formatDateShort(aEliminar.vigencia_hasta)} · ${formatCurrency(aEliminar.valor)}. ` : ""}
              Dejará de contarse en los costos de esas fechas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorEliminar && (
            <p role="alert" className="text-sm text-destructive">
              {errorEliminar}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                confirmarEliminar();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
