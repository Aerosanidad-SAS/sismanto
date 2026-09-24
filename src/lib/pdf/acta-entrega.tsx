import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { etiquetaChequeo, fechaCorta } from "@/lib/formatos-ti/comun";
import {
  CHECKLIST_ACTA_ENTREGA,
  ETIQUETA_LADO_ACTA,
  type ActaEntregaFila,
  type LadoActaEntrega,
} from "@/lib/formatos-ti/acta-entrega";

const TEAL = "#0E7490";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1 solid #0E7490", paddingBottom: 8, marginBottom: 10 },
  title: { fontSize: 14, color: TEAL, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 9, color: "#555", marginTop: 2 },
  headerRight: { textAlign: "right", fontSize: 9 },
  headerLine: { marginBottom: 2, fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 10, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4, borderBottom: "0.5 solid #ddd", paddingBottom: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", marginBottom: 4, paddingRight: 8 },
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
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, fontSize: 7, color: "#9C9B99", textAlign: "center" },
});

/** Firma ya resuelta para el PDF: los bytes del PNG (o null) y si su hash dejó de coincidir con los datos. */
export interface FirmaPdf {
  imagen: Buffer | null;
  modificada: boolean;
  /** El registro dice que hay firma pero el archivo no está en Storage. */
  faltante: boolean;
}

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valor || "—"}</Text>
    </View>
  );
}

function Firma({ firma, nombre, rol }: { firma?: FirmaPdf; nombre: string | null; rol: string }) {
  return (
    <View style={styles.signature} wrap={false}>
      <View style={styles.signatureBox}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
        {firma?.imagen ? <Image style={styles.signatureImg} src={{ data: firma.imagen, format: "png" }} /> : <View />}
      </View>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureName}>{nombre || " "}</Text>
      <Text style={styles.signatureRole}>{rol}</Text>
      {firma?.modificada && <Text style={styles.warning}>MODIFICADO despues de firmar</Text>}
      {firma?.faltante && <Text style={styles.warning}>Firma no disponible</Text>}
      {!firma && <Text style={styles.signatureRole}>Sin firma</Text>}
    </View>
  );
}

/**
 * Acta de Entrega de Equipos (G-TECN-F 028 Celular / F 031 General). Mismos datos que el PDF de SISRES
 * (mostrarActaEntrega → TCPDF): funcionario, equipo, pruebas de funcionalidad, entrega y, si existe, devolución.
 */
export function ActaEntregaPdf({
  acta: a,
  firmas,
  generadoPor,
}: {
  acta: ActaEntregaFila;
  firmas: Partial<Record<LadoActaEntrega, FirmaPdf>>;
  generadoPor: string;
}) {
  const celular = a.tipo_equipo === "CELULAR";
  const catalogo = CHECKLIST_ACTA_ENTREGA[a.tipo_equipo];
  const hayDevolucion = celular && (a.fecha_devolucion || firmas.devolucion_entrega || firmas.devolucion_recibe);

  return (
    <Document title={`Acta de entrega ${a.numero_orden}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ACTA DE ENTREGA DE EQUIPOS</Text>
            <Text style={styles.subtitle}>
              {celular ? "G-TECN-F 028 · Celulares" : "G-TECN-F 031 · Equipos"} — Sistema Integrado de Gestión
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLine}>N° {a.numero_orden}</Text>
            <Text>Fecha: {fechaCorta(a.fecha_entrega)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATOS DEL FUNCIONARIO</Text>
        <View style={styles.grid}>
          <Campo label="Nombre" valor={a.func_nombre} />
          <Campo label="Cédula" valor={a.func_cedula} />
          <Campo label="Cargo" valor={a.func_cargo} />
          <Campo label="Sede" valor={a.func_sede} />
          <Campo label="Correo electrónico" valor={a.func_correo} />
        </View>

        <Text style={styles.sectionTitle}>DATOS DEL EQUIPO</Text>
        <View style={styles.grid}>
          <Campo label="Referencia" valor={a.equipo_referencia} />
          <Campo label="Marca" valor={a.equipo_marca} />
          <Campo label="Modelo" valor={a.equipo_modelo} />
          <Campo label="Placa" valor={a.equipo_placa} />
          {celular && (
            <>
              <Campo label="IMEI" valor={a.equipo_imei} />
              <Campo label="N° SIM" valor={a.equipo_sim} />
              <Campo label="N° Activo" valor={a.equipo_activo} />
              <Campo label="Tarjeta SD" valor={a.equipo_tarjeta_sd} />
              <Campo label="Operador" valor={a.equipo_operador} />
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>PRUEBAS DE FUNCIONALIDAD</Text>
        <View style={styles.checkGrid}>
          {Object.entries(catalogo).map(([clave, etiqueta]) => (
            <View key={clave} style={styles.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={styles.checkValue}>{etiquetaChequeo(a.checklist?.[clave]) || "—"}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>REGISTRO DE ENTREGA</Text>
        <View style={styles.grid}>
          <Campo label="Fecha de entrega" valor={fechaCorta(a.fecha_entrega)} />
          <Campo label="Lugar de entrega" valor={a.lugar_entrega} />
        </View>
        <View style={styles.signatures}>
          <Firma firma={firmas.entrega} nombre={a.entrega_nombre} rol={ETIQUETA_LADO_ACTA.entrega.toUpperCase()} />
          <Firma firma={firmas.recibe} nombre={a.recibe_nombre} rol={ETIQUETA_LADO_ACTA.recibe.toUpperCase()} />
        </View>

        {hayDevolucion && (
          <>
            <Text style={styles.sectionTitle}>REGISTRO DE DEVOLUCIÓN</Text>
            <View style={styles.grid}>
              <Campo label="Fecha de devolución" valor={fechaCorta(a.fecha_devolucion)} />
              <Campo label="Lugar de devolución" valor={a.lugar_devolucion} />
            </View>
            <View style={styles.signatures}>
              <Firma firma={firmas.devolucion_entrega} nombre={a.devolucion_entrega_nombre} rol="ENTREGA" />
              <Firma firma={firmas.devolucion_recibe} nombre={a.devolucion_recibe_nombre} rol="RECIBE" />
            </View>
          </>
        )}

        {a.observaciones ? (
          <>
            <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
            <Text>{a.observaciones}</Text>
          </>
        ) : null}

        <Text style={styles.footer} fixed>
          Generado por {generadoPor} el {new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })} — Aerosanidad S.A.S. · {a.numero_orden}
        </Text>
      </Page>
    </Document>
  );
}
