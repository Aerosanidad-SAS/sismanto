"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/forms/date-field";
import { ETAPAS_SERVICIO } from "@/lib/validations";
import { filtrosAQuery, type FiltrosServicios } from "@/lib/servicios-lista";
import { FiltroCiudad } from "./filtro-ciudad";
import { cn } from "@/lib/utils";
import { TIPOS_SERVICIO } from "./servicios-tabla";

const TODOS = "__todos__";
const AVANZADOS = ["cliente", "origen", "destino", "cedula"] as const;

const ETIQUETA = "text-[11px] font-medium leading-none text-muted-foreground";

/** Los filtros de mostrarServicios.php en una sola franja: lo de siempre a la vista y el resto bajo «Más filtros». */
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
  const activosAvanzados = AVANZADOS.filter((k) => inicial[k]).length;
  const [masAbierto, setMasAbierto] = useState(activosAvanzados > 0);
  const set = (k: keyof FiltrosServicios, v: string) => setF((prev) => ({ ...prev, [k]: v === TODOS ? "" : v }));
  const hayFiltros = Object.values(inicial).some(Boolean);

  const aplicar = (filtros: FiltrosServicios) => router.push(`/servicios${filtrosAQuery(filtros)}`);

  const selector = (k: keyof FiltrosServicios, placeholder: string, opciones: readonly string[], ancho: string) => (
    <Select value={f[k] || TODOS} onValueChange={(v) => set(k, v)}>
      <SelectTrigger aria-label={placeholder} className={cn("h-8 text-sm", ancho)}>
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
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        aplicar(f);
      }}
    >
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <FiltroCiudad
          valor={f.ciudad ?? ""}
          onChange={(clave) => {
            const siguiente = { ...f, ciudad: clave };
            setF(siguiente);
            aplicar(siguiente);
          }}
        />
        <div className="space-y-1">
          <label htmlFor="f-desde" className={cn(ETIQUETA, "block")}>
            Programado desde
          </label>
          <DateField id="f-desde" compact className="w-[9.5rem]" value={f.desde ?? ""} onChange={(v) => set("desde", v)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="f-hasta" className={cn(ETIQUETA, "block")}>
            Programado hasta
          </label>
          <DateField id="f-hasta" compact className="w-[9.5rem]" value={f.hasta ?? ""} onChange={(v) => set("hasta", v)} />
        </div>
        <div className="space-y-1">
          <span className={cn(ETIQUETA, "block")}>Tipo de servicio</span>
          {selector("tipo", "Tipo", TIPOS_SERVICIO, "w-44")}
        </div>
        <div className="space-y-1">
          <span className={cn(ETIQUETA, "block")}>Etapa</span>
          {selector("etapa", "Etapa", ETAPAS_SERVICIO, "w-36")}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1.5 px-3 text-sm"
          aria-expanded={masAbierto}
          onClick={() => setMasAbierto((v) => !v)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Más filtros{activosAvanzados > 0 ? ` (${activosAvanzados})` : ""}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", masAbierto && "rotate-180")} />
        </Button>
        <div className="ml-auto flex gap-2">
          {hayFiltros && (
            <Button type="button" variant="outline" className="h-8 px-3 text-sm" onClick={() => router.push("/servicios")}>
              Limpiar
            </Button>
          )}
          <Button type="submit" className="h-8 px-3 text-sm">
            Aplicar filtros
          </Button>
        </div>
      </div>

      {masAbierto && (
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2 border-t pt-2">
          <div className="space-y-1">
            <span className={cn(ETIQUETA, "block")}>Cliente</span>
            {selector("cliente", "Cliente", clientes, "w-52")}
          </div>
          <div className="space-y-1">
            <span className={cn(ETIQUETA, "block")}>Ciudad de origen</span>
            {selector("origen", "Origen", origenes, "w-44")}
          </div>
          <div className="space-y-1">
            <span className={cn(ETIQUETA, "block")}>Ciudad de destino</span>
            {selector("destino", "Destino", destinos, "w-44")}
          </div>
          <div className="space-y-1">
            <label htmlFor="f-cedula" className={cn(ETIQUETA, "block")}>
              Cédula
            </label>
            <Input
              id="f-cedula"
              inputMode="numeric"
              placeholder="Buscar cédula"
              className="h-8 w-40 text-sm"
              value={f.cedula ?? ""}
              onChange={(e) => set("cedula", e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  );
}
