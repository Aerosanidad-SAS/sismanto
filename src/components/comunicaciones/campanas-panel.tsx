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
import { crearCampana, crearCampanaDesdeBase, procesarLoteCampana } from "@/app/api/actions/campanas";
import { DestinatariosOrigen, type OrigenDestinatarios } from "@/components/comunicaciones/destinatarios-origen";

export interface CampanaRow {
  id: number;
  nombre: string;
  plantilla: string;
  idioma: string;
  estado: string;
  total_destinatarios: number;
  total_enviados: number;
  total_fallidos: number;
  created_at: string;
}

const ESTADO_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  BORRADOR: "outline",
  EN_PROCESO: "default",
  COMPLETADA: "success",
  CANCELADA: "destructive",
};

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
  const [origen, setOrigen] = useState<OrigenDestinatarios>({ tipo: "texto", texto: "" });
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);

  const crear = async () => {
    setError(null);

    let res: { error?: string; resumen?: string | null };
    setGuardando(true);
    if (origen.tipo === "base") {
      res = await crearCampanaDesdeBase({ nombre, plantilla, idioma, fuente: origen.fuente, ciudad: origen.ciudad, mapeo: origen.mapeo });
    } else if (origen.tipo === "excel") {
      if (origen.destinatarios.length === 0) {
        setGuardando(false);
        setError("Sube un Excel válido con al menos un destinatario");
        return;
      }
      res = await crearCampana({ nombre, plantilla, idioma, destinatarios: origen.destinatarios }, { omitirInvalidos: true });
    } else {
      // Formato: una línea por destinatario → telefono;nombre;param1|param2|param3
      const destinatarios = origen.texto
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
        setGuardando(false);
        setError("Agrega al menos un destinatario (una línea por teléfono)");
        return;
      }
      res = await crearCampana({ nombre, plantilla, idioma, destinatarios });
    }
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setAviso(res.resumen ?? null);
    setDialogOpen(false);
    setNombre("");
    setPlantilla("");
    setOrigen({ tipo: "texto", texto: "" });
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
      if (restantes === 0) break;
    }
    setProcesandoId(null);
    setProgreso(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {aviso && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800" role="status">
          Campaña creada. {aviso}
        </p>
      )}
      {puedeEditar && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>Nueva campaña</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Plantilla</TableHead>
              <TableHead>Destinatarios</TableHead>
              <TableHead>Enviados / Fallidos</TableHead>
              <TableHead>Estado</TableHead>
              {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {campanas.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeEditar ? 7 : 6} className="text-center text-muted-foreground">
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
                <TableCell>
                  <Badge variant={ESTADO_BADGE[c.estado] ?? "outline"}>{c.estado.replace("_", " ")}</Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell className="text-right">
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
              La plantilla debe existir y estar aprobada en el WhatsApp Business Manager. Elige de dónde salen los destinatarios.
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
            <DestinatariosOrigen onChange={setOrigen} />

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
