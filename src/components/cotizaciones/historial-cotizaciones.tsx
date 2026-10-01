"use client";

import { useState } from "react";
import { FileDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enviarCotizacionCorreo, generarCotizacionPdf, type CotizacionFila } from "@/app/api/actions/cotizaciones";
import { formatoCOP, formatoKm } from "@/lib/cotizacion-ruta";
import { formatoInstante } from "@/lib/fechas";

/** Últimas 50 cotizaciones, con su PDF y reenvío por correo. */
export function HistorialCotizaciones({ cotizaciones }: { cotizaciones: CotizacionFila[] }) {
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function pdf(c: CotizacionFila) {
    setOcupado(c.id);
    const r = await generarCotizacionPdf(c.id);
    setOcupado(null);
    if (!("data" in r) || !r.data) return setMensaje(("error" in r && r.error) || "No se pudo generar el PDF");
    const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(r.data), (x) => x.charCodeAt(0))], { type: "application/pdf" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function correo(c: CotizacionFila) {
    const destino = prompt("Correo al que se envía la cotización:", c.cliente_correo ?? "")?.trim();
    if (!destino) return;
    setOcupado(c.id);
    const r = await enviarCotizacionCorreo(c.id, destino);
    setOcupado(null);
    setMensaje("error" in r && r.error ? r.error : `${c.numero} enviada a ${destino}.`);
  }

  if (cotizaciones.length === 0) return <p className="text-sm text-muted-foreground">Todavía no hay cotizaciones.</p>;
  return (
    <div className="space-y-2">
      {mensaje && <p className="text-sm">{mensaje}</p>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Recorrido</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotizaciones.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.numero}</TableCell>
                <TableCell className="whitespace-nowrap">{formatoInstante(c.created_at, { dateStyle: "short", timeStyle: "short" })}</TableCell>
                <TableCell>{c.cliente_nombre ?? "—"}</TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate" title={`${c.origen} → ${c.destino}`}>
                    {c.origen} → {c.destino}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatoKm(c.distancia_m)}</p>
                </TableCell>
                <TableCell className="text-right font-medium">{formatoCOP(c.total)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" title="PDF" aria-label={`PDF de ${c.numero}`} disabled={ocupado === c.id} onClick={() => void pdf(c)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Enviar por correo" aria-label={`Enviar ${c.numero} por correo`} disabled={ocupado === c.id} onClick={() => void correo(c)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
