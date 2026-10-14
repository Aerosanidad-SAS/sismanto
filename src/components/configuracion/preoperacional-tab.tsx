"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  eliminarGrupo,
  eliminarItem,
  getConfigPreoperacional,
  guardarGrupo,
  guardarItem,
  type GrupoConfig,
  type ItemConfig,
} from "@/app/api/actions/checklist-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aplicaDesdeTipos } from "@/lib/checklist-tipo";
import { cantidadEsperada } from "@/lib/inventario-preop";
import { tieneReglaPorNombre } from "@/lib/documentos-preop";

type Filtro = "todos" | "ambulancia" | "domiciliaria";

const SEVERIDADES: Array<[ItemConfig["severidad_falla"] & string, string]> = [
  ["CRITICA", "Crítica: si falla, el vehículo sale de servicio"],
  ["ALTA", "Alta: novedad urgente"],
  ["MEDIA", "Media"],
  ["BAJA", "Baja"],
];

interface FormItem {
  id?: number;
  descripcion: string;
  groupId: string;
  ambulancia: boolean;
  domiciliaria: boolean;
  /** Casillas con las que se abrió el diálogo, para saber si cambiaron. */
  aplicaOriginal?: string;
  nombreProtegido?: boolean;
  seCuenta: boolean;
  cantidad: string;
  /** Cantidad heredada no numérica («1 Par»): se conserva si no se convierte en un conteo. */
  cantidadHeredada?: string;
  esInventario: boolean;
  severidad: string;
  orden: string;
  activo: boolean;
}

const itemVacio = (groupId: number | null, orden: number): FormItem => ({
  descripcion: "",
  groupId: groupId ? String(groupId) : "",
  ambulancia: true,
  domiciliaria: true,
  seCuenta: false,
  cantidad: "1",
  esInventario: false,
  severidad: "MEDIA",
  orden: String(orden),
  activo: true,
});

function aForm(it: ItemConfig): FormItem {
  const a = aplicaDesdeTipos(it.tipos_vehiculo);
  const n = cantidadEsperada(it.cantidad_esperada);
  return {
    id: it.id,
    descripcion: it.descripcion,
    groupId: it.group_id ? String(it.group_id) : "",
    ambulancia: a.ambulancia,
    domiciliaria: a.domiciliaria,
    aplicaOriginal: `${a.ambulancia}|${a.domiciliaria}`,
    nombreProtegido: tieneReglaPorNombre(it.descripcion),
    seCuenta: n !== null,
    cantidad: String(n ?? 1),
    cantidadHeredada: n === null && it.cantidad_esperada && it.cantidad_esperada.toUpperCase() !== "OK" ? it.cantidad_esperada : undefined,
    esInventario: it.es_inventario ?? ["EQUIPO_BASICO", "EQUIPO_CARRETERA"].includes(it.categoria),
    severidad: it.severidad_falla ?? "MEDIA",
    orden: String(it.orden),
    activo: it.activo,
  };
}

/**
 * Configuración → Preoperacional (solo ADMIN): la lista maestra de ítems, agrupada. Se crean y reordenan grupos, se crean,
 * editan y eliminan ítems y se elige a qué vehículos aplica cada uno (ambulancia / medicina domiciliaria). Los cambios se ven en
 * el preoperacional del OVEM al recargar. Las respuestas posibles siguen siendo OK / Falla (las escalas editables son la fase siguiente).
 */
export function PreoperacionalTab() {
  const [grupos, setGrupos] = useState<GrupoConfig[]>([]);
  const [items, setItems] = useState<ItemConfig[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [verInactivos, setVerInactivos] = useState(false);
  const [formItem, setFormItem] = useState<FormItem | null>(null);
  const [formGrupo, setFormGrupo] = useState<{ id?: number; nombre: string; orden: string; activo: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const cargar = useCallback(async () => {
    const r = await getConfigPreoperacional();
    if ("error" in r) setError(r.error);
    else {
      setError(null);
      setGrupos(r.grupos);
      setItems(r.items);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const visibles = useMemo(
    () =>
      items.filter((it) => {
        if (!verInactivos && !it.activo) return false;
        if (filtro === "todos") return true;
        const a = aplicaDesdeTipos(it.tipos_vehiculo);
        return filtro === "ambulancia" ? a.ambulancia : a.domiciliaria;
      }),
    [items, filtro, verInactivos]
  );
  const sinGrupo = visibles.filter((it) => !grupos.some((g) => g.id === it.group_id));

  const abrirItem = (f: FormItem) => {
    setError(null);
    setAviso(null);
    setFormItem(f);
  };
  const abrirGrupo = (g: { id?: number; nombre: string; orden: string; activo: boolean }) => {
    setError(null);
    setAviso(null);
    setFormGrupo(g);
  };
  const cerrar = () => {
    setError(null);
    setFormItem(null);
    setFormGrupo(null);
  };

  /** Ejecuta una acción; al terminar bien cierra SOLO el diálogo que la lanzó. */
  const correr = (
    accion: () => Promise<{ error?: string; desactivado?: boolean } | { success: true; desactivado?: boolean }>,
    ok: string | ((r: any) => string),
    cierra: "item" | "grupo"
  ) => {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const r = (await accion()) as { error?: string; desactivado?: boolean };
      if (r.error) {
        setError(r.error);
        return;
      }
      setAviso(typeof ok === "function" ? ok(r) : ok);
      if (cierra === "item") setFormItem(null);
      else setFormGrupo(null);
      await cargar();
    });
  };

  const guardarFormItem = () => {
    if (!formItem) return;
    const cantidad = formItem.seCuenta ? Number(formItem.cantidad) : null;
    if (formItem.seCuenta && (!Number.isInteger(cantidad) || (cantidad ?? 0) < 1)) {
      setError("La cantidad debe ser un número entero de 1 en adelante.");
      return;
    }
    correr(
      () =>
        guardarItem({
          id: formItem.id,
          descripcion: formItem.descripcion,
          groupId: Number(formItem.groupId),
          ambulancia: formItem.ambulancia,
          domiciliaria: formItem.domiciliaria,
          cambiaTipos: formItem.aplicaOriginal !== `${formItem.ambulancia}|${formItem.domiciliaria}`,
          cantidad,
          conservarCantidad: formItem.cantidadHeredada,
          esInventario: formItem.seCuenta ? formItem.esInventario : null,
          severidad: formItem.severidad as "CRITICA" | "ALTA" | "MEDIA" | "BAJA",
          orden: Number(formItem.orden) || 0,
          activo: formItem.activo,
        }),
      "Ítem guardado.",
      "item"
    );
  };

  const etiquetas = (it: ItemConfig) => {
    const a = aplicaDesdeTipos(it.tipos_vehiculo);
    const n = cantidadEsperada(it.cantidad_esperada);
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {a.ambulancia && a.domiciliaria ? (
          <Badge variant="secondary">Todos</Badge>
        ) : (
          <Badge variant="secondary">{a.ambulancia ? "Ambulancia" : "Medicina domiciliaria"}</Badge>
        )}
        {n !== null && <Badge variant="outline">Se cuenta: {n}</Badge>}
        {n !== null && (it.es_inventario ?? ["EQUIPO_BASICO", "EQUIPO_CARRETERA"].includes(it.categoria)) && <Badge variant="outline">Inventario</Badge>}
        {it.severidad_falla === "CRITICA" && <Badge variant="destructive">Crítico</Badge>}
        {!it.activo && <Badge variant="secondary">Inactivo</Badge>}
      </div>
    );
  };

  if (cargando) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista maestra del preoperacional</CardTitle>
          <CardDescription>
            Crea grupos («Cabina conducción», «Habitáculo paciente»…), agrega o elimina ítems y elige a qué vehículos aplica cada uno. Lo
            que cambies aparece en el preoperacional del OVEM al recargar. Un ítem con historial se desactiva en vez de borrarse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
              <SelectTrigger className="min-h-11 w-64" aria-label="Filtrar por tipo de vehículo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los vehículos</SelectItem>
                <SelectItem value="ambulancia">Aplican a ambulancia</SelectItem>
                <SelectItem value="domiciliaria">Aplican a medicina domiciliaria</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <Checkbox checked={verInactivos} onCheckedChange={setVerInactivos} />
              Ver inactivos
            </label>
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => abrirGrupo({ nombre: "", orden: String((grupos.at(-1)?.orden ?? 0) + 10), activo: true })}>
                Nuevo grupo
              </Button>
              <Button
                type="button"
                className="min-h-11"
                onClick={() => abrirItem(itemVacio(grupos.find((g) => g.activo)?.id ?? null, (items.at(-1)?.orden ?? 0) + 10))}
              >
                Nuevo ítem
              </Button>
            </div>
          </div>
          {error && !formItem && !formGrupo && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {aviso && (
            <p role="status" className="rounded-md border border-success bg-success-soft p-3 text-sm text-foreground">
              {aviso}
            </p>
          )}
        </CardContent>
      </Card>

      {[...grupos.map((g) => ({ g, lista: visibles.filter((it) => it.group_id === g.id) })), ...(sinGrupo.length ? [{ g: null, lista: sinGrupo }] : [])].map(
        ({ g, lista }) => (
          <Card key={g?.id ?? "sin-grupo"}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">
                  {g?.nombre ?? "Sin grupo"} {g && !g.activo && <Badge variant="secondary">Inactivo</Badge>}
                </CardTitle>
                <CardDescription>{lista.length} ítem{lista.length === 1 ? "" : "s"}</CardDescription>
              </div>
              {g && (
                <Button type="button" variant="outline" size="sm" onClick={() => abrirGrupo({ id: g.id, nombre: g.nombre, orden: String(g.orden), activo: g.activo })}>
                  Editar grupo
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {lista.length === 0 && <p className="text-sm text-muted-foreground">Sin ítems con este filtro.</p>}
              {lista.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3 border-b py-2 last:border-b-0">
                  <div className="min-w-0">
                    <p className={it.activo ? "text-sm font-medium" : "text-sm font-medium text-muted-foreground"}>{it.descripcion}</p>
                    {etiquetas(it)}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => abrirItem(aForm(it))}>
                    Editar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      )}

      {/* ─── Ítem ─── */}
      <Dialog open={formItem !== null} onOpenChange={(o) => !o && cerrar()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{formItem?.id ? "Editar ítem" : "Nuevo ítem"}</DialogTitle>
            <DialogDescription>Las respuestas posibles de todos los ítems son OK / Falla; el ítem puede contarse (ej. 2 luces).</DialogDescription>
          </DialogHeader>
          {formItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pi-nombre">Nombre</Label>
                <Input id="pi-nombre" className="mt-1" value={formItem.descripcion} disabled={formItem.nombreProtegido} onChange={(e) => setFormItem({ ...formItem, descripcion: e.target.value })} />
                {formItem.nombreProtegido && <p className="mt-1 text-xs text-muted-foreground">Este ítem tiene una regla ligada a su nombre en el portal del OVEM: no se renombra.</p>}
              </div>
              <div>
                <Label>Grupo</Label>
                <Select value={formItem.groupId} onValueChange={(v) => setFormItem({ ...formItem, groupId: v })}>
                  <SelectTrigger className="mt-1 min-h-11">
                    <SelectValue placeholder="Elige un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.nombre}
                        {g.activo ? "" : " (inactivo)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Aplica a</legend>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox checked={formItem.ambulancia} onCheckedChange={(v) => setFormItem({ ...formItem, ambulancia: v })} />
                  Ambulancia
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox checked={formItem.domiciliaria} onCheckedChange={(v) => setFormItem({ ...formItem, domiciliaria: v })} />
                  Medicina domiciliaria (DOMI, VAN, ADMIN)
                </label>
              </fieldset>
              <div className="space-y-2">
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox checked={formItem.seCuenta} onCheckedChange={(v) => setFormItem({ ...formItem, seCuenta: v })} />
                  Se cuenta (hay varias unidades: luces, extintores, chalecos…)
                </label>
                {formItem.seCuenta && (
                  <div className="space-y-2 pl-7">
                    <div>
                      <Label htmlFor="pi-cant">Cantidad esperada</Label>
                      <Input id="pi-cant" inputMode="numeric" className="mt-1 w-24" value={formItem.cantidad} onChange={(e) => setFormItem({ ...formItem, cantidad: e.target.value })} />
                    </div>
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <Checkbox checked={formItem.esInventario} onCheckedChange={(v) => setFormItem({ ...formItem, esInventario: v })} />
                      Es inventario: si falta una unidad es un faltante, no una falla
                    </label>
                  </div>
                )}
              </div>
              <div>
                <Label>Si falla</Label>
                <Select value={formItem.severidad} onValueChange={(v) => setFormItem({ ...formItem, severidad: v })}>
                  <SelectTrigger className="mt-1 min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERIDADES.map(([v, t]) => (
                      <SelectItem key={v} value={v}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <Label htmlFor="pi-orden">Orden</Label>
                  <Input id="pi-orden" inputMode="numeric" className="mt-1 w-24" value={formItem.orden} onChange={(e) => setFormItem({ ...formItem, orden: e.target.value })} />
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox checked={formItem.activo} onCheckedChange={(v) => setFormItem({ ...formItem, activo: v })} />
                  Activo
                </label>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                {formItem.id ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm("¿Eliminar este ítem? Si ya se respondió en algún preoperacional se desactiva en vez de borrarse.")) return;
                      correr(() => eliminarItem(formItem.id!), (r) => (r.desactivado ? "El ítem quedó desactivado (tiene historial)." : "Ítem eliminado."), "item");
                    }}
                  >
                    Eliminar
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="min-h-11" onClick={cerrar}>
                    Cancelar
                  </Button>
                  <Button type="button" className="min-h-11" disabled={pending} onClick={guardarFormItem}>
                    {pending ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Grupo ─── */}
      <Dialog open={formGrupo !== null} onOpenChange={(o) => !o && cerrar()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{formGrupo?.id ? "Editar grupo" : "Nuevo grupo"}</DialogTitle>
            <DialogDescription>El orden decide en qué lugar aparece el grupo en el preoperacional (menor primero).</DialogDescription>
          </DialogHeader>
          {formGrupo && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pg-nombre">Nombre</Label>
                <Input id="pg-nombre" className="mt-1" value={formGrupo.nombre} onChange={(e) => setFormGrupo({ ...formGrupo, nombre: e.target.value })} />
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <Label htmlFor="pg-orden">Orden</Label>
                  <Input id="pg-orden" inputMode="numeric" className="mt-1 w-24" value={formGrupo.orden} onChange={(e) => setFormGrupo({ ...formGrupo, orden: e.target.value })} />
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox checked={formGrupo.activo} onCheckedChange={(v) => setFormGrupo({ ...formGrupo, activo: v })} />
                  Activo (si lo desactivas, sus ítems no se muestran)
                </label>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                {formGrupo.id ? (
                  <Button type="button" variant="destructive" className="min-h-11" disabled={pending} onClick={() => correr(() => eliminarGrupo(formGrupo.id!), "Grupo eliminado.", "grupo")}>
                    Eliminar grupo
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="min-h-11" onClick={cerrar}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => correr(() => guardarGrupo({ id: formGrupo.id, nombre: formGrupo.nombre, orden: Number(formGrupo.orden) || 0, activo: formGrupo.activo }), "Grupo guardado.", "grupo")}
                  >
                    {pending ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
