"use client";

// Google Maps JS se carga por <script> sin paquete de tipos: sus objetos se tratan como any.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, FileDown, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crearCotizacion, enviarCotizacionCorreo, generarCotizacionPdf } from "@/app/api/actions/cotizaciones";
import {
  estadoTrafico,
  formatoCOP,
  formatoDuracion,
  formatoKm,
  rutaRecomendada,
  totalCotizacion,
  totalesRuta,
  type TramoRuta,
} from "@/lib/cotizacion-ruta";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: any;
    __initMapsCotizador?: () => void;
  }
}

interface RutaCalculada {
  tramos: TramoRuta[];
  polilinea: string;
}

/** Carga Google Maps JS (con Places) una sola vez por página. */
function cargarGoogleMaps(llave: string): Promise<void> {
  if (window.google?.maps?.DirectionsService) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.__initMapsCotizador = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(llave)}&libraries=places&language=es&region=CO&callback=__initMapsCotizador`;
    s.async = true;
    s.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(s);
  });
}

async function descargarPdf(id: number, imprimir: boolean): Promise<string | null> {
  const r = await generarCotizacionPdf(id);
  if (!("data" in r) || !r.data) return ("error" in r && r.error) || "No se pudo generar el PDF";
  const blob = new Blob([Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0))], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  if (imprimir) {
    window.open(url, "_blank", "noopener");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = r.filename ?? "cotizacion.pdf";
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return null;
}

export function CotizadorRutas({ llave }: { llave: string | null }) {
  const router = useRouter();
  const mapaRef = useRef<HTMLDivElement>(null);
  const mapa = useRef<any>(null);
  const trazos = useRef<any[]>([]);
  const campos = { origen: useRef<HTMLInputElement>(null), intermedio: useRef<HTMLInputElement>(null), destino: useRef<HTMLInputElement>(null) };

  const [listo, setListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(llave ? null : "Falta la llave de Google Maps (Administración → Integraciones).");
  const [valorKm, setValorKm] = useState("");
  const [valorAdicional, setValorAdicional] = useState("0");
  const [cliente, setCliente] = useState("");
  const [correo, setCorreo] = useState("");
  const [notas, setNotas] = useState("");
  const [rutas, setRutas] = useState<RutaCalculada[]>([]);
  const [elegida, setElegida] = useState(0);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [guardada, setGuardada] = useState<{ id: number; numero: string } | null>(null);

  useEffect(() => {
    if (!llave) return;
    let vivo = true;
    cargarGoogleMaps(llave)
      .then(() => {
        if (!vivo || !mapaRef.current) return;
        const g = window.google;
        mapa.current = new g.maps.Map(mapaRef.current, { center: { lat: 4.711, lng: -74.072 }, zoom: 11, mapTypeControl: false });
        new g.maps.TrafficLayer().setMap(mapa.current);
        for (const ref of Object.values(campos)) {
          if (ref.current) new g.maps.places.Autocomplete(ref.current, { componentRestrictions: { country: "co" } });
        }
        setListo(true);
      })
      .catch((e: Error) => setErrorMapa(e.message));
    return () => {
      vivo = false;
    };
    // campos son refs estables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llave]);

  const dibujar = useCallback((resultado: any, indices: number, mejor: number) => {
    const g = window.google;
    trazos.current.forEach((t) => t.setMap(null));
    trazos.current = Array.from({ length: indices }, (_, i) =>
      new g.maps.DirectionsRenderer({
        map: mapa.current,
        directions: resultado,
        routeIndex: i,
        suppressMarkers: i !== mejor,
        polylineOptions: { strokeColor: i === mejor ? "#0f766e" : "#9ca3af", strokeWeight: i === mejor ? 6 : 4, zIndex: i === mejor ? 2 : 1 },
      })
    );
  }, []);

  function calcular() {
    const origen = campos.origen.current?.value.trim() ?? "";
    const destino = campos.destino.current?.value.trim() ?? "";
    const intermedio = campos.intermedio.current?.value.trim() ?? "";
    if (!origen || !destino) return setMensaje({ ok: false, texto: "Escriba origen y destino" });
    if (!(Number(valorKm) > 0)) return setMensaje({ ok: false, texto: "Escriba un valor por km válido" });
    setMensaje(null);
    setGuardada(null);
    const g = window.google;
    new g.maps.DirectionsService().route(
      {
        origin: origen,
        destination: destino,
        waypoints: intermedio ? [{ location: intermedio, stopover: true }] : [],
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
        drivingOptions: { departureTime: new Date(), trafficModel: "bestguess" },
      },
      (resultado: any, estado: string) => {
        if (estado !== "OK") return setMensaje({ ok: false, texto: `Google Maps no encontró la ruta (${estado})` });
        const calculadas: RutaCalculada[] = resultado.routes.map((r: any) => ({
          polilinea: typeof r.overview_polyline === "string" ? r.overview_polyline : r.overview_polyline?.points ?? "",
          tramos: r.legs.map((l: any) => ({
            desde: l.start_address,
            hasta: l.end_address,
            distancia_m: l.distance.value,
            duracion_s: l.duration.value,
            duracion_trafico_s: l.duration_in_traffic?.value ?? null,
          })),
        }));
        const mejor = rutaRecomendada(calculadas.map((c) => c.tramos));
        setRutas(calculadas);
        setElegida(mejor);
        dibujar(resultado, calculadas.length, mejor);
      }
    );
  }

  async function guardar() {
    const r = rutas[elegida];
    if (!r) return;
    setOcupado(true);
    setMensaje(null);
    const res = await crearCotizacion({
      cliente_nombre: cliente,
      cliente_correo: correo,
      origen: campos.origen.current?.value ?? "",
      intermedio: campos.intermedio.current?.value ?? "",
      destino: campos.destino.current?.value ?? "",
      valor_km: Number(valorKm),
      valor_adicional: Number(valorAdicional) || 0,
      polilinea: r.polilinea,
      tramos: r.tramos,
      notas,
    });
    setOcupado(false);
    if ("error" in res && res.error) return setMensaje({ ok: false, texto: res.error });
    if ("id" in res && res.id) {
      setGuardada({ id: res.id, numero: res.numero });
      setMensaje({ ok: true, texto: `Cotización ${res.numero} guardada.` });
      router.refresh();
    }
  }

  async function pdf(imprimir: boolean) {
    if (!guardada) return;
    setOcupado(true);
    const error = await descargarPdf(guardada.id, imprimir);
    setOcupado(false);
    if (error) setMensaje({ ok: false, texto: error });
  }

  async function enviar() {
    if (!guardada) return;
    const destino = correo.trim() || prompt("Correo al que se envía la cotización:")?.trim() || "";
    if (!destino) return;
    setOcupado(true);
    const r = await enviarCotizacionCorreo(guardada.id, destino);
    setOcupado(false);
    setMensaje("error" in r && r.error ? { ok: false, texto: r.error } : { ok: true, texto: `Enviada a ${destino}.` });
  }

  function usarMiUbicacion() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      new window.google.maps.Geocoder().geocode(
        { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
        (res: any, st: string) => {
          if (st === "OK" && campos.origen.current) campos.origen.current.value = res[0].formatted_address;
        }
      );
    });
  }

  const actual = rutas[elegida];
  const totales = actual ? totalesRuta(actual.tramos) : null;
  const total = totales ? totalCotizacion(totales.distancia_m, Number(valorKm) || 0, Number(valorAdicional) || 0) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[24rem_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la cotización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cot-origen">Origen *</Label>
            <div className="flex gap-2">
              <Input id="cot-origen" ref={campos.origen} placeholder="Dirección o lugar" disabled={!listo} />
              <Button type="button" variant="outline" size="icon" title="Usar mi ubicación" aria-label="Usar mi ubicación" onClick={usarMiUbicacion} disabled={!listo}>
                <Crosshair className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cot-intermedio">Punto intermedio</Label>
            <Input id="cot-intermedio" ref={campos.intermedio} placeholder="Opcional" disabled={!listo} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cot-destino">Destino *</Label>
            <Input id="cot-destino" ref={campos.destino} placeholder="Dirección o lugar" disabled={!listo} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="cot-km">Valor por km *</Label>
              <Input id="cot-km" type="number" min={1} value={valorKm} onChange={(e) => setValorKm(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cot-adicional">Valor adicional</Label>
              <Input id="cot-adicional" type="number" min={0} value={valorAdicional} onChange={(e) => setValorAdicional(e.target.value)} />
            </div>
          </div>
          <Button className="w-full" onClick={calcular} disabled={!listo}>
            Calcular ruta
          </Button>
          <div className="space-y-1 border-t pt-3">
            <Label htmlFor="cot-cliente">Cliente</Label>
            <Input id="cot-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cot-correo">Correo del cliente</Label>
            <Input id="cot-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cot-notas">Observaciones</Label>
            <Textarea id="cot-notas" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={1000} />
          </div>
          {mensaje && <p className={mensaje.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{mensaje.texto}</p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {errorMapa ? (
          <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{errorMapa}</p>
        ) : (
          <div ref={mapaRef} className="h-[50vh] min-h-[320px] w-full rounded-md border border-border bg-muted" />
        )}

        {rutas.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {rutas.map((r, i) => {
              const t = totalesRuta(r.tramos);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setElegida(i);
                    setGuardada(null);
                  }}
                  className={cn("rounded-md border p-3 text-left text-sm", i === elegida ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}
                >
                  <p className="font-medium">
                    Ruta {i + 1} {i === rutaRecomendada(rutas.map((x) => x.tramos)) && <span className="text-emerald-700">· recomendada</span>}
                  </p>
                  <p>{formatoKm(t.distancia_m)} · {formatoDuracion(t.duracion_trafico_s ?? t.duracion_s)}</p>
                  <p className="font-semibold">{formatoCOP(totalCotizacion(t.distancia_m, Number(valorKm) || 0, Number(valorAdicional) || 0))}</p>
                </button>
              );
            })}
          </div>
        )}

        {actual && totales && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              {actual.tramos.map((t, i) => (
                <p key={i} className="text-sm">
                  <span className="font-medium">Tramo {i + 1}:</span> {t.desde} → {t.hasta} · {formatoKm(t.distancia_m)} ·{" "}
                  {formatoDuracion(t.duracion_trafico_s ?? t.duracion_s)} · {estadoTrafico(t)}
                </p>
              ))}
              <p className="text-lg font-semibold">
                Total: {formatoCOP(total)} <span className="text-sm font-normal text-muted-foreground">({formatoKm(totales.distancia_m)} × {formatoCOP(Number(valorKm) || 0)}{Number(valorAdicional) > 0 ? ` + ${formatoCOP(Number(valorAdicional))}` : ""})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void guardar()} disabled={ocupado || Boolean(guardada)}>
                  {guardada ? `Guardada: ${guardada.numero}` : ocupado ? "Guardando…" : "Guardar cotización"}
                </Button>
                <Button variant="outline" onClick={() => void pdf(false)} disabled={!guardada || ocupado}>
                  <FileDown className="mr-1 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => void pdf(true)} disabled={!guardada || ocupado}>
                  <Printer className="mr-1 h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={() => void enviar()} disabled={!guardada || ocupado}>
                  <Mail className="mr-1 h-4 w-4" />
                  Enviar por correo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
