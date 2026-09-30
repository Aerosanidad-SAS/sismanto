"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatoDia } from "@/lib/fechas";
import type {
  HMT,
  InformeAcm,
  InformeAerocivil,
  InformePae,
  InformePme,
  TablaCantidad,
  TablaHMT,
} from "@/lib/informes-captacion";

const INFORMES = ["acm", "aerocivil", "pme", "pae"] as const;
type Informe = (typeof INFORMES)[number];

interface Props {
  filtros: { desde: string; hasta: string; aeropuerto: string };
  informeInicial?: string;
  aeropuertos: string[];
  acm: InformeAcm;
  aerocivil: InformeAerocivil;
  pme: InformePme;
  pae: InformePae;
}

// Al imprimir solo sale el informe: se ocultan el menú lateral, la barra móvil y el espacio que reserva el menú.
const ESTILO_IMPRESION = `@media print {
  aside, header { display: none !important; }
  div:has(> main) { padding-left: 0 !important; }
  main { padding: 0 !important; }
}`;

export function InformesCaptacion({ filtros, informeInicial, aeropuertos, acm, aerocivil, pme, pae }: Props) {
  const router = useRouter();
  const [desde, setDesde] = useState(filtros.desde);
  const [hasta, setHasta] = useState(filtros.hasta);
  const [aeropuerto, setAeropuerto] = useState(filtros.aeropuerto);
  const [informe, setInforme] = useState<Informe>(
    INFORMES.includes(informeInicial as Informe) ? (informeInicial as Informe) : "acm"
  );

  function aplicar() {
    const p = new URLSearchParams({ informe, desde, hasta });
    if (aeropuerto.trim()) p.set("aeropuerto", aeropuerto.trim());
    router.push(`/captacion/informes?${p}`);
  }

  const periodo = `Del ${formatoDia(filtros.desde)} al ${formatoDia(filtros.hasta)} — ${filtros.aeropuerto || "todos los aeropuertos"}`;

  return (
    <div className="space-y-6">
      <style>{ESTILO_IMPRESION}</style>

      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="space-y-1">
          <Label htmlFor="inf-desde">Desde</Label>
          <Input id="inf-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="inf-hasta">Hasta</Label>
          <Input id="inf-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="min-w-[16rem] flex-1 space-y-1 sm:flex-none">
          <Label htmlFor="inf-aeropuerto">Aeropuerto</Label>
          <Input
            id="inf-aeropuerto"
            list="inf-aeropuertos"
            placeholder="Todos"
            value={aeropuerto}
            onChange={(e) => setAeropuerto(e.target.value)}
          />
          <datalist id="inf-aeropuertos">
            {aeropuertos.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <Button onClick={aplicar}>Filtrar</Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/captacion">Volver a captaciones</Link>
        </Button>
      </div>

      <Tabs value={informe} onValueChange={(v) => setInforme(v as Informe)}>
        <TabsList className="print:hidden">
          <TabsTrigger value="acm">ACM</TabsTrigger>
          <TabsTrigger value="aerocivil">Aerocivil</TabsTrigger>
          <TabsTrigger value="pme">PME</TabsTrigger>
          <TabsTrigger value="pae">PAE</TabsTrigger>
        </TabsList>

        <TabsContent value="acm" className="space-y-4">
          <Encabezado titulo="Informe ACM — Captación aeroportuaria" periodo={periodo} total={acm.totalPacientes} />
          <InformeAcmVista d={acm} />
        </TabsContent>
        <TabsContent value="aerocivil" className="space-y-4">
          <Encabezado titulo="Informe Aerocivil (GSAP2.2-8-02)" periodo={periodo} total={aerocivil.totalPacientes} />
          <InformeAerocivilVista d={aerocivil} />
        </TabsContent>
        <TabsContent value="pme" className="space-y-4">
          <Encabezado titulo="Informe PME — Procedimientos médicos y de enfermería" periodo={periodo} total={pme.total} rotulo="Procedimientos" />
          <TablaConteo titulo="Procedimiento" filas={pme.conteo} total={pme.total} />
        </TabsContent>
        <TabsContent value="pae" className="space-y-4">
          <Encabezado titulo="Informe PAE — Pacientes atendidos por empresa" periodo={periodo} total={pae.totalGeneral.TOTAL} />
          <InformePaeVista d={pae} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Encabezado({ titulo, periodo, total, rotulo = "Pacientes atendidos" }: { titulo: string; periodo: string; total: number; rotulo?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{periodo}</p>
      </div>
      <div className="rounded-md bg-primary px-4 py-2 text-lg font-semibold text-primary-foreground">
        {rotulo}: {total}
      </div>
    </div>
  );
}

const CELDA = "border border-border px-2 py-1";
const NUM = `${CELDA} w-12 text-center tabular-nums`;

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="break-inside-avoid overflow-hidden rounded-md border border-border bg-card">
      <h3 className="bg-primary px-2 py-1.5 text-center text-xs font-semibold uppercase text-primary-foreground">{titulo}</h3>
      {children}
    </div>
  );
}

function TablaHmt({ titulo, filas, extra }: { titulo: string; filas: TablaHMT; extra?: TablaHMT }) {
  const total = Object.values(filas).reduce<HMT>((a, c) => ({ H: a.H + c.H, M: a.M + c.M, T: a.T + c.T }), { H: 0, M: 0, T: 0 });
  return (
    <Tarjeta titulo={titulo}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted">
            <th className={CELDA} />
            <th className={NUM}>H</th>
            <th className={NUM}>M</th>
            <th className={NUM}>T</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filas).map(([etiqueta, c]) => (
            <tr key={etiqueta}>
              <td className={CELDA}>{etiqueta}</td>
              <td className={NUM}>{c.H}</td>
              <td className={NUM}>{c.M}</td>
              <td className={NUM}>{c.T}</td>
            </tr>
          ))}
          {extra &&
            Object.entries(extra).map(([etiqueta, c]) => (
              <tr key={etiqueta}>
                <td className={`${CELDA} pl-4`}>↳ {etiqueta}</td>
                <td className={NUM}>{c.H}</td>
                <td className={NUM}>{c.M}</td>
                <td className={NUM}>{c.T}</td>
              </tr>
            ))}
          <tr className="bg-muted font-semibold">
            <td className={CELDA}>TOTAL</td>
            <td className={NUM}>{total.H}</td>
            <td className={NUM}>{total.M}</td>
            <td className={NUM}>{total.T}</td>
          </tr>
        </tbody>
      </table>
    </Tarjeta>
  );
}

function TablaConteo({ titulo, filas, total }: { titulo: string; filas: TablaCantidad; total?: number }) {
  const suma = total ?? Object.values(filas).reduce((a, b) => a + b, 0);
  return (
    <Tarjeta titulo={titulo}>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {Object.entries(filas).map(([etiqueta, n]) => (
            <tr key={etiqueta}>
              <td className={CELDA}>{etiqueta}</td>
              <td className={NUM}>{n}</td>
            </tr>
          ))}
          <tr className="bg-muted font-semibold">
            <td className={CELDA}>TOTAL</td>
            <td className={NUM}>{suma}</td>
          </tr>
        </tbody>
      </table>
    </Tarjeta>
  );
}

const GRILLA = "grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3";

function InformeAcmVista({ d }: { d: InformeAcm }) {
  return (
    <div className={GRILLA}>
      <TablaHmt titulo="Tipo de atención" filas={d.tipoAtencion} />
      <TablaHmt titulo="Resultado autorización de vuelo" filas={d.resultadoAutorizacion} />
      <TablaHmt titulo="Condición" filas={d.condicion} />
      <TablaHmt titulo="Condición accidente de tránsito" filas={d.condicionTransito} />
      <TablaHmt titulo="Identidad" filas={d.identidad} />
      <TablaHmt titulo="Accidentes especiales" filas={d.accidentesEspeciales} />
      <TablaHmt titulo="Grupo etáreo" filas={d.grupoEtareo} />
      <TablaHmt titulo="Notificación obligatoria" filas={d.notificacionObligatoria} />
      <TablaHmt titulo="Tipo de vuelo" filas={d.tipoVuelo} />
      <TablaConteo titulo="Patología por sistema" filas={d.patologiaSistema} />
      <TablaConteo titulo="Otras patologías" filas={d.otraPatologia} />
      <TablaConteo titulo="Post operatorios" filas={d.postOperatorio} />
      <TablaConteo titulo="Emergencias" filas={d.emergencias} />
    </div>
  );
}

function FilaDatos({ columnas }: { columnas: [string, number][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted">
            {columnas.map(([c]) => (
              <th key={c} className={CELDA}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columnas.map(([c, n]) => (
              <td key={c} className={`${CELDA} text-center tabular-nums`}>
                {n}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function InformeAerocivilVista({ d }: { d: InformeAerocivil }) {
  const vuelos: TablaHMT = { "Vuelo comercial": d.vueloComercial, "Vuelo ambulancia": d.vueloAmbulancia };
  return (
    <div className="space-y-4">
      <FilaDatos
        columnas={[
          ["Servicio médico", d.totalServicio],
          ["Externos", d.totalExterno],
          ["Total", d.totalServicio + d.totalExterno],
        ]}
      />
      <FilaDatos
        columnas={[
          ["Hombres", d.hombres],
          ["Mujeres", d.mujeres],
          ["Pasajeros", d.pasajeros],
          ["Tripulantes", d.tripulantes],
          ["Empleados aeropuerto", d.empleados],
          ["Accidentes", d.accidentes],
          ["Enfermos", d.enfermos],
          ["Remisiones", d.remisiones],
          ["Visitantes", d.visitantes],
        ]}
      />
      <FilaDatos
        columnas={[
          ["Inyecciones", d.inyecciones],
          ["Curaciones", d.curaciones],
          ["Silla de ruedas", d.sillaRuedas],
          ["Ambulancia", d.ambulancia],
        ]}
      />
      <div className={GRILLA}>
        <TablaConteo titulo="Patologías" filas={d.patologias} />
        <TablaHmt titulo="Tipo de vuelo" filas={vuelos} />
        <TablaHmt titulo="Grupo etáreo" filas={d.grupoEtareo} />
      </div>
    </div>
  );
}

function InformePaeVista({ d }: { d: InformePae }) {
  const empresas = Object.entries(d.conteo);
  if (empresas.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay aerolíneas activas en el catálogo.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-3xl border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            <th className={`${CELDA} text-left`}>Aerolínea / entidad</th>
            <th className={NUM}>Empleados</th>
            <th className={NUM}>Pasajeros</th>
            <th className={NUM}>Total</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map(([empresa, c]) => (
            <tr key={empresa}>
              <td className={CELDA}>{empresa}</td>
              <td className={NUM}>{c.EMPLEADOS}</td>
              <td className={NUM}>{c.PASAJEROS}</td>
              <td className={NUM}>{c.TOTAL}</td>
            </tr>
          ))}
          <tr className="bg-muted font-semibold">
            <td className={CELDA}>TOTAL</td>
            <td className={NUM}>{d.totalGeneral.EMPLEADOS}</td>
            <td className={NUM}>{d.totalGeneral.PASAJEROS}</td>
            <td className={NUM}>{d.totalGeneral.TOTAL}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        El total de cada empresa incluye todas sus captaciones (tripulantes, visitantes y demás), no solo empleados y pasajeros.
      </p>
    </div>
  );
}
