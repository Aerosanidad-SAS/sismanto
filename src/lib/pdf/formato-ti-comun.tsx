import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FirmaPdf } from "@/lib/formatos-ti/comun";

/** Piezas de PDF compartidas por los 4 Formatos TI: mismos estilos, campos, firmas, encabezado y pie. */
const TEAL = "#0E7490";

export const estilos = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1 solid #0E7490", paddingBottom: 8, marginBottom: 10 },
  title: { fontSize: 14, color: TEAL, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 9, color: "#555", marginTop: 2 },
  headerRight: { textAlign: "right", fontSize: 9 },
  headerLine: { marginBottom: 2, fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 10, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4, borderBottom: "0.5 solid #ddd", paddingBottom: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", marginBottom: 4, paddingRight: 8 },
  fieldFull: { width: "100%", marginBottom: 4, paddingRight: 8 },
  label: { fontSize: 7, color: "#666", textTransform: "uppercase" },
  value: { fontSize: 9, marginTop: 1 },
  checkGrid: { flexDirection: "row", flexWrap: "wrap" },
  checkItem: { width: "50%", flexDirection: "row", justifyContent: "space-between", paddingRight: 12, marginBottom: 3 },
  checkValue: { fontFamily: "Helvetica-Bold" },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  signature: { width: "48%", alignItems: "center" },
  signatureBox: { height: 46, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  signatureImg: { height: 44, objectFit: "contain" },
  signatureLine: { borderTop: "1 solid #000", width: "100%", marginTop: 2, marginBottom: 2 },
  signatureName: { fontSize: 8, textAlign: "center" },
  signatureRole: { fontSize: 7, color: "#666", textAlign: "center" },
  warning: { fontSize: 7, color: "#B91C1C", fontFamily: "Helvetica-Bold", textAlign: "center" },
  tHeader: { flexDirection: "row", backgroundColor: "#F4EFE6", paddingVertical: 3, paddingHorizontal: 2, fontFamily: "Helvetica-Bold" },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #E5E5E5", paddingVertical: 3, paddingHorizontal: 2 },
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, fontSize: 7, color: "#9C9B99", textAlign: "center" },
});

export function Campo({ label, valor, ancho }: { label: string; valor: string | null | undefined; ancho?: "completo" }) {
  return (
    <View style={ancho === "completo" ? estilos.fieldFull : estilos.field}>
      <Text style={estilos.label}>{label}</Text>
      <Text style={estilos.value}>{valor || "—"}</Text>
    </View>
  );
}

export function Seccion({ titulo }: { titulo: string }) {
  return <Text style={estilos.sectionTitle}>{titulo}</Text>;
}

export function Firma({ firma, nombre, rol }: { firma?: FirmaPdf; nombre: string | null; rol: string }) {
  return (
    <View style={estilos.signature} wrap={false}>
      <View style={estilos.signatureBox}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
        {firma?.imagen ? <Image style={estilos.signatureImg} src={{ data: firma.imagen, format: "png" }} /> : <View />}
      </View>
      <View style={estilos.signatureLine} />
      <Text style={estilos.signatureName}>{nombre || " "}</Text>
      <Text style={estilos.signatureRole}>{rol}</Text>
      {firma?.modificada && <Text style={estilos.warning}>MODIFICADO despues de firmar</Text>}
      {firma?.faltante && <Text style={estilos.warning}>Firma no disponible</Text>}
      {!firma && <Text style={estilos.signatureRole}>Sin firma</Text>}
    </View>
  );
}

/** Encabezado del formato: título, código del SIG y, a la derecha, N° de orden y fecha. */
export function Encabezado({ titulo, codigo, numero, fecha }: { titulo: string; codigo: string; numero: string; fecha: string }) {
  return (
    <View style={estilos.header}>
      <View>
        <Text style={estilos.title}>{titulo}</Text>
        <Text style={estilos.subtitle}>{codigo} — Sistema Integrado de Gestión</Text>
      </View>
      <View style={estilos.headerRight}>
        <Text style={estilos.headerLine}>N° {numero}</Text>
        <Text>Fecha: {fecha}</Text>
      </View>
    </View>
  );
}

export function Pie({ generadoPor, numero }: { generadoPor: string; numero: string }) {
  return (
    <Text style={estilos.footer} fixed>
      Generado por {generadoPor} el {new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })} — Aerosanidad S.A.S. · {numero}
    </Text>
  );
}
