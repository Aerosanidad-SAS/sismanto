"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export type MantenimientoFiltrosIniciales = {
  placa?: string;
  desde?: string;
  hasta?: string;
  categoria?: string;
  tipo?: string;
  proveedor?: string;
  factura?: string;
};

const TIPOS_ALL = "__all__";

export function MantenimientoFiltrosForm({ inicial }: { inicial: MantenimientoFiltrosIniciales }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [placa, setPlaca] = useState(inicial.placa ?? "");
  const [desde, setDesde] = useState(inicial.desde ?? "");
  const [hasta, setHasta] = useState(inicial.hasta ?? "");
  const [categoria, setCategoria] = useState(inicial.categoria ?? "");
  const [tipo, setTipo] = useState<string>(inicial.tipo ?? "");
  const [proveedor, setProveedor] = useState(inicial.proveedor ?? "");
  const [factura, setFactura] = useState(inicial.factura ?? "");

  const aplicar = () => {
    const qs = new URLSearchParams();
    if (placa.trim()) qs.set("mPlaca", placa.trim());
    if (desde.trim()) qs.set("mDesde", desde.trim());
    if (hasta.trim()) qs.set("mHasta", hasta.trim());
    if (categoria.trim()) qs.set("mCat", categoria.trim());
    if (tipo && tipo !== TIPOS_ALL) qs.set("mTipo", tipo);
    if (proveedor.trim()) qs.set("mProv", proveedor.trim());
    if (factura.trim()) qs.set("mFac", factura.trim());

    startTransition(() => router.push(`/mantenimientos${qs.toString() ? `?${qs.toString()}` : ""}`));
  };

  const limpiar = () => {
    setPlaca("");
    setDesde("");
    setHasta("");
    setCategoria("");
    setTipo("");
    setProveedor("");
    setFactura("");
    startTransition(() => router.push("/mantenimientos"));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Filtros compuestos (se combinan todos los que llene).
      </p>
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-7 items-end">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Placa</Label>
          <Input placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Categoría</Label>
          <Input
            placeholder="Categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select value={tipo || TIPOS_ALL} onValueChange={(v) => setTipo(v === TIPOS_ALL ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TIPOS_ALL}>Todos los tipos</SelectItem>
              <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
              <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Proveedor</Label>
          <Input
            placeholder="Proveedor"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Factura</Label>
          <Input placeholder="Factura" value={factura} onChange={(e) => setFactura(e.target.value)} className="h-9" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={aplicar} disabled={pending}>
          {pending ? "Buscando…" : "Aplicar"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={limpiar}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
