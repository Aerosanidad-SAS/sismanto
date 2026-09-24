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
import { estadoPrestamo, type LadoPrestamo, type PrestamoEntrada } from "@/lib/formatos-ti/prestamo";
import {
  actualizarPrestamo,
  crearPrestamo,
  eliminarPrestamo,
  exportarPrestamos,
  generarPrestamoPdf,
  urlFirmaPrestamo,
  type FirmasPrestamo,
  type PrestamoLista,
} from "@/app/api/actions/formatos-ti-prestamo";

const vacio = (): PrestamoEntrada => ({
  equipo_descripcion: "", equipo_placa: "", equipo_incluye: "",
  usuario_recibe_nombre: "", usuario_recibe_cargo: "", func_entrega_nombre: "", func_entrega_cargo: "",
  fecha_devolucion: "", gestion_recibe_nombre: "", gestion_recibe_cargo: "",
  usuario_entrega_dev_nombre: "", usuario_entrega_dev_cargo: "", observaciones: "",
});

function InsigniaFirma({ estado }: { estado: EstadoFirma }) {
  if (estado === "ok") return <Badge variant="success">Firmada</Badge>;
  if (estado === "modificada") return <Badge variant="destructive">Modificada</Badge>;
  return <Badge variant="outline">Sin firma</Badge>;
}

/** Resume las dos firmas de un lado: "Firmadas", "Modificada" si alguna cambió, o "Sin firma". */
function estadoPar(a: EstadoFirma, b: EstadoFirma): EstadoFirma {
  if (a === "modificada" || b === "modificada") return "modificada";
  if (a === "ok" && b === "ok") return "ok";
  return a === "sin_firma" && b === "sin_firma" ? "sin_firma" : "ok";
}

export function PrestamoTabla({ filas, filtros }: { filas: PrestamoLista[]; filtros: { q: string; estado: string } }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<PrestamoLista | null>(null);
  const [datos, setDatos] = useState<PrestamoEntrada>(vacio());
  const [firmas, setFirmas] = useState<FirmasPrestamo>({});
  const [existentes, setExistentes] = useState<Partial<Record<LadoPrestamo, string | null>>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const set = <K extends keyof PrestamoEntrada>(k: K, v: PrestamoEntrada[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const texto = (k: keyof PrestamoEntrada) => (datos[k] as string | null | undefined) ?? "";
  const campo = (k: keyof PrestamoEntrada, label: string, obligatorio = false, tipo = "text") => (
    <div className="space-y-1">
      <Label htmlFor={`p-${k}`}>
        {label}
        {obligatorio && " *"}
      </Label>
      <Input id={`p-${k}`} type={tipo} value={texto(k)} onChange={(e) => set(k, e.target.value as never)} />
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

  const abrirEdicion = async (f: PrestamoLista) => {
    setEditando(f);
    setDatos({
      equipo_descripcion: f.equipo_descripcion, equipo_placa: f.equipo_placa, equipo_incluye: f.equipo_incluye,
      usuario_recibe_nombre: f.usuario_recibe_nombre, usuario_recibe_cargo: f.usuario_recibe_cargo,
      func_entrega_nombre: f.func_entrega_nombre, func_entrega_cargo: f.func_entrega_cargo,
      fecha_devolucion: f.fecha_devolucion ?? "", gestion_recibe_nombre: f.gestion_recibe_nombre ?? "",
      gestion_recibe_cargo: f.gestion_recibe_cargo ?? "", usuario_entrega_dev_nombre: f.usuario_entrega_dev_nombre ?? "",
      usuario_entrega_dev_cargo: f.usuario_entrega_dev_cargo ?? "", observaciones: f.observaciones,
    });
    setFirmas({});
    setExistentes({});
    setError(null);
    setAbierto(true);
    const lados: LadoPrestamo[] = ["usuario_recibe", "func_entrega", "gestion_recibe", "usuario_entrega_dev"];
    const urls = await Promise.all(lados.map((l) => (f.estadoFirmas[l] === "sin_firma" ? null : urlFirmaPrestamo(f.id, l))));
    setExistentes(Object.fromEntries(lados.map((l, i) => [l, urls[i]])));
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const res = editando ? await actualizarPrestamo(editando.id, datos, firmas) : await crearPrestamo(datos, firmas);
    setGuardando(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("avisos" in res && res.avisos && res.avisos.length > 0) setAviso(res.avisos.join(" · "));
    setAbierto(false);
    router.refresh();
  };

  const eliminar = async (f: PrestamoLista) => {
    if (!confirm(`¿Eliminar el préstamo ${f.numero_orden} (${f.equipo_descripcion}, placa ${f.equipo_placa})? Se borran también sus firmas.`)) return;
    const res = await eliminarPrestamo(f.id);
    if ("error" in res && res.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  const descargarPdf = async (f: PrestamoLista) => {
    setDescargandoId(f.id);
    descargarPdfBase64(await generarPrestamoPdf(f.id), "prestamo.pdf");
    setDescargandoId(null);
  };

  const exportar = async () => {
    setExportando(true);
    setAviso(null);
    const res = await exportarPrestamos(filtros);
    if ("error" in res && res.error) {
      setAviso(res.error);
      setExportando(false);
      return;
    }
    await exportarExcel("Préstamos", "prestamos_equipos", [
      ["N° ORDEN", (f) => f.numero_orden], ["ESTADO", (f) => estadoPrestamo(f)], ["FECHA ENTREGA", (f) => f.fecha_entrega],
      ["EQUIPO", (f) => f.equipo_descripcion], ["PLACA", (f) => f.equipo_placa], ["INCLUYE", (f) => f.equipo_incluye],
      ["USUARIO QUE RECIBE", (f) => f.usuario_recibe_nombre], ["CARGO", (f) => f.usuario_recibe_cargo],
      ["FUNCIONARIO QUE ENTREGA", (f) => f.func_entrega_nombre], ["CARGO ENTREGA", (f) => f.func_entrega_cargo],
      ["FECHA DEVOLUCIÓN", (f) => f.fecha_devolucion], ["GESTIÓN QUE RECIBE", (f) => f.gestion_recibe_nombre],
      ["USUARIO QUE DEVUELVE", (f) => f.usuario_entrega_dev_nombre], ["OBSERVACIONES", (f) => f.observaciones],
    ], res.filas ?? []);
    if (res.truncado) setAviso("Se exportaron solo las primeras 5.000 filas. Aplica filtros para exportar el resto.");
    setExportando(false);
  };

  const hayFiltros = filtros.q || filtros.estado;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input name="q" defaultValue={filtros.q} placeholder="Equipo, placa, usuario, funcionario, N° orden" className="sm:w-72" />
          <select name="estado" defaultValue={filtros.estado} className={`${CLASE_SELECT} sm:w-52`} aria-label="Estado">
            <option value="">Todos los estados</option>
            <option value="PRESTADO">Prestado (sin devolver)</option>
            <option value="DEVUELTO">Devuelto</option>
          </select>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {hayFiltros && (
            <Button asChild variant="ghost">
              <Link href="/formatos-ti/prestamo">Limpiar</Link>
            </Button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportar} disabled={exportando} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {exportando ? "Exportando…" : "Exportar Excel"}
          </Button>
          <Button onClick={abrirNuevo}>Nuevo préstamo</Button>
        </div>
      </div>
      {aviso && <p className="text-sm text-amber-700">{aviso}</p>}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° orden</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Recibe</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Fecha entrega</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Firmas entrega</TableHead>
              <TableHead>Firmas devolución</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No hay préstamos{hayFiltros ? " para esos filtros" : " todavía"}.
                </TableCell>
              </TableRow>
            )}
            {filas.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.numero_orden}</TableCell>
                <TableCell>{f.equipo_descripcion}</TableCell>
                <TableCell>{f.equipo_placa}</TableCell>
                <TableCell>{f.usuario_recibe_nombre}</TableCell>
                <TableCell>{f.func_entrega_nombre}</TableCell>
                <TableCell>{fechaCorta(f.fecha_entrega)}</TableCell>
                <TableCell>
                  {estadoPrestamo(f) === "DEVUELTO" ? <Badge variant="success">Devuelto {fechaCorta(f.fecha_devolucion)}</Badge> : <Badge variant="default">Prestado</Badge>}
                </TableCell>
                <TableCell>
                  <InsigniaFirma estado={estadoPar(f.estadoFirmas.usuario_recibe, f.estadoFirmas.func_entrega)} />
                </TableCell>
                <TableCell>
                  <InsigniaFirma estado={estadoPar(f.estadoFirmas.gestion_recibe, f.estadoFirmas.usuario_entrega_dev)} />
                </TableCell>
                <TableCell className="space-x-2 whitespace-nowrap text-right">
                  <Button variant="outline" size="sm" onClick={() => descargarPdf(f)} disabled={descargandoId === f.id}>
                    {descargandoId === f.id ? "Generando…" : "PDF"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => abrirEdicion(f)}>
                    {estadoPrestamo(f) === "PRESTADO" ? "Devolver / editar" : "Editar"}
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
            <DialogTitle>{editando ? `Editar préstamo ${editando.numero_orden}` : "Nuevo préstamo de equipo"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "La fecha de entrega no cambia. Registra aquí la devolución cuando el equipo regrese. Si editas un dato cubierto por una firma, queda marcada como Modificada."
                : "G-TECN-F 018. Se crea con la entrega; la devolución se registra después editando. La fecha de entrega es la de hoy."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardar} className="space-y-5">
            <EquipoBuscador
              onElegir={(e) => {
                set("equipo_descripcion", [e.equipo, e.marca, e.modelo].filter(Boolean).join(" "));
                set("equipo_placa", e.placa_equipo);
              }}
            />

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Equipo</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("equipo_descripcion", "Descripción del equipo", true)}
                {campo("equipo_placa", "Placa", true)}
                <div className="sm:col-span-2">{campo("equipo_incluye", "Incluye (accesorios, cargador…)")}</div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Entrega</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("usuario_recibe_nombre", "Usuario que recibe", true)}
                {campo("usuario_recibe_cargo", "Cargo de quien recibe")}
                {campo("func_entrega_nombre", "Funcionario que entrega", true)}
                {campo("func_entrega_cargo", "Cargo de quien entrega")}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SignaturePad etiqueta="Firma del usuario que recibe" existente={existentes.usuario_recibe} onChange={(v) => setFirmas((f) => ({ ...f, usuario_recibe: v }))} />
                <SignaturePad etiqueta="Firma del funcionario que entrega" existente={existentes.func_entrega} onChange={(v) => setFirmas((f) => ({ ...f, func_entrega: v }))} />
              </div>
            </fieldset>

            {editando && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">Devolución</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {campo("fecha_devolucion", "Fecha de devolución", false, "date")}
                  <span />
                  {campo("gestion_recibe_nombre", "Gestión tecnológica que recibe")}
                  {campo("gestion_recibe_cargo", "Cargo de quien recibe")}
                  {campo("usuario_entrega_dev_nombre", "Usuario que devuelve")}
                  {campo("usuario_entrega_dev_cargo", "Cargo de quien devuelve")}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SignaturePad etiqueta="Firma de gestión tecnológica" existente={existentes.gestion_recibe} onChange={(v) => setFirmas((f) => ({ ...f, gestion_recibe: v }))} />
                  <SignaturePad etiqueta="Firma del usuario que devuelve" existente={existentes.usuario_entrega_dev} onChange={(v) => setFirmas((f) => ({ ...f, usuario_entrega_dev: v }))} />
                </div>
              </fieldset>
            )}

            <div className="space-y-1">
              <Label htmlFor="p-observaciones">Observaciones</Label>
              <Textarea id="p-observaciones" value={texto("observaciones")} onChange={(e) => set("observaciones", e.target.value)} maxLength={500} />
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
