"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TICKET_ESTADOS, TICKET_PRIORIDADES } from "@/lib/validations";
import { eliminarTicket, type TicketGestionRow } from "@/app/api/actions/tickets-gestion";
import { ETIQUETA_ESTADO, ETIQUETA_PRIORIDAD, fechaHora, variantePrioridad, varianteEstado } from "@/components/soporte/etiquetas";

interface Filtros {
  estado?: string;
  categoria?: string;
  prioridad?: string;
  buscar?: string;
  desde?: string;
  hasta?: string;
  mios?: string;
}

interface Props {
  tickets: TicketGestionRow[];
  categorias: string[];
  esAdmin: boolean;
  filtros: Filtros;
}

const TODOS = "TODOS";

export function GestionTickets({ tickets, categorias, esAdmin, filtros }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState(filtros.estado ?? TODOS);
  const [categoria, setCategoria] = useState(filtros.categoria ?? TODOS);
  const [prioridad, setPrioridad] = useState(filtros.prioridad ?? TODOS);
  const [buscar, setBuscar] = useState(filtros.buscar ?? "");
  const [desde, setDesde] = useState(filtros.desde ?? "");
  const [hasta, setHasta] = useState(filtros.hasta ?? "");
  const [mios, setMios] = useState(filtros.mios === "1");
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const conteo = (e: string) => tickets.filter((t) => t.estado === e).length;

  function aplicar() {
    const p = new URLSearchParams();
    if (estado !== TODOS) p.set("estado", estado);
    if (categoria !== TODOS) p.set("categoria", categoria);
    if (prioridad !== TODOS) p.set("prioridad", prioridad);
    if (buscar.trim()) p.set("buscar", buscar.trim());
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (mios) p.set("mios", "1");
    const qs = p.toString();
    router.push(qs ? `/soporte/gestion?${qs}` : "/soporte/gestion");
  }

  function limpiar() {
    setEstado(TODOS);
    setCategoria(TODOS);
    setPrioridad(TODOS);
    setBuscar("");
    setDesde("");
    setHasta("");
    setMios(false);
    router.push("/soporte/gestion");
  }

  async function borrar(t: TicketGestionRow) {
    if (!window.confirm(`¿Eliminar el ticket #${t.id}? Se borra también su historial y su imagen. Esta acción no se puede deshacer.`)) return;
    setEliminando(t.id);
    setError(null);
    const r = await eliminarTicket(t.id);
    setEliminando(null);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    if ("aviso" in r && r.aviso) setError(r.aviso);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TICKET_ESTADOS.map((e) => (
          <div key={e} className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{ETIQUETA_ESTADO[e]}</p>
            <p className="text-2xl font-semibold">{conteo(e)}</p>
          </div>
        ))}
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar();
        }}
      >
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              {TICKET_ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Prioridad</Label>
          <Select value={prioridad} onValueChange={setPrioridad}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {TICKET_PRIORIDADES.map((p) => (
                <SelectItem key={p} value={p}>
                  {ETIQUETA_PRIORIDAD[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="g-buscar">Buscar</Label>
          <Input id="g-buscar" placeholder="N.º, asunto o solicitante" maxLength={80} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="g-desde">Creado desde</Label>
          <Input id="g-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="g-hasta">Creado hasta</Label>
          <Input id="g-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={mios} onChange={(e) => setMios(e.target.checked)} />
          Solo los que atiendo yo
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">Filtrar</Button>
          <Button type="button" variant="outline" onClick={limpiar}>
            Limpiar
          </Button>
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
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  No hay tickets con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>
                    <Badge variant={varianteEstado(t.estado)}>{ETIQUETA_ESTADO[t.estado] ?? t.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variantePrioridad(t.prioridad)}>{ETIQUETA_PRIORIDAD[t.prioridad] ?? t.prioridad}</Badge>
                  </TableCell>
                  <TableCell>{t.categoria}</TableCell>
                  <TableCell>{t.nombre_solicitante}</TableCell>
                  <TableCell>{t.area}</TableCell>
                  <TableCell className="max-w-xs truncate" title={t.asunto}>
                    {t.asunto}
                  </TableCell>
                  <TableCell>{t.nombre_tecnico ?? "Sin asignar"}</TableCell>
                  <TableCell className="whitespace-nowrap">{fechaHora(t.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/soporte/gestion/${t.id}`}>Gestionar</Link>
                      </Button>
                      {esAdmin && (
                        <Button size="sm" variant="outline" disabled={eliminando === t.id} onClick={() => void borrar(t)}>
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
