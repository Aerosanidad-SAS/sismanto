/**
 * Datos de prueba realistas para el flujo Regulación → OVEM: segundo OVEM por ciudad y servicios asignados con direcciones
 * reales de Medellín y Bogotá (clínicas y hospitales reales; las direcciones de domicilio y los pacientes son inventados).
 *
 *  · Crea (o deja) `ovem2.medellin@prueba.local` y `ovem2.bogota@prueba.local`, rol OVEM, con el centro de su ciudad.
 *  · Crea 2 servicios PROGRAMADOS de hoy por OVEM (los 4 OVEM de prueba) y les pone dirección a los `TEST-` que no la tenían.
 *
 * Idempotente: no repite un servicio `TEST-` que ya existe con el mismo nombre. Sin `--yes` solo muestra qué haría.
 * Dev y staging comparten base hoy (ENTORNOS.md): confirma el proyecto que imprime antes de correrlo con `--yes`.
 *
 * Uso: npx tsx scripts/seed-ovem-prueba.ts [--yes]   (la clave de los usuarios nuevos sale de PRUEBA_PASSWORD; si no existe,
 * se genera una y queda en `.env.prueba-usuarios.local`, que git ignora.)
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { hoyBogota } from "../src/lib/fechas";

const confirmado = process.argv.includes("--yes");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8").split(/\r?\n/)) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
if (process.env.VERCEL_ENV === "production") throw new Error("No se siembran datos de prueba en producción.");
console.log(`Proyecto: ${url.replace(/^https:\/\//, "").split(".")[0]}${confirmado ? "" : "  (simulación: falta --yes)"}`);
const db: any = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", { auth: { persistSession: false } });

type Ciudad = "MEDELLIN" | "BOGOTA";
const CIUDAD = {
  MEDELLIN: { centro: "CRA_MEDELLIN", registro: "MEDELLÍN", departamento: "Antioquia", ciudad: "Medellín" },
  BOGOTA: { centro: "CRA_BOGOTA", registro: "BOGOTÁ", departamento: "Bogotá D.C.", ciudad: "Bogotá D.C." },
} as const;

const USUARIOS_NUEVOS = [
  { email: "ovem2.medellin@prueba.local", nombre: "OVEM 2 Medellín", ciudad: "MEDELLIN" as Ciudad },
  { email: "ovem2.bogota@prueba.local", nombre: "OVEM 2 Bogotá", ciudad: "BOGOTA" as Ciudad },
];

interface Servicio {
  ovem: string; // correo del OVEM
  placa: string;
  tipo: string;
  hora: string; // HH:mm hora Colombia
  paciente: string;
  cedula: string;
  cie: [string, string];
  origen: string;
  destino: string;
  notas?: string;
}

// Clínicas y hospitales reales; domicilios inventados pero con nomenclatura válida de cada ciudad.
const SERVICIOS: Record<Ciudad, Servicio[]> = {
  MEDELLIN: [
    { ovem: "ovem.medellin@prueba.local", placa: "KQX040", tipo: "TAB SIMPLE", hora: "09:00", paciente: "TEST- Paciente Laureles", cedula: "1000000101",
      cie: ["J189", "Neumonía, no especificada"], origen: "Carrera 70 #44-30, Laureles", destino: "Clínica Las Américas, Diagonal 75B #2A-80",
      notas: "Apartamento 502, torre 2. La portería pide documento del paciente." },
    { ovem: "ovem.medellin@prueba.local", placa: "KQX040", tipo: "TAM SIMPLE", hora: "13:30", paciente: "TEST- Paciente Tesoro", cedula: "1000000102",
      cie: ["I219", "Infarto agudo del miocardio, sin otra especificación"], origen: "Clínica El Rosario sede Tesoro, Carrera 20 #2 Sur-185",
      destino: "Hospital Pablo Tobón Uribe, Calle 78B #69-240", notas: "Está en urgencias; preguntar por la jefe de turno." },
    { ovem: "ovem2.medellin@prueba.local", placa: "DRU893", tipo: "TAB SIMPLE", hora: "10:30", paciente: "TEST- Paciente Poblado", cedula: "1000000103",
      cie: ["N390", "Infección de vías urinarias, sitio no especificado"], origen: "Carrera 43A #1 Sur-100, El Poblado", destino: "Clínica Las Vegas, Calle 2 Sur #46-55",
      notas: "Entrada por el parqueadero de visitantes, casa de reja blanca." },
    { ovem: "ovem2.medellin@prueba.local", placa: "DRU893", tipo: "TAB SIMPLE", hora: "15:00", paciente: "TEST- Paciente Centro", cedula: "1000000104",
      cie: ["J440", "EPOC con infección aguda de las vías respiratorias inferiores"], origen: "Hospital General de Medellín, Carrera 48 #32-102",
      destino: "Calle 33 #74-20, Laureles", notas: "Alta a domicilio; lleva oxígeno portátil." },
  ],
  BOGOTA: [
    { ovem: "ovem.bogota@prueba.local", placa: "EQR890", tipo: "TAB SIMPLE", hora: "08:30", paciente: "TEST- Paciente Usaquén", cedula: "1000000201",
      cie: ["J440", "EPOC con infección aguda de las vías respiratorias inferiores"], origen: "Calle 134 #19-15, Usaquén",
      destino: "Fundación Santa Fe de Bogotá, Carrera 7 #117-15", notas: "Casa de dos pisos, el paciente está en el primero." },
    { ovem: "ovem.bogota@prueba.local", placa: "EQR890", tipo: "TAM SIMPLE", hora: "14:00", paciente: "TEST- Paciente Chapinero", cedula: "1000000202",
      cie: ["I639", "Infarto cerebral, no especificado"], origen: "Clínica del Country, Carrera 16 #82-57",
      destino: "Hospital Universitario San Ignacio, Carrera 7 #40-62", notas: "Remisión urgente; llevar historia clínica impresa." },
    { ovem: "ovem2.bogota@prueba.local", placa: "JQS239", tipo: "TAB SIMPLE", hora: "11:00", paciente: "TEST- Paciente Montevideo", cedula: "1000000203",
      cie: ["I509", "Insuficiencia cardiaca, no especificada"], origen: "Calle 22 #68D-40, Montevideo", destino: "Clínica Shaio, Diagonal 115A #70C-75",
      notas: "Conjunto cerrado, torre 3 apto 101; avisar por citófono." },
    { ovem: "ovem2.bogota@prueba.local", placa: "JQS239", tipo: "TAB SIMPLE", hora: "16:00", paciente: "TEST- Paciente Calle 127", cedula: "1000000204",
      cie: ["N390", "Infección de vías urinarias, sitio no especificado"], origen: "Clínica Reina Sofía, Calle 127 #20-78",
      destino: "Calle 80 #69-70, Boyacá Real", notas: "Alta médica; acompañante es la hija." },
  ],
};

// Direcciones para los `TEST-` de Medellín que ya existían sin ellas (ids 83074–83078), en orden.
const DIRECCIONES_TEST_EXISTENTES = [
  ["Carrera 70 #44-30, Laureles", "Clínica Las Américas, Diagonal 75B #2A-80"],
  ["Carrera 43A #1 Sur-100, El Poblado", "Clínica Las Vegas, Calle 2 Sur #46-55"],
  ["Hospital General de Medellín, Carrera 48 #32-102", "Calle 33 #74-20, Laureles"],
  ["Clínica El Rosario sede Tesoro, Carrera 20 #2 Sur-185", "Hospital Pablo Tobón Uribe, Calle 78B #69-240"],
  ["Calle 10 #43D-30, El Poblado", "Hospital San Vicente Fundación, Calle 64 #51D-154"],
];

async function idDeUsuario(email: string): Promise<string | null> {
  const { data } = await db.from("user_profiles").select("user_id").eq("email", email).maybeSingle();
  return data?.user_id ?? null;
}

function claveDePrueba(): string {
  if (process.env.PRUEBA_PASSWORD) return process.env.PRUEBA_PASSWORD;
  const archivo = path.join(process.cwd(), ".env.prueba-usuarios.local");
  const clave = `Prueba-${randomBytes(6).toString("hex")}!`;
  fs.writeFileSync(archivo, `PRUEBA_PASSWORD=${clave}\n`);
  console.log(`  Clave generada para los usuarios nuevos: quedó en ${path.basename(archivo)} (git la ignora).`);
  return clave;
}

async function main() {
  const { data: centros } = await db.from("operational_centers").select("id, codigo");
  const centroId = (codigo: string) => (centros ?? []).find((c: any) => c.codigo === codigo)?.id as number;
  const { data: rol } = await db.from("roles").select("id").eq("codigo", "OVEM").single();

  console.log("\nUsuarios:");
  let clave: string | null = null;
  for (const u of USUARIOS_NUEVOS) {
    if (await idDeUsuario(u.email)) { console.log(`  = ${u.email} (ya existe)`); continue; }
    console.log(`  + ${u.email}`);
    if (!confirmado) continue;
    clave ??= claveDePrueba();
    const { data, error } = await db.auth.admin.createUser({ email: u.email, password: clave, email_confirm: true });
    if (error || !data.user) throw new Error(`${u.email}: ${error?.message ?? "no se creó"}`);
    const { error: e2 } = await db.from("user_profiles").upsert(
      { user_id: data.user.id, role_id: rol.id, nombre_completo: u.nombre, email: u.email, activo: true, operational_center_id: centroId(CIUDAD[u.ciudad].centro) },
      { onConflict: "user_id" }
    );
    if (e2) throw new Error(`${u.email} (perfil): ${e2.message}`);
  }

  console.log("\nServicios:");
  const hoy = hoyBogota();
  for (const ciudad of Object.keys(SERVICIOS) as Ciudad[]) {
    const c = CIUDAD[ciudad];
    for (const s of SERVICIOS[ciudad]) {
      const { data: existe } = await db.from("medical_services").select("id").eq("nombre_completo", s.paciente).maybeSingle();
      if (existe) { console.log(`  = ${s.paciente} (ya existe, #${existe.id})`); continue; }
      const ovemId = await idDeUsuario(s.ovem);
      const { data: veh } = await db.from("vehicles").select("id").eq("placa", s.placa).single();
      console.log(`  + ${c.registro.padEnd(8)} ${s.hora} ${s.tipo.padEnd(11)} ${s.placa} → ${s.ovem}  ${s.origen}  →  ${s.destino}`);
      if (!confirmado) continue;
      if (!ovemId) throw new Error(`Falta el usuario ${s.ovem}`);

      let patientId: number | null = null;
      const [nombre1, ...resto] = s.paciente.split(" ");
      const { data: p, error: pe } = await db.from("patients").upsert(
        { cedula: s.cedula, nombre1, apellido1: resto.join(" ") || "Paciente", direccion: s.origen, ciudad: c.ciudad, activo: true },
        { onConflict: "cedula" }
      ).select("id").single();
      if (pe) console.log(`    ! paciente: ${pe.message}`); else patientId = p.id;

      const { error } = await db.from("medical_services").insert({
        patient_id: patientId,
        nombre_completo: s.paciente,
        cedula_paciente: s.cedula,
        tipo_servicio: s.tipo,
        etapa: "PROGRAMADO",
        ciudad_registro: c.registro,
        operational_center_id: centroId(c.centro),
        vehicle_id: veh.id,
        movil_placa: s.placa,
        ovem_user_id: ovemId,
        ovem: s.ovem.split("@")[0],
        fecha_hora_programacion: `${hoy}T${s.hora}:00-05:00`,
        departamento_origen: c.departamento,
        ciudad_origen: c.ciudad,
        direccion_origen: s.origen,
        departamento_destino: c.departamento,
        ciudad_destino: c.ciudad,
        direccion_destino: s.destino,
        cie_codigo: s.cie[0],
        cie_descripcion: s.cie[1],
        observaciones: s.notas ?? null,
      });
      if (error) throw new Error(`${s.paciente}: ${error.message}`);
    }
  }

  console.log("\nTEST- existentes de Medellín sin dirección:");
  const { data: sinDireccion } = await db.from("medical_services").select("id, nombre_completo").ilike("nombre_completo", "TEST-%")
    .is("direccion_origen", null).eq("ciudad_registro", "MEDELLÍN").lte("id", 83078).order("id");
  for (const [i, f] of (sinDireccion ?? []).entries()) {
    const [origen, destino] = DIRECCIONES_TEST_EXISTENTES[i % DIRECCIONES_TEST_EXISTENTES.length];
    console.log(`  ~ #${f.id} ${f.nombre_completo}: ${origen} → ${destino}`);
    if (!confirmado) continue;
    const { error } = await db.from("medical_services").update({
      direccion_origen: origen, departamento_origen: "Antioquia", ciudad_origen: "Medellín",
      direccion_destino: destino, departamento_destino: "Antioquia", ciudad_destino: "Medellín",
    }).eq("id", f.id);
    if (error) console.log(`    ! ${error.message}`);
  }
  console.log(confirmado ? "\nListo." : "\nSimulación: nada se escribió. Repite con --yes.");
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
