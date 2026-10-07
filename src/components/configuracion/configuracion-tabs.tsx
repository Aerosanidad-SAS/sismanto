"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/components/layout/use-tab-param";
import { VehiculosTab } from "./vehiculos-tab";
import { CentrosTab } from "./centros-tab";
import { ProveedoresTab } from "./proveedores-tab";
import { CargaMasivaTab } from "./carga-masiva-tab";
import { ServiciosTab } from "./servicios-tab";
import { ClientesTab, type ClienteRow } from "./clientes-tab";
import { MarcaTab } from "./marca-tab";
import type { OperationalCenter, Supplier } from "@/types";

interface ConfiguracionTabsProps {
  vehicles: any[];
  centros: OperationalCenter[];
  proveedores: Supplier[];
  clientes: ClienteRow[];
  serviceTypes: Array<{ id: number; codigo: string; nombre: string; activo: boolean; orden: number }>;
  logoUrl: string | null;
  esAdmin: boolean;
}

const tabItems = [
  { id: "vehiculos", label: "Vehículos" },
  { id: "centros", label: "Centros de Operaciones" },
  { id: "proveedores", label: "Proveedores" },
  { id: "clientes", label: "Clientes" },
  { id: "servicios", label: "Servicios prestados" },
  { id: "carga", label: "Carga Masiva" },
  { id: "marca", label: "Marca" },
];

export function ConfiguracionTabs({
  vehicles,
  centros,
  proveedores,
  clientes,
  serviceTypes,
  logoUrl,
  esAdmin,
}: ConfiguracionTabsProps) {
  const [tab, setTab] = useTabParam(
    tabItems.map((t) => t.id),
    "vehiculos"
  );

  return (
    <Tabs value={tab} onValueChange={setTab}>
      {/* En móvil las 7 pestañas no caben: la barra se desplaza en horizontal en vez de cortarse. */}
      <TabsList className="mb-4 flex h-auto w-full justify-start overflow-x-auto">
        {tabItems.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="shrink-0 px-4 py-2">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="vehiculos">
        <VehiculosTab vehicles={vehicles} centros={centros} />
      </TabsContent>

      <TabsContent value="centros">
        <CentrosTab centros={centros} />
      </TabsContent>

      <TabsContent value="proveedores">
        <ProveedoresTab proveedores={proveedores} />
      </TabsContent>

      <TabsContent value="clientes">
        <ClientesTab clientes={clientes} puedeEliminar={esAdmin} />
      </TabsContent>

      <TabsContent value="servicios">
        <ServiciosTab initialTypes={serviceTypes} />
      </TabsContent>

      <TabsContent value="carga">
        <CargaMasivaTab />
      </TabsContent>

      <TabsContent value="marca">
        <MarcaTab logoUrl={logoUrl} puedeEditar={esAdmin} />
      </TabsContent>
    </Tabs>
  );
}
