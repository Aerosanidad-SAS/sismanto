"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import { reportRoadAccident } from "@/app/api/actions/ovem";
import { registrarFotoSiniestro } from "@/app/api/actions/siniestros";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { comprimirFoto } from "@/lib/comprimir-imagen";
import { MENSAJE_EXPLICACION, MIN_FOTOS_DOCUMENTOS, MIN_FOTOS_HECHOS } from "@/lib/siniestro-datos";
import type { TipoFotoSiniestro } from "@/lib/siniestro-fotos";
import { cn } from "@/lib/utils";
import { roadAccidentSchema } from "@/lib/validations";
import { SiniestroFotosSelector, type FotoLocal } from "./siniestro-fotos-selector";

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
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
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
            disabled={disabled}
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

/** Casilla de excepción: solo vale con una explicación escrita, que queda guardada con el siniestro. */
function Excepcion({
  id,
  etiqueta,
  marcada,
  onMarcar,
  motivo,
  onMotivo,
  error,
  disabled,
}: {
  id: string;
  etiqueta: string;
  marcada: boolean;
  onMarcar: (v: boolean) => void;
  motivo: string;
  onMotivo: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox id={id} checked={marcada} disabled={disabled} onCheckedChange={onMarcar} />
        <Label htmlFor={id} className="text-sm">
          {etiqueta}
        </Label>
      </div>
      {marcada && (
        <Field label="Explica el motivo" required error={error} hint="Queda guardado con el reporte.">
          <Textarea value={motivo} onChange={(e) => onMotivo(e.target.value)} rows={2} disabled={disabled} />
        </Field>
      )}
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
  const [hayTerceros, setHayTerceros] = useState(true);
  const [terceroPlaca, setTerceroPlaca] = useState("");
  const [terceroNombre, setTerceroNombre] = useState("");
  const [terceroCedula, setTerceroCedula] = useState("");
  const [terceroTelefono, setTerceroTelefono] = useState("");
  const [terceroAseguradora, setTerceroAseguradora] = useState("");
  const [sinTerceroMotivo, setSinTerceroMotivo] = useState("");
  const [abogadoNombre, setAbogadoNombre] = useState("");
  const [abogadoTelefono, setAbogadoTelefono] = useState("");
  const [abogadoCedula, setAbogadoCedula] = useState("");
  const [abogadoCorreo, setAbogadoCorreo] = useState("");
  const [sinAbogado, setSinAbogado] = useState(false);
  const [sinAbogadoMotivo, setSinAbogadoMotivo] = useState("");
  const [sinDocumentos, setSinDocumentos] = useState(false);
  const [sinDocumentosMotivo, setSinDocumentosMotivo] = useState("");
  const [intervinoAutoridad, setIntervinoAutoridad] = useState(false);
  const [numeroIpat, setNumeroIpat] = useState("");
  const [vehiculoOperativo, setVehiculoOperativo] = useState(true);
  const [hechos, setHechos] = useState<FotoLocal[]>([]);
  const [documentos, setDocumentos] = useState<FotoLocal[]>([]);
  const [avisosFotos, setAvisosFotos] = useState<Record<TipoFotoSiniestro, string[]>>({ HECHOS: [], DOCUMENTOS: [] });
  const [procesando, setProcesando] = useState(0);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tras crear el reporte se guarda el id: reintentar la subida de fotos nunca vuelve a crear el siniestro.
  const [accidentId, setAccidentId] = useState<number | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);

  const todas = useRef<FotoLocal[]>([]);
  todas.current = [...hechos, ...documentos];
  useEffect(() => () => todas.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const creado = accidentId !== null;
  const bloqueado = loading || creado;
  const err = (k: string) => errores[k];

  const agregar = async (tipo: TipoFotoSiniestro, archivos: File[]) => {
    const set = tipo === "HECHOS" ? setHechos : setDocumentos;
    const avisos: string[] = [];
    setProcesando((n) => n + archivos.length);
    for (const archivo of archivos) {
      try {
        const file = await comprimirFoto(archivo);
        set((prev) => [...prev, { id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), estado: "PENDIENTE" }]);
      } catch (e) {
        avisos.push(`${archivo.name}: ${e instanceof Error ? e.message : "no se pudo procesar"}`);
      }
      setProcesando((n) => n - 1);
    }
    setAvisosFotos((prev) => ({ ...prev, [tipo]: avisos }));
  };

  const quitar = (tipo: TipoFotoSiniestro, id: string) => {
    const set = tipo === "HECHOS" ? setHechos : setDocumentos;
    set((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const marcar = (id: string, cambio: Partial<FotoLocal>) => {
    const aplicar = (prev: FotoLocal[]) => prev.map((f) => (f.id === id ? { ...f, ...cambio } : f));
    setHechos(aplicar);
    setDocumentos(aplicar);
  };

  /** Sube solo lo pendiente o fallido, una por una, para informar el avance y no repetir lo ya subido. */
  const subirPendientes = async (id: number) => {
    const cola: [TipoFotoSiniestro, FotoLocal][] = [
      ...hechos.map((f): [TipoFotoSiniestro, FotoLocal] => ["HECHOS", f]),
      ...(sinDocumentos ? [] : documentos).map((f): [TipoFotoSiniestro, FotoLocal] => ["DOCUMENTOS", f]),
    ].filter(([, f]) => f.estado !== "SUBIDA");
    let fallidas = 0;
    for (let i = 0; i < cola.length; i++) {
      const [tipo, f] = cola[i];
      setProgreso(`Subiendo foto ${i + 1} de ${cola.length}…`);
      marcar(f.id, { estado: "SUBIENDO", error: undefined });
      const r = await registrarFotoSiniestro(id, tipo, f.file);
      if (r.error) {
        fallidas++;
        marcar(f.id, { estado: "ERROR", error: r.error });
      } else {
        marcar(f.id, { estado: "SUBIDA" });
      }
    }
    setProgreso(null);
    return fallidas;
  };

  const terminar = () => {
    router.refresh();
    onDone();
  };

  const mensajeFaltantes = (n: number) =>
    `El siniestro quedó reportado, pero faltan ${n} foto${n === 1 ? "" : "s"} por subir. Reintenta: el reporte no se duplica.`;

  const reintentar = async () => {
    if (accidentId === null) return;
    setLoading(true);
    setError(null);
    const fallidas = await subirPendientes(accidentId);
    setLoading(false);
    if (fallidas > 0) {
      setError(mensajeFaltantes(fallidas));
      return;
    }
    terminar();
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creado) {
      await reintentar();
      return;
    }
    setError(null);
    const payload = {
      vehicleId,
      // El servidor corre en UTC: se envía con zona para no correr la hora 5 h.
      fechaHora: new Date(fechaHora).toISOString(),
      lugar,
      descripcion,
      pacienteABordo,
      hayLesionados,
      lesionadosDetalle: lesionadosDetalle || undefined,
      hayTerceros,
      terceroPlaca: hayTerceros ? terceroPlaca || undefined : undefined,
      terceroNombre: hayTerceros ? terceroNombre || undefined : undefined,
      terceroCedula: hayTerceros ? terceroCedula || undefined : undefined,
      terceroTelefono: hayTerceros ? terceroTelefono || undefined : undefined,
      terceroAseguradora: hayTerceros ? terceroAseguradora || undefined : undefined,
      sinTerceroMotivo: hayTerceros ? undefined : sinTerceroMotivo || undefined,
      abogadoNombre: sinAbogado ? undefined : abogadoNombre || undefined,
      abogadoTelefono: sinAbogado ? undefined : abogadoTelefono || undefined,
      abogadoCedula: sinAbogado ? undefined : abogadoCedula || undefined,
      abogadoCorreo: sinAbogado ? undefined : abogadoCorreo || undefined,
      sinAbogadoMotivo: sinAbogado ? sinAbogadoMotivo || undefined : undefined,
      sinDocumentosMotivo: sinDocumentos ? sinDocumentosMotivo || undefined : undefined,
      fotosHechos: hechos.length,
      fotosDocumentos: sinDocumentos ? 0 : documentos.length,
      intervinoAutoridad,
      numeroIpat: numeroIpat || undefined,
      vehiculoOperativo,
    };

    // Mismo esquema que el servidor: los errores aparecen junto a cada campo antes de enviar nada.
    const check = roadAccidentSchema.safeParse(payload);
    if (!check.success) {
      const porCampo: Record<string, string> = {};
      for (const issue of check.error.issues) {
        const clave = String(issue.path[0] ?? "general");
        if (!porCampo[clave]) porCampo[clave] = issue.message;
      }
      setErrores(porCampo);
      setError("Revisa los campos marcados: todos son obligatorios para que la reclamación quede respaldada.");
      return;
    }
    setErrores({});

    setLoading(true);
    const result = await reportRoadAccident(payload);
    if ("error" in result && result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }
    const id = (result as { accidentId: number }).accidentId;
    setAccidentId(id);
    const fallidas = await subirPendientes(id);
    setLoading(false);
    if (fallidas > 0) {
      setError(mensajeFaltantes(fallidas));
      return;
    }
    terminar();
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
          de prioridad alta si hay lesionados o el vehículo no puede seguir. Los datos y las fotos son
          obligatorios: así la reclamación queda respaldada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha y hora" required error={err("fechaHora")}>
              <Input type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} disabled={bloqueado} />
            </Field>
            <Field label="Lugar" required error={err("lugar")}>
              <Input
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Dirección o punto de referencia"
                disabled={bloqueado}
              />
            </Field>
          </div>

          <Field label="Qué pasó" required error={err("descripcion")}>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cómo ocurrió y qué daños tiene la ambulancia"
              rows={3}
              disabled={bloqueado}
            />
          </Field>

          <div className="space-y-3 rounded-lg border p-3">
            <SiNo label="¿Llevaban paciente?" value={pacienteABordo} onChange={setPacienteABordo} disabled={bloqueado} />
            <SiNo label="¿Hay lesionados?" value={hayLesionados} onChange={setHayLesionados} disabled={bloqueado} />
            {hayLesionados && (
              <Field label="Detalle de lesionados" required error={err("lesionadosDetalle")}>
                <Textarea
                  value={lesionadosDetalle}
                  onChange={(e) => setLesionadosDetalle(e.target.value)}
                  placeholder="Quiénes y cómo están (tripulación, paciente, terceros)"
                  rows={2}
                  disabled={bloqueado}
                />
              </Field>
            )}
            <SiNo label="¿Hay otro vehículo o persona involucrada?" value={hayTerceros} onChange={setHayTerceros} disabled={bloqueado} />
            {hayTerceros ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Placa del otro vehículo" required error={err("terceroPlaca")}>
                  <Input
                    value={terceroPlaca}
                    onChange={(e) => setTerceroPlaca(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={10}
                    autoCapitalize="characters"
                    disabled={bloqueado}
                  />
                </Field>
                <Field label="Nombre del implicado" required error={err("terceroNombre")}>
                  <Input value={terceroNombre} onChange={(e) => setTerceroNombre(e.target.value)} disabled={bloqueado} />
                </Field>
                <Field label="Cédula del implicado" required error={err("terceroCedula")}>
                  <Input
                    value={terceroCedula}
                    onChange={(e) => setTerceroCedula(e.target.value)}
                    inputMode="numeric"
                    maxLength={20}
                    disabled={bloqueado}
                  />
                </Field>
                <Field label="Teléfono del implicado" error={err("terceroTelefono")}>
                  <Input type="tel" value={terceroTelefono} onChange={(e) => setTerceroTelefono(e.target.value)} disabled={bloqueado} />
                </Field>
                <Field label="Aseguradora (SOAT)" error={err("terceroAseguradora")}>
                  <Input value={terceroAseguradora} onChange={(e) => setTerceroAseguradora(e.target.value)} disabled={bloqueado} />
                </Field>
              </div>
            ) : (
              <Field
                label="Por qué no hay otro vehículo o persona"
                required
                error={err("sinTerceroMotivo")}
                hint="Por ejemplo: choque contra un objeto fijo. Queda guardado con el reporte."
              >
                <Textarea value={sinTerceroMotivo} onChange={(e) => setSinTerceroMotivo(e.target.value)} rows={2} disabled={bloqueado} />
              </Field>
            )}
            <SiNo label="¿Llegó tránsito o policía?" value={intervinoAutoridad} onChange={setIntervinoAutoridad} disabled={bloqueado} />
            {intervinoAutoridad && (
              <Field label="Número de IPAT" error={err("numeroIpat")}>
                <Input
                  value={numeroIpat}
                  onChange={(e) => setNumeroIpat(e.target.value)}
                  placeholder="Número del informe, si lo tienes"
                  maxLength={40}
                  disabled={bloqueado}
                />
              </Field>
            )}
            <SiNo
              label="¿La ambulancia puede seguir operando?"
              value={vehiculoOperativo}
              onChange={setVehiculoOperativo}
              disabled={bloqueado}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border p-3" disabled={bloqueado}>
            <legend className="px-1 text-sm font-semibold">Abogado presente</legend>
            {!sinAbogado && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre del abogado" required error={err("abogadoNombre")}>
                  <Input value={abogadoNombre} onChange={(e) => setAbogadoNombre(e.target.value)} />
                </Field>
                <Field label="Teléfono del abogado" required error={err("abogadoTelefono")}>
                  <Input type="tel" value={abogadoTelefono} onChange={(e) => setAbogadoTelefono(e.target.value)} />
                </Field>
                <Field label="Cédula del abogado" required error={err("abogadoCedula")}>
                  <Input value={abogadoCedula} onChange={(e) => setAbogadoCedula(e.target.value)} inputMode="numeric" maxLength={20} />
                </Field>
                <Field label="Correo del abogado" required error={err("abogadoCorreo")}>
                  <Input type="email" value={abogadoCorreo} onChange={(e) => setAbogadoCorreo(e.target.value)} autoCapitalize="none" />
                </Field>
              </div>
            )}
            <Excepcion
              id="sin-abogado"
              etiqueta="No hubo abogado presente"
              marcada={sinAbogado}
              onMarcar={setSinAbogado}
              motivo={sinAbogadoMotivo}
              onMotivo={setSinAbogadoMotivo}
              error={sinAbogado && ["abogadoNombre", "abogadoTelefono", "abogadoCedula", "abogadoCorreo", "sinAbogadoMotivo"].some(err) ? MENSAJE_EXPLICACION : undefined}
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-lg border p-3" disabled={loading && !creado}>
            <legend className="px-1 text-sm font-semibold">Fotos</legend>
            <SiniestroFotosSelector
              inputId="sin-fotos-hechos"
              titulo="Fotos de los hechos"
              ayuda="Vehículos, daños, placas y lugar, desde varios ángulos."
              fotos={hechos}
              minimo={MIN_FOTOS_HECHOS}
              error={err("fotosHechos")}
              bloqueado={bloqueado && !creado}
              avisos={avisosFotos.HECHOS}
              onAgregar={(a) => agregar("HECHOS", a)}
              onQuitar={(id) => quitar("HECHOS", id)}
            />
            {!sinDocumentos && (
              <SiniestroFotosSelector
                inputId="sin-fotos-docs"
                titulo="Fotos de los documentos generados"
                ayuda="IPAT, acta, croquis o cualquier papel que se haya firmado."
                fotos={documentos}
                minimo={MIN_FOTOS_DOCUMENTOS}
                error={err("fotosDocumentos")}
                bloqueado={bloqueado && !creado}
                avisos={avisosFotos.DOCUMENTOS}
                onAgregar={(a) => agregar("DOCUMENTOS", a)}
                onQuitar={(id) => quitar("DOCUMENTOS", id)}
              />
            )}
            <Excepcion
              id="sin-documentos"
              etiqueta="No se generaron documentos"
              marcada={sinDocumentos}
              onMarcar={setSinDocumentos}
              motivo={sinDocumentosMotivo}
              onMotivo={setSinDocumentosMotivo}
              error={sinDocumentos && (err("fotosDocumentos") || err("sinDocumentosMotivo")) ? MENSAJE_EXPLICACION : undefined}
              disabled={creado}
            />
            {procesando > 0 && (
              <p role="status" className="text-sm text-muted-foreground">
                Preparando {procesando} foto{procesando === 1 ? "" : "s"}…
              </p>
            )}
          </fieldset>

          {!vehiculoOperativo && (
            <p role="status" className="rounded border border-warning bg-warning-soft p-2 text-sm text-warning-foreground">
              La ambulancia quedará fuera de servicio hasta que Mantenimiento cierre la novedad.
            </p>
          )}
          {progreso && (
            <p role="status" aria-live="polite" className="text-sm font-medium">
              {progreso}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || procesando > 0} className="h-11 w-full sm:w-auto">
            {loading ? "Enviando…" : creado ? "Reintentar subir las fotos pendientes" : "Reportar siniestro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
