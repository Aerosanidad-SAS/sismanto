"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
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
import { SignaturePad } from "@/components/formatos-ti/signature-pad";
import { EquipoBuscador } from "@/components/formatos-ti/equipo-buscador";
import { celdaExcelSegura } from "@/lib/servicios-lista";
import { OPCIONES_CHEQUEO, etiquetaChequeo, fechaCorta, type EstadoFirma } from "@/lib/formatos-ti/comun";
import {
  CHECKLIST_ACTA_ENTREGA,
  TIPOS_ACTA_ENTREGA,
  type ActaEntregaEntrada,
  type LadoActaEntrega,
  type TipoActaEntrega,
} from "@/lib/formatos-ti/acta-entrega";
import {
  actualizarActaEntrega,
  crearActaEntrega,
  eliminarActaEntrega,
  exportarActasEntrega,
  generarActaEntregaPdf,
  urlFirmaActaEntrega,
  type ActaEntregaLista,
  type FirmasActaEntrega,
} from "@/app/api/actions/formatos-ti-acta-entrega";

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const vacio = (): ActaEntregaEntrada => ({
  tipo_equipo: "GENERAL",
  func_nombre: "", func_cedula: "", func_cargo: "", func_sede: "", func_correo: "",
  equipo_referencia: "", equipo_marca: "", equipo_modelo: "", equipo_placa: "",
  equipo_imei: "", equipo_sim: "", equipo_activo: "", equipo_tarjeta_sd: "", equipo_operador: "",
  checklist: {},
  lugar_entrega: "", entrega_nombre: "", recibe_nombre: "", observaciones: "",
  fecha_devolucion: "", lugar_devolucion: "", devolucion_entrega_nombre: "", devolucion_recibe_nombre: "",
});

function InsigniaFirma({ estado }: { estado: EstadoFirma }) {
  if (estado === "ok") return <Badge variant="success">Firmada</Badge>;
  if (estado === "modificada") return <Badge variant="destructive">Modificada</Badge>;
  return <Badge variant="outline">Sin firma</Badge>;
}

export interface ActaEntregaTablaProps {
  actas: ActaEntregaLista[];
  sedes: string[];
  filtros: { q: string; tipo: string; sede: string };
}

export function ActaEntregaTabla({ actas, sedes, filtros }: ActaEntregaTablaProps) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<ActaEntregaLista | null>(null);
  const [datos, setDatos] = useState<ActaEntregaEntrada>(vacio());
  const [firmas, setFirmas] = useState<FirmasActaEntrega>({});
  const [existentes, setExistentes] = useState<Partial<Record<LadoActaEntrega, string | null>>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const celular = datos.tipo_equipo === "CELULAR";
  const catalogo = CHECKLIST_ACTA_ENTREGA[datos.tipo_equipo as TipoActaEntrega] ?? CHECKLIST_ACTA_ENTREGA.GENERAL;
  const set = <K extends keyof ActaEntregaEntrada>(k: K, v: ActaEntregaEntrada[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const texto = (k: keyof ActaEntregaEntrada) => (datos[k] as string | null | undefined) ?? "";
  const campo = (k: keyof ActaEntregaEntrada, label: string, obligatorio = false) => (
    <div className="space-y-1">
      <Label htmlFor={`f-${k}`}>
        {label}
        {obligatorio && " *"}
      </Label>
      <Input id={`f-${k}`} value={texto(k)} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );

  const abrirNuevo = () => {
    setEditando(null);
    setDatos(vacio());
    setFirmas({});
    setExistentes({});
    setError(null);
    setAbierto(true);
  };

  const abrirEdicion = async (a: ActaEntregaLista) => {
    setEditando(a);
    setDatos({
      tipo_equipo: a.tipo_equipo,
      func_nombre: a.func_nombre, func_cedula: a.func_cedula, func_cargo: a.func_cargo, func_sede: a.func_sede, func_correo: a.func_correo,
      equipo_referencia: a.equipo_referencia, equipo_marca: a.equipo_marca, equipo_modelo: a.equipo_modelo, equipo_placa: a.equipo_placa,
      equipo_imei: a.equipo_imei, equipo_sim: a.equipo_sim, equipo_activo: a.equipo_activo,
      equipo_tarjeta_sd: a.equipo_tarjeta_sd, equipo_operador: a.equipo_operador,
      checklist: (a.checklist ?? {}) as ActaEntregaEntrada["checklist"],
      lugar_entrega: a.lugar_entrega, entrega_nombre: a.entrega_nombre, recibe_nombre: a.recibe_nombre,
      observaciones: a.observaciones,
      fecha_devolucion: a.fecha_devolucion ?? "", lugar_devolucion: a.lugar_devolucion ?? "",
      devolucion_entrega_nombre: a.devolucion_entrega_nombre ?? "", devolucion_recibe_nombre: a.devolucion_recibe_nombre ?? "",
    });
    setFirmas({});
    setExistentes({});
    setError(null);
    setAbierto(true);
    // Las firmas guardadas se ven con URL firmada temporal (el bucket es privado).
    const lados: LadoActaEntrega[] = ["entrega", "recibe", "devolucion_entrega", "devolucion_recibe"];
    const urls = await Promise.all(lados.map((l) => (a.estadoFirmas[l] === "sin_firma" ? null : urlFirmaActaEntrega(a.id, l))));
    setExistentes(Object.fromEntries(lados.map((l, i) => [l, urls[i]])));
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarActaEntrega(editando.id, datos, firmas) : await crearActaEntrega(datos, firmas);
    setGuardando(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("avisos" in res && res.avisos && res.avisos.length > 0) setAviso(res.avisos.join(" · "));
    setAbierto(false);
    router.refresh();
  };

  const eliminar = async (a: ActaEntregaLista) => {
    if (!confirm(`¿Eliminar el acta ${a.numero_orden} de ${a.func_nombre}? Se borra también su firma y no se puede deshacer.`)) return;
    const res = await eliminarActaEntrega(a.id);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  const descargarPdf = async (a: ActaEntregaLista) => {
    setDescargandoId(a.id);
    const res = await generarActaEntregaPdf(a.id);
    setDescargandoId(null);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    if (!("data" in res) || !res.data) return;
    const bytes = Uint8Array.from(atob(res.data), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = res.filename ?? "acta-entrega.pdf";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const exportar = async () => {
    setExportando(true);
    setAviso(null);
    const res = await exportarActasEntrega(filtros);
    if ("error" in res && res.error) {
      setAviso(res.error);
      setExportando(false);
      return;
    }
    const filas = res.filas ?? [];
    const XLSX = await import("xlsx");
    const columnas: [string, (f: (typeof filas)[number]) => unknown][] = [
      ["N° ORDEN", (f) => f.numero_orden], ["TIPO", (f) => f.tipo_equipo], ["FUNCIONARIO", (f) => f.func_nombre],
      ["CÉDULA", (f) => f.func_cedula], ["CARGO", (f) => f.func_cargo], ["SEDE", (f) => f.func_sede],
      ["CORREO", (f) => f.func_correo], ["REFERENCIA", (f) => f.equipo_referencia], ["MARCA", (f) => f.equipo_marca],
      ["MODELO", (f) => f.equipo_modelo], ["PLACA", (f) => f.equipo_placa], ["IMEI", (f) => f.equipo_imei],
      ["SIM", (f) => f.equipo_sim], ["N° ACTIVO", (f) => f.equipo_activo], ["TARJETA SD", (f) => f.equipo_tarjeta_sd],
      ["OPERADOR", (f) => f.equipo_operador], ["FECHA ENTREGA", (f) => f.fecha_entrega], ["LUGAR ENTREGA", (f) => f.lugar_entrega],
      ["ENTREGA", (f) => f.entrega_nombre], ["RECIBE", (f) => f.recibe_nombre], ["FECHA DEVOLUCIÓN", (f) => f.fecha_devolucion],
      ["LUGAR DEVOLUCIÓN", (f) => f.lugar_devolucion], ["OBSERVACIONES", (f) => f.observaciones],
    ];
    const hoja = XLSX.utils.aoa_to_sheet([
      columnas.map(([t]) => t),
      ...filas.map((f) => columnas.map(([, g]) => celdaExcelSegura(g(f)))),
    ]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Actas de entrega");
    const sello = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" }).replace(/[: ]/g, "-");
    XLSX.writeFile(libro, `actas_entrega_${sello}.xlsx`);
    if (res.truncado) setAviso("Se exportaron solo las primeras 5.000 filas. Aplica filtros para exportar el resto.");
    setExportando(false);
  };

  const cambiarChequeo = (clave: string, valor: string) =>
    setDatos((d) => {
      const c = { ...(d.checklist ?? {}) } as Record<string, string>;
      if (valor) c[clave] = valor;
      else delete c[clave];
      return { ...d, checklist: c as ActaEntregaEntrada["checklist"] };
    });

  const estadoDevolucion = (a: ActaEntregaLista) => {
    if (a.tipo_equipo !== "CELULAR") return <span className="text-muted-foreground">—</span>;
    return a.fecha_devolucion ? <Badge variant="success">Devuelto {fechaCorta(a.fecha_devolucion)}</Badge> : <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input name="q" defaultValue={filtros.q} placeholder="Funcionario, cédula, placa, N° orden" className="sm:w-64" />
          <select name="tipo" defaultValue={filtros.tipo} className={`${CLASE_SELECT} sm:w-40`} aria-label="Tipo de equipo">
            <option value="">Todos los tipos</option>
            {TIPOS_ACTA_ENTREGA.map((t) => (
              <option key={t} value={t}>
                {t === "CELULAR" ? "Celular" : "General"}
              </option>
            ))}
          </select>
          <select name="sede" defaultValue={filtros.sede} className={`${CLASE_SELECT} sm:w-44`} aria-label="Sede">
            <option value="">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {(filtros.q || filtros.tipo || filtros.sede) && (
            <Button asChild variant="ghost">
              <Link href="/formatos-ti/acta-entrega">Limpiar</Link>
            </Button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportar} disabled={exportando} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {exportando ? "Exportando…" : "Exportar Excel"}
          </Button>
          <Button onClick={abrirNuevo}>Nueva acta</Button>
        </div>
      </div>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° orden</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Funcionario</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Firma entrega</TableHead>
              <TableHead>Firma recibe</TableHead>
              <TableHead>Devolución</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actas.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground">
                  No hay actas de entrega{filtros.q || filtros.tipo || filtros.sede ? " para esos filtros" : " todavía"}.
                </TableCell>
              </TableRow>
            )}
            {actas.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.numero_orden}</TableCell>
                <TableCell>{a.tipo_equipo === "CELULAR" ? "Celular" : "General"}</TableCell>
                <TableCell>{a.func_nombre}</TableCell>
                <TableCell>{a.func_cedula}</TableCell>
                <TableCell>{a.func_sede || "—"}</TableCell>
                <TableCell>{a.equipo_marca || "—"}</TableCell>
                <TableCell>{a.equipo_placa}</TableCell>
                <TableCell>{fechaCorta(a.fecha_entrega)}</TableCell>
                <TableCell>
                  <InsigniaFirma estado={a.estadoFirmas.entrega} />
                </TableCell>
                <TableCell>
                  <InsigniaFirma estado={a.estadoFirmas.recibe} />
                </TableCell>
                <TableCell>{estadoDevolucion(a)}</TableCell>
                <TableCell className="space-x-2 whitespace-nowrap text-right">
                  <Button variant="outline" size="sm" onClick={() => descargarPdf(a)} disabled={descargandoId === a.id}>
                    {descargandoId === a.id ? "Generando…" : "PDF"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => abrirEdicion(a)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => eliminar(a)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar acta ${editando.numero_orden}` : "Nueva acta de entrega"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "La fecha de entrega no cambia. Si editas un dato después de firmar, la firma queda marcada como Modificada; vuelve a firmar para actualizarla."
                : "El N° de orden se asigna al guardar y la fecha de entrega es la de hoy."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardar} className="space-y-5">
            <EquipoBuscador
              onElegir={(e) => {
                set("equipo_referencia", e.equipo);
                set("equipo_marca", e.marca ?? "");
                set("equipo_modelo", e.modelo ?? "");
                set("equipo_placa", e.placa_equipo);
                if (!datos.func_sede) set("func_sede", e.ciudad ?? "");
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="f-tipo_equipo">Tipo de equipo *</Label>
              <select
                id="f-tipo_equipo"
                className={CLASE_SELECT}
                value={datos.tipo_equipo}
                onChange={(e) => {
                  set("tipo_equipo", e.target.value as TipoActaEntrega);
                  set("checklist", {});
                }}
              >
                <option value="GENERAL">General (G-TECN-F 031)</option>
                <option value="CELULAR">Celular (G-TECN-F 028)</option>
              </select>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Funcionario responsable</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("func_nombre", "Nombre", true)}
                {campo("func_cedula", "Cédula", true)}
                {campo("func_cargo", "Cargo")}
                {campo("func_sede", "Sede")}
                {campo("func_correo", "Correo electrónico")}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Equipo</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("equipo_referencia", "Referencia")}
                {campo("equipo_marca", "Marca")}
                {campo("equipo_modelo", "Modelo")}
                {campo("equipo_placa", "Placa", true)}
                {celular && (
                  <>
                    {campo("equipo_imei", "IMEI")}
                    {campo("equipo_sim", "N° SIM")}
                    {campo("equipo_activo", "N° Activo")}
                    {campo("equipo_tarjeta_sd", "Tarjeta SD")}
                    {campo("equipo_operador", "Operador")}
                  </>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Pruebas de funcionalidad</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(catalogo).map(([clave, etiqueta]) => (
                  <div key={clave} className="flex items-center justify-between gap-2 rounded border p-2">
                    <Label htmlFor={`chk-${clave}`} className="text-sm font-normal">
                      {etiqueta}
                    </Label>
                    <select
                      id={`chk-${clave}`}
                      className={`${CLASE_SELECT} w-28`}
                      value={(datos.checklist as Record<string, string> | undefined)?.[clave] ?? ""}
                      onChange={(e) => cambiarChequeo(clave, e.target.value)}
                    >
                      <option value="">—</option>
                      {OPCIONES_CHEQUEO.map((o) => (
                        <option key={o} value={o}>
                          {etiquetaChequeo(o)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Registro de entrega</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("lugar_entrega", "Lugar de entrega")}
                {campo("entrega_nombre", "Quien entrega", true)}
                {campo("recibe_nombre", "Quien recibe", true)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SignaturePad etiqueta="Firma de quien entrega" existente={existentes.entrega} onChange={(v) => setFirmas((f) => ({ ...f, entrega: v }))} />
                <SignaturePad etiqueta="Firma de quien recibe" existente={existentes.recibe} onChange={(v) => setFirmas((f) => ({ ...f, recibe: v }))} />
              </div>
            </fieldset>

            {celular && editando && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">Registro de devolución (solo celulares)</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="f-fecha_devolucion">Fecha de devolución</Label>
                    <Input id="f-fecha_devolucion" type="date" value={texto("fecha_devolucion")} onChange={(e) => set("fecha_devolucion", e.target.value)} />
                  </div>
                  {campo("lugar_devolucion", "Lugar de devolución")}
                  {campo("devolucion_entrega_nombre", "Quien entrega")}
                  {campo("devolucion_recibe_nombre", "Quien recibe")}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SignaturePad etiqueta="Firma de quien devuelve" existente={existentes.devolucion_entrega} onChange={(v) => setFirmas((f) => ({ ...f, devolucion_entrega: v }))} />
                  <SignaturePad etiqueta="Firma de quien recibe la devolución" existente={existentes.devolucion_recibe} onChange={(v) => setFirmas((f) => ({ ...f, devolucion_recibe: v }))} />
                </div>
              </fieldset>
            )}

            <div className="space-y-1">
              <Label htmlFor="f-observaciones">Observaciones</Label>
              <Textarea id="f-observaciones" value={texto("observaciones")} onChange={(e) => set("observaciones", e.target.value)} maxLength={500} />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
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
