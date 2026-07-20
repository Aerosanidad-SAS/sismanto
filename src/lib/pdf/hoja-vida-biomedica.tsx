import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 2, color: "#0E7490" },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#666564" },
  sectionTitle: { fontSize: 11, marginTop: 14, marginBottom: 6, color: "#0E7490", borderBottom: "1 solid #E5E5E5", paddingBottom: 3 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", marginBottom: 6, paddingRight: 8 },
  label: { fontSize: 7, color: "#666564", textTransform: "uppercase" },
  value: { fontSize: 9, marginTop: 1 },
  table: { marginTop: 4 },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #E5E5E5", paddingVertical: 4 },
  tHeaderRow: { flexDirection: "row", backgroundColor: "#F4EFE6", paddingVertical: 4, fontWeight: "bold" },
  tCol1: { width: "14%" },
  tCol2: { width: "16%" },
  tCol3: { width: "18%" },
  tCol4: { width: "12%" },
  tCol5: { width: "40%" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 7, color: "#9C9B99", textAlign: "center" },
});

export interface HojaVidaEquipo {
  placa_equipo: string;
  equipo: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  registro_invima: string | null;
  riesgo: string | null;
  area: string | null;
  ubicacion_interna: string | null;
  ciudad: string | null;
  aeropuerto: string | null;
  ultimo_mantenimiento: string | null;
  proximo_mantenimiento: string | null;
  ultima_calibracion: string | null;
  proxima_calibracion: string | null;
  proveedor_nombre: string | null;
  operador: string | null;
}

export interface HojaVidaMantenimiento {
  fecha_mantenimiento: string;
  tipo_mantenimiento: string | null;
  orden_numero: string | null;
  obs_apto: boolean;
  obs_averiado: boolean;
  realizo_nombre: string;
  descripcion_falla: string | null;
}

function fmtFecha(f: string | null): string {
  if (!f) return "—";
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return f;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function Campo({ label, valor }: { label: string; valor: string | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valor || "—"}</Text>
    </View>
  );
}

export function HojaVidaBiomedicaPdf({
  equipo,
  mantenimientos,
  generadoPor,
}: {
  equipo: HojaVidaEquipo;
  mantenimientos: HojaVidaMantenimiento[];
  generadoPor: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Hoja de Vida — Equipo Biomédico</Text>
        <Text style={styles.subtitle}>
          {equipo.equipo} · Placa {equipo.placa_equipo}
        </Text>

        <Text style={styles.sectionTitle}>Ficha técnica</Text>
        <View style={styles.grid}>
          <Campo label="Marca" valor={equipo.marca} />
          <Campo label="Modelo" valor={equipo.modelo} />
          <Campo label="Serie" valor={equipo.serie} />
          <Campo label="Registro INVIMA" valor={equipo.registro_invima} />
          <Campo label="Clasificación de riesgo" valor={equipo.riesgo} />
          <Campo label="Área" valor={equipo.area} />
          <Campo label="Ubicación interna" valor={equipo.ubicacion_interna} />
          <Campo label="Ciudad / Aeropuerto" valor={[equipo.ciudad, equipo.aeropuerto].filter(Boolean).join(" · ") || null} />
          <Campo label="Proveedor" valor={equipo.proveedor_nombre} />
          <Campo label="Operador" valor={equipo.operador} />
        </View>

        <Text style={styles.sectionTitle}>Mantenimiento y calibración</Text>
        <View style={styles.grid}>
          <Campo label="Último mantenimiento" valor={fmtFecha(equipo.ultimo_mantenimiento)} />
          <Campo label="Próximo mantenimiento" valor={fmtFecha(equipo.proximo_mantenimiento)} />
          <Campo label="Última calibración" valor={fmtFecha(equipo.ultima_calibracion)} />
          <Campo label="Próxima calibración" valor={fmtFecha(equipo.proxima_calibracion)} />
        </View>

        <Text style={styles.sectionTitle}>Historial de mantenimientos ({mantenimientos.length})</Text>
        <View style={styles.table}>
          <View style={styles.tHeaderRow}>
            <Text style={styles.tCol1}>Fecha</Text>
            <Text style={styles.tCol2}>Tipo</Text>
            <Text style={styles.tCol3}>Orden</Text>
            <Text style={styles.tCol4}>Resultado</Text>
            <Text style={styles.tCol5}>Realizó</Text>
          </View>
          {mantenimientos.length === 0 && (
            <View style={styles.tRow}>
              <Text>Sin mantenimientos registrados</Text>
            </View>
          )}
          {mantenimientos.map((m, i) => (
            <View key={i} style={styles.tRow} wrap={false}>
              <Text style={styles.tCol1}>{fmtFecha(m.fecha_mantenimiento)}</Text>
              <Text style={styles.tCol2}>{m.tipo_mantenimiento || "—"}</Text>
              <Text style={styles.tCol3}>{m.orden_numero || "—"}</Text>
              <Text style={styles.tCol4}>{m.obs_averiado ? "Averiado" : m.obs_apto ? "Apto" : "Revisar"}</Text>
              <Text style={styles.tCol5}>{m.realizo_nombre}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generado por {generadoPor} el {new Date().toLocaleDateString("es-CO")} — Aeromanto / Aerosanidad S.A.S.
        </Text>
      </Page>
    </Document>
  );
}
