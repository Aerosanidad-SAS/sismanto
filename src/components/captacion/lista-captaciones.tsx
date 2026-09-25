"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { eliminarCaptacion, generarCaptacionPdf, type CaptacionRow } from "@/app/api/actions/captacion";
import { MOTIVOS_CONSULTA } from "@/lib/captacion";

interface Props {
  captaciones: CaptacionRow[];
  aeropuertos: string[];
  filtros: { buscar?: string; desde?: string; hasta?: string; aeropuerto?: string };
  esAdmin: boolean;
}

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function fechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function ListaCaptaciones({ captaciones, aeropuertos, filtros, esAdmin }: Props) {
  const router = useRouter();
  const [buscar, setBuscar] = useState(filtros.buscar ?? "");
  const [desde, setDesde] = useState(filtros.desde ?? "");
  const [hasta, setHasta] = useState(filtros.hasta ?? "");
  const [aeropuerto, setAeropuerto] = useState(filtros.aeropuerto ?? "");
  const hoy = new Date(Date.now() - 5 * 3_600_000);
  const [mes, setMes] = useState(`${hoy.getUTCFullYear()}-${String(hoy.getUTCMonth() + 1).padStart(2, "0")}`);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [generando, setGenerando] = useState<number | null>(null);

  function aplicar() {
    const p = new URLSearchParams();
    if (buscar.trim()) p.set("buscar", buscar.trim());
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (aeropuerto) p.set("aeropuerto", aeropuerto);
    router.push(p.toString() ? `/captacion?${p}` : "/captacion");
  }

  async function descargarPdf(c: CaptacionRow) {
    setGenerando(c.id);
    setError(null);
    const r = await generarCaptacionPdf(c.id);
    setGenerando(null);
    if (!("success" in r) || !r.success) {
      setError("error" in r && r.error ? r.error : "No se pudo generar el PDF");
      return;
    }
    const bytes = Uint8Array.from(atob(r.data), (ch) => ch.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = r.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function borrar(c: CaptacionRow) {
    if (!window.confirm(`¿Eliminar la captación #${c.id}? Dejará de aparecer en la lista y en el reporte SISPRO.`)) return;
    setEliminando(c.id);
    setError(null);
    const r = await eliminarCaptacion(c.id);
    setEliminando(null);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    router.refresh();
  }

  const [anio, num] = mes.split("-").map(Number);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
        <div className="space-y-1">
          <Label htmlFor="mes-sispro">Reporte SISPRO del mes</Label>
          <Input id="mes-sispro" type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </div>
        <Button asChild disabled={!/^\d{4}-\d{2}$/.test(mes)}>
          <a href={`/api/captacion/sispro?mes=${encodeURIComponent(mes)}`}>
            Descargar Excel {Number.isFinite(num) && num >= 1 && num <= 12 ? `${MESES[num - 1]} ${anio}` : ""}
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">Mismas 38 columnas del libro SISPRO 2026; los códigos de país, ciudad e IPS ya van resueltos.</p>
        <div className="ml-auto flex gap-2">
          {esAdmin && (
            <Button variant="outline" asChild>
              <Link href="/captacion/configuracion">Configurar campos</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/captacion/nueva">Nueva captación</Link>
          </Button>
        </div>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar();
        }}
      >
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="c-buscar">Buscar</Label>
          <Input id="c-buscar" placeholder="Identificación, nombre o apellido" maxLength={60} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-desde">Desde</Label>
          <Input id="c-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-hasta">Hasta</Label>
          <Input id="c-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-aero">Aeropuerto</Label>
          <select id="c-aero" className={CLASE_SELECT} value={aeropuerto} onChange={(e) => setAeropuerto(e.target.value)}>
            <option value="">Todos</option>
            {aeropuertos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">Filtrar</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBuscar("");
              setDesde("");
              setHasta("");
              setAeropuerto("");
              router.push("/captacion");
            }}
          >
            Limpiar
          </Button>
          <span className="self-center text-sm text-muted-foreground">{captaciones.length} registro(s)</span>
        </div>
      </form>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Aeropuerto</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>CIE-10</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {captaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  No hay captaciones con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              captaciones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{fechaHora(c.fecha_atencion)}</TableCell>
                  <TableCell>{c.aeropuerto_atencion}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {c.tipo_identificacion} {c.numero_identificacion}
                  </TableCell>
                  <TableCell>{[c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido].filter(Boolean).join(" ")}</TableCell>
                  <TableCell>{MOTIVOS_CONSULTA.find((m) => m.codigo === c.motivo_consulta)?.nombre ?? c.motivo_consulta}</TableCell>
                  <TableCell>{c.cie10 ?? "—"}</TableCell>
                  <TableCell>{c.medico_atendio ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/captacion/${c.id}`}>{esAdmin ? "Editar" : "Ver"}</Link>
                      </Button>
                      <Button size="sm" variant="outline" disabled={generando === c.id} onClick={() => void descargarPdf(c)}>
                        {generando === c.id ? "Generando…" : "PDF"}
                      </Button>
                      {esAdmin && (
                        <Button size="sm" variant="outline" disabled={eliminando === c.id} onClick={() => void borrar(c)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
