"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatDateShort } from "@/lib/utils";
import { cancelarCampana, crearCampana, pausarCampana, procesarLoteCampana, reanudarCampana } from "@/app/api/actions/campanas";
import { ESTADOS_SIN_ENVIO, ESTADO_BADGE, accionesDisponibles } from "@/lib/campanas-estado";
import { CampanaAdjuntoExportar, ExportarHistorialCampanas } from "@/components/comunicaciones/campana-adjunto-exportar";

export interface CampanaRow {
  id: number;
  nombre: string;
  plantilla: string;
  idioma: string;
  estado: string;
  total_destinatarios: number;
  total_enviados: number;
  total_fallidos: number;
  total_entregados: number;
  total_leidos: number;
  created_at: string;
  media_nombre?: string | null;
}

interface CampanasPanelProps {
  campanas: CampanaRow[];
  puedeEditar: boolean;
}

export function CampanasPanel({ campanas, puedeEditar }: CampanasPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState("");
  const [idioma, setIdioma] = useState("es_CO");
  const [destinatariosTexto, setDestinatariosTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);

  const crear = async () => {
    setError(null);

    // Formato: una línea por destinatario → telefono;nombre;param1|param2|param3
    const destinatarios = destinatariosTexto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((linea) => {
        const [telefono, nombreDest, params] = linea.split(";").map((p) => p?.trim() ?? "");
        return {
          telefono,
          nombre: nombreDest || undefined,
          parametros: params ? params.split("|").map((p) => p.trim()) : [],
        };
      });

    if (destinatarios.length === 0) {
      setError("Agrega al menos un destinatario (una línea por teléfono)");
      return;
    }

    setGuardando(true);
    const res = await crearCampana({ nombre, plantilla, idioma, destinatarios });
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDialogOpen(false);
    setNombre("");
    setPlantilla("");
    setDestinatariosTexto("");
    router.refresh();
  };

  const procesar = async (campanaId: number) => {
    setProcesandoId(campanaId);
    setProgreso("Enviando lote…");
    // Itera lotes de 50 hasta agotar pendientes (mismo esquema que SISRES)
    for (let i = 0; i < 100; i++) {
      const res = await procesarLoteCampana(campanaId);
      if ("error" in res && res.error) {
        alert(res.error);
        break;
      }
      const restantes = "restantes" in res ? (res.restantes ?? 0) : 0;
      setProgreso(`Enviados ${"procesados" in res ? res.procesados : 0} — quedan ${restantes}`);
      // Se pausó o canceló (desde aquí o desde otra pestaña): el lote ya cortó y el ciclo debe parar.
      if ("estado" in res && (ESTADOS_SIN_ENVIO as readonly string[]).includes(res.estado)) break;
      if (restantes === 0) break;
    }
    setProcesandoId(null);
    setProgreso(null);
    router.refresh();
  };

  /** Pausar, reanudar o cancelar. Al reanudar se vuelven a llamar los lotes. */
  const cambiarEstado = async (c: CampanaRow, accion: "pausar" | "reanudar" | "cancelar") => {
    if (accion === "cancelar" && !confirm(`¿Cancelar la campaña "${c.nombre}"? Los mensajes que no se alcanzaron a enviar ya no se enviarán. No se puede deshacer.`)) return;
    const res = await { pausar: pausarCampana, reanudar: reanudarCampana, cancelar: cancelarCampana }[accion](c.id);
    if ("error" in res && res.error) {
      alert(res.error);
      router.refresh();
      return;
    }
    router.refresh();
    if (accion === "reanudar") await procesar(c.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExportarHistorialCampanas />
      {puedeEditar && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>Nueva campaña</Button>
        </div>
      )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Plantilla</TableHead>
              <TableHead>Destinatarios</TableHead>
              <TableHead>Enviados / Fallidos</TableHead>
              <TableHead>Entregados / Leídos</TableHead>
              <TableHead>Estado</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {campanas.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 8 : 7} className="text-center text-muted-foreground">
                  Sin campañas creadas
                </TableCell>
              </TableRow>
            )}
            {campanas.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{formatDateShort(c.created_at)}</TableCell>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell>
                  {c.plantilla} <span className="text-xs text-muted-foreground">({c.idioma})</span>
                </TableCell>
                <TableCell>{c.total_destinatarios}</TableCell>
                <TableCell>
                  <span className="text-green-600">{c.total_enviados}</span>
                  {" / "}
                  <span className="text-red-600">{c.total_fallidos}</span>
                </TableCell>
                <TableCell title="Según los avisos de WhatsApp (webhook)">
                  {c.total_entregados}
                  {" / "}
                  {c.total_leidos}
                </TableCell>
                <TableCell>
                  <Badge variant={ESTADO_BADGE[c.estado] ?? "outline"}>{c.estado.replace("_", " ")}</Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell className="space-x-2 whitespace-nowrap text-right">
                    <CampanaAdjuntoExportar id={c.id} estado={c.estado} mediaNombre={c.media_nombre} puedeEditar={puedeEditar} />
                    {accionesDisponibles(c.estado).map((a) => (
                      <Button key={a} size="sm" variant="outline" disabled={procesandoId === c.id && a !== "pausar" && a !== "cancelar"} onClick={() => cambiarEstado(c, a)}>
                        {{ pausar: "Pausar", reanudar: "Reanudar", cancelar: "Cancelar" }[a]}
                      </Button>
                    ))}
                    {(c.estado === "BORRADOR" || c.estado === "EN_PROCESO") && (
                      <Button
                        size="sm"
                        disabled={procesandoId !== null}
                        onClick={() => procesar(c.id)}
                      >
                        {procesandoId === c.id ? (progreso ?? "Procesando…") : "Procesar envíos"}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva campaña WhatsApp</DialogTitle>
            <DialogDescription>
              La plantilla debe existir y estar aprobada en el WhatsApp Business Manager. Un
              destinatario por línea con el formato:{" "}
              <code className="text-xs">telefono;nombre;param1|param2</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1 sm:col-span-2">
                <Label>Nombre de la campaña *</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Idioma</Label>
                <Input value={idioma} onChange={(e) => setIdioma(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Plantilla de Meta *</Label>
              <Input
                value={plantilla}
                onChange={(e) => setPlantilla(e.target.value)}
                placeholder="ej: recordatorio_servicio"
              />
            </div>
            <div className="space-y-1">
              <Label>Destinatarios *</Label>
              <Textarea
                rows={8}
                value={destinatariosTexto}
                onChange={(e) => setDestinatariosTexto(e.target.value)}
                placeholder={"3001234567;Juan Pérez;Juan|mañana 8am\n3109876543;Ana Gómez;Ana|tarde 2pm"}
              />
              <p className="text-xs text-muted-foreground">
                Celulares colombianos de 10 dígitos: el indicativo 57 se agrega automáticamente.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crear} disabled={guardando}>
              {guardando ? "Creando…" : "Crear campaña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
