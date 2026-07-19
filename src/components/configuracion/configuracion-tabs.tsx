"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { VehiculosTab } from "./vehiculos-tab";
import { CentrosTab } from "./centros-tab";
import { ProveedoresTab } from "./proveedores-tab";
import { CargaMasivaTab } from "./carga-masiva-tab";
import { ServiciosTab } from "./servicios-tab";
import { ClientesTab, type ClienteRow } from "./clientes-tab";
import type { OperationalCenter, Supplier } from "@/types";

interface ConfiguracionTabsProps {
  vehicles: any[];
  centros: OperationalCenter[];
  proveedores: Supplier[];
  clientes: ClienteRow[];
  serviceTypes: Array<{ id: number; codigo: string; nombre: string; activo: boolean; orden: number }>;
}

const tabItems = [
  { id: "vehiculos", label: "Vehículos" },
  { id: "centros", label: "Centros de Operaciones" },
  { id: "proveedores", label: "Proveedores" },
  { id: "clientes", label: "Clientes" },
  { id: "servicios", label: "Servicios prestados" },
  { id: "carga", label: "Carga Masiva" },
];

export function ConfiguracionTabs({
  vehicles,
  centros,
  proveedores,
  clientes,
  serviceTypes,
}: ConfiguracionTabsProps) {
  return (
    <Tabs.Root defaultValue="vehiculos">
      <Tabs.List className="flex border-b border-gray-200 mb-6">
        {tabItems.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            )}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="vehiculos">
        <VehiculosTab vehicles={vehicles} centros={centros} />
      </Tabs.Content>

      <Tabs.Content value="centros">
        <CentrosTab centros={centros} />
      </Tabs.Content>

      <Tabs.Content value="proveedores">
        <ProveedoresTab proveedores={proveedores} />
      </Tabs.Content>

      <Tabs.Content value="clientes">
        <ClientesTab clientes={clientes} />
      </Tabs.Content>

      <Tabs.Content value="servicios">
        <ServiciosTab initialTypes={serviceTypes} />
      </Tabs.Content>

      <Tabs.Content value="carga">
        <CargaMasivaTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}
