import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const TEAL = "#2DC4C8";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  logo: { width: 110, height: 55, objectFit: "contain" },
  headerRight: { fontSize: 9, textAlign: "right" },
  headerLine: { marginBottom: 3, fontFamily: "Helvetica-Bold" },
  titleBox: { alignItems: "center", marginBottom: 14 },
  title: { fontSize: 14, color: TEAL, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 2 },
  sectionTitle: { fontSize: 10, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 5 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 130, fontFamily: "Helvetica-Bold", fontSize: 8 },
  value: { flex: 1, fontSize: 9 },
  verdict: { alignItems: "center", marginVertical: 14 },
  verdictText: { fontSize: 16, color: TEAL, fontFamily: "Helvetica-Bold" },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 70 },
  signature: { width: "30%", alignItems: "center" },
  signatureName: { fontSize: 8, marginBottom: 2, textAlign: "center" },
  signatureLine: { borderTop: "1 solid #000", width: "100%", marginBottom: 3 },
  signatureRole: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7, color: "#9C9B99", textAlign: "center" },
});

export interface CertificadoValoracionDatos {
  id: number;
  hc: string | null;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  aerolinea: string | null;
  fecha_hora_vuelo: string | null;
  origen: string | null;
  destino: string | null;
  tiempo_estimado: string | null;
  recomendaciones: string | null;
  concepto_medico: string | null;
  valoracion: string | null;
  medico: string | null;
  pasajero: string | null;
  acompanante: string | null;
}

const ZONA = "America/Bogota";

function fmtFecha(f: string | null): string {
  if (!f) return "—";
  const d = new Date(f.length === 10 ? `${f}T12:00:00` : f);
  if (Number.isNaN(d.getTime())) return f;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA });
}

function fmtFechaHora(f: string | null): string {
  if (!f) return "—";
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return f;
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: ZONA,
  });
}

function Fila({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valor || "—"}</Text>
    </View>
  );
}

/**
 * Certificado de valoración (aptitud de vuelo). Mismos datos que
 * tcpdf/DescargarValoracion_PDF.php de SISRES: encabezado con N°, fecha, hora,
 * sede (= origen) y N° HC; datos del paciente; valoración; datos del vuelo;
 * concepto y recomendaciones; y firmas de médico, pasajero y acompañante.
 * El diseño es nuevo (react-pdf, sin coordenadas fijas) pero no agrega ni quita datos.
 */
export function CertificadoValoracionPdf({
  valoracion: v,
  logo,
  ahora = new Date(),
}: {
  valoracion: CertificadoValoracionDatos;
  /** PNG del logo; si no se pasa, el certificado sale sin logo. */
  logo?: Buffer;
  ahora?: Date;
}) {
  const fecha = ahora.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA });
  const hora = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: ZONA });

  return (
    <Document title="Certificado de valoración" author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
          {logo ? <Image style={styles.logo} src={{ data: logo, format: "png" }} /> : <View />}
          <View style={styles.headerRight}>
            <Text style={styles.headerLine}>N°: {v.id}</Text>
            <Text style={styles.headerLine}>Fecha: {fecha}</Text>
            <Text style={styles.headerLine}>Hora: {hora}</Text>
            <Text style={styles.headerLine}>Sede: {v.origen || "—"}</Text>
            <Text style={styles.headerLine}>N° HC: {v.hc || "—"}</Text>
          </View>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>CERTIFICADO DE VALORACIÓN</Text>
          <Text style={styles.subtitle}>APTITUD DE VUELO</Text>
        </View>

        <Text style={styles.sectionTitle}>DATOS DEL PACIENTE</Text>
        <Fila label="NOMBRE COMPLETO" valor={v.nombre_completo} />
        <Fila label="IDENTIFICACIÓN" valor={v.cedula} />
        <Fila label="FECHA DE NACIMIENTO" valor={fmtFecha(v.fecha_nacimiento)} />
        <Fila label="GÉNERO" valor={v.genero} />

        <View style={styles.verdict}>
          <Text style={styles.verdictText}>VALORACIÓN: {v.valoracion || "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>DATOS DEL VUELO</Text>
        <Fila label="AEROLÍNEA" valor={v.aerolinea} />
        <Fila label="FECHA Y HORA DEL VUELO" valor={fmtFechaHora(v.fecha_hora_vuelo)} />
        <Fila label="ORIGEN" valor={v.origen} />
        <Fila label="DESTINO" valor={v.destino} />
        <Fila label="TIEMPO DEL VUELO" valor={v.tiempo_estimado} />

        <Text style={styles.sectionTitle}>CONCEPTO MÉDICO</Text>
        <Text style={{ marginBottom: 6 }}>{v.concepto_medico || "—"}</Text>
        <Text style={styles.sectionTitle}>RECOMENDACIONES</Text>
        <Text>{v.recomendaciones || "—"}</Text>

        <View style={styles.signatures} wrap={false}>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>{v.medico || " "}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureRole}>MÉDICO</Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>{v.pasajero || v.nombre_completo}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureRole}>PASAJERO(A)</Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.signatureName}>{v.acompanante || " "}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureRole}>ACOMPAÑANTE</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Aerosanidad S.A.S. — Certificado N° {v.id}
        </Text>
      </Page>
    </Document>
  );
}
