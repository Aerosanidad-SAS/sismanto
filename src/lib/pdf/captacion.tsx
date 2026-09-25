import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MOMENTOS_ATENCION, MOTIVOS_CONSULTA, TIPOS_EGRESO, TIPOS_IDENTIFICACION, TIPOS_USUARIO } from "@/lib/captacion";

// Formato individual de la captación de pacientes aeroportuarios (tcpdf/DescargarCaptacion_PDF.php de SISRES).
// Lleva los mismos datos del registro: atención, paciente, clasificación SISPRO, clínica, traslado y procedimientos.

const TEAL = "#2DC4C8";
const ZONA = "America/Bogota";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  logo: { width: 110, height: 55, objectFit: "contain" },
  headerRight: { fontSize: 9, textAlign: "right" },
  headerLine: { marginBottom: 3, fontFamily: "Helvetica-Bold" },
  titleBox: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 14, color: TEAL, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  sectionTitle: { fontSize: 10, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 9, marginBottom: 4 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 150, fontFamily: "Helvetica-Bold", fontSize: 8 },
  value: { flex: 1, fontSize: 9 },
  bullet: { marginBottom: 2 },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 50 },
  signature: { width: "45%", alignItems: "center" },
  signatureName: { fontSize: 8, marginBottom: 2, textAlign: "center" },
  signatureLine: { borderTop: "1 solid #000", width: "100%", marginBottom: 3 },
  signatureRole: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, fontSize: 7, color: "#9C9B99", textAlign: "center" },
});

export interface CaptacionPdfDatos {
  id: number;
  fecha_atencion: string;
  aeropuerto_atencion: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  nacionalidad: string;
  pais_residencia: string;
  pais_procedencia: string;
  aeropuerto_procedencia: string | null;
  telefono: string | null;
  tipo_usuario: number;
  momento_atencion: number;
  motivo_consulta: number;
  tipo_egreso: number;
  tipo_atencion: string | null;
  resultado_autorizacion: string | null;
  lugar_atencion: string | null;
  lado_atencion: string | null;
  ubicacion_atencion: string | null;
  detalle_ubicacion: string | null;
  tiempo_activacion: string | null;
  tiempo_llegada: string | null;
  condicion: string | null;
  cie10: string | null;
  patologia_sistema: string | null;
  otra_patologia: string | null;
  post_operatorio: string | null;
  accidente_especial: string | null;
  notificacion_obligatoria: string | null;
  tipo_vuelo: string | null;
  aerolinea: string | null;
  procedimientos: string[];
  emergencia_tipo: string | null;
  emergencia_notas: string | null;
  remision: boolean;
  ips_receptora: string | null;
  origen: string | null;
  destino: string | null;
  recibio_medicamentos: boolean;
  medicamento: string | null;
  evento_adverso_medicamento: boolean | null;
  uso_dispositivo: boolean;
  dispositivo: string | null;
  evento_adverso_dispositivo: boolean | null;
  medico_atendio: string | null;
  nombre_registrado_por: string | null;
}

const nombreDe = (lista: readonly { codigo: number; nombre: string }[], codigo: number) =>
  `${codigo} — ${lista.find((x) => x.codigo === codigo)?.nombre ?? "—"}`;
const siNo = (v: boolean | null) => (v === null ? "—" : v ? "SÍ" : "NO");
const fmtFecha = (yyyyMmDd: string | null) => {
  if (!yyyyMmDd) return "—";
  const [a, m, d] = yyyyMmDd.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
};
const fmtFechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short", hour12: true, timeZone: ZONA });

function Fila({ label, valor }: { label: string; valor: string | number | null | undefined }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valor === null || valor === undefined || valor === "" ? "—" : String(valor)}</Text>
    </View>
  );
}

export function CaptacionPdf({ captacion: c, logo, ahora = new Date() }: { captacion: CaptacionPdfDatos; logo?: Buffer; ahora?: Date }) {
  const paciente = [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido].filter(Boolean).join(" ");
  const tipoId = TIPOS_IDENTIFICACION.find((t) => t.codigo === c.tipo_identificacion)?.nombre ?? c.tipo_identificacion;
  const generado = ahora.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short", hour12: true, timeZone: ZONA });

  return (
    <Document title={`Captación aeroportuaria #${c.id}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
          {logo ? <Image style={styles.logo} src={{ data: logo, format: "png" }} /> : <View />}
          <View style={styles.headerRight}>
            <Text style={styles.headerLine}>N°: {c.id}</Text>
            <Text style={styles.headerLine}>Fecha de atención: {fmtFechaHora(c.fecha_atencion)}</Text>
            <Text style={styles.headerLine}>Aeropuerto: {c.aeropuerto_atencion}</Text>
          </View>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>FORMATO DE CAPTACIÓN</Text>
          <Text style={styles.subtitle}>PACIENTES AEROPORTUARIOS</Text>
        </View>

        <Text style={styles.sectionTitle}>PACIENTE</Text>
        <Fila label="NOMBRE COMPLETO" valor={paciente} />
        <Fila label="IDENTIFICACIÓN" valor={`${tipoId}: ${c.numero_identificacion}`} />
        <Fila label="FECHA DE NACIMIENTO" valor={fmtFecha(c.fecha_nacimiento)} />
        <Fila label="SEXO" valor={c.sexo === "F" ? "Femenino" : c.sexo === "M" ? "Masculino" : c.sexo} />
        <Fila label="NACIONALIDAD" valor={c.nacionalidad} />
        <Fila label="PAÍS DE RESIDENCIA" valor={c.pais_residencia} />
        <Fila label="PAÍS / AEROPUERTO DE PROCEDENCIA" valor={`${c.pais_procedencia} / ${c.aeropuerto_procedencia ?? "—"}`} />
        <Fila label="TELÉFONO" valor={c.telefono} />

        <Text style={styles.sectionTitle}>ATENCIÓN</Text>
        <Fila label="TIPO DE USUARIO" valor={nombreDe(TIPOS_USUARIO, c.tipo_usuario)} />
        <Fila label="MOMENTO DE LA ATENCIÓN" valor={nombreDe(MOMENTOS_ATENCION, c.momento_atencion)} />
        <Fila label="MOTIVO DE CONSULTA" valor={nombreDe(MOTIVOS_CONSULTA, c.motivo_consulta)} />
        <Fila label="TIPO DE ATENCIÓN" valor={c.tipo_atencion} />
        {c.tipo_atencion === "AUTORIZACION DE VUELO" && <Fila label="RESULTADO" valor={c.resultado_autorizacion} />}
        <Fila label="LUGAR / LADO / UBICACIÓN" valor={[c.lugar_atencion, c.lado_atencion, c.ubicacion_atencion].filter(Boolean).join(" · ") || "—"} />
        <Fila label="DETALLE DE LA UBICACIÓN" valor={c.detalle_ubicacion} />
        <Fila label="HORA DE ACTIVACIÓN / LLEGADA" valor={`${c.tiempo_activacion ?? "—"} / ${c.tiempo_llegada ?? "—"}`} />

        <Text style={styles.sectionTitle}>CLASIFICACIÓN CLÍNICA</Text>
        <Fila label="DIAGNÓSTICO CIE-10" valor={c.cie10} />
        <Fila label="CONDICIÓN" valor={c.condicion} />
        <Fila label="PATOLOGÍA POR SISTEMA" valor={c.patologia_sistema} />
        <Fila label="OTRA PATOLOGÍA" valor={c.otra_patologia} />
        <Fila label="POST OPERATORIO" valor={c.post_operatorio} />
        <Fila label="ACCIDENTE ESPECIAL" valor={c.accidente_especial} />
        <Fila label="NOTIFICACIÓN OBLIGATORIA" valor={c.notificacion_obligatoria} />
        <Fila label="TIPO DE VUELO / AEROLÍNEA" valor={`${c.tipo_vuelo ?? "—"} / ${c.aerolinea ?? "—"}`} />

        <Text style={styles.sectionTitle}>EGRESO, TRASLADO Y TRATAMIENTO</Text>
        <Fila label="TIPO DE EGRESO" valor={nombreDe(TIPOS_EGRESO, c.tipo_egreso)} />
        <Fila label="REMISIÓN A OTRA INSTITUCIÓN" valor={c.remision ? `SÍ — ${c.ips_receptora ?? "—"}` : "NO"} />
        <Fila label="ORIGEN / DESTINO" valor={`${c.origen ?? "NO APLICA"} / ${c.destino ?? "NO APLICA"}`} />
        <Fila label="MEDICAMENTOS" valor={c.recibio_medicamentos ? `${c.medicamento ?? "—"} (evento adverso: ${siNo(c.evento_adverso_medicamento)})` : "NO"} />
        <Fila label="DISPOSITIVO" valor={c.uso_dispositivo ? `${c.dispositivo ?? "—"} (evento adverso: ${siNo(c.evento_adverso_dispositivo)})` : "NO"} />

        <Text style={styles.sectionTitle}>PROCEDIMIENTOS</Text>
        {c.procedimientos.length === 0 ? (
          <Text>—</Text>
        ) : (
          c.procedimientos.map((p) => (
            <Text key={p} style={styles.bullet}>
              • {p}
            </Text>
          ))
        )}

        {c.emergencia_tipo && (
          <>
            <Text style={styles.sectionTitle}>EMERGENCIA</Text>
            <Fila label="TIPO" valor={c.emergencia_tipo} />
            <Fila label="NOTAS" valor={c.emergencia_notas} />
          </>
        )}

        <View style={styles.signatures} wrap={false}>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>{c.medico_atendio || " "}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureRole}>MÉDICO QUE ATENDIÓ</Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>{paciente}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureRole}>PACIENTE</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Registrado por {c.nombre_registrado_por ?? "—"} · Generado el {generado} · Documento con datos clínicos: manéjalo con reserva.
        </Text>
      </Page>
    </Document>
  );
}
