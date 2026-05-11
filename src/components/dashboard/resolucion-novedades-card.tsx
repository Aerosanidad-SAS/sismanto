"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { HelpTrigger } from "@/components/ui/help-trigger";

interface ResumenNovedades {
  total: number;
  cerradas: number;
  abiertas: number;
  promedioHorasResolucion: number;
  pctResueltas: number;
}

interface ResolucionNovedadesCardProps {
  novedades: any[];
  resumen: ResumenNovedades | null;
}

function getSeverityVariant(s: string) {
  if (s === "ALTA") return "destructive";
  if (s === "MEDIA") return "default";
  return "secondary";
}

function getStatusVariant(e: string) {
  if (e === "CERRADO") return "success";
  if (e === "EN_PROCESO") return "default";
  return "destructive";
}

function formatHoras(h: number | null) {
  if (h === null || h === 0) return "—";
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function ResolucionNovedadesCard({
  novedades,
  resumen,
}: ResolucionNovedadesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span title="Listado de novedades en el período" className="inline-flex shrink-0">
            <ClipboardList className="h-5 w-5 text-muted-foreground" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Resolución de novedades</CardTitle>
              <HelpTrigger text="Muestra novedades del período (alineado con filtros globales cuando están activos) y un resumen de cuántas se cerraron, cuántas siguen abiertas y el tiempo medio hasta el cierre." />
            </div>
            <CardDescription>Eficacia en atención de novedades reportadas</CardDescription>
          </div>
        </div>
        {resumen && (
          <div className="grid grid-cols-4 gap-3 pt-2">
            <div>
              <p className="text-xl font-bold">{resumen.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{resumen.cerradas}</p>
              <p className="text-xs text-gray-500">Resueltas</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{resumen.abiertas}</p>
              <p className="text-xs text-gray-500">Abiertas</p>
            </div>
            <div>
              <p className="text-xl font-bold">
                {resumen.promedioHorasResolucion > 0
                  ? formatHoras(resumen.promedioHorasResolucion)
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Prom. resolución</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {novedades.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">
            No hay novedades en el período
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">T. Resolución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {novedades.map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateShort(n.fecha_reporte)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {n.vehicles?.placa || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{n.descripcion}</p>
                    </TableCell>
                    <TableCell className="text-sm">{n.reportado_por}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(n.severidad)}>
                        {n.severidad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(n.estado)}>
                        {n.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {n.estado === "CERRADO"
                        ? formatHoras(n.tiempo_resolucion_horas)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
