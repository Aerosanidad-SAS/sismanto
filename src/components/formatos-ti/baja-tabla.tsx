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
import { fechaCorta, type EstadoFirma } from "@/lib/formatos-ti/comun";
import { CLASE_SELECT, descargarPdfBase64, exportarExcel } from "@/lib/formatos-ti/cliente";
import { ACCESORIOS_BAJA, CAUSAS_BAJA, TELECOM_BAJA, TIPOS_BAJA, type BajaEntrada } from "@/lib/formatos-ti/baja";
import {
  actualizarBaja,
  crearBaja,
  eliminarBaja,
  exportarBajas,
  generarBajaPdf,
  urlFirmaBaja,
  type BajaLista,
  type FirmasBaja,
} from "@/app/api/actions/formatos-ti-baja";

const vacio = (): BajaEntrada => ({
  tipo_equipo: "INFORMATICO",
  fecha_ingreso_reporte: "", numero_inventario: "", sede: "", ubicacion_sanidad: "", mayor_dos_anios: false,
  nombre_equipo: "", marca: "", modelo: "", serie: "",
  causa_baja: "DANIO", causa_baja_detalle: "", concepto_tecnico_radicado: "", proveedor_garantia: "", denuncio: "",
  costo_historico: "", fecha_compra: "",
  telecom_tipo: "NINGUNO", telecom_marca: "", telecom_modelo: "", telecom_imei: "", telecom_operador: "",
  accesorios: {}, observaciones: "", responsable_nombre: "",
});

function InsigniaFirma({ estado }: { estado: EstadoFirma }) {
  if (estado === "ok") return <Badge variant="success">Firmada</Badge>;
  if (estado === "modificada") return <Badge variant="destructive">Modificada</Badge>;
  return <Badge variant="outline">Sin firma</Badge>;
}

export function BajaTabla({ filas, filtros }: { filas: BajaLista[]; filtros: { q: string; tipo: string; causa: string } }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<BajaLista | null>(null);
  const [datos, setDatos] = useState<BajaEntrada>(vacio());
  const [firmas, setFirmas] = useState<FirmasBaja>({});
  const [existente, setExistente] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const informatico = datos.tipo_equipo === "INFORMATICO";
  const conTelecom = datos.telecom_tipo !== "NINGUNO";
  const accesorios = (datos.accesorios ?? {}) as Record<string, boolean | string>;
  const set = <K extends keyof BajaEntrada>(k: K, v: BajaEntrada[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const texto = (k: keyof BajaEntrada) => (datos[k] as string | null | undefined) ?? "";
  const campo = (k: keyof BajaEntrada, label: string, obligatorio = false, tipo = "text") => (
    <div className="space-y-1">
      <Label htmlFor={`b-${k}`}>
        {label}
        {obligatorio && " *"}
      </Label>
      <Input id={`b-${k}`} type={tipo} value={texto(k)} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );

  const abrirNuevo = () => {
    setEditando(null);
    setDatos(vacio());
    setFirmas({});
    setExistente(null);
    setError(null);
    setAbierto(true);
  };

  const abrirEdicion = async (f: BajaLista) => {
    setEditando(f);
    setDatos({
      tipo_equipo: f.tipo_equipo,
      fecha_ingreso_reporte: f.fecha_ingreso_reporte ?? "", numero_inventario: f.numero_inventario ?? "",
      sede: f.sede ?? "", ubicacion_sanidad: f.ubicacion_sanidad ?? "", mayor_dos_anios: f.mayor_dos_anios,
      nombre_equipo: f.nombre_equipo, marca: f.marca, modelo: f.modelo, serie: f.serie,
      causa_baja: f.causa_baja, causa_baja_detalle: f.causa_baja_detalle,
      concepto_tecnico_radicado: f.concepto_tecnico_radicado, proveedor_garantia: f.proveedor_garantia, denuncio: f.denuncio,
      costo_historico: f.costo_historico, fecha_compra: f.fecha_compra ?? "",
      telecom_tipo: f.telecom_tipo, telecom_marca: f.telecom_marca, telecom_modelo: f.telecom_modelo,
      telecom_imei: f.telecom_imei, telecom_operador: f.telecom_operador,
      accesorios: f.accesorios ?? {}, observaciones: f.observaciones, responsable_nombre: f.responsable_nombre,
    });
    setFirmas({});
    setExistente(null);
    setError(null);
    setAbierto(true);
    if (f.estadoFirmas.responsable !== "sin_firma") setExistente(await urlFirmaBaja(f.id));
  };

  const cambiarAccesorio = (clave: string, valor: boolean | string) => set("accesorios", { ...accesorios, [clave]: valor });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarBaja(editando.id, datos, firmas) : await crearBaja(datos, firmas);
    setGuardando(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("avisos" in res && res.avisos && res.avisos.length > 0) setAviso(res.avisos.join(" · "));
    setAbierto(false);
    router.refresh();
  };

  const eliminar = async (f: BajaLista) => {
    if (!confirm(`¿Eliminar la baja ${f.numero_orden} (${f.nombre_equipo}, serie ${f.serie})? Se borra también su firma.`)) return;
    const res = await eliminarBaja(f.id);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  const descargarPdf = async (f: BajaLista) => {
    setDescargandoId(f.id);
    descargarPdfBase64(await generarBajaPdf(f.id), "baja.pdf");
    setDescargandoId(null);
  };

  const exportar = async () => {
    setExportando(true);
    setAviso(null);
    const res = await exportarBajas(filtros);
    if ("error" in res && res.error) {
      setAviso(res.error);
      setExportando(false);
      return;
    }
    await exportarExcel("Bajas", "bajas_equipos", [
      ["N° ORDEN", (f) => f.numero_orden], ["TIPO", (f) => f.tipo_equipo], ["EQUIPO", (f) => f.nombre_equipo],
      ["MARCA", (f) => f.marca], ["MODELO", (f) => f.modelo], ["SERIE", (f) => f.serie],
      ["N° INVENTARIO", (f) => f.numero_inventario], ["FECHA INGRESO/REPORTE", (f) => f.fecha_ingreso_reporte],
      ["SEDE", (f) => f.sede], ["UBICACIÓN SANIDAD", (f) => f.ubicacion_sanidad],
      ["MAYOR A 2 AÑOS", (f) => (f.mayor_dos_anios ? "SI" : "NO")],
      ["CAUSA", (f) => CAUSAS_BAJA[f.causa_baja] ?? f.causa_baja], ["DETALLE CAUSA", (f) => f.causa_baja_detalle],
      ["CONCEPTO TÉCNICO", (f) => f.concepto_tecnico_radicado], ["PROVEEDOR/GARANTÍA", (f) => f.proveedor_garantia],
      ["DENUNCIÓ", (f) => f.denuncio], ["COSTO HISTÓRICO", (f) => f.costo_historico], ["FECHA COMPRA", (f) => f.fecha_compra],
      ["TELECOM", (f) => TELECOM_BAJA[f.telecom_tipo] ?? f.telecom_tipo], ["IMEI", (f) => f.telecom_imei],
      ["OBSERVACIONES", (f) => f.observaciones], ["RESPONSABLE", (f) => f.responsable_nombre],
    ], res.filas ?? []);
    if (res.truncado) setAviso("Se exportaron solo las primeras 5.000 filas. Aplica filtros para exportar el resto.");
    setExportando(false);
  };

  const hayFiltros = filtros.q || filtros.tipo || filtros.causa;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input name="q" defaultValue={filtros.q} placeholder="Equipo, serie, inventario, responsable, N° orden" className="sm:w-72" />
          <select name="tipo" defaultValue={filtros.tipo} className={`${CLASE_SELECT} sm:w-44`} aria-label="Tipo de equipo">
            <option value="">Todos los tipos</option>
            {TIPOS_BAJA.map((t) => (
              <option key={t} value={t}>
                {t === "BIOMEDICO" ? "Biomédico" : "Informático"}
              </option>
            ))}
          </select>
          <select name="causa" defaultValue={filtros.causa} className={`${CLASE_SELECT} sm:w-48`} aria-label="Causa de la baja">
            <option value="">Todas las causas</option>
            {Object.entries(CAUSAS_BAJA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {hayFiltros && (
            <Button asChild variant="ghost">
              <Link href="/formatos-ti/baja">Limpiar</Link>
            </Button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportar} disabled={exportando} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {exportando ? "Exportando…" : "Exportar Excel"}
          </Button>
          <Button onClick={abrirNuevo}>Nueva baja</Button>
        </div>
      </div>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° orden</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Serie</TableHead>
              <TableHead>Causa</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No hay bajas{hayFiltros ? " para esos filtros" : " todavía"}.
                </TableCell>
              </TableRow>
            )}
            {filas.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.numero_orden}</TableCell>
                <TableCell>{f.tipo_equipo === "BIOMEDICO" ? "Biomédico" : "Informático"}</TableCell>
                <TableCell>{f.nombre_equipo}</TableCell>
                <TableCell>{f.marca || "—"}</TableCell>
                <TableCell>{f.serie || "—"}</TableCell>
                <TableCell>{CAUSAS_BAJA[f.causa_baja] ?? f.causa_baja}</TableCell>
                <TableCell>{f.responsable_nombre}</TableCell>
                <TableCell>{fechaCorta(new Date(f.created_at).toLocaleDateString("en-CA", { timeZone: "America/Bogota" }))}</TableCell>
                <TableCell>
                  <InsigniaFirma estado={f.estadoFirmas.responsable} />
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
            <DialogTitle>{editando ? `Editar baja ${editando.numero_orden}` : "Nueva baja de equipo"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Si editas un dato cubierto por la firma, queda marcada como Modificada; vuelve a firmar para actualizarla."
                : "G-TECN-F 020. El N° de orden se asigna al guardar."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardar} className="space-y-5">
            <EquipoBuscador
              onElegir={(e) => {
                set("nombre_equipo", e.equipo);
                set("marca", e.marca ?? "");
                set("modelo", e.modelo ?? "");
                set("serie", e.serie ?? "");
                if (informatico) set("numero_inventario", e.placa_equipo);
                else {
                  set("sede", e.ciudad ?? "");
                  set("ubicacion_sanidad", e.ubicacion_interna ?? "");
                }
              }}
            />

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Equipo</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="b-tipo_equipo">Tipo de equipo *</Label>
                  <select id="b-tipo_equipo" className={CLASE_SELECT} value={datos.tipo_equipo} onChange={(e) => set("tipo_equipo", e.target.value as "INFORMATICO")}>
                    <option value="INFORMATICO">Informático</option>
                    <option value="BIOMEDICO">Biomédico</option>
                  </select>
                </div>
                {campo("nombre_equipo", "Nombre del equipo", true)}
                {campo("marca", "Marca", true)}
                {campo("modelo", "Modelo")}
                {campo("serie", "Serie", true)}
                {informatico ? (
                  <>
                    {campo("fecha_ingreso_reporte", "Fecha de ingreso / reporte", false, "date")}
                    {campo("numero_inventario", "N° de inventario")}
                  </>
                ) : (
                  <>
                    {campo("sede", "Sede")}
                    {campo("ubicacion_sanidad", "Ubicación en Sanidad")}
                  </>
                )}
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={!!datos.mayor_dos_anios} onChange={(e) => set("mayor_dos_anios", e.target.checked)} />
                  El equipo tiene más de dos años
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Causa de la baja</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="b-causa_baja">Causa *</Label>
                  <select id="b-causa_baja" className={CLASE_SELECT} value={datos.causa_baja} onChange={(e) => set("causa_baja", e.target.value)}>
                    {Object.entries(CAUSAS_BAJA).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                {campo("causa_baja_detalle", datos.causa_baja === "OTROS" ? "Detalle de la causa *" : "Detalle de la causa")}
                {campo("concepto_tecnico_radicado", "Concepto técnico radicado")}
                {campo("proveedor_garantia", "Proveedor / garantía")}
                {campo("denuncio", "Denuncio")}
                {campo("costo_historico", "Costo histórico")}
                {campo("fecha_compra", "Fecha de compra", false, "date")}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Telecomunicaciones</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="b-telecom_tipo">Tipo</Label>
                  <select id="b-telecom_tipo" className={CLASE_SELECT} value={datos.telecom_tipo} onChange={(e) => set("telecom_tipo", e.target.value)}>
                    {Object.entries(TELECOM_BAJA).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                {conTelecom && (
                  <>
                    {campo("telecom_marca", "Marca")}
                    {campo("telecom_modelo", "Modelo")}
                    {campo("telecom_imei", "IMEI")}
                    {campo("telecom_operador", "Operador")}
                  </>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Cables y cargadores</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(ACCESORIOS_BAJA).map(([k, etiqueta]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={accesorios[k] === true} onChange={(e) => cambiarAccesorio(k, e.target.checked)} />
                    {etiqueta}
                  </label>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="b-otro_detalle">Otros</Label>
                <Input
                  id="b-otro_detalle"
                  value={typeof accesorios.otro_detalle === "string" ? accesorios.otro_detalle : ""}
                  onChange={(e) => cambiarAccesorio("otro_detalle", e.target.value)}
                  maxLength={255}
                />
              </div>
            </fieldset>

            <div className="space-y-1">
              <Label htmlFor="b-observaciones">Observaciones</Label>
              <Textarea id="b-observaciones" value={texto("observaciones")} onChange={(e) => set("observaciones", e.target.value)} maxLength={1000} />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Responsable</legend>
              {campo("responsable_nombre", "Nombre del responsable", true)}
              <SignaturePad etiqueta="Firma del responsable" existente={existente} onChange={(v) => setFirmas({ responsable: v })} />
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
