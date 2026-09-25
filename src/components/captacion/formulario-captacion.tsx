"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { captacionSchema, type CaptacionFormData } from "@/lib/validations";
import { aTextoLocalColombia } from "@/lib/hora-colombia";
import {
  ACCIDENTES_ESPECIALES,
  CONDICIONES,
  EMERGENCIAS_TIPO,
  LADOS_ATENCION,
  LUGARES_ATENCION,
  MOMENTOS_ATENCION,
  MOTIVOS_CONSULTA,
  NOTIFICACIONES_OBLIGATORIAS,
  OTRAS_PATOLOGIAS,
  PATOLOGIAS_SISTEMA,
  POST_OPERATORIOS,
  PROCEDIMIENTOS,
  TIPOS_ATENCION,
  TIPOS_EGRESO,
  TIPOS_IDENTIFICACION,
  TIPOS_USUARIO,
  TIPOS_VUELO,
  UBICACIONES_POR_LADO,
} from "@/lib/captacion";
import {
  actualizarCaptacion,
  buscarCie10Captacion,
  buscarPacienteCaptacion,
  crearCaptacion,
  type CaptacionRow,
  type CatalogosCaptacion,
} from "@/app/api/actions/captacion";

interface Props {
  catalogos: CatalogosCaptacion;
  /** Si viene, el formulario edita ese registro (solo ADMIN). */
  inicial?: CaptacionRow;
  medicoPorDefecto?: string;
}

interface Estado {
  fecha_atencion: string;
  aeropuerto_atencion: string;
  paciente_id: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  fecha_nacimiento: string;
  sexo: string;
  nacionalidad: string;
  pais_residencia: string;
  pais_procedencia: string;
  aeropuerto_procedencia: string;
  telefono: string;
  tipo_usuario: string;
  momento_atencion: string;
  motivo_consulta: string;
  tipo_egreso: string;
  tipo_atencion: string;
  resultado_autorizacion: string;
  lugar_atencion: string;
  lado_atencion: string;
  ubicacion_atencion: string;
  detalle_ubicacion: string;
  tiempo_activacion: string;
  tiempo_llegada: string;
  condicion: string;
  cie10: string;
  patologia_sistema: string;
  otra_patologia: string;
  post_operatorio: string;
  accidente_especial: string;
  notificacion_obligatoria: string;
  tipo_vuelo: string;
  aerolinea: string;
  procedimientos: string[];
  emergencia_tipo: string;
  emergencia_notas: string;
  remision: boolean;
  ips_receptora: string;
  origen: string;
  destino: string;
  recibio_medicamentos: boolean;
  medicamento: string;
  evento_adverso_medicamento: string; // "" | "SI" | "NO"
  uso_dispositivo: boolean;
  dispositivo: string;
  evento_adverso_dispositivo: string;
  medico_atendio: string;
}

const s = (v: string | null | undefined) => v ?? "";
const siNo = (v: boolean | null | undefined) => (v === null || v === undefined ? "" : v ? "SI" : "NO");

function estadoInicial(catalogos: CatalogosCaptacion, medico: string, c?: CaptacionRow): Estado {
  const ahora = aTextoLocalColombia(new Date().toISOString());
  return {
    fecha_atencion: c ? aTextoLocalColombia(c.fecha_atencion) : ahora,
    aeropuerto_atencion: c?.aeropuerto_atencion ?? (catalogos.aeropuertosAtencion.find((a) => a === "AEROPUERTO OLAYA HERRERA") ?? ""),
    paciente_id: c?.paciente_id ? String(c.paciente_id) : "",
    tipo_identificacion: c?.tipo_identificacion ?? "CC",
    numero_identificacion: s(c?.numero_identificacion),
    primer_nombre: s(c?.primer_nombre),
    segundo_nombre: s(c?.segundo_nombre),
    primer_apellido: s(c?.primer_apellido),
    segundo_apellido: s(c?.segundo_apellido),
    fecha_nacimiento: s(c?.fecha_nacimiento),
    sexo: s(c?.sexo),
    nacionalidad: c?.nacionalidad ?? "COLOMBIA",
    pais_residencia: c?.pais_residencia ?? "COLOMBIA",
    pais_procedencia: c?.pais_procedencia ?? "COLOMBIA",
    aeropuerto_procedencia: c?.aeropuerto_procedencia ?? "MEDELLIN - OLAYA HERRERA",
    telefono: s(c?.telefono),
    tipo_usuario: c ? String(c.tipo_usuario) : "4",
    momento_atencion: c ? String(c.momento_atencion) : "1",
    motivo_consulta: c ? String(c.motivo_consulta) : "4",
    tipo_egreso: c ? String(c.tipo_egreso) : "1",
    tipo_atencion: s(c?.tipo_atencion),
    resultado_autorizacion: s(c?.resultado_autorizacion),
    lugar_atencion: s(c?.lugar_atencion),
    lado_atencion: s(c?.lado_atencion),
    ubicacion_atencion: s(c?.ubicacion_atencion),
    detalle_ubicacion: s(c?.detalle_ubicacion),
    tiempo_activacion: s(c?.tiempo_activacion),
    tiempo_llegada: s(c?.tiempo_llegada),
    condicion: s(c?.condicion),
    cie10: s(c?.cie10),
    patologia_sistema: s(c?.patologia_sistema),
    otra_patologia: s(c?.otra_patologia),
    post_operatorio: s(c?.post_operatorio),
    accidente_especial: s(c?.accidente_especial),
    notificacion_obligatoria: s(c?.notificacion_obligatoria),
    tipo_vuelo: s(c?.tipo_vuelo),
    aerolinea: s(c?.aerolinea),
    procedimientos: c?.procedimientos ?? [],
    emergencia_tipo: s(c?.emergencia_tipo),
    emergencia_notas: s(c?.emergencia_notas),
    remision: c?.remision ?? false,
    ips_receptora: s(c?.ips_receptora),
    origen: s(c?.origen),
    destino: s(c?.destino),
    recibio_medicamentos: c?.recibio_medicamentos ?? false,
    medicamento: s(c?.medicamento),
    evento_adverso_medicamento: siNo(c?.evento_adverso_medicamento),
    uso_dispositivo: c?.uso_dispositivo ?? false,
    dispositivo: s(c?.dispositivo),
    evento_adverso_dispositivo: siNo(c?.evento_adverso_dispositivo),
    medico_atendio: c?.medico_atendio ?? medico,
  };
}

const CLASE_SELECT =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Campo({ etiqueta, children, ancho = "" }: { etiqueta: string; children: React.ReactNode; ancho?: string }) {
  return (
    <div className={`space-y-1 ${ancho}`}>
      <Label>{etiqueta}</Label>
      {children}
    </div>
  );
}

function Lista({ valores, vacio = "Selecciona…", valor, onChange, id }: { valores: readonly string[]; vacio?: string; valor: string; onChange: (v: string) => void; id?: string }) {
  return (
    <select id={id} className={CLASE_SELECT} value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">{vacio}</option>
      {valores.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}

function Codigos({ opciones, valor, onChange }: { opciones: readonly { codigo: number; nombre: string }[]; valor: string; onChange: (v: string) => void }) {
  return (
    <select className={CLASE_SELECT} value={valor} onChange={(e) => onChange(e.target.value)}>
      {opciones.map((o) => (
        <option key={o.codigo} value={o.codigo}>
          {o.codigo} — {o.nombre}
        </option>
      ))}
    </select>
  );
}

function SiNo({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <select className={CLASE_SELECT} value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona…</option>
      <option value="NO">NO</option>
      <option value="SI">SI</option>
    </select>
  );
}

export function FormularioCaptacion({ catalogos, inicial, medicoPorDefecto = "" }: Props) {
  const router = useRouter();
  const [f, setF] = useState<Estado>(() => estadoInicial(catalogos, medicoPorDefecto, inicial));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resultadosCie, setResultadosCie] = useState<{ codigo: string; descripcion: string }[]>([]);
  const [busquedaCie, setBusquedaCie] = useState("");

  const set = <K extends keyof Estado>(k: K, v: Estado[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const edicion = !!inicial;

  async function buscarPaciente() {
    setAviso(null);
    const p = await buscarPacienteCaptacion(f.numero_identificacion);
    if (!p) {
      setAviso("No hay un paciente con ese número: escribe los datos a mano.");
      return;
    }
    const tipo = ({ CC: "CC", TI: "TI", RC: "RC", CE: "CE", PA: "PA" } as Record<string, string>)[p.tipo_documento.toUpperCase()] ?? f.tipo_identificacion;
    setF((prev) => ({
      ...prev,
      paciente_id: String(p.id),
      tipo_identificacion: tipo,
      primer_nombre: p.nombre1,
      segundo_nombre: s(p.nombre2),
      primer_apellido: p.apellido1,
      segundo_apellido: s(p.apellido2),
      fecha_nacimiento: s(p.fecha_nacimiento),
      sexo: p.sexo?.toUpperCase().startsWith("F") ? "F" : p.sexo?.toUpperCase().startsWith("M") ? "M" : prev.sexo,
      telefono: prev.telefono || s(p.celular),
    }));
    setAviso("Datos del paciente cargados desde el maestro. Revísalos.");
  }

  async function buscarCie() {
    setResultadosCie(await buscarCie10Captacion(busquedaCie));
  }

  function alternarProcedimiento(p: string, marcado: boolean) {
    set("procedimientos", marcado ? [...f.procedimientos, p] : f.procedimientos.filter((x) => x !== p));
  }

  // El servidor vuelve a validar todo con captacionSchema: aquí solo se ajustan los tipos.
  function aDatos(): CaptacionFormData {
    const b = (v: string) => (v === "" ? undefined : v === "SI");
    return {
      ...f,
      evento_adverso_medicamento: b(f.evento_adverso_medicamento),
      evento_adverso_dispositivo: b(f.evento_adverso_dispositivo),
    } as unknown as CaptacionFormData;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const datos = aDatos();
    const validacion = captacionSchema.safeParse(datos);
    if (!validacion.success) {
      setError(validacion.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setGuardando(true);
    const r = inicial ? await actualizarCaptacion(inicial.id, datos) : await crearCaptacion(datos);
    setGuardando(false);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    router.push("/captacion");
    router.refresh();
  }

  const ubicaciones = f.lado_atencion ? UBICACIONES_POR_LADO[f.lado_atencion as keyof typeof UBICACIONES_POR_LADO] ?? [] : [];

  return (
    <form onSubmit={enviar} className="space-y-6">
      {aviso && (
        <Alert>
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Atención</CardTitle>
          <CardDescription>Fecha y hora en hora de Colombia.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Fecha y hora de la atención *">
            <Input type="datetime-local" value={f.fecha_atencion} onChange={(e) => set("fecha_atencion", e.target.value)} />
          </Campo>
          <Campo etiqueta="Aeropuerto de atención *" ancho="lg:col-span-2">
            <Lista valores={catalogos.aeropuertosAtencion} valor={f.aeropuerto_atencion} onChange={(v) => set("aeropuerto_atencion", v)} />
          </Campo>
          <Campo etiqueta="Tipo de atención">
            <Lista valores={TIPOS_ATENCION} valor={f.tipo_atencion} onChange={(v) => set("tipo_atencion", v)} />
          </Campo>
          {f.tipo_atencion === "AUTORIZACION DE VUELO" && (
            <Campo etiqueta="Resultado *">
              <Lista valores={["APTO", "NO APTO"]} valor={f.resultado_autorizacion} onChange={(v) => set("resultado_autorizacion", v)} />
            </Campo>
          )}
          <Campo etiqueta="Lugar de atención">
            <Lista valores={LUGARES_ATENCION} valor={f.lugar_atencion} onChange={(v) => set("lugar_atencion", v)} />
          </Campo>
          <Campo etiqueta="Lado">
            <Lista
              valores={LADOS_ATENCION}
              valor={f.lado_atencion}
              onChange={(v) => setF((p) => ({ ...p, lado_atencion: v, ubicacion_atencion: "" }))}
            />
          </Campo>
          <Campo etiqueta="Ubicación">
            <Lista valores={ubicaciones} vacio={f.lado_atencion ? "Selecciona…" : "Elige primero el lado"} valor={f.ubicacion_atencion} onChange={(v) => set("ubicacion_atencion", v)} />
          </Campo>
          <Campo etiqueta="Detalle de la ubicación" ancho="sm:col-span-2 lg:col-span-3">
            <Textarea rows={2} maxLength={2000} value={f.detalle_ubicacion} onChange={(e) => set("detalle_ubicacion", e.target.value)} />
          </Campo>
          <Campo etiqueta="Hora de activación (HH:MM:SS)">
            <Input type="time" step={1} value={f.tiempo_activacion} onChange={(e) => set("tiempo_activacion", e.target.value)} />
          </Campo>
          <Campo etiqueta="Hora de llegada (HH:MM:SS)">
            <Input type="time" step={1} value={f.tiempo_llegada} onChange={(e) => set("tiempo_llegada", e.target.value)} />
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paciente</CardTitle>
          <CardDescription>Escribe el número y pulsa Buscar para traer los datos del maestro de pacientes; se copian a este registro.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Tipo de identificación *">
            <select className={CLASE_SELECT} value={f.tipo_identificacion} onChange={(e) => set("tipo_identificacion", e.target.value)}>
              {TIPOS_IDENTIFICACION.map((t) => (
                <option key={t.codigo} value={t.codigo}>
                  {t.codigo} — {t.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Número de identificación *" ancho="lg:col-span-2">
            <div className="flex gap-2">
              <Input maxLength={18} value={f.numero_identificacion} onChange={(e) => setF((p) => ({ ...p, numero_identificacion: e.target.value, paciente_id: "" }))} />
              <Button type="button" variant="outline" disabled={f.numero_identificacion.trim().length < 4} onClick={() => void buscarPaciente()}>
                Buscar
              </Button>
            </div>
          </Campo>
          <Campo etiqueta="Sexo *">
            <Lista valores={["F", "M"]} valor={f.sexo} onChange={(v) => set("sexo", v)} />
          </Campo>
          <Campo etiqueta="Primer nombre *">
            <Input maxLength={30} value={f.primer_nombre} onChange={(e) => set("primer_nombre", e.target.value)} />
          </Campo>
          <Campo etiqueta="Segundo nombre (vacío = NONE)">
            <Input maxLength={30} value={f.segundo_nombre} onChange={(e) => set("segundo_nombre", e.target.value)} />
          </Campo>
          <Campo etiqueta="Primer apellido *">
            <Input maxLength={30} value={f.primer_apellido} onChange={(e) => set("primer_apellido", e.target.value)} />
          </Campo>
          <Campo etiqueta="Segundo apellido (vacío = NONE)">
            <Input maxLength={30} value={f.segundo_apellido} onChange={(e) => set("segundo_apellido", e.target.value)} />
          </Campo>
          <Campo etiqueta="Fecha de nacimiento">
            <Input type="date" value={f.fecha_nacimiento} onChange={(e) => set("fecha_nacimiento", e.target.value)} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Input inputMode="tel" maxLength={20} value={f.telefono} onChange={(e) => set("telefono", e.target.value)} />
          </Campo>
          <Campo etiqueta="Nacionalidad *">
            <Input maxLength={35} value={f.nacionalidad} onChange={(e) => set("nacionalidad", e.target.value)} />
          </Campo>
          <Campo etiqueta="País de residencia *">
            <Lista valores={catalogos.paises} valor={f.pais_residencia} onChange={(v) => set("pais_residencia", v)} />
          </Campo>
          <Campo etiqueta="País de procedencia *">
            <Lista valores={catalogos.paises} valor={f.pais_procedencia} onChange={(v) => set("pais_procedencia", v)} />
          </Campo>
          <Campo etiqueta="Aeropuerto de procedencia *" ancho="sm:col-span-2">
            <Input list="lista-aeropuertos-procedencia" value={f.aeropuerto_procedencia} onChange={(e) => set("aeropuerto_procedencia", e.target.value)} placeholder="Escribe para buscar…" />
            <datalist id="lista-aeropuertos-procedencia">
              {catalogos.aeropuertosProcedencia.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clasificación de la atención (SISPRO)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tipo de usuario *">
            <Codigos opciones={TIPOS_USUARIO} valor={f.tipo_usuario} onChange={(v) => set("tipo_usuario", v)} />
          </Campo>
          <Campo etiqueta="Momento de la atención *">
            <Codigos opciones={MOMENTOS_ATENCION} valor={f.momento_atencion} onChange={(v) => set("momento_atencion", v)} />
          </Campo>
          <Campo etiqueta="Motivo de consulta *">
            <Codigos opciones={MOTIVOS_CONSULTA} valor={f.motivo_consulta} onChange={(v) => set("motivo_consulta", v)} />
          </Campo>
          <Campo etiqueta="Tipo de egreso *">
            <Codigos opciones={TIPOS_EGRESO} valor={f.tipo_egreso} onChange={(v) => set("tipo_egreso", v)} />
          </Campo>
          <Campo etiqueta="Diagnóstico CIE-10 * (4 caracteres)" ancho="sm:col-span-2">
            <div className="flex gap-2">
              <Input
                maxLength={4}
                className="w-28 uppercase"
                value={f.cie10}
                onChange={(e) => set("cie10", e.target.value.toUpperCase())}
                placeholder="J449"
              />
              <Input
                placeholder="Busca por código o nombre del diagnóstico…"
                value={busquedaCie}
                onChange={(e) => setBusquedaCie(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void buscarCie();
                  }
                }}
              />
              <Button type="button" variant="outline" disabled={busquedaCie.trim().length < 2} onClick={() => void buscarCie()}>
                Buscar
              </Button>
            </div>
            {resultadosCie.length > 0 && (
              <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                {resultadosCie.map((r) => (
                  <li key={r.codigo}>
                    <button
                      type="button"
                      className="w-full rounded px-2 py-1 text-left hover:bg-muted"
                      onClick={() => {
                        set("cie10", r.codigo);
                        setResultadosCie([]);
                        setBusquedaCie("");
                      }}
                    >
                      <strong>{r.codigo}</strong> — {r.descripcion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clasificación clínica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Condición">
            <Lista valores={CONDICIONES} valor={f.condicion} onChange={(v) => set("condicion", v)} />
          </Campo>
          <Campo etiqueta="Patología por sistema">
            <Lista valores={PATOLOGIAS_SISTEMA} valor={f.patologia_sistema} onChange={(v) => set("patologia_sistema", v)} />
          </Campo>
          <Campo etiqueta="Otra patología">
            <Lista valores={OTRAS_PATOLOGIAS} valor={f.otra_patologia} onChange={(v) => set("otra_patologia", v)} />
          </Campo>
          <Campo etiqueta="Post operatorio">
            <Lista valores={POST_OPERATORIOS} valor={f.post_operatorio} onChange={(v) => set("post_operatorio", v)} />
          </Campo>
          <Campo etiqueta="Accidente especial">
            <Lista valores={ACCIDENTES_ESPECIALES} valor={f.accidente_especial} onChange={(v) => set("accidente_especial", v)} />
          </Campo>
          <Campo etiqueta="Notificación obligatoria">
            <Lista valores={NOTIFICACIONES_OBLIGATORIAS} valor={f.notificacion_obligatoria} onChange={(v) => set("notificacion_obligatoria", v)} />
          </Campo>
          <Campo etiqueta="Tipo de vuelo">
            <Lista valores={TIPOS_VUELO} valor={f.tipo_vuelo} onChange={(v) => set("tipo_vuelo", v)} />
          </Campo>
          <Campo etiqueta="Aerolínea o entidad">
            {catalogos.aerolineas.length > 0 ? (
              // Del catálogo de aerolíneas; si el registro trae una que ya no está (inactiva o vieja), se conserva.
              <Lista
                valores={f.aerolinea && !catalogos.aerolineas.includes(f.aerolinea) ? [f.aerolinea, ...catalogos.aerolineas] : catalogos.aerolineas}
                valor={f.aerolinea}
                onChange={(v) => set("aerolinea", v)}
              />
            ) : (
              <Input maxLength={150} value={f.aerolinea} onChange={(e) => set("aerolinea", e.target.value)} />
            )}
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traslado, medicamentos y dispositivos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Origen">
            <Input maxLength={100} placeholder="Vacío = NO APLICA" value={f.origen} onChange={(e) => set("origen", e.target.value)} />
          </Campo>
          <Campo etiqueta="Destino">
            <Input maxLength={100} placeholder="Vacío = NO APLICA" value={f.destino} onChange={(e) => set("destino", e.target.value)} />
          </Campo>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={f.remision} onChange={(e) => set("remision", e.target.checked)} />
            El usuario fue remitido a otra institución
          </label>
          {f.remision && (
            <Campo etiqueta="IPS receptora * (999 si es desconocida)" ancho="sm:col-span-2">
              <Input list="lista-ips" value={f.ips_receptora} onChange={(e) => set("ips_receptora", e.target.value)} placeholder="Escribe para buscar…" />
              <datalist id="lista-ips">
                {catalogos.ips.map((i) => (
                  <option key={i} value={i} />
                ))}
              </datalist>
            </Campo>
          )}

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={f.recibio_medicamentos} onChange={(e) => set("recibio_medicamentos", e.target.checked)} />
            Recibió medicamentos
          </label>
          {f.recibio_medicamentos && (
            <>
              <Campo etiqueta="Nombre del medicamento *">
                <Input maxLength={150} value={f.medicamento} onChange={(e) => set("medicamento", e.target.value)} />
              </Campo>
              <Campo etiqueta="¿Presentó evento adverso? *">
                <SiNo valor={f.evento_adverso_medicamento} onChange={(v) => set("evento_adverso_medicamento", v)} />
              </Campo>
            </>
          )}

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={f.uso_dispositivo} onChange={(e) => set("uso_dispositivo", e.target.checked)} />
            Se utilizó algún dispositivo
          </label>
          {f.uso_dispositivo && (
            <>
              <Campo etiqueta="Nombre del dispositivo *">
                <Input maxLength={150} value={f.dispositivo} onChange={(e) => set("dispositivo", e.target.value)} />
              </Campo>
              <Campo etiqueta="¿Presentó evento adverso? *">
                <SiNo valor={f.evento_adverso_dispositivo} onChange={(v) => set("evento_adverso_dispositivo", v)} />
              </Campo>
            </>
          )}

          <Campo etiqueta="Médico que atendió *" ancho="sm:col-span-2">
            <Input maxLength={100} value={f.medico_atendio} onChange={(e) => set("medico_atendio", e.target.value)} />
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procedimientos y emergencia (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {PROCEDIMIENTOS.map((p) => (
              <label key={p} className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={f.procedimientos.includes(p)} onChange={(e) => alternarProcedimiento(p, e.target.checked)} />
                {p}
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Tipo de emergencia">
              <Lista valores={EMERGENCIAS_TIPO} valor={f.emergencia_tipo} onChange={(v) => set("emergencia_tipo", v)} />
            </Campo>
            <Campo etiqueta="Notas de la emergencia" ancho="sm:col-span-2">
              <Textarea rows={3} maxLength={2000} value={f.emergencia_notas} onChange={(e) => set("emergencia_notas", e.target.value)} />
            </Campo>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : edicion ? "Guardar cambios" : "Registrar captación"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/captacion")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
