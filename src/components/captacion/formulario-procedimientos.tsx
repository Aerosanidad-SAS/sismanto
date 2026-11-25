"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aTextoLocalColombia } from "@/lib/hora-colombia";
import { EMERGENCIAS_TIPO } from "@/lib/captacion";
import {
  CANTIDAD_MAX,
  CANTIDAD_MIN,
  PROCEDIMIENTOS_EXTERNOS,
  captacionProcedimientosSchema,
} from "@/lib/captacion-procedimientos";
import { crearProcedimientosExternos } from "@/app/api/actions/captacion-procedimientos";

interface Props {
  /** Aeropuertos de atención del catálogo SISPRO. */
  aeropuertos: string[];
}

interface Linea {
  clave: number;
  procedimiento: string;
  cantidad: string;
}

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Llave de idempotencia: si el envío se repite (doble clic, reintento) el servidor no lo guarda dos veces. */
function nuevoLote(): string | undefined {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined;
}

export function FormularioProcedimientos({ aeropuertos }: Props) {
  const router = useRouter();
  const [lote] = useState(nuevoLote);
  const [fecha, setFecha] = useState(() => aTextoLocalColombia(new Date().toISOString()));
  const [aeropuerto, setAeropuerto] = useState(() => aeropuertos.find((a) => a === "AEROPUERTO OLAYA HERRERA") ?? "");
  const [emergencia, setEmergencia] = useState("");
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ clave: 1, procedimiento: "AMBULANCIAS EXTERNAS", cantidad: "1" }]);
  const [siguiente, setSiguiente] = useState(2);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiarLinea = (clave: number, cambios: Partial<Linea>) =>
    setLineas((prev) => prev.map((l) => (l.clave === clave ? { ...l, ...cambios } : l)));

  function agregarLinea() {
    const usados = lineas.map((l) => l.procedimiento);
    const libre = PROCEDIMIENTOS_EXTERNOS.find((p) => !usados.includes(p));
    if (!libre) return;
    setLineas((prev) => [...prev, { clave: siguiente, procedimiento: libre, cantidad: "1" }]);
    setSiguiente((n) => n + 1);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const datos = {
      lote,
      fecha_atencion: fecha,
      aeropuerto_atencion: aeropuerto,
      emergencia_tipo: emergencia,
      notas,
      lineas: lineas.map((l) => ({ procedimiento: l.procedimiento, cantidad: Number(l.cantidad) })),
    };
    // El servidor vuelve a validar todo con el mismo esquema: aquí solo se avisa antes de enviar.
    const validacion = captacionProcedimientosSchema.safeParse(datos);
    if (!validacion.success) {
      setError(validacion.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setGuardando(true);
    const r = await crearProcedimientosExternos(datos);
    setGuardando(false);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    router.push("/captacion/procedimientos");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Atención</CardTitle>
          <CardDescription>Fecha y hora en hora de Colombia.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="p-fecha">Fecha y hora *</Label>
            <Input id="p-fecha" type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <Label htmlFor="p-aeropuerto">Aeropuerto *</Label>
            <select id="p-aeropuerto" className={CLASE_SELECT} value={aeropuerto} onChange={(e) => setAeropuerto(e.target.value)}>
              <option value="">Selecciona…</option>
              {aeropuertos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procedimientos</CardTitle>
          <CardDescription>
            Una línea por procedimiento, con la cantidad realizada ({CANTIDAD_MIN} a {CANTIDAD_MAX}). Usa «Agregar otro» para registrar más de uno.
            No se piden datos del paciente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineas.map((l, i) => {
            const usadosPorOtras = lineas.filter((o) => o.clave !== l.clave).map((o) => o.procedimiento);
            return (
              <div key={l.clave} className="grid items-end gap-3 sm:grid-cols-[1fr_7rem_auto]">
                <div className="space-y-1">
                  <Label htmlFor={`p-proc-${l.clave}`}>Procedimiento {i + 1} *</Label>
                  <select
                    id={`p-proc-${l.clave}`}
                    className={CLASE_SELECT}
                    value={l.procedimiento}
                    onChange={(e) => cambiarLinea(l.clave, { procedimiento: e.target.value })}
                  >
                    {PROCEDIMIENTOS_EXTERNOS.filter((p) => p === l.procedimiento || !usadosPorOtras.includes(p)).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`p-cant-${l.clave}`}>Cantidad *</Label>
                  <Input
                    id={`p-cant-${l.clave}`}
                    type="number"
                    inputMode="numeric"
                    min={CANTIDAD_MIN}
                    max={CANTIDAD_MAX}
                    step={1}
                    value={l.cantidad}
                    onChange={(e) => cambiarLinea(l.clave, { cantidad: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={lineas.length === 1}
                  onClick={() => setLineas((prev) => prev.filter((o) => o.clave !== l.clave))}
                >
                  Quitar
                </Button>
              </div>
            );
          })}
          <Button type="button" variant="outline" disabled={lineas.length >= PROCEDIMIENTOS_EXTERNOS.length} onClick={agregarLinea}>
            Agregar otro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergencia y notas (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="p-emergencia">Tipo de emergencia</Label>
            <select id="p-emergencia" className={CLASE_SELECT} value={emergencia} onChange={(e) => setEmergencia(e.target.value)}>
              <option value="">Ninguna</option>
              {EMERGENCIAS_TIPO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="p-notas">Notas</Label>
            <Textarea id="p-notas" rows={3} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Registrar procedimientos"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/captacion/procedimientos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
