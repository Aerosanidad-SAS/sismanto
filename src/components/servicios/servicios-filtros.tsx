"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETAPAS_SERVICIO } from "@/lib/validations";
import { filtrosAQuery, type FiltrosServicios } from "@/lib/servicios-lista";
import { TIPOS_SERVICIO } from "./servicios-tabla";

const TODOS = "__todos__";

/** Los filtros de mostrarServicios.php; se aplican con el botón, como en SISRES. */
export function ServiciosFiltros({
  inicial,
  clientes,
  origenes,
  destinos,
}: {
  inicial: FiltrosServicios;
  clientes: string[];
  origenes: string[];
  destinos: string[];
}) {
  const router = useRouter();
  const [f, setF] = useState<FiltrosServicios>(inicial);
  const set = (k: keyof FiltrosServicios, v: string) => setF((prev) => ({ ...prev, [k]: v === TODOS ? "" : v }));
  const hayFiltros = Object.values(inicial).some(Boolean);

  const selector = (k: keyof FiltrosServicios, placeholder: string, opciones: readonly string[]) => (
    <Select value={f[k] || TODOS} onValueChange={(v) => set(k, v)}>
      <SelectTrigger aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{placeholder}: todos</SelectItem>
        {opciones.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/servicios${filtrosAQuery(f)}`);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="f-desde" className="text-xs">
            Programado desde
          </Label>
          <Input id="f-desde" type="date" value={f.desde ?? ""} onChange={(e) => set("desde", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-hasta" className="text-xs">
            Programado hasta
          </Label>
          <Input id="f-hasta" type="date" value={f.hasta ?? ""} onChange={(e) => set("hasta", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tipo de servicio</Label>
          {selector("tipo", "Tipo", TIPOS_SERVICIO)}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Etapa</Label>
          {selector("etapa", "Etapa", ETAPAS_SERVICIO)}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cliente</Label>
          {selector("cliente", "Cliente", clientes)}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ciudad de origen</Label>
          {selector("origen", "Origen", origenes)}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ciudad de destino</Label>
          {selector("destino", "Destino", destinos)}
        </div>
        <div className="space-y-1">
          <Label htmlFor="f-cedula" className="text-xs">
            Cédula
          </Label>
          <Input
            id="f-cedula"
            inputMode="numeric"
            placeholder="Buscar cédula"
            value={f.cedula ?? ""}
            onChange={(e) => set("cedula", e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {hayFiltros && (
          <Button type="button" variant="outline" onClick={() => router.push("/servicios")}>
            Limpiar
          </Button>
        )}
        <Button type="submit">Aplicar filtros</Button>
      </div>
    </form>
  );
}
