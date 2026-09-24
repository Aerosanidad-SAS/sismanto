"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  guardarCatalogoTickets,
  guardarCorreosGestores,
  guardarDisponibilidad,
  guardarHorarioTickets,
  guardarMensajeTickets,
  guardarSlaTickets,
  type ConfigTickets,
  type DisponibilidadRow,
} from "@/app/api/actions/tickets-config";

interface Catalogo {
  nombre: string;
  activo: boolean;
}

interface Props {
  config: ConfigTickets;
  catalogos: { sedes: Catalogo[]; areas: Catalogo[]; categorias: Catalogo[] };
  correos: string[];
  disponibilidad: DisponibilidadRow[];
}

const DIAS = [
  { n: 1, etiqueta: "Lun" },
  { n: 2, etiqueta: "Mar" },
  { n: 3, etiqueta: "Mié" },
  { n: 4, etiqueta: "Jue" },
  { n: 5, etiqueta: "Vie" },
  { n: 6, etiqueta: "Sáb" },
  { n: 7, etiqueta: "Dom" },
];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const lineas = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

export function ConfiguracionSoporte({ config, catalogos, correos, disponibilidad }: Props) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  const [sedes, setSedes] = useState(catalogos.sedes.filter((c) => c.activo).map((c) => c.nombre).join("\n"));
  const [areas, setAreas] = useState(catalogos.areas.filter((c) => c.activo).map((c) => c.nombre).join("\n"));
  const [categorias, setCategorias] = useState(catalogos.categorias.filter((c) => c.activo).map((c) => c.nombre).join("\n"));
  const [sla, setSla] = useState({ ...config.sla });
  const [dias, setDias] = useState<number[]>(config.horario.dias);
  const [inicio, setInicio] = useState(config.horario.inicio);
  const [fin, setFin] = useState(config.horario.fin);
  const [texto, setTexto] = useState(config.mensaje);
  const [listaCorreos, setListaCorreos] = useState(correos.join("\n"));
  const hoy = new Date(Date.now() - 5 * 3_600_000);
  const [disp, setDisp] = useState({ anio: hoy.getUTCFullYear(), mes: hoy.getUTCMonth() + 1, porcentaje: "", notas: "" });

  async function guardar(clave: string, fn: () => Promise<{ error?: string; success?: true }>, okTexto: string) {
    setOcupado(clave);
    setMensaje(null);
    const r = await fn();
    setOcupado(null);
    if (r.error) {
      setMensaje({ ok: false, texto: r.error });
      return;
    }
    setMensaje({ ok: true, texto: okTexto });
    router.refresh();
  }

  const bloqueCatalogo = (clave: "sedes" | "areas" | "categorias", titulo: string, valor: string, set: (v: string) => void) => (
    <div className="space-y-2">
      <Label htmlFor={`cat-${clave}`}>{titulo}</Label>
      <Textarea id={`cat-${clave}`} rows={8} value={valor} onChange={(e) => set(e.target.value)} />
      <Button
        size="sm"
        disabled={ocupado !== null}
        onClick={() => void guardar(clave, () => guardarCatalogoTickets(clave, lineas(valor)), `${titulo} guardadas.`)}
      >
        {ocupado === clave ? "Guardando…" : "Guardar"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {mensaje && (
        <Alert>
          <AlertDescription className={mensaje.ok ? "" : "text-destructive"}>{mensaje.texto}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catálogos</CardTitle>
          <CardDescription>
            Un nombre por línea. Lo que quites deja de ofrecerse en el formulario, pero los tickets ya creados conservan su valor. No pueden quedar vacíos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {bloqueCatalogo("sedes", "Sedes", sedes, setSedes)}
          {bloqueCatalogo("areas", "Áreas", areas, setAreas)}
          {bloqueCatalogo("categorias", "Categorías", categorias, setCategorias)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SLA de primer contacto</CardTitle>
          <CardDescription>Horas laborales máximas para el primer contacto, según la prioridad (1 a 720).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {(["urgente", "alta", "media", "baja"] as const).map((p) => (
              <div key={p} className="space-y-1">
                <Label htmlFor={`sla-${p}`} className="capitalize">
                  {p}
                </Label>
                <Input
                  id={`sla-${p}`}
                  type="number"
                  min={1}
                  max={720}
                  value={sla[p]}
                  onChange={(e) => setSla({ ...sla, [p]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <Button disabled={ocupado !== null} onClick={() => void guardar("sla", () => guardarSlaTickets(sla), "SLA guardado.")}>
            {ocupado === "sla" ? "Guardando…" : "Guardar SLA"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horario laboral</CardTitle>
          <CardDescription>Solo estas horas cuentan para medir tiempos de respuesta y resolución (hora de Colombia).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {DIAS.map((d) => (
              <label key={d.n} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={dias.includes(d.n)}
                  onChange={(e) => setDias(e.target.checked ? [...dias, d.n] : dias.filter((x) => x !== d.n))}
                />
                {d.etiqueta}
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="h-ini">Apertura</Label>
              <Input id="h-ini" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="h-fin">Cierre</Label>
              <Input id="h-fin" type="time" value={fin} onChange={(e) => setFin(e.target.value)} />
            </div>
          </div>
          <Button disabled={ocupado !== null} onClick={() => void guardar("horario", () => guardarHorarioTickets({ dias, inicio, fin }), "Horario guardado.")}>
            {ocupado === "horario" ? "Guardando…" : "Guardar horario"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensaje adicional</CardTitle>
          <CardDescription>Texto opcional (máx. 500 caracteres) que se muestra en la página de soporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={3} maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <Button disabled={ocupado !== null} onClick={() => void guardar("mensaje", () => guardarMensajeTickets(texto), "Mensaje guardado.")}>
            {ocupado === "mensaje" ? "Guardando…" : "Guardar mensaje"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correos de los gestores</CardTitle>
          <CardDescription>Un correo por línea. Recibirán el aviso de cada ticket nuevo cuando el envío de correo esté activado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={5} value={listaCorreos} onChange={(e) => setListaCorreos(e.target.value)} />
          <Button
            disabled={ocupado !== null}
            onClick={() => void guardar("correos", () => guardarCorreosGestores(lineas(listaCorreos)), "Correos guardados.")}
          >
            {ocupado === "correos" ? "Guardando…" : "Guardar correos"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad mensual de la plataforma</CardTitle>
          <CardDescription>Porcentaje de disponibilidad de cada mes; alimenta el indicador de disponibilidad. Guardar de nuevo un mes lo reemplaza.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="d-anio">Año</Label>
              <Input id="d-anio" type="number" min={2020} max={2100} value={disp.anio} onChange={(e) => setDisp({ ...disp, anio: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-mes">Mes (1-12)</Label>
              <Input id="d-mes" type="number" min={1} max={12} value={disp.mes} onChange={(e) => setDisp({ ...disp, mes: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-pct">Disponibilidad (%)</Label>
              <Input id="d-pct" type="number" step="0.01" min={0} max={100} value={disp.porcentaje} onChange={(e) => setDisp({ ...disp, porcentaje: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-notas">Notas</Label>
              <Input id="d-notas" maxLength={500} value={disp.notas} onChange={(e) => setDisp({ ...disp, notas: e.target.value })} />
            </div>
          </div>
          <Button
            disabled={ocupado !== null || disp.porcentaje === ""}
            onClick={() =>
              void guardar(
                "disp",
                () => guardarDisponibilidad({ anio: disp.anio, mes: disp.mes, porcentaje: Number(disp.porcentaje), notas: disp.notas }),
                "Disponibilidad guardada.",
              )
            }
          >
            {ocupado === "disp" ? "Guardando…" : "Guardar disponibilidad"}
          </Button>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disponibilidad.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                      Todavía no hay meses registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  disponibilidad.map((d) => (
                    <TableRow key={`${d.anio}-${d.mes}`}>
                      <TableCell>
                        {MESES[d.mes - 1]} {d.anio}
                      </TableCell>
                      <TableCell>{d.porcentaje.toFixed(2)}</TableCell>
                      <TableCell>{d.notas ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
