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
import { SIN_FILTROS, filtrarEquipos, hayFiltros, valoresDistintos, type FiltrosEquipos } from "@/lib/equipos-filtros";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateShort } from "@/lib/utils";
import { DateField } from "@/components/forms/date-field";
import {
  biomedicalEquipmentSchema,
  biomedicalMaintenanceSchema,
  type BiomedicalEquipmentFormData,
  type BiomedicalMaintenanceFormData,
} from "@/lib/validations";
import {
  crearEquipoBiomedico,
  actualizarEquipoBiomedico,
  crearMantenimientoBiomedico,
  generarHojaVidaPdf,
} from "@/app/api/actions/inventario-biomedico";

export interface EquipoRow {
  id: number;
  placa_equipo: string;
  equipo: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  registro_invima: string | null;
  riesgo: string | null;
  ultimo_mantenimiento: string | null;
  proximo_mantenimiento: string | null;
  ultima_calibracion: string | null;
  proxima_calibracion: string | null;
  ubicacion_interna: string | null;
  aeropuerto: string | null;
  ciudad: string | null;
  area: string | null;
  [key: string]: unknown;
}

export interface MantenimientoBioRow {
  id: number;
  equipment_id: number;
  orden_numero: string | null;
  fecha_mantenimiento: string;
  tipo_mantenimiento: string | null;
  descripcion_falla: string | null;
  obs_apto: boolean;
  obs_averiado: boolean;
  realizo_nombre: string;
  reviso_nombre: string | null;
  observaciones: string | null;
  biomedical_equipment?: { placa_equipo: string; equipo: string } | null;
  [key: string]: unknown;
}

const CAMPOS_EQUIPO: { name: keyof BiomedicalEquipmentFormData; label: string; type?: string }[] = [
  { name: "marca", label: "Marca" },
  { name: "modelo", label: "Modelo" },
  { name: "serie", label: "Serie" },
  { name: "registro_invima", label: "Registro INVIMA" },
  { name: "riesgo", label: "Clasificación de riesgo" },
  { name: "ultimo_mantenimiento", label: "Último mantenimiento", type: "date" },
  { name: "proximo_mantenimiento", label: "Próximo mantenimiento", type: "date" },
  { name: "ultima_calibracion", label: "Última calibración", type: "date" },
  { name: "proxima_calibracion", label: "Próxima calibración", type: "date" },
  { name: "frec_mantenimiento", label: "Frecuencia mantenimiento" },
  { name: "frec_calibracion", label: "Frecuencia calibración" },
  { name: "ubicacion_interna", label: "Ubicación interna" },
  { name: "aeropuerto", label: "Aeropuerto" },
  { name: "departamento", label: "Departamento" },
  { name: "ciudad", label: "Ciudad" },
  { name: "adquisicion", label: "Forma de adquisición" },
  { name: "area", label: "Área" },
  { name: "voltaje", label: "Voltaje" },
  { name: "corriente", label: "Corriente" },
  { name: "potencia", label: "Potencia" },
  { name: "frecuencia", label: "Frecuencia" },
  { name: "humedad", label: "Humedad" },
  { name: "dimensiones", label: "Dimensiones" },
  { name: "peso", label: "Peso" },
  { name: "temperatura", label: "Temperatura" },
  { name: "fecha_compra", label: "Fecha de compra", type: "date" },
  { name: "proveedor_nombre", label: "Proveedor" },
  { name: "proveedor_contacto", label: "Contacto del proveedor" },
  { name: "operador", label: "Operador" },
];

interface EquiposTablaProps {
  equipos: EquipoRow[];
  mantenimientos: MantenimientoBioRow[];
  puedeEditar: boolean;
}

export function EquiposTabla({ equipos, mantenimientos, puedeEditar }: EquiposTablaProps) {
  const router = useRouter();
  const [filtros, setFiltros] = useState<FiltrosEquipos>(SIN_FILTROS);
  const [dialogEquipo, setDialogEquipo] = useState(false);
  const [dialogMantenimiento, setDialogMantenimiento] = useState(false);
  const [hojaDeVida, setHojaDeVida] = useState<EquipoRow | null>(null);
  const [editando, setEditando] = useState<EquipoRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const formEquipo = useForm<BiomedicalEquipmentFormData>({
    resolver: zodResolver(biomedicalEquipmentSchema),
  });
  const formMant = useForm<BiomedicalMaintenanceFormData>({
    resolver: zodResolver(biomedicalMaintenanceSchema),
  });

  const filtrados = useMemo(() => filtrarEquipos(equipos, filtros), [equipos, filtros]);
  const areas = useMemo(() => valoresDistintos(equipos, (e) => e.area), [equipos]);
  const tiposEquipo = useMemo(() => valoresDistintos(equipos, (e) => e.equipo), [equipos]);
  const aeropuertos = useMemo(() => valoresDistintos(equipos, (e) => e.aeropuerto), [equipos]);
  const cambiar = (parcial: Partial<FiltrosEquipos>) => setFiltros((f) => ({ ...f, ...parcial }));

  const historialEquipo = useMemo(() => {
    if (!hojaDeVida) return [];
    return mantenimientos.filter((m) => m.equipment_id === hojaDeVida.id);
  }, [mantenimientos, hojaDeVida]);

  const abrirNuevoEquipo = () => {
    setEditando(null);
    setError(null);
    formEquipo.reset({} as BiomedicalEquipmentFormData);
    setDialogEquipo(true);
  };

  const abrirEdicionEquipo = (e: EquipoRow) => {
    setEditando(e);
    setError(null);
    const valores: Record<string, unknown> = { placa_equipo: e.placa_equipo, equipo: e.equipo };
    for (const campo of CAMPOS_EQUIPO) valores[campo.name] = e[campo.name] ?? "";
    valores.observaciones = e.observaciones ?? "";
    formEquipo.reset(valores as BiomedicalEquipmentFormData);
    setDialogEquipo(true);
  };

  const abrirNuevoMantenimiento = (e: EquipoRow) => {
    setError(null);
    formMant.reset({
      equipment_id: e.id,
      fecha_mantenimiento: new Date().toISOString().slice(0, 10),
      obs_apto: true,
      obs_averiado: false,
      obs_reparacion: false,
      obs_baja: false,
      obs_partes: true,
    } as BiomedicalMaintenanceFormData);
    setDialogMantenimiento(true);
  };

  const onSubmitEquipo = async (values: BiomedicalEquipmentFormData) => {
    setGuardando(true);
    setError(null);
    const res = editando
      ? await actualizarEquipoBiomedico(editando.id, values)
      : await crearEquipoBiomedico(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogEquipo(false);
    router.refresh();
  };

  const onSubmitMantenimiento = async (values: BiomedicalMaintenanceFormData) => {
    setGuardando(true);
    setError(null);
    const res = await crearMantenimientoBiomedico(values);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogMantenimiento(false);
    router.refresh();
  };

  const handleDescargarPdf = async (equipmentId: number) => {
    setDescargandoPdf(true);
    const res = await generarHojaVidaPdf(equipmentId);
    setDescargandoPdf(false);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    if (!("data" in res) || !res.data) return;
    const bytes = Uint8Array.from(atob(res.data), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.filename ?? "hoja-vida.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const estadoMantenimiento = (e: EquipoRow) => {
    if (!e.proximo_mantenimiento) return <Badge variant="outline">Sin programar</Badge>;
    const hoy = new Date().toISOString().slice(0, 10);
    if (e.proximo_mantenimiento < hoy) return <Badge variant="destructive">Vencido</Badge>;
    const en30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    if (e.proximo_mantenimiento <= en30) return <Badge variant="default">Próximo</Badge>;
    return <Badge variant="success">Al día</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar por placa, equipo, marca, serie, área o ciudad…"
            value={filtros.buscar}
            onChange={(e) => cambiar({ buscar: e.target.value })}
            className="sm:w-72"
          />
          <select
            aria-label="Área"
            value={filtros.area}
            onChange={(e) => cambiar({ area: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Área: todas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <Input
            list="lista-tipos-equipo"
            placeholder="Tipo de equipo"
            aria-label="Tipo de equipo"
            value={filtros.equipo}
            onChange={(e) => cambiar({ equipo: e.target.value })}
            className="sm:w-48"
          />
          <datalist id="lista-tipos-equipo">
            {tiposEquipo.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <select
            aria-label="Sanidad (aeropuerto)"
            value={filtros.aeropuerto}
            onChange={(e) => cambiar({ aeropuerto: e.target.value })}
            className="h-10 max-w-[14rem] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sanidad: todas</option>
            {aeropuertos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          {hayFiltros(filtros) && (
            <Button type="button" variant="outline" size="sm" onClick={() => setFiltros(SIN_FILTROS)}>
              ✕ Limpiar
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {filtrados.length} de {equipos.length}
          </span>
        </div>
        {puedeEditar && <Button onClick={abrirNuevoEquipo}>Nuevo equipo</Button>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Próx. mantenimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin equipos registrados
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.placa_equipo}</TableCell>
                <TableCell>{e.equipo}</TableCell>
                <TableCell>{[e.marca, e.modelo].filter(Boolean).join(" / ") || "—"}</TableCell>
                <TableCell>{[e.area, e.ciudad].filter(Boolean).join(" · ") || "—"}</TableCell>
                <TableCell>
                  {e.proximo_mantenimiento ? formatDateShort(e.proximo_mantenimiento) : "—"}
                </TableCell>
                <TableCell>{estadoMantenimiento(e)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setHojaDeVida(e)}>
                      Hoja de vida
                    </Button>
                    {puedeEditar && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => abrirNuevoMantenimiento(e)}>
                          + Mantenimiento
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => abrirEdicionEquipo(e)}>
                          Editar
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hoja de vida — ficha + historial */}
      <Dialog open={Boolean(hojaDeVida)} onOpenChange={(open) => !open && setHojaDeVida(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <DialogTitle>
                Hoja de vida — {hojaDeVida?.equipo} ({hojaDeVida?.placa_equipo})
              </DialogTitle>
              <DialogDescription>Ficha técnica e historial de mantenimientos del equipo.</DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={descargandoPdf}
              onClick={() => hojaDeVida && handleDescargarPdf(hojaDeVida.id)}
            >
              {descargandoPdf ? "Generando…" : "Descargar PDF"}
            </Button>
          </DialogHeader>
          {hojaDeVida && (
            <Tabs defaultValue="ficha">
              <TabsList>
                <TabsTrigger value="ficha">Ficha técnica</TabsTrigger>
                <TabsTrigger value="historial">
                  Mantenimientos ({historialEquipo.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ficha">
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {[
                    ["Marca", hojaDeVida.marca],
                    ["Modelo", hojaDeVida.modelo],
                    ["Serie", hojaDeVida.serie],
                    ["Registro INVIMA", hojaDeVida.registro_invima],
                    ["Riesgo", hojaDeVida.riesgo],
                    ["Área", hojaDeVida.area],
                    ["Ubicación interna", hojaDeVida.ubicacion_interna],
                    ["Aeropuerto", hojaDeVida.aeropuerto],
                    ["Ciudad", hojaDeVida.ciudad],
                    ["Último mantenimiento", hojaDeVida.ultimo_mantenimiento],
                    ["Próximo mantenimiento", hojaDeVida.proximo_mantenimiento],
                    ["Última calibración", hojaDeVida.ultima_calibracion],
                    ["Próxima calibración", hojaDeVida.proxima_calibracion],
                    ["Voltaje", hojaDeVida.voltaje as string | null],
                    ["Dimensiones", hojaDeVida.dimensiones as string | null],
                    ["Peso", hojaDeVida.peso as string | null],
                    ["Proveedor", hojaDeVida.proveedor_nombre as string | null],
                    ["Operador", hojaDeVida.operador as string | null],
                  ].map(([label, valor]) => (
                    <div key={label as string}>
                      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                      <dd className="text-sm">{(valor as string) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
              <TabsContent value="historial">
                {historialEquipo.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Sin mantenimientos registrados para este equipo
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Realizó</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historialEquipo.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{formatDateShort(m.fecha_mantenimiento)}</TableCell>
                          <TableCell>{m.orden_numero ?? "—"}</TableCell>
                          <TableCell>{m.tipo_mantenimiento ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant={m.obs_averiado ? "destructive" : m.obs_apto ? "success" : "outline"}>
                              {m.obs_averiado ? "Averiado" : m.obs_apto ? "Apto" : "Revisar"}
                            </Badge>
                          </TableCell>
                          <TableCell>{m.realizo_nombre}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Alta / edición de equipo */}
      <Dialog open={dialogEquipo} onOpenChange={setDialogEquipo}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar equipo" : "Nuevo equipo biomédico"}</DialogTitle>
            <DialogDescription>La placa del equipo no puede repetirse en el inventario.</DialogDescription>
          </DialogHeader>
          <form onSubmit={formEquipo.handleSubmit(onSubmitEquipo)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="placa_equipo">Placa del equipo *</Label>
                <Input id="placa_equipo" {...formEquipo.register("placa_equipo")} disabled={Boolean(editando)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="equipo">Nombre del equipo *</Label>
                <Input id="equipo" {...formEquipo.register("equipo")} />
              </div>
              {CAMPOS_EQUIPO.map((campo) => (
                <div key={campo.name} className="space-y-1">
                  <Label htmlFor={campo.name}>{campo.label}</Label>
                  <Input id={campo.name} type={campo.type ?? "text"} {...formEquipo.register(campo.name)} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" rows={2} {...formEquipo.register("observaciones")} />
            </div>

            {(error || Object.values(formEquipo.formState.errors)[0]?.message) && (
              <p className="text-sm text-destructive">
                {error ?? String(Object.values(formEquipo.formState.errors)[0]?.message)}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogEquipo(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Registro de mantenimiento */}
      <Dialog open={dialogMantenimiento} onOpenChange={setDialogMantenimiento}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar mantenimiento biomédico</DialogTitle>
            <DialogDescription>
              Al guardar, la fecha de último mantenimiento del equipo se actualiza automáticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formMant.handleSubmit(onSubmitMantenimiento)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fecha_mantenimiento">Fecha *</Label>
                <DateField
                  id="fecha_mantenimiento"
                  value={formMant.watch("fecha_mantenimiento") ?? ""}
                  onChange={(v) => formMant.setValue("fecha_mantenimiento", v)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orden_numero">Número de orden</Label>
                <Input id="orden_numero" {...formMant.register("orden_numero")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tipo_mantenimiento">Tipo (preventivo/correctivo)</Label>
                <Input id="tipo_mantenimiento" {...formMant.register("tipo_mantenimiento")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="codigo_institucional">Código institucional</Label>
                <Input id="codigo_institucional" {...formMant.register("codigo_institucional")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input id="ubicacion" {...formMant.register("ubicacion")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sanidad">Sanidad</Label>
                <Input id="sanidad" {...formMant.register("sanidad")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="realizo_nombre">Realizó *</Label>
                <Input id="realizo_nombre" {...formMant.register("realizo_nombre")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="realizo_cargo">Cargo de quien realizó</Label>
                <Input id="realizo_cargo" {...formMant.register("realizo_cargo")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reviso_nombre">Revisó</Label>
                <Input id="reviso_nombre" {...formMant.register("reviso_nombre")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reviso_cargo">Cargo de quien revisó</Label>
                <Input id="reviso_cargo" {...formMant.register("reviso_cargo")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="repuesto">Repuesto</Label>
                <Input id="repuesto" {...formMant.register("repuesto")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="referencia_serial">Referencia / serial del repuesto</Label>
                <Input id="referencia_serial" {...formMant.register("referencia_serial")} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["obs_apto", "Apto"],
                  ["obs_averiado", "Averiado"],
                  ["obs_reparacion", "Requiere reparación"],
                  ["obs_baja", "Dar de baja"],
                  ["obs_partes", "Partes completas"],
                ] as const
              ).map(([name, label]) => (
                <label key={name} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(formMant.watch(name))}
                    onCheckedChange={(v) => formMant.setValue(name, v === true)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <Label htmlFor="descripcion_falla">Descripción de la falla</Label>
              <Textarea id="descripcion_falla" rows={2} {...formMant.register("descripcion_falla")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="observaciones_mant">Observaciones</Label>
              <Textarea id="observaciones_mant" rows={2} {...formMant.register("observaciones")} />
            </div>

            {(error || Object.values(formMant.formState.errors)[0]?.message) && (
              <p className="text-sm text-destructive">
                {error ?? String(Object.values(formMant.formState.errors)[0]?.message)}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogMantenimiento(false)}>
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
