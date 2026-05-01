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
import type { DisponibilidadVehiculo } from "@/types";
import { Activity } from "lucide-react";

interface DisponibilidadCardProps {
  datos: DisponibilidadVehiculo[];
}

function DisponibilidadBadge({ pct, cumple }: { pct: number; cumple: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        cumple
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${cumple ? "bg-green-600" : "bg-red-600"}`}
      />
      {pct.toFixed(2)}%
    </span>
  );
}

export function DisponibilidadCard({ datos }: DisponibilidadCardProps) {
  const META = 95;
  const cumpleMeta = datos.filter((d) => d.cumpleMeta).length;
  const noCumple = datos.length - cumpleMeta;
  const promedioFlota =
    datos.length > 0
      ? datos.reduce((s, d) => s + d.disponibilidadPct, 0) / datos.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Disponibilidad de Flota</CardTitle>
            <CardDescription>Meta: {META}% — Tiempo laborable 24/7</CardDescription>
          </div>
        </div>
        <div className="flex gap-4 pt-2">
          <div>
            <p className="text-2xl font-bold">{promedioFlota.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Promedio flota</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{cumpleMeta}</p>
              <p className="text-xs text-gray-500">≥{META}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{noCumple}</p>
              <p className="text-xs text-gray-500">&lt;{META}%</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">Sin datos</p>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead className="text-right">Disponibilidad</TableHead>
                  <TableHead className="text-right">TFDS (h)</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos
                  .sort((a, b) => a.disponibilidadPct - b.disponibilidadPct)
                  .map((d) => (
                    <TableRow key={d.vehicleId}>
                      <TableCell className="font-medium">{d.placa}</TableCell>
                      <TableCell className="text-right">
                        <DisponibilidadBadge pct={d.disponibilidadPct} cumple={d.cumpleMeta} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {d.tfdsHoras.toFixed(1)}h
                      </TableCell>
                      <TableCell className="text-right">
                        {d.cumpleMeta ? (
                          <Badge variant="success">Cumple</Badge>
                        ) : (
                          <Badge variant="destructive">No cumple</Badge>
                        )}
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
