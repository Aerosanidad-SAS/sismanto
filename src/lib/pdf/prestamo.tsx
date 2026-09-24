import { Document, Page, Text, View } from "@react-pdf/renderer";
import { fechaCorta, type FirmaPdf } from "@/lib/formatos-ti/comun";
import { estadoPrestamo, type LadoPrestamo, type PrestamoFila } from "@/lib/formatos-ti/prestamo";
import { Campo, Encabezado, Firma, Pie, Seccion, estilos } from "./formato-ti-comun";

const cargo = (nombre: string | null, cargoTxt: string | null) => [nombre, cargoTxt].filter(Boolean).join(" · ");

/**
 * Entrega y/o Préstamo de Equipos Informáticos (G-TECN-F 018). Mismos datos que el PDF de SISRES: equipo, entrega con
 * sus dos firmas y, solo si existe, la devolución con las suyas.
 */
export function PrestamoPdf({
  prestamo: p,
  firmas,
  generadoPor,
}: {
  prestamo: PrestamoFila;
  firmas: Partial<Record<LadoPrestamo, FirmaPdf>>;
  generadoPor: string;
}) {
  const hayDevolucion = !!p.fecha_devolucion || !!firmas.gestion_recibe || !!firmas.usuario_entrega_dev;

  return (
    <Document title={`Préstamo ${p.numero_orden}`} author="Aerosanidad S.A.S.">
      <Page size="LETTER" style={estilos.page}>
        <Encabezado
          titulo="ENTREGA Y/O PRÉSTAMO DE EQUIPOS INFORMÁTICOS"
          codigo="G-TECN-F 018"
          numero={p.numero_orden}
          fecha={fechaCorta(p.fecha_entrega)}
        />

        <Seccion titulo="DATOS DEL EQUIPO" />
        <View style={estilos.grid}>
          <Campo label="Descripción del equipo" valor={p.equipo_descripcion} />
          <Campo label="Placa" valor={p.equipo_placa} />
          <Campo label="Incluye" valor={p.equipo_incluye} ancho="completo" />
          <Campo label="Estado" valor={estadoPrestamo(p) === "DEVUELTO" ? "Devuelto" : "Prestado (sin devolver)"} />
        </View>

        <Seccion titulo="ENTREGA" />
        <View style={estilos.grid}>
          <Campo label="Fecha de entrega" valor={fechaCorta(p.fecha_entrega)} />
        </View>
        <View style={estilos.signatures}>
          <Firma firma={firmas.usuario_recibe} nombre={cargo(p.usuario_recibe_nombre, p.usuario_recibe_cargo)} rol="USUARIO QUE RECIBE" />
          <Firma firma={firmas.func_entrega} nombre={cargo(p.func_entrega_nombre, p.func_entrega_cargo)} rol="FUNCIONARIO QUE ENTREGA" />
        </View>

        {hayDevolucion && (
          <>
            <Seccion titulo="DEVOLUCIÓN" />
            <View style={estilos.grid}>
              <Campo label="Fecha de devolución" valor={fechaCorta(p.fecha_devolucion)} />
            </View>
            <View style={estilos.signatures}>
              <Firma firma={firmas.gestion_recibe} nombre={cargo(p.gestion_recibe_nombre, p.gestion_recibe_cargo)} rol="GESTIÓN TECNOLÓGICA QUE RECIBE" />
              <Firma firma={firmas.usuario_entrega_dev} nombre={cargo(p.usuario_entrega_dev_nombre, p.usuario_entrega_dev_cargo)} rol="USUARIO QUE DEVUELVE" />
            </View>
          </>
        )}

        {p.observaciones ? (
          <>
            <Seccion titulo="OBSERVACIONES" />
            <Text>{p.observaciones}</Text>
          </>
        ) : null}

        <Pie generadoPor={generadoPor} numero={p.numero_orden} />
      </Page>
    </Document>
  );
}
