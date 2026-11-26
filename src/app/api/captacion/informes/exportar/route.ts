import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { getProfile } from "@/app/api/actions/auth";
import { getDatosInformeCaptacion, getFilasSisproMes } from "@/app/api/actions/captacion";
import { auditar } from "@/lib/auditoria";
import { COLUMNAS_SISPRO, puedeUsarCaptacion } from "@/lib/captacion";
import { formatoDia } from "@/lib/fechas";
import {
  EXPORT_INFORMES_MAX_FILAS,
  EXPORT_SISPRO_MAX_MESES,
  detalleAuditoriaExport,
  hojaSispro,
  hojasInformes,
  mesesDelRango,
  nombreHojaSispro,
  parsearInformes,
  validarRangoExport,
  type Hoja,
} from "@/lib/informes-captacion-export";

// Descarga de los informes de captación en un solo libro: ?desde&hasta&aeropuerto&informes=acm,aerocivil,pme,pae,sispro
// (una hoja por informe; SISPRO, una por mes del rango). Los roles se revisan aquí y otra vez dentro de
// getDatosInformeCaptacion / getFilasSisproMes (y la base los exige con RLS).

const error = (mensaje: string, status: number) => NextResponse.json({ error: mensaje }, { status });
const estado = (mensaje: string) => (mensaje === "Sin permisos" ? 403 : 400);

function agregarHoja(libro: XLSX.WorkBook, nombre: string, hoja: Hoja, anchoPrimera = 48) {
  const ws = XLSX.utils.aoa_to_sheet(hoja);
  ws["!cols"] = [{ wch: anchoPrimera }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(libro, ws, nombre);
}

export async function GET(request: Request) {
  const perfil = await getProfile();
  if (!perfil || !puedeUsarCaptacion(perfil.role_codigo)) return error("Sin permisos", 403);

  const p = new URL(request.url).searchParams;
  const desde = p.get("desde");
  const hasta = p.get("hasta");
  const aeropuerto = (p.get("aeropuerto") ?? "").trim().slice(0, 150);
  const informes = parsearInformes(p.get("informes"));
  if (!informes) return error("Elige al menos un informe válido (acm, aerocivil, pme, pae, sispro)", 400);
  const errorRango = validarRangoExport(desde, hasta);
  if (errorRango || !desde || !hasta) return error(errorRango ?? "Fechas inválidas", 400);

  const meses = informes.includes("sispro") ? mesesDelRango(desde, hasta) : [];
  if (meses.length > EXPORT_SISPRO_MAX_MESES) {
    return error(`SISPRO se exporta por meses: el rango toca ${meses.length} y el máximo es ${EXPORT_SISPRO_MAX_MESES}`, 400);
  }

  const periodo = `Del ${formatoDia(desde)} al ${formatoDia(hasta)} — ${aeropuerto || "todos los aeropuertos"}`;
  const libro = XLSX.utils.book_new();
  let captaciones = 0;

  if (informes.some((i) => i !== "sispro")) {
    const datos = await getDatosInformeCaptacion(desde, hasta, aeropuerto || undefined);
    if ("error" in datos) return error(datos.error, estado(datos.error));
    if (datos.filas.length > EXPORT_INFORMES_MAX_FILAS) {
      return error(`El período tiene más de ${EXPORT_INFORMES_MAX_FILAS} captaciones: acórtalo para exportar`, 413);
    }
    captaciones = datos.filas.length;
    for (const { nombre, hoja } of hojasInformes(informes, datos, periodo)) agregarHoja(libro, nombre, hoja);
  }

  let filasSispro = 0;
  for (const mes of meses) {
    const r = await getFilasSisproMes(mes);
    if ("error" in r) return error(r.error, estado(r.error));
    filasSispro += r.total;
    if (filasSispro > EXPORT_INFORMES_MAX_FILAS) {
      return error(`SISPRO supera ${EXPORT_INFORMES_MAX_FILAS} filas en el rango: acórtalo para exportar`, 413);
    }
    const ws = XLSX.utils.aoa_to_sheet(hojaSispro(r.filas));
    ws["!cols"] = COLUMNAS_SISPRO.map((c) => ({ wch: Math.min(Math.max(c.length, 12), 40) }));
    XLSX.utils.book_append_sheet(libro, ws, nombreHojaSispro(mes));
  }
  await auditar(
    "EXPORTAR",
    "captacion",
    "",
    detalleAuditoriaExport({ informes, desde, hasta, aeropuerto, captaciones, mesesSispro: meses, filasSispro }),
  );

  const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="informes-captacion-${desde}_${hasta}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
