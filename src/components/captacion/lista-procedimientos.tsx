"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { eliminarProcedimientosExternos } from "@/app/api/actions/captacion-procedimientos";
import type { LoteProcedimientos } from "@/lib/captacion-procedimientos";

interface Props {
  lotes: LoteProcedimientos[];
  aeropuertos: string[];
  filtros: { desde?: string; hasta?: string; aeropuerto?: string };
  esAdmin: boolean;
}

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function fechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));
}

export function ListaProcedimientos({ lotes, aeropuertos, filtros, esAdmin }: Props) {
  const router = useRouter();
  const [desde, setDesde] = useState(filtros.desde ?? "");
  const [hasta, setHasta] = useState(filtros.hasta ?? "");
  const [aeropuerto, setAeropuerto] = useState(filtros.aeropuerto ?? "");
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  function aplicar() {
    const p = new URLSearchParams();
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (aeropuerto) p.set("aeropuerto", aeropuerto);
    router.push(p.toString() ? `/captacion/procedimientos?${p}` : "/captacion/procedimientos");
  }

  async function borrar(l: LoteProcedimientos) {
    if (!window.confirm("¿Eliminar este registro? Dejará de aparecer en la lista y en los informes.")) return;
    setEliminando(l.lote);
    setError(null);
    const r = await eliminarProcedimientosExternos(l.lote);
    setEliminando(null);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Estos registros no son pacientes: cuentan en el informe PME (con su cantidad), en las emergencias del ACM y en «Ambulancia» de Aerocivil.
        </p>
        <Button asChild>
          <Link href="/captacion/procedimientos/nueva">Nuevo registro</Link>
        </Button>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar();
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="pl-desde">Desde</Label>
          <Input id="pl-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pl-hasta">Hasta</Label>
          <Input id="pl-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="pl-aero">Aeropuerto</Label>
          <select id="pl-aero" className={CLASE_SELECT} value={aeropuerto} onChange={(e) => setAeropuerto(e.target.value)}>
            <option value="">Todos</option>
            {aeropuertos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit">Filtrar</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDesde("");
              setHasta("");
              setAeropuerto("");
              router.push("/captacion/procedimientos");
            }}
          >
            Limpiar
          </Button>
          <span className="self-center text-sm text-muted-foreground">{lotes.length} registro(s)</span>
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
              <TableHead>Fecha</TableHead>
              <TableHead>Aeropuerto</TableHead>
              <TableHead>Procedimientos</TableHead>
              <TableHead>Emergencia</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead>Registró</TableHead>
              {esAdmin && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={esAdmin ? 7 : 6} className="py-8 text-center text-muted-foreground">
                  No hay registros con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              lotes.map((l) => (
                <TableRow key={l.lote}>
                  <TableCell className="whitespace-nowrap">{fechaHora(l.fecha_atencion)}</TableCell>
                  <TableCell>{l.aeropuerto_atencion}</TableCell>
                  <TableCell>
                    <ul className="space-y-0.5">
                      {l.lineas.map((x) => (
                        <li key={x.id}>
                          {x.procedimiento} <span className="font-medium">× {x.cantidad}</span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{l.emergencia_tipo ?? "—"}</TableCell>
                  <TableCell className="max-w-xs whitespace-pre-line">{l.notas ?? "—"}</TableCell>
                  <TableCell>{l.nombre_registrado_por ?? "—"}</TableCell>
                  {esAdmin && (
                    <TableCell>
                      <Button size="sm" variant="outline" disabled={eliminando === l.lote} onClick={() => void borrar(l)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
