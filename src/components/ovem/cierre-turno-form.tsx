"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Check } from "lucide-react";
import { cerrarTurno, getContextoCierre, type ContextoCierre } from "@/app/api/actions/cierre-turno";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  NIVELES_COMBUSTIBLE,
  NIVEL_COMBUSTIBLE_LABEL,
  NOVEDADES_NOTA_MAX,
  horaCierreBogota,
  validarCierre,
  type NivelCombustible,
} from "@/lib/cierre-turno";
import { parseKilometraje } from "@/lib/ovem-portal";
import { cn } from "@/lib/utils";

const SIN_ENTREGA = "ninguno";

/** Sí / No sin depender del color: texto, marca de selección y aria-pressed. */
function SiNo({
  nombre,
  valor,
  onChange,
}: {
  nombre: string;
  valor: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <div role="group" aria-label={nombre} className="mt-1 grid max-w-xs grid-cols-2 gap-2">
      {([true, false] as const).map((v) => (
        <Button
          key={String(v)}
          type="button"
          variant={valor === v ? "default" : "outline"}
          aria-pressed={valor === v}
          className="min-h-11 gap-2"
          onClick={() => onChange(v)}
        >
          {valor === v && <Check className="h-4 w-4" aria-hidden="true" />}
          {v ? "Sí" : "No"}
        </Button>
      ))}
    </div>
  );
}

/**
 * Cierre de turno del OVEM: km final, novedades, combustible, limpieza y a quién entrega el vehículo. La hora que se
 * muestra y la que queda registrada son las del servidor en hora de Colombia, nunca las del teléfono.
 */
export function CierreTurnoForm({
  vehicleId,
  placa,
  onDone,
}: {
  vehicleId: string;
  placa: string;
  /** Se llama tras cerrar, con la hora (HH:MM, Colombia) que puso el servidor. */
  onDone: (hora: string, novedadCreada: boolean) => void;
}) {
  const router = useRouter();
  const [ctx, setCtx] = useState<ContextoCierre | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  /** Diferencia entre el reloj del servidor y el del teléfono, para mostrar la hora del servidor. */
  const [desfaseMs, setDesfaseMs] = useState(0);
  const [km, setKm] = useState("");
  const [huboNovedades, setHuboNovedades] = useState<boolean | undefined>(undefined);
  const [nota, setNota] = useState("");
  const [combustible, setCombustible] = useState<NivelCombustible | "">("");
  const [limpieza, setLimpieza] = useState<boolean | undefined>(undefined);
  const [entregadoA, setEntregadoA] = useState<string>(SIN_ENTREGA);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState(false);
  const [horaResumen, setHoraResumen] = useState("");
  const [loading, setLoading] = useState(false);
  const [cerradoAt, setCerradoAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCtx(null);
    setErrorCarga(null);
    (async () => {
      try {
        const r = await getContextoCierre(vehicleId);
        if (cancelado) return;
        if ("error" in r) setErrorCarga(r.error);
        else {
          setCtx(r);
          setCerradoAt(r.cerradoAt);
          setDesfaseMs(new Date(r.ahora).getTime() - Date.now());
        }
      } catch {
        if (!cancelado) setErrorCarga("No se pudo cargar el cierre: revisa tu señal e inténtalo de nuevo.");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [vehicleId]);

  const kmNumero = parseKilometraje(km);
  const siguiente = ctx?.siguientes.find((s) => s.user_id === entregadoA) ?? null;
  const entrada = useMemo(
    () => ({ kmFinal: kmNumero, huboNovedades, novedadesNota: nota, nivelCombustible: combustible || undefined, limpiezaOk: limpieza }),
    [kmNumero, huboNovedades, nota, combustible, limpieza],
  );

  const horaServidor = () => horaCierreBogota(new Date(Date.now() + desfaseMs).toISOString());

  const revisar = () => {
    setError(null);
    const e = validarCierre(entrada, { kmInicialHoy: ctx?.kmInicialHoy, ultimoKm: ctx?.ultimoKm });
    if (e) {
      setError(e);
      return;
    }
    setHoraResumen(horaServidor());
    setResumen(true);
  };

  const confirmar = async () => {
    if (kmNumero === undefined || huboNovedades === undefined || !combustible || limpieza === undefined) return;
    setResumen(false);
    setLoading(true);
    setError(null);
    try {
      const r = (await cerrarTurno({
        vehicleId,
        kmFinal: kmNumero,
        huboNovedades,
        novedadesNota: huboNovedades ? nota : undefined,
        nivelCombustible: combustible,
        limpiezaOk: limpieza,
        entregadoA: entregadoA === SIN_ENTREGA ? null : entregadoA,
      })) as { error?: string; cerradoAt?: string; novedadCreada?: boolean };
      if (r.error) {
        setError(r.error);
      } else if (r.cerradoAt) {
        setCerradoAt(r.cerradoAt);
        router.refresh();
        onDone(horaCierreBogota(r.cerradoAt), Boolean(r.novedadCreada));
      }
    } catch {
      setError("No se pudo cerrar: revisa tu señal. Tus respuestas siguen aquí; inténtalo de nuevo.");
    }
    setLoading(false);
  };

  if (errorCarga) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {errorCarga}
      </p>
    );
  }
  if (!ctx) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  if (cerradoAt) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6" role="status">
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
          <p className="font-medium text-foreground">
            Turno de {placa} cerrado a las {horaCierreBogota(cerradoAt)}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (ctx.bloqueo) {
    return (
      <p role="alert" className="rounded-lg border border-warning bg-warning-soft p-3 text-sm text-foreground">
        {ctx.bloqueo}
      </p>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cerrar turno</CardTitle>
          <CardDescription>
            Vehículo {placa}. La hora del cierre la registra el sistema en hora de Colombia; no se puede cambiar después.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="cierre-km">Kilometraje final</Label>
            <span className="text-destructive"> *</span>
            <Input
              id="cierre-km"
              type="text"
              inputMode="numeric"
              pattern="[0-9.\s]+"
              required
              aria-describedby="cierre-km-ayuda"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Número que marca el tablero"
              className="mt-1 max-w-xs"
            />
            <p id="cierre-km-ayuda" className="mt-1 text-xs text-muted-foreground">
              {ctx.kmInicialHoy !== null ? `Km inicial de hoy: ${ctx.kmInicialHoy.toLocaleString("es-CO")}` : "Número que marca el tablero."}
            </p>
          </div>

          <div>
            <Label id="cierre-novedades-label">¿Hubo novedades en el turno?</Label>
            <span className="text-destructive"> *</span>
            <SiNo nombre="¿Hubo novedades en el turno?" valor={huboNovedades} onChange={setHuboNovedades} />
          </div>

          {huboNovedades && (
            <div>
              <Label htmlFor="cierre-nota">¿Qué pasó?</Label>
              <span className="text-destructive"> *</span>
              <Textarea
                id="cierre-nota"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={NOVEDADES_NOTA_MAX}
                rows={3}
                className="mt-1"
                placeholder="Ej: ruido al frenar, golpe en el panel lateral"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Si el vehículo no tiene una novedad abierta, se crea con este texto para Regulación y Mantenimiento.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="cierre-combustible">Nivel de combustible</Label>
            <span className="text-destructive"> *</span>
            <Select value={combustible} onValueChange={(v) => setCombustible(v as NivelCombustible)}>
              <SelectTrigger id="cierre-combustible" className="mt-1 min-h-11 max-w-xs">
                <SelectValue placeholder="Selecciona el nivel" />
              </SelectTrigger>
              <SelectContent>
                {NIVELES_COMBUSTIBLE.map((n) => (
                  <SelectItem key={n} value={n}>
                    {NIVEL_COMBUSTIBLE_LABEL[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>¿El vehículo queda limpio?</Label>
            <span className="text-destructive"> *</span>
            <SiNo nombre="¿El vehículo queda limpio?" valor={limpieza} onChange={setLimpieza} />
          </div>

          <div>
            <Label htmlFor="cierre-entrega">Entrego el vehículo a</Label>
            {ctx.siguientes.length > 0 ? (
              <Select value={entregadoA} onValueChange={setEntregadoA}>
                <SelectTrigger id="cierre-entrega" className="mt-1 min-h-11 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_ENTREGA}>Nadie en particular</SelectItem>
                  {ctx.siguientes.map((s) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p id="cierre-entrega" className="mt-1 text-sm text-muted-foreground">
                Regulación no ha programado mañana otro conductor en este vehículo.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="button" className={cn("min-h-11 w-full sm:w-auto")} onClick={revisar} disabled={loading}>
            {loading ? "Cerrando..." : "Revisar y cerrar turno"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resumen} onOpenChange={setResumen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cierras el turno de {placa} a las {horaResumen}
            </DialogTitle>
            <DialogDescription>Hora de Colombia. Revisa: después no se puede editar.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Km final</dt>
            <dd className="font-medium">{kmNumero?.toLocaleString("es-CO")}</dd>
            <dt className="text-muted-foreground">Novedades</dt>
            <dd className="font-medium">{huboNovedades ? `Sí: ${nota.trim()}` : "No"}</dd>
            <dt className="text-muted-foreground">Combustible</dt>
            <dd className="font-medium">{combustible ? NIVEL_COMBUSTIBLE_LABEL[combustible] : ""}</dd>
            <dt className="text-muted-foreground">Limpieza</dt>
            <dd className="font-medium">{limpieza ? "Limpio" : "No queda limpio"}</dd>
            <dt className="text-muted-foreground">Entrega a</dt>
            <dd className="font-medium">{siguiente ? siguiente.nombre : "Nadie en particular"}</dd>
          </dl>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setResumen(false)}>
              Seguir revisando
            </Button>
            <Button type="button" className="min-h-11" onClick={confirmar}>
              Cerrar turno
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
