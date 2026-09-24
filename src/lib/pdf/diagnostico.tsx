import { Document, Page, Text, View } from "@react-pdf/renderer";
import { etiquetaChequeo, fechaCorta, type FirmaPdf } from "@/lib/formatos-ti/comun";
import {
  CATALOGO_CHEQUEO_DIAGNOSTICO,
  CATALOGO_DIAGNOSTICO,
  RESULTADOS_DIAGNOSTICO,
  type DiagnosticoFila,
  type LadoDiagnostico,
  type RepuestoFila,
} from "@/lib/formatos-ti/diagnostico";
import { Campo, Encabezado, Firma, Pie, Seccion, estilos } from "./formato-ti-comun";

/**
 * Diagnóstico de Mantenimiento de Equipos Informáticos (G-TECN-F 047). Mismos datos que el PDF de SISRES:
 * equipo y orden, diagnóstico inicial, listado de chequeo, resultado, repuestos, observaciones y las firmas de
 * quien realizó y quien revisó.
 */
export function DiagnosticoPdf({
  diagnostico: d,
  repuestos,
  firmas,
  generadoPor,
}: {
  diagnostico: DiagnosticoFila;
  repuestos: RepuestoFila[];
  firmas: Partial<Record<LadoDiagnostico, FirmaPdf>>;
  generadoPor: string;
}) {
  return (
    <Document title={`Diagnóstico ${d.numero_orden}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={estilos.page}>
        <Encabezado
          titulo="DIAGNÓSTICO DE MANTENIMIENTO DE EQUIPOS"
          codigo="G-TECN-F 047"
          numero={d.numero_orden}
          fecha={fechaCorta(d.fecha_diagnostico)}
        />

        <Seccion titulo="DATOS DEL EQUIPO" />
        <View style={estilos.grid}>
          <Campo label="Equipo" valor={d.equipo} />
          <Campo label="Marca" valor={d.marca} />
          <Campo label="Modelo" valor={d.modelo} />
          <Campo label="Serial" valor={d.serial} />
          <Campo label="Placa" valor={d.placa} />
          <Campo label="Código institucional" valor={d.codigo_institucional} />
          <Campo label="Usuario del equipo" valor={d.usuario_equipo} />
          <Campo label="Responsable del equipo" valor={d.responsable_equipo} />
          <Campo label="Ubicación" valor={d.ubicacion} />
          <Campo label="Sede" valor={d.sede} />
        </View>

        <Seccion titulo="ORDEN DE MANTENIMIENTO" />
        <View style={estilos.grid}>
          <Campo label="N° de orden" valor={d.numero_orden} />
          <Campo label="Fecha de la orden" valor={fechaCorta(d.fecha_orden)} />
          <Campo label="Tipo de mantenimiento" valor={d.tipo_mtto === "CORRECTIVO" ? "Correctivo" : "Preventivo"} />
        </View>

        <Seccion titulo="DIAGNÓSTICO" />
        <View style={estilos.checkGrid}>
          {Object.entries(CATALOGO_DIAGNOSTICO).map(([clave, etiqueta]) => (
            <View key={clave} style={estilos.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={estilos.checkValue}>{etiquetaChequeo(d.diagnostico?.[clave]) || "—"}</Text>
            </View>
          ))}
        </View>
        <View style={estilos.grid}>
          <Campo label="Descripción de la falla" valor={d.descripcion_falla} ancho="completo" />
        </View>

        <Seccion titulo="LISTADO DE CHEQUEO" />
        <View style={estilos.checkGrid}>
          {Object.entries(CATALOGO_CHEQUEO_DIAGNOSTICO).map(([clave, etiqueta]) => (
            <View key={clave} style={estilos.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={estilos.checkValue}>{etiquetaChequeo(d.checklist?.[clave]) || "—"}</Text>
            </View>
          ))}
        </View>

        <Seccion titulo="RESULTADO" />
        <View style={estilos.checkGrid}>
          {RESULTADOS_DIAGNOSTICO.map(([campo, etiqueta]) => (
            <View key={campo} style={estilos.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={estilos.checkValue}>{d[campo] ? "SI" : "NO"}</Text>
            </View>
          ))}
        </View>

        <Seccion titulo={`REPUESTOS (${repuestos.length})`} />
        <View>
          <View style={estilos.tHeader}>
            <Text style={{ width: "48%" }}>Repuesto</Text>
            <Text style={{ width: "40%" }}>Referencia / serial</Text>
            <Text style={{ width: "12%", textAlign: "right" }}>Cant.</Text>
          </View>
          {repuestos.length === 0 && (
            <View style={estilos.tRow}>
              <Text>Sin repuestos</Text>
            </View>
          )}
          {repuestos.map((r, i) => (
            <View key={r.id ?? i} style={estilos.tRow} wrap={false}>
              <Text style={{ width: "48%" }}>{r.repuesto}</Text>
              <Text style={{ width: "40%" }}>{r.referencia_serial || "—"}</Text>
              <Text style={{ width: "12%", textAlign: "right" }}>{r.cantidad}</Text>
            </View>
          ))}
        </View>

        {d.observaciones ? (
          <>
            <Seccion titulo="OBSERVACIONES" />
            <Text>{d.observaciones}</Text>
          </>
        ) : null}

        <View style={estilos.signatures}>
          <Firma firma={firmas.realizo} nombre={[d.realizo_nombre, d.realizo_cargo].filter(Boolean).join(" · ")} rol="REALIZÓ" />
          <Firma firma={firmas.reviso} nombre={[d.reviso_nombre, d.reviso_cargo].filter(Boolean).join(" · ")} rol="REVISÓ" />
        </View>

        <Pie generadoPor={generadoPor} numero={d.numero_orden} />
      </Page>
    </Document>
  );
}
