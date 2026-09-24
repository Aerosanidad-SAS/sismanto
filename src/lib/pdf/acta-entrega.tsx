import { Document, Page, Text, View } from "@react-pdf/renderer";
import { etiquetaChequeo, fechaCorta, type FirmaPdf } from "@/lib/formatos-ti/comun";
import {
  CHECKLIST_ACTA_ENTREGA,
  ETIQUETA_LADO_ACTA,
  type ActaEntregaFila,
  type LadoActaEntrega,
} from "@/lib/formatos-ti/acta-entrega";
import { Campo, Encabezado, Firma, Pie, Seccion, estilos } from "./formato-ti-comun";

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
      <Page size="LETTER" style={estilos.page}>
        <Encabezado
          titulo="ACTA DE ENTREGA DE EQUIPOS"
          codigo={celular ? "G-TECN-F 028 · Celulares" : "G-TECN-F 031 · Equipos"}
          numero={a.numero_orden}
          fecha={fechaCorta(a.fecha_entrega)}
        />

        <Seccion titulo="DATOS DEL FUNCIONARIO" />
        <View style={estilos.grid}>
          <Campo label="Nombre" valor={a.func_nombre} />
          <Campo label="Cédula" valor={a.func_cedula} />
          <Campo label="Cargo" valor={a.func_cargo} />
          <Campo label="Sede" valor={a.func_sede} />
          <Campo label="Correo electrónico" valor={a.func_correo} />
        </View>

        <Seccion titulo="DATOS DEL EQUIPO" />
        <View style={estilos.grid}>
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

        <Seccion titulo="PRUEBAS DE FUNCIONALIDAD" />
        <View style={estilos.checkGrid}>
          {Object.entries(catalogo).map(([clave, etiqueta]) => (
            <View key={clave} style={estilos.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={estilos.checkValue}>{etiquetaChequeo(a.checklist?.[clave]) || "—"}</Text>
            </View>
          ))}
        </View>

        <Seccion titulo="REGISTRO DE ENTREGA" />
        <View style={estilos.grid}>
          <Campo label="Fecha de entrega" valor={fechaCorta(a.fecha_entrega)} />
          <Campo label="Lugar de entrega" valor={a.lugar_entrega} />
        </View>
        <View style={estilos.signatures}>
          <Firma firma={firmas.entrega} nombre={a.entrega_nombre} rol={ETIQUETA_LADO_ACTA.entrega.toUpperCase()} />
          <Firma firma={firmas.recibe} nombre={a.recibe_nombre} rol={ETIQUETA_LADO_ACTA.recibe.toUpperCase()} />
        </View>

        {hayDevolucion && (
          <>
            <Seccion titulo="REGISTRO DE DEVOLUCIÓN" />
            <View style={estilos.grid}>
              <Campo label="Fecha de devolución" valor={fechaCorta(a.fecha_devolucion)} />
              <Campo label="Lugar de devolución" valor={a.lugar_devolucion} />
            </View>
            <View style={estilos.signatures}>
              <Firma firma={firmas.devolucion_entrega} nombre={a.devolucion_entrega_nombre} rol="ENTREGA" />
              <Firma firma={firmas.devolucion_recibe} nombre={a.devolucion_recibe_nombre} rol="RECIBE" />
            </View>
          </>
        )}

        {a.observaciones ? (
          <>
            <Seccion titulo="OBSERVACIONES" />
            <Text>{a.observaciones}</Text>
          </>
        ) : null}

        <Pie generadoPor={generadoPor} numero={a.numero_orden} />
      </Page>
    </Document>
  );
}
