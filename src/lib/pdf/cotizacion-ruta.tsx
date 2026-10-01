import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { estadoTrafico, formatoCOP, formatoDuracion, formatoKm, type TramoRuta } from "@/lib/cotizacion-ruta";

// PDF de la cotización de ruta (migración 106): encabezado, datos, mapa del trazo, tramos y total.

export interface CotizacionPdfDatos {
  numero: string;
  created_at: string;
  cliente_nombre: string | null;
  origen: string;
  intermedio: string | null;
  destino: string;
  distancia_m: number;
  duracion_s: number;
  duracion_trafico_s: number | null;
  valor_km: number;
  valor_adicional: number;
  total: number;
  tramos: TramoRuta[];
  notas: string | null;
}

const VERDE = "#0f766e";
const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  logo: { width: 110, height: 50, objectFit: "contain" },
  numero: { fontSize: 14, fontFamily: "Helvetica-Bold", color: VERDE, textAlign: "right" },
  gris: { color: "#6b7280" },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  seccion: { marginTop: 10, marginBottom: 4, fontSize: 11, fontFamily: "Helvetica-Bold", color: VERDE },
  fila: { flexDirection: "row", marginBottom: 3 },
  etiqueta: { width: 120, color: "#6b7280" },
  valor: { flex: 1 },
  mapa: { width: "100%", height: 280, objectFit: "cover", marginVertical: 8, borderRadius: 4 },
  tramo: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 6, marginBottom: 4 },
  totalCaja: { marginTop: 12, padding: 10, backgroundColor: "#f0fdfa", borderRadius: 4, flexDirection: "row", justifyContent: "space-between" },
  totalTexto: { fontSize: 14, fontFamily: "Helvetica-Bold", color: VERDE },
  pie: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 8, color: "#6b7280", textAlign: "center" },
});

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <View style={styles.fila} wrap={false}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor || "—"}</Text>
    </View>
  );
}

export function CotizacionRutaPdf({ c, mapa, logo }: { c: CotizacionPdfDatos; mapa?: Buffer; logo?: Buffer }) {
  const fecha = new Date(c.created_at).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" });
  return (
    <Document title={`Cotización ${c.numero}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
          {logo ? <Image style={styles.logo} src={{ data: logo, format: "png" }} /> : <Text>Aerosanidad S.A.S.</Text>}
          <View>
            <Text style={styles.numero}>{c.numero}</Text>
            <Text style={[styles.gris, { textAlign: "right" }]}>{fecha}</Text>
          </View>
        </View>

        <Text style={styles.titulo}>Cotización de traslado en ambulancia</Text>
        <Fila etiqueta="Cliente" valor={c.cliente_nombre} />
        <Fila etiqueta="Origen" valor={c.origen} />
        {c.intermedio ? <Fila etiqueta="Punto intermedio" valor={c.intermedio} /> : null}
        <Fila etiqueta="Destino" valor={c.destino} />

        {/* eslint-disable-next-line jsx-a11y/alt-text -- el <Image> de react-pdf no es un <img> HTML y no admite alt */}
        {mapa ? <Image style={styles.mapa} src={{ data: mapa, format: "png" }} /> : null}

        <Text style={styles.seccion}>Recorrido</Text>
        <Fila etiqueta="Distancia total" valor={formatoKm(c.distancia_m)} />
        <Fila etiqueta="Tiempo estimado" valor={formatoDuracion(c.duracion_s)} />
        {c.duracion_trafico_s !== null ? <Fila etiqueta="Tiempo con tráfico" valor={formatoDuracion(c.duracion_trafico_s)} /> : null}
        {c.tramos.length > 1
          ? c.tramos.map((t, i) => (
              <View key={i} style={styles.tramo} wrap={false}>
                <Text>
                  Tramo {i + 1}: de {t.desde} a {t.hasta}
                </Text>
                <Text style={styles.gris}>
                  {formatoKm(t.distancia_m)} · {formatoDuracion(t.duracion_trafico_s ?? t.duracion_s)} · {estadoTrafico(t)}
                </Text>
              </View>
            ))
          : null}

        <Text style={styles.seccion}>Valor</Text>
        <Fila etiqueta="Valor por km" valor={formatoCOP(c.valor_km)} />
        {c.valor_adicional > 0 ? <Fila etiqueta="Valor adicional" valor={formatoCOP(c.valor_adicional)} /> : null}
        <View style={styles.totalCaja} wrap={false}>
          <Text style={styles.totalTexto}>Total</Text>
          <Text style={styles.totalTexto}>{formatoCOP(c.total)}</Text>
        </View>
        {c.notas ? (
          <>
            <Text style={styles.seccion}>Observaciones</Text>
            <Text>{c.notas}</Text>
          </>
        ) : null}

        <Text style={styles.pie} fixed>
          Valores calculados sobre la ruta sugerida por Google Maps; los tiempos son estimados y pueden variar con el tráfico.
          Aerosanidad S.A.S.
        </Text>
      </Page>
    </Document>
  );
}
