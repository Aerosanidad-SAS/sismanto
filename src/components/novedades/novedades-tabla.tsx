"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort } from "@/lib/utils";
import { updateIncidentPrioridad } from "@/app/api/actions/incidents";

function getSeverityBadgeVariant(severidad: string) {
  switch (severidad) {
    case "ALTA":
      return "destructive";
    case "MEDIA":
      return "default";
    case "BAJA":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusBadgeVariant(estado: string) {
  switch (estado) {
    case "CERRADO":
      return "success";
    case "EN_PROCESO":
      return "default";
    case "ABIERTO":
      return "destructive";
    default:
      return "outline";
  }
}

export interface NovedadRow {
  id: number;
  vehicle_id: string;
  fecha_reporte: string;
  descripcion: string;
  severidad: string;
  /** Prioridad administrativa (columna nueva en BD) */
  prioridad?: string | null;
  reportado_por: string;
  estado: string;
  afecta_operatividad: boolean | null;
  fecha_cierre?: string | null;
  vehicles?: { placa: string };
}

interface NovedadesTablaProps {
  novedades: NovedadRow[];
  isAdmin: boolean;
}

export function NovedadesTabla({ novedades, isAdmin }: NovedadesTablaProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  const handlePrioridad = async (incidentId: number, raw: string) => {
    let prioridad: "BAJA" | "MEDIA" | "ALTA" | null;
    if (raw === "__none__") prioridad = null;
    else prioridad = raw as "BAJA" | "MEDIA" | "ALTA";

    setBusyId(incidentId);
    const res = await updateIncidentPrioridad(incidentId, prioridad);
    setBusyId(null);
    if (res.error) alert(res.error);
    else router.refresh();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha Reporte</TableHead>
          <TableHead>Vehículo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Clasif. reporte</TableHead>
          <TableHead>Prioridad (admin)</TableHead>
          <TableHead>Reportado Por</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Afecta Operatividad</TableHead>
          <TableHead>Fecha Cierre</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {novedades.map((novedad) => (
          <TableRow key={novedad.id}>
            <TableCell>{formatDateShort(novedad.fecha_reporte)}</TableCell>
            <TableCell className="font-medium">
              <Link
                href={`/vehiculos/${novedad.vehicle_id}`}
                className="text-primary hover:underline"
              >
                {novedad.vehicles?.placa}
              </Link>
            </TableCell>
            <TableCell className="max-w-md">
              <p className="truncate">{novedad.descripcion}</p>
            </TableCell>
            <TableCell>
              <Badge variant={getSeverityBadgeVariant(novedad.severidad)}>{novedad.severidad}</Badge>
            </TableCell>
            <TableCell className="min-w-[9rem]">
              {isAdmin ? (
                <Select
                  value={novedad.prioridad ?? "__none__"}
                  onValueChange={(v) => handlePrioridad(novedad.id, v)}
                  disabled={busyId === novedad.id}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                  </SelectContent>
                </Select>
              ) : novedad.prioridad ? (
                <Badge variant={getSeverityBadgeVariant(novedad.prioridad)}>{novedad.prioridad}</Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
            <TableCell>{novedad.reportado_por}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(novedad.estado)}>{novedad.estado}</Badge>
            </TableCell>
            <TableCell>
              {novedad.afecta_operatividad ? (
                <Badge variant="destructive">Sí</Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </TableCell>
            <TableCell>
              {novedad.fecha_cierre ? formatDateShort(novedad.fecha_cierre) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
