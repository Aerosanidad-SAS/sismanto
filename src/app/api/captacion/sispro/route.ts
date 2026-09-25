import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { getFilasSisproMes } from "@/app/api/actions/captacion";
import { auditar } from "@/lib/auditoria";
import { COLUMNAS_SISPRO } from "@/lib/captacion";

// Descarga del reporte SISPRO de un mes (?mes=aaaa-mm) en el mismo formato de las hojas
// mensuales del libro "SISPRO 2026". El rol se revisa en getFilasSisproMes (y la base
// vuelve a exigirlo con RLS): sin sesión o sin rol de captación responde 403.

const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

export async function GET(request: Request) {
  const mes = new URL(request.url).searchParams.get("mes") ?? "";
  const resultado = await getFilasSisproMes(mes);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: resultado.error === "Sin permisos" ? 403 : 400 });
  }

  const [anio, num] = mes.split("-").map(Number);
  await auditar("EXPORTAR", "captacion", "", `Reporte SISPRO ${mes} (${resultado.total} filas)`);
  const hoja = XLSX.utils.aoa_to_sheet([[...COLUMNAS_SISPRO], ...resultado.filas]);
  hoja["!cols"] = COLUMNAS_SISPRO.map((c) => ({ wch: Math.min(Math.max(c.length, 12), 40) }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, MESES[num - 1]);
  const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="SISPRO-${anio}-${String(num).padStart(2, "0")}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
