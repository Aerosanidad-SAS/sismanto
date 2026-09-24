import { Document, Page, Text, View } from "@react-pdf/renderer";
import { fechaCorta, type FirmaPdf } from "@/lib/formatos-ti/comun";
import { ACCESORIOS_BAJA, CAUSAS_BAJA, TELECOM_BAJA, type BajaFila, type LadoBaja } from "@/lib/formatos-ti/baja";
import { Campo, Encabezado, Firma, Pie, Seccion, estilos } from "./formato-ti-comun";

/**
 * Baja de Dispositivos Informáticos y Biomédicos (G-TECN-F 020). Mismos datos que el PDF de SISRES: equipo,
 * causa, datos de compra y garantía, telecomunicaciones, cables y cargadores, observaciones y firma del responsable.
 */
export function BajaPdf({
  baja: b,
  firmas,
  generadoPor,
}: {
  baja: BajaFila;
  firmas: Partial<Record<LadoBaja, FirmaPdf>>;
  generadoPor: string;
}) {
  const informatico = b.tipo_equipo === "INFORMATICO";
  const conTelecom = b.telecom_tipo !== "NINGUNO";
  const detalleAccesorios = typeof b.accesorios?.otro_detalle === "string" ? b.accesorios.otro_detalle : "";

  return (
    <Document title={`Baja ${b.numero_orden}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={estilos.page}>
        <Encabezado
          titulo="BAJA DE DISPOSITIVOS INFORMÁTICOS Y BIOMÉDICOS"
          codigo="G-TECN-F 020"
          numero={b.numero_orden}
          fecha={fechaCorta(new Date(b.created_at).toLocaleDateString("en-CA", { timeZone: "America/Bogota" }))}
        />

        <Seccion titulo="DATOS DEL EQUIPO" />
        <View style={estilos.grid}>
          <Campo label="Tipo de equipo" valor={informatico ? "Informático" : "Biomédico"} />
          <Campo label="Nombre del equipo" valor={b.nombre_equipo} />
          <Campo label="Marca" valor={b.marca} />
          <Campo label="Modelo" valor={b.modelo} />
          <Campo label="Serie" valor={b.serie} />
          <Campo label="Mayor a dos años" valor={b.mayor_dos_anios ? "Sí" : "No"} />
          {informatico ? (
            <>
              <Campo label="Fecha de ingreso / reporte" valor={fechaCorta(b.fecha_ingreso_reporte)} />
              <Campo label="N° de inventario" valor={b.numero_inventario} />
            </>
          ) : (
            <>
              <Campo label="Sede" valor={b.sede} />
              <Campo label="Ubicación en Sanidad" valor={b.ubicacion_sanidad} />
            </>
          )}
        </View>

        <Seccion titulo="CAUSA DE LA BAJA" />
        <View style={estilos.grid}>
          <Campo label="Causa" valor={CAUSAS_BAJA[b.causa_baja] ?? b.causa_baja} />
          <Campo label="Detalle" valor={b.causa_baja_detalle} />
          <Campo label="Concepto técnico radicado" valor={b.concepto_tecnico_radicado} />
          <Campo label="Proveedor / garantía" valor={b.proveedor_garantia} />
          <Campo label="Denuncio" valor={b.denuncio} />
          <Campo label="Costo histórico" valor={b.costo_historico} />
          <Campo label="Fecha de compra" valor={fechaCorta(b.fecha_compra)} />
        </View>

        <Seccion titulo="TELECOMUNICACIONES" />
        <View style={estilos.grid}>
          <Campo label="Tipo" valor={TELECOM_BAJA[b.telecom_tipo] ?? b.telecom_tipo} />
          {conTelecom && (
            <>
              <Campo label="Marca" valor={b.telecom_marca} />
              <Campo label="Modelo" valor={b.telecom_modelo} />
              <Campo label="IMEI" valor={b.telecom_imei} />
              <Campo label="Operador" valor={b.telecom_operador} />
            </>
          )}
        </View>

        <Seccion titulo="CABLES Y CARGADORES" />
        <View style={estilos.checkGrid}>
          {Object.entries(ACCESORIOS_BAJA).map(([clave, etiqueta]) => (
            <View key={clave} style={estilos.checkItem}>
              <Text>{etiqueta}</Text>
              <Text style={estilos.checkValue}>{b.accesorios?.[clave] === true ? "SI" : "NO"}</Text>
            </View>
          ))}
        </View>
        {detalleAccesorios ? (
          <View style={estilos.grid}>
            <Campo label="Otros" valor={detalleAccesorios} ancho="completo" />
          </View>
        ) : null}

        {b.observaciones ? (
          <>
            <Seccion titulo="OBSERVACIONES" />
            <Text>{b.observaciones}</Text>
          </>
        ) : null}

        <View style={estilos.signatures}>
          <Firma firma={firmas.responsable} nombre={b.responsable_nombre} rol="RESPONSABLE" />
        </View>

        <Pie generadoPor={generadoPor} numero={b.numero_orden} />
      </Page>
    </Document>
  );
}
