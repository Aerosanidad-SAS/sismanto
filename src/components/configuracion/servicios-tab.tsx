"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createServiceType } from "@/app/api/actions/service-revenue";

interface ServiceTypeRow {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export function ServiciosTab({ initialTypes }: { initialTypes: ServiceTypeRow[] }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createServiceType({ codigo, nombre });
    setBusy(false);
    if (res && "error" in res && res.error) setError(res.error);
    else {
      setCodigo("");
      setNombre("");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tipos de servicio (prestación)</CardTitle>
          <CardDescription>
            Códigos para cruzar con facturación y construir el indicador beneficio vs costos (B/C).
            Valores semilla: TAB, TAM, MD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-3 items-end">
            <div>
              <Label htmlFor="st-codigo">Código</Label>
              <Input
                id="st-codigo"
                className="mt-1 uppercase"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="EJ: TAB"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="st-nombre">Nombre</Label>
              <Input
                id="st-nombre"
                className="mt-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Descripción del tipo de servicio"
              />
            </div>
            {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
            <Button type="submit" disabled={busy} className="md:col-span-3 w-fit">
              {busy ? "Guardando…" : "Agregar tipo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo actual</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTypes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono">{t.codigo}</TableCell>
                  <TableCell>{t.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={t.activo ? "success" : "secondary"}>
                      {t.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {initialTypes.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              Aplique la migración <code className="text-xs bg-muted px-1 rounded">006_mantenimiento_flota_ovem.sql</code>{" "}
              para crear la tabla y los tipos por defecto.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
