"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { previsualizarDestinatariosBase } from "@/app/api/actions/campanas";
import { descargarPlantilla, leerHoja } from "@/lib/campanas-excel";
import { FUENTES_BASE, crudosDesdeHoja, type DestinatarioCrudo, type FuenteBase } from "@/lib/campanas-destinatarios";

/** Lo que el panel necesita para crear la campaña según el origen elegido. */
export type OrigenDestinatarios =
  | { tipo: "texto"; texto: string }
  | { tipo: "excel"; destinatarios: DestinatarioCrudo[] }
  | { tipo: "base"; fuente: FuenteBase; ciudad: string; mapeo: string[] };

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Botones-casilla que guardan el ORDEN en que se eligen las variables ({{1}}, {{2}}…). */
function SelectorVariables({
  opciones,
  elegidas,
  onChange,
}: {
  opciones: { valor: string; etiqueta: string }[];
  elegidas: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>Variables de la plantilla (en orden)</Label>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const pos = elegidas.indexOf(o.valor);
          return (
            <Button
              key={o.valor}
              type="button"
              size="sm"
              variant={pos >= 0 ? "default" : "outline"}
              aria-pressed={pos >= 0}
              onClick={() => onChange(pos >= 0 ? elegidas.filter((x) => x !== o.valor) : [...elegidas, o.valor])}
            >
              {pos >= 0 ? `{{${pos + 1}}} ` : ""}
              {o.etiqueta}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Elige, en el orden de la plantilla, qué dato va en {"{{1}}"}, {"{{2}}"}… Sin elegir ninguno, la plantilla no lleva variables.</p>
    </div>
  );
}

export function DestinatariosOrigen({ onChange }: { onChange: (o: OrigenDestinatarios) => void }) {
  const [origen, setOrigen] = useState<"texto" | "pacientes" | "clientes" | "excel">("texto");
  const [texto, setTexto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [mapeoBase, setMapeoBase] = useState<string[]>([]);
  const [vista, setVista] = useState<string | null>(null);
  const [errorVista, setErrorVista] = useState<string | null>(null);
  const [cargandoVista, setCargandoVista] = useState(false);

  const [archivo, setArchivo] = useState<string | null>(null);
  const [hoja, setHoja] = useState<{ encabezados: string[]; filas: Record<string, unknown>[] } | null>(null);
  const [mapeoExcel, setMapeoExcel] = useState<string[]>([]);
  const [errorExcel, setErrorExcel] = useState<string | null>(null);

  const excel = hoja ? crudosDesdeHoja(hoja.encabezados, hoja.filas, mapeoExcel) : null;

  // El panel se entera de cada cambio.
  useEffect(() => {
    if (origen === "texto") onChange({ tipo: "texto", texto });
    else if (origen === "excel") onChange({ tipo: "excel", destinatarios: excel && excel.ok ? excel.crudos : [] });
    else onChange({ tipo: "base", fuente: origen, ciudad, mapeo: mapeoBase });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `excel` se recalcula en cada render; sus entradas están en la lista
  }, [origen, texto, ciudad, mapeoBase, hoja, mapeoExcel]);

  const cambiarOrigen = (o: typeof origen) => {
    setOrigen(o);
    setVista(null);
    setErrorVista(null);
    setMapeoBase([]);
  };

  const elegirArchivo = async (f: File | null) => {
    setErrorExcel(null);
    setHoja(null);
    setMapeoExcel([]);
    setArchivo(null);
    if (!f) return;
    try {
      const h = await leerHoja(await f.arrayBuffer(), f.name);
      setHoja(h);
      setArchivo(f.name);
    } catch (e) {
      setErrorExcel(e instanceof Error ? e.message : "No se pudo leer el archivo");
    }
  };

  const verVistaPrevia = async () => {
    if (origen !== "pacientes" && origen !== "clientes") return;
    setCargandoVista(true);
    setVista(null);
    setErrorVista(null);
    const res = await previsualizarDestinatariosBase({ fuente: origen, ciudad, mapeo: mapeoBase });
    setCargandoVista(false);
    if ("error" in res && res.error) {
      setErrorVista(res.error);
      return;
    }
    if ("total" in res) {
      setVista(
        `${res.total} destinatarios con celular válido (de ${res.registros} registros). ${res.resumen ?? ""} Muestra: ${res.muestra
          .map((m) => `${m.telefono}${m.nombre ? ` · ${m.nombre}` : ""}`)
          .join("; ")}.`
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="origen-destinatarios">Origen de los destinatarios *</Label>
        <select id="origen-destinatarios" className={CLASE_SELECT} value={origen} onChange={(e) => cambiarOrigen(e.target.value as typeof origen)}>
          <option value="texto">Escribir o pegar una lista</option>
          <option value="pacientes">Pacientes activos (base de datos)</option>
          <option value="clientes">Clientes activos (base de datos)</option>
          <option value="excel">Subir un Excel (.xlsx)</option>
        </select>
      </div>

      {origen === "texto" && (
        <div className="space-y-1">
          <Textarea
            rows={8}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Destinatarios"
            placeholder={"3001234567;Juan Pérez;Juan|mañana 8am\n3109876543;Ana Gómez;Ana|tarde 2pm"}
          />
          <p className="text-xs text-muted-foreground">
            Una línea por destinatario: <code>telefono;nombre;param1|param2</code>. Celulares colombianos de 10 dígitos: el indicativo 57 se agrega solo.
          </p>
        </div>
      )}

      {(origen === "pacientes" || origen === "clientes") && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="space-y-1">
            <Label htmlFor="ciudad-base">Ciudad (opcional)</Label>
            <Input id="ciudad-base" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Todas las ciudades" />
          </div>
          <SelectorVariables
            opciones={Object.entries(FUENTES_BASE[origen].columnas).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
            elegidas={mapeoBase}
            onChange={setMapeoBase}
          />
          <p className="text-xs text-muted-foreground">
            Se envía solo a registros <strong>activos</strong> con celular válido; los repetidos se envían una sola vez. Usa esta opción
            únicamente con personas que <strong>autorizaron ser contactadas</strong> por este medio (Ley 1581 de 2012).
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={verVistaPrevia} disabled={cargandoVista}>
              {cargandoVista ? "Calculando…" : "Ver cuántos son"}
            </Button>
          </div>
          {vista && (
            <p className="text-sm" role="status">
              {vista}
            </p>
          )}
          {errorVista && (
            <p className="text-sm text-destructive" role="alert">
              {errorVista}
            </p>
          )}
        </div>
      )}

      {origen === "excel" && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input type="file" accept=".xlsx" aria-label="Archivo Excel" className="max-w-xs" onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)} />
            <Button type="button" variant="ghost" size="sm" onClick={() => descargarPlantilla()}>
              Descargar plantilla
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">La primera fila son los encabezados; debe haber una columna <code>telefono</code> (o celular / whatsapp). Máximo 5 MB y 5.000 filas.</p>
          {errorExcel && (
            <p className="text-sm text-destructive" role="alert">
              {errorExcel}
            </p>
          )}
          {hoja && (
            <>
              <SelectorVariables
                opciones={hoja.encabezados.map((h) => ({ valor: h, etiqueta: h }))}
                elegidas={mapeoExcel}
                onChange={setMapeoExcel}
              />
              {excel && !excel.ok && (
                <p className="text-sm text-destructive" role="alert">
                  {excel.error}
                </p>
              )}
              {excel && excel.ok && (
                <p className="text-sm" role="status">
                  {archivo}: {excel.crudos.length} filas leídas (teléfono en la columna «{excel.columnaTelefono}»). Los teléfonos inválidos y repetidos se omiten al crear.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
