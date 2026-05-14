"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/utils";

type VencimientoDocumentoItem = {
  placa: string;
  fecha: string;
  diasRestantes: number;
};

type VencimientoPolizaItem = {
  placa: string;
  costoPolizaAnual: number;
};

interface ProximosVencimientosModalProps {
  total: number;
  soat: VencimientoDocumentoItem[];
  tecnicomecanica: VencimientoDocumentoItem[];
  polizas: VencimientoPolizaItem[];
}

function TablaDocumentos({
  rows,
  emptyText,
}: {
  rows: VencimientoDocumentoItem[];
  emptyText: string;
}) {
  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Fecha vencimiento</TableHead>
            <TableHead className="text-right">Días restantes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={`${item.placa}-${item.fecha}`}>
              <TableCell className="font-medium">{item.placa}</TableCell>
              <TableCell>{formatDateShort(item.fecha)}</TableCell>
              <TableCell className="text-right">{item.diasRestantes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ProximosVencimientosModal({
  total,
  soat,
  tecnicomecanica,
  polizas,
}: ProximosVencimientosModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Próximos vencimientos</CardTitle>
            <HelpTrigger text="Cantidad de vehículos con SOAT o técnico-mecánica que vencen en los próximos 30 días. Haz clic para ver el detalle." />
          </div>
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-left hover:bg-transparent"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
          >
            <div>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">SOAT / técnico-mec. en 30 días</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Próximos vencimientos</DialogTitle>
            <DialogDescription>
              Detalle de documentos próximos a vencer por tipo.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="soat" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-3">
              <TabsTrigger value="soat">SOAT</TabsTrigger>
              <TabsTrigger value="tecnicomecanica">Tecnicomecánica</TabsTrigger>
              <TabsTrigger value="polizas">Pólizas</TabsTrigger>
            </TabsList>

            <TabsContent value="soat" className="space-y-2">
              <TablaDocumentos rows={soat} emptyText="No hay SOAT próximos a vencer en los próximos 30 días." />
            </TabsContent>

            <TabsContent value="tecnicomecanica" className="space-y-2">
              <TablaDocumentos
                rows={tecnicomecanica}
                emptyText="No hay técnico-mecánicas próximas a vencer en los próximos 30 días."
              />
            </TabsContent>

            <TabsContent value="polizas" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                La base actual no guarda fecha de vencimiento de póliza; se muestra el valor anual registrado.
              </p>
              {polizas.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No hay pólizas con costo anual registrado.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Costo anual</TableHead>
                        <TableHead>Fecha vencimiento</TableHead>
                        <TableHead className="text-right">Días restantes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {polizas.map((item) => (
                        <TableRow key={item.placa}>
                          <TableCell className="font-medium">{item.placa}</TableCell>
                          <TableCell>{formatCurrency(item.costoPolizaAnual)}</TableCell>
                          <TableCell>—</TableCell>
                          <TableCell className="text-right">—</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
