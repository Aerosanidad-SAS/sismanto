"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DashboardTabDef {
  key: string;
  label: string;
  /** Ya renderizado (p. ej. `<Truck className="h-4 w-4" aria-hidden />`), no el componente sin invocar:
   * un componente de ícono sin renderizar no se puede pasar de un Server Component a uno de cliente. */
  icon?: ReactNode;
  content: ReactNode;
}

/**
 * Barra de pestañas compartida por Dashboard y Tablero ejecutivo (una por área: Vehículos y Operación,
 * Servicios, Biomédicos, Financiero). Cada página arma su propia lista ya filtrada por rol y con el
 * contenido ya resuelto server-side; este componente solo decide cómo mostrarlo.
 * Igual que el resto del proyecto (ProximosVencimientosModal, EquiposTabla…), todo el contenido de cada
 * pestaña ya está montado en el DOM — Radix solo cambia qué se ve, no hay carga diferida por pestaña.
 * Si al rol le queda una sola pestaña visible, se muestra ese contenido directo, sin la barra.
 */
export function DashboardTabs({ tabs, defaultTab }: { tabs: DashboardTabDef[]; defaultTab?: string }) {
  if (tabs.length === 0) return null;
  if (tabs.length === 1) return <>{tabs[0].content}</>;

  const inicial = tabs.some((t) => t.key === defaultTab) ? defaultTab : tabs[0].key;

  return (
    <Tabs defaultValue={inicial} className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-1">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
            {t.icon}
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-0 space-y-8">
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
