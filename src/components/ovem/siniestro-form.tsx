"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import { reportRoadAccident } from "@/app/api/actions/ovem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Valor para <input type="datetime-local"> en la hora del teléfono. */
function ahoraLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function SiNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="inline-flex shrink-0 rounded-md border" role="group" aria-label={label}>
        {[
          { v: true, t: "Sí" },
          { v: false, t: "No" },
        ].map((opt) => (
          <button
            key={opt.t}
            type="button"
            aria-pressed={value === opt.v}
            onClick={() => onChange(opt.v)}
            className={cn(
              "h-11 min-w-14 px-4 text-sm first:rounded-l-md last:rounded-r-md",
              value === opt.v ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
            )}
          >
            {opt.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SiniestroForm({ vehicleId, placa, onDone }: { vehicleId: string; placa: string; onDone: () => void }) {
  const router = useRouter();
  const [fechaHora, setFechaHora] = useState(ahoraLocal);
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [pacienteABordo, setPacienteABordo] = useState(false);
  const [hayLesionados, setHayLesionados] = useState(false);
  const [lesionadosDetalle, setLesionadosDetalle] = useState("");
  const [hayTerceros, setHayTerceros] = useState(false);
  const [terceroPlaca, setTerceroPlaca] = useState("");
  const [terceroNombre, setTerceroNombre] = useState("");
  const [terceroTelefono, setTerceroTelefono] = useState("");
  const [terceroAseguradora, setTerceroAseguradora] = useState("");
  const [intervinoAutoridad, setIntervinoAutoridad] = useState(false);
  const [numeroIpat, setNumeroIpat] = useState("");
  const [vehiculoOperativo, setVehiculoOperativo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await reportRoadAccident({
      vehicleId,
      // El servidor corre en UTC: se envía con zona para no correr la hora 5 h.
      fechaHora: new Date(fechaHora).toISOString(),
      lugar,
      descripcion,
      pacienteABordo,
      hayLesionados,
      lesionadosDetalle: lesionadosDetalle || undefined,
      hayTerceros,
      terceroPlaca: terceroPlaca || undefined,
      terceroNombre: terceroNombre || undefined,
      terceroTelefono: terceroTelefono || undefined,
      terceroAseguradora: terceroAseguradora || undefined,
      intervinoAutoridad,
      numeroIpat: numeroIpat || undefined,
      vehiculoOperativo,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Siren className="h-5 w-5" />
          Siniestro vial — {placa}
        </CardTitle>
        <CardDescription>
          Primero la atención y la seguridad; este reporte puede esperar. Regulación lo recibe como novedad
          de prioridad alta si hay lesionados o el vehículo no puede seguir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="sin-fecha">Fecha y hora</Label>
              <Input
                id="sin-fecha"
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sin-lugar">Lugar</Label>
              <Input
                id="sin-lugar"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Dirección o punto de referencia"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="sin-desc">Qué pasó</Label>
            <Textarea
              id="sin-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cómo ocurrió y qué daños tiene la ambulancia"
              rows={3}
              required
            />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <SiNo label="¿Llevaban paciente?" value={pacienteABordo} onChange={setPacienteABordo} />
            <SiNo label="¿Hay lesionados?" value={hayLesionados} onChange={setHayLesionados} />
            {hayLesionados && (
              <Textarea
                aria-label="Detalle de lesionados"
                value={lesionadosDetalle}
                onChange={(e) => setLesionadosDetalle(e.target.value)}
                placeholder="Quiénes y cómo están (tripulación, paciente, terceros)"
                rows={2}
              />
            )}
            <SiNo label="¿Hay otro vehículo o persona involucrada?" value={hayTerceros} onChange={setHayTerceros} />
            {hayTerceros && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  aria-label="Placa del tercero"
                  value={terceroPlaca}
                  onChange={(e) => setTerceroPlaca(e.target.value.toUpperCase())}
                  placeholder="Placa"
                  maxLength={10}
                />
                <Input
                  aria-label="Nombre del tercero"
                  value={terceroNombre}
                  onChange={(e) => setTerceroNombre(e.target.value)}
                  placeholder="Nombre"
                />
                <Input
                  aria-label="Teléfono del tercero"
                  type="tel"
                  value={terceroTelefono}
                  onChange={(e) => setTerceroTelefono(e.target.value)}
                  placeholder="Teléfono"
                />
                <Input
                  aria-label="Aseguradora del tercero"
                  value={terceroAseguradora}
                  onChange={(e) => setTerceroAseguradora(e.target.value)}
                  placeholder="Aseguradora (SOAT)"
                />
              </div>
            )}
            <SiNo label="¿Llegó tránsito o policía?" value={intervinoAutoridad} onChange={setIntervinoAutoridad} />
            {intervinoAutoridad && (
              <Input
                aria-label="Número de IPAT"
                value={numeroIpat}
                onChange={(e) => setNumeroIpat(e.target.value)}
                placeholder="Número del informe (IPAT), si lo tienes"
                maxLength={40}
              />
            )}
            <SiNo label="¿La ambulancia puede seguir operando?" value={vehiculoOperativo} onChange={setVehiculoOperativo} />
          </div>

          {!vehiculoOperativo && (
            <p className="text-sm text-amber-700">
              La ambulancia quedará fuera de servicio hasta que Mantenimiento cierre la novedad.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="h-11 w-full sm:w-auto">
            {loading ? "Enviando…" : "Reportar siniestro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
