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
import { OPCIONES_CHEQUEO, etiquetaChequeo, fechaCorta, hoyColombia, type EstadoFirma } from "@/lib/formatos-ti/comun";
import { CLASE_SELECT, descargarPdfBase64, exportarExcel } from "@/lib/formatos-ti/cliente";
import {
  CATALOGO_CHEQUEO_DIAGNOSTICO,
  CATALOGO_DIAGNOSTICO,
  MAX_REPUESTOS,
  OPCIONES_DIAGNOSTICO,
  RESULTADOS_DIAGNOSTICO,
  TIPOS_MTTO,
  type DiagnosticoEntrada,
  type LadoDiagnostico,
  type RepuestoFila,
} from "@/lib/formatos-ti/diagnostico";
import {
  actualizarDiagnostico,
  crearDiagnostico,
  eliminarDiagnostico,
  exportarDiagnosticos,
  generarDiagnosticoPdf,
  getRepuestosDiagnostico,
  urlFirmaDiagnostico,
  type DiagnosticoLista,
  type FirmasDiagnostico,
} from "@/app/api/actions/formatos-ti-diagnostico";

const vacio = (): DiagnosticoEntrada => ({
  fecha_diagnostico: hoyColombia(),
  equipo: "", marca: "", modelo: "", usuario_equipo: "", serial: "", ubicacion: "", responsable_equipo: "",
  fecha_orden: "", sede: "", placa: "", codigo_institucional: "", tipo_mtto: "PREVENTIVO",
  diagnostico: {}, descripcion_falla: "", checklist: {},
  equipo_apto_uso: false, equipo_averiado: false, requirio_reparacion: false, partes_buen_estado: false,
  observaciones: "", realizo_nombre: "", realizo_cargo: "", reviso_nombre: "", reviso_cargo: "",
  repuestos: [],
});

function InsigniaFirma({ estado }: { estado: EstadoFirma }) {
  if (estado === "ok") return <Badge variant="success">Firmada</Badge>;
  if (estado === "modificada") return <Badge variant="destructive">Modificada</Badge>;
  return <Badge variant="outline">Sin firma</Badge>;
}

export function DiagnosticoTabla({
  filas,
  sedes,
  filtros,
}: {
  filas: DiagnosticoLista[];
  sedes: string[];
  filtros: { q: string; tipo: string; sede: string };
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<DiagnosticoLista | null>(null);
  const [datos, setDatos] = useState<DiagnosticoEntrada>(vacio());
  const [repuestos, setRepuestos] = useState<RepuestoFila[]>([]);
  const [firmas, setFirmas] = useState<FirmasDiagnostico>({});
  const [existentes, setExistentes] = useState<Partial<Record<LadoDiagnostico, string | null>>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const set = <K extends keyof DiagnosticoEntrada>(k: K, v: DiagnosticoEntrada[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const texto = (k: keyof DiagnosticoEntrada) => (datos[k] as string | null | undefined) ?? "";
  const campo = (k: keyof DiagnosticoEntrada, label: string, obligatorio = false, tipo = "text") => (
    <div className="space-y-1">
      <Label htmlFor={`d-${k}`}>
        {label}
        {obligatorio && " *"}
      </Label>
      <Input id={`d-${k}`} type={tipo} value={texto(k)} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );

  const abrirNuevo = () => {
    setEditando(null);
    setDatos(vacio());
    setRepuestos([]);
    setFirmas({});
    setExistentes({});
    setError(null);
    setAbierto(true);
  };

  const abrirEdicion = async (f: DiagnosticoLista) => {
    setEditando(f);
    setDatos({
      fecha_diagnostico: f.fecha_diagnostico,
      equipo: f.equipo, marca: f.marca, modelo: f.modelo, usuario_equipo: f.usuario_equipo, serial: f.serial,
      ubicacion: f.ubicacion, responsable_equipo: f.responsable_equipo, fecha_orden: f.fecha_orden ?? "", sede: f.sede,
      placa: f.placa, codigo_institucional: f.codigo_institucional, tipo_mtto: f.tipo_mtto,
      diagnostico: (f.diagnostico ?? {}) as DiagnosticoEntrada["diagnostico"], descripcion_falla: f.descripcion_falla,
      checklist: (f.checklist ?? {}) as DiagnosticoEntrada["checklist"],
      equipo_apto_uso: f.equipo_apto_uso, equipo_averiado: f.equipo_averiado,
      requirio_reparacion: f.requirio_reparacion, partes_buen_estado: f.partes_buen_estado,
      observaciones: f.observaciones, realizo_nombre: f.realizo_nombre, realizo_cargo: f.realizo_cargo,
      reviso_nombre: f.reviso_nombre, reviso_cargo: f.reviso_cargo, repuestos: [],
    });
    setRepuestos([]);
    setFirmas({});
    setExistentes({});
    setError(null);
    setAbierto(true);
    const lados: LadoDiagnostico[] = ["realizo", "reviso"];
    const [reps, ...urls] = await Promise.all([
      getRepuestosDiagnostico(f.id),
      ...lados.map((l) => (f.estadoFirmas[l] === "sin_firma" ? null : urlFirmaDiagnostico(f.id, l))),
    ]);
    setRepuestos(reps as RepuestoFila[]);
    setExistentes(Object.fromEntries(lados.map((l, i) => [l, urls[i] as string | null])));
  };

  const cambiarMapa = (campoMapa: "diagnostico" | "checklist", clave: string, valor: string) =>
    setDatos((d) => {
      const m = { ...((d[campoMapa] ?? {}) as Record<string, string>) };
      if (valor) m[clave] = valor;
      else delete m[clave];
      return { ...d, [campoMapa]: m } as DiagnosticoEntrada;
    });

  const cambiarRepuesto = (i: number, parcial: Partial<RepuestoFila>) =>
    setRepuestos((rs) => rs.map((r, j) => (j === i ? { ...r, ...parcial } : r)));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const entrada = { ...datos, repuestos: repuestos.map(({ repuesto, referencia_serial, cantidad }) => ({ repuesto, referencia_serial, cantidad })) };
    const res = editando ? await actualizarDiagnostico(editando.id, entrada, firmas) : await crearDiagnostico(entrada, firmas);
    setGuardando(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("avisos" in res && res.avisos && res.avisos.length > 0) setAviso(res.avisos.join(" · "));
    setAbierto(false);
    router.refresh();
  };

  const eliminar = async (f: DiagnosticoLista) => {
    if (!confirm(`¿Eliminar el diagnóstico ${f.numero_orden} (${f.equipo}, placa ${f.placa})? Se borran también sus repuestos y firmas.`)) return;
    const res = await eliminarDiagnostico(f.id);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  const descargarPdf = async (f: DiagnosticoLista) => {
    setDescargandoId(f.id);
    descargarPdfBase64(await generarDiagnosticoPdf(f.id), "diagnostico.pdf");
    setDescargandoId(null);
  };

  const exportar = async () => {
    setExportando(true);
    setAviso(null);
    const res = await exportarDiagnosticos(filtros);
    if ("error" in res && res.error) {
      setAviso(res.error);
      setExportando(false);
      return;
    }
    await exportarExcel("Diagnósticos", "diagnosticos", [
      ["N° ORDEN", (f) => f.numero_orden], ["FECHA", (f) => f.fecha_diagnostico], ["EQUIPO", (f) => f.equipo],
      ["MARCA", (f) => f.marca], ["MODELO", (f) => f.modelo], ["SERIAL", (f) => f.serial], ["PLACA", (f) => f.placa],
      ["CÓDIGO INSTITUCIONAL", (f) => f.codigo_institucional], ["USUARIO", (f) => f.usuario_equipo],
      ["RESPONSABLE", (f) => f.responsable_equipo], ["UBICACIÓN", (f) => f.ubicacion], ["SEDE", (f) => f.sede],
      ["TIPO", (f) => f.tipo_mtto], ["FECHA ORDEN", (f) => f.fecha_orden], ["FALLA", (f) => f.descripcion_falla],
      ["APTO USO", (f) => (f.equipo_apto_uso ? "SI" : "NO")], ["AVERIADO", (f) => (f.equipo_averiado ? "SI" : "NO")],
      ["REQUIRIÓ REPARACIÓN", (f) => (f.requirio_reparacion ? "SI" : "NO")], ["PARTES EN BUEN ESTADO", (f) => (f.partes_buen_estado ? "SI" : "NO")],
      ["OBSERVACIONES", (f) => f.observaciones], ["REALIZÓ", (f) => f.realizo_nombre], ["REVISÓ", (f) => f.reviso_nombre],
    ], res.filas ?? []);
    if (res.truncado) setAviso("Se exportaron solo las primeras 5.000 filas. Aplica filtros para exportar el resto.");
    setExportando(false);
  };

  const hayFiltros = filtros.q || filtros.tipo || filtros.sede;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input name="q" defaultValue={filtros.q} placeholder="Equipo, placa, serial, responsable, N° orden" className="sm:w-72" />
          <select name="tipo" defaultValue={filtros.tipo} className={`${CLASE_SELECT} sm:w-44`} aria-label="Tipo de mantenimiento">
            <option value="">Todos los tipos</option>
            {TIPOS_MTTO.map((t) => (
              <option key={t} value={t}>
                {t === "CORRECTIVO" ? "Correctivo" : "Preventivo"}
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
          {hayFiltros && (
            <Button asChild variant="ghost">
              <Link href="/formatos-ti/diagnostico">Limpiar</Link>
            </Button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportar} disabled={exportando} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {exportando ? "Exportando…" : "Exportar Excel"}
          </Button>
          <Button onClick={abrirNuevo}>Nuevo diagnóstico</Button>
        </div>
      </div>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° orden</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Firma realizó</TableHead>
              <TableHead>Firma revisó</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No hay diagnósticos{hayFiltros ? " para esos filtros" : " todavía"}.
                </TableCell>
              </TableRow>
            )}
            {filas.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.numero_orden}</TableCell>
                <TableCell>{fechaCorta(f.fecha_diagnostico)}</TableCell>
                <TableCell>{f.equipo}</TableCell>
                <TableCell>{f.marca || "—"}</TableCell>
                <TableCell>{f.placa}</TableCell>
                <TableCell>{f.serial || "—"}</TableCell>
                <TableCell>{f.tipo_mtto === "CORRECTIVO" ? <Badge variant="destructive">Correctivo</Badge> : <Badge variant="secondary">Preventivo</Badge>}</TableCell>
                <TableCell>{f.sede || "—"}</TableCell>
                <TableCell>
                  <InsigniaFirma estado={f.estadoFirmas.realizo} />
                </TableCell>
                <TableCell>
                  <InsigniaFirma estado={f.estadoFirmas.reviso} />
                </TableCell>
                <TableCell className="space-x-2 whitespace-nowrap text-right">
                  <Button variant="outline" size="sm" onClick={() => descargarPdf(f)} disabled={descargandoId === f.id}>
                    {descargandoId === f.id ? "Generando…" : "PDF"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => abrirEdicion(f)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => eliminar(f)}>
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
            <DialogTitle>{editando ? `Editar diagnóstico ${editando.numero_orden}` : "Nuevo diagnóstico de mantenimiento"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Si editas un dato cubierto por la firma, queda marcada como Modificada; vuelve a firmar para actualizarla."
                : "G-TECN-F 047. El N° de orden se asigna al guardar."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardar} className="space-y-5">
            <EquipoBuscador
              onElegir={(e) => {
                set("equipo", e.equipo);
                set("marca", e.marca ?? "");
                set("modelo", e.modelo ?? "");
                set("serial", e.serie ?? "");
                set("placa", e.placa_equipo);
                set("ubicacion", e.ubicacion_interna ?? "");
                if (!datos.sede) set("sede", e.ciudad ?? "");
              }}
            />

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Equipo y orden</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("fecha_diagnostico", "Fecha del diagnóstico", true, "date")}
                {campo("equipo", "Equipo", true)}
                {campo("marca", "Marca")}
                {campo("modelo", "Modelo")}
                {campo("serial", "Serial")}
                {campo("placa", "Placa", true)}
                {campo("codigo_institucional", "Código institucional")}
                {campo("usuario_equipo", "Usuario del equipo")}
                {campo("responsable_equipo", "Responsable del equipo")}
                {campo("ubicacion", "Ubicación")}
                {campo("sede", "Sede")}
                {campo("fecha_orden", "Fecha de la orden", false, "date")}
                <div className="space-y-1">
                  <Label htmlFor="d-tipo_mtto">Tipo de mantenimiento *</Label>
                  <select id="d-tipo_mtto" className={CLASE_SELECT} value={datos.tipo_mtto} onChange={(e) => set("tipo_mtto", e.target.value as "PREVENTIVO")}>
                    {TIPOS_MTTO.map((t) => (
                      <option key={t} value={t}>
                        {t === "CORRECTIVO" ? "Correctivo" : "Preventivo"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Diagnóstico</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(CATALOGO_DIAGNOSTICO).map(([clave, etiqueta]) => (
                  <div key={clave} className="flex items-center justify-between gap-2 rounded border p-2">
                    <Label htmlFor={`dg-${clave}`} className="text-sm font-normal">
                      {etiqueta}
                    </Label>
                    <select
                      id={`dg-${clave}`}
                      className={`${CLASE_SELECT} w-24`}
                      value={(datos.diagnostico as Record<string, string> | undefined)?.[clave] ?? ""}
                      onChange={(e) => cambiarMapa("diagnostico", clave, e.target.value)}
                    >
                      <option value="">—</option>
                      {OPCIONES_DIAGNOSTICO.map((o) => (
                        <option key={o} value={o}>
                          {etiquetaChequeo(o)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="d-descripcion_falla">Descripción de la falla</Label>
                <Textarea id="d-descripcion_falla" value={texto("descripcion_falla")} onChange={(e) => set("descripcion_falla", e.target.value)} maxLength={1000} />
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Listado de chequeo</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(CATALOGO_CHEQUEO_DIAGNOSTICO).map(([clave, etiqueta]) => (
                  <div key={clave} className="flex items-center justify-between gap-2 rounded border p-2">
                    <Label htmlFor={`ck-${clave}`} className="text-sm font-normal">
                      {etiqueta}
                    </Label>
                    <select
                      id={`ck-${clave}`}
                      className={`${CLASE_SELECT} w-28`}
                      value={(datos.checklist as Record<string, string> | undefined)?.[clave] ?? ""}
                      onChange={(e) => cambiarMapa("checklist", clave, e.target.value)}
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
              <legend className="text-sm font-semibold">Resultado</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {RESULTADOS_DIAGNOSTICO.map(([k, etiqueta]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!datos[k]} onChange={(e) => set(k, e.target.checked)} />
                    {etiqueta}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Repuestos</legend>
              {repuestos.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_5rem_auto] items-end gap-2">
                  <div className="space-y-1">
                    {i === 0 && <Label htmlFor="rep-0">Repuesto</Label>}
                    <Input id={`rep-${i}`} aria-label={`Repuesto ${i + 1}`} value={r.repuesto} onChange={(e) => cambiarRepuesto(i, { repuesto: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    {i === 0 && <Label>Referencia / serial</Label>}
                    <Input aria-label={`Referencia del repuesto ${i + 1}`} value={r.referencia_serial} onChange={(e) => cambiarRepuesto(i, { referencia_serial: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    {i === 0 && <Label>Cant.</Label>}
                    <Input type="number" min={1} aria-label={`Cantidad del repuesto ${i + 1}`} value={r.cantidad} onChange={(e) => cambiarRepuesto(i, { cantidad: Number(e.target.value) })} />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setRepuestos((rs) => rs.filter((_, j) => j !== i))}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={repuestos.length >= MAX_REPUESTOS}
                onClick={() => setRepuestos((rs) => [...rs, { repuesto: "", referencia_serial: "", cantidad: 1 }])}
              >
                Agregar repuesto
              </Button>
            </fieldset>

            <div className="space-y-1">
              <Label htmlFor="d-observaciones">Observaciones</Label>
              <Textarea id="d-observaciones" value={texto("observaciones")} onChange={(e) => set("observaciones", e.target.value)} maxLength={1000} />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Firmas</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("realizo_nombre", "Quien realizó", true)}
                {campo("realizo_cargo", "Cargo de quien realizó")}
                {campo("reviso_nombre", "Quien revisó")}
                {campo("reviso_cargo", "Cargo de quien revisó")}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SignaturePad etiqueta="Firma de quien realizó" existente={existentes.realizo} onChange={(v) => setFirmas((f) => ({ ...f, realizo: v }))} />
                <SignaturePad etiqueta="Firma de quien revisó" existente={existentes.reviso} onChange={(v) => setFirmas((f) => ({ ...f, reviso: v }))} />
              </div>
            </fieldset>

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
