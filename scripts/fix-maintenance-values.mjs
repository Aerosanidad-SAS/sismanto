/**
 * scripts/fix-maintenance-values.mjs
 *
 * Corrige valores incorrectos en maintenance_records causados por extracción
 * errónea de facturas (el AI anterior leía el texto legal en lugar de las líneas reales).
 *
 * Modos de uso:
 *
 *   node scripts/fix-maintenance-values.mjs --list [--umbral 10000000]
 *     → Lista todos los registros con valor sospechoso en la BD.
 *
 *   node scripts/fix-maintenance-values.mjs --extract ./factura.pdf
 *     → Lee la factura con Claude y muestra el valor correcto (no actualiza BD).
 *
 *   node scripts/fix-maintenance-values.mjs --extract ./factura.pdf --record-id <uuid>
 *     → Lee la factura, muestra el valor correcto y pide confirmación para actualizar.
 *
 *   node scripts/fix-maintenance-values.mjs --update <uuid> --valor <numero>
 *     → Actualiza directamente un registro con el valor correcto.
 *
 *   node scripts/fix-maintenance-values.mjs --batch ./carpeta-facturas/ [--dry-run]
 *     → Procesa todos los PDF/imágenes de la carpeta. Intenta hacer match con registros
 *       sospechosos por placa+fecha detectadas en el nombre del archivo.
 *
 * Formatos de factura soportados: PDF, PNG, JPG, JPEG, WEBP
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { extname, basename, resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

// ─── Config ───────────────────────────────────────────────────────────────────

const UMBRAL_DEFAULT = 10_000_000; // COP — registros por encima de esto son sospechosos

const args = process.argv.slice(2);
const MODE_LIST    = args.includes("--list");
const MODE_EXTRACT = args.includes("--extract");
const MODE_UPDATE  = args.includes("--update");
const MODE_BATCH   = args.includes("--batch");
const DRY_RUN      = args.includes("--dry-run");

const umbral = (() => {
  const i = args.indexOf("--umbral");
  return i >= 0 ? Number(args[i + 1]) || UMBRAL_DEFAULT : UMBRAL_DEFAULT;
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadEnv() {
  const raw = readFileSync(".env.local", "utf-8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function fmt(n) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

function getMediaType(filePath) {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":  return "application/pdf";
    case ".png":  return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    default:      return null;
  }
}

// ─── Claude extraction ────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `Eres un extractor de información de facturas de mantenimiento vehicular colombianas.

Tu tarea es encontrar el VALOR TOTAL REAL del servicio de mantenimiento (suma de repuestos + mano de obra).

REGLAS CRÍTICAS:
1. IGNORA completamente cualquier texto legal como: "A esta factura de venta aplican las normas relativas a la ley", "resolución", "DIAN", "por valor de $X". Estos valores son referencias legales, NO el costo del mantenimiento.
2. SOLO suma los ítems de línea reales: repuestos (con cantidad × precio unitario) y mano de obra listados en la factura.
3. Si ves IVA (19%), inclúyelo en el total si aparece explícitamente.
4. Si hay descuentos aplicados, réstalos.

Responde ÚNICAMENTE con JSON válido en este formato:
{
  "items": [
    { "descripcion": "...", "cantidad": 1, "precio_unitario": 190400, "subtotal": 190400 }
  ],
  "subtotal_sin_iva": 226100,
  "iva": 0,
  "total": 226100,
  "notas": "cualquier observación relevante"
}

No incluyas texto fuera del JSON.`;

async function extractFromInvoice(anthropic, filePath) {
  const mediaType = getMediaType(filePath);
  if (!mediaType) throw new Error(`Formato no soportado: ${extname(filePath)}`);

  const fileData = readFileSync(filePath);
  const base64 = fileData.toString("base64");

  const isImage = mediaType.startsWith("image/");

  const contentBlock = isImage
    ? { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }
    : { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } };

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          contentBlock,
          { type: "text", text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const raw = response.content[0]?.text || "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude no devolvió JSON válido:\n${raw}`);
  return JSON.parse(jsonMatch[0]);
}

// ─── Modos ────────────────────────────────────────────────────────────────────

async function modeList(supabase) {
  console.log(`\nBuscando registros con valor > ${fmt(umbral)}...\n`);

  const { data, error } = await supabase
    .from("maintenance_records")
    .select("id, fecha, tipo, descripcion_trabajo, valor, numero_factura, vehicles(placa)")
    .gt("valor", umbral)
    .order("valor", { ascending: false });

  if (error) { console.error("Error:", error.message); return; }
  if (!data?.length) { console.log("✅ No hay registros sospechosos."); return; }

  console.log(`${data.length} registros sospechosos:\n`);
  console.log("ID".padEnd(38) + "Placa".padEnd(10) + "Fecha".padEnd(12) + "Tipo".padEnd(14) + "Valor".padStart(18) + "  Factura");
  console.log("─".repeat(100));

  for (const r of data) {
    const placa = r.vehicles?.placa || "?";
    const tipo  = r.tipo || "";
    const fac   = r.numero_factura || "-";
    const desc  = (r.descripcion_trabajo || "").slice(0, 30);
    console.log(
      r.id.padEnd(38) +
      placa.padEnd(10) +
      r.fecha.padEnd(12) +
      tipo.padEnd(14) +
      fmt(r.valor).padStart(18) +
      `  ${fac} — ${desc}`
    );
  }
  console.log("\nUsa --extract <archivo> --record-id <id> para corregir cada uno.");
}

async function modeExtract(supabase, anthropic) {
  const fileArg = args[args.indexOf("--extract") + 1];
  if (!fileArg || fileArg.startsWith("--")) {
    console.error("Especifica un archivo: --extract ./factura.pdf"); process.exit(1);
  }
  const filePath = resolve(fileArg);
  if (!existsSync(filePath)) { console.error(`Archivo no encontrado: ${filePath}`); process.exit(1); }

  const recordIdIdx = args.indexOf("--record-id");
  const recordId = recordIdIdx >= 0 ? args[recordIdIdx + 1] : null;

  console.log(`\nExtrayendo valor de: ${basename(filePath)}`);
  console.log("Consultando a Claude...\n");

  let extraction;
  try {
    extraction = await extractFromInvoice(anthropic, filePath);
  } catch (err) {
    console.error("Error en extracción:", err.message); process.exit(1);
  }

  console.log("─".repeat(50));
  console.log("ÍTEMS DETECTADOS:");
  for (const item of extraction.items || []) {
    console.log(`  ${String(item.cantidad).padStart(3)} × ${item.descripcion.padEnd(35)} = ${fmt(item.subtotal)}`);
  }
  console.log("─".repeat(50));
  if (extraction.iva > 0) {
    console.log(`  Subtotal: ${fmt(extraction.subtotal_sin_iva)}`);
    console.log(`  IVA:      ${fmt(extraction.iva)}`);
  }
  console.log(`  TOTAL:    ${fmt(extraction.total)}`);
  if (extraction.notas) console.log(`  Notas:    ${extraction.notas}`);
  console.log("─".repeat(50));

  if (!recordId) {
    console.log("\nNo se especificó --record-id. Solo extracción, sin actualización.");
    return;
  }

  // Mostrar registro actual
  const { data: rec } = await supabase
    .from("maintenance_records")
    .select("id, fecha, tipo, descripcion_trabajo, valor, vehicles(placa)")
    .eq("id", recordId)
    .single();

  if (!rec) { console.error(`Registro no encontrado: ${recordId}`); process.exit(1); }

  console.log(`\nRegistro actual:`);
  console.log(`  Placa : ${rec.vehicles?.placa}`);
  console.log(`  Fecha : ${rec.fecha}`);
  console.log(`  Tipo  : ${rec.tipo}`);
  console.log(`  Desc  : ${rec.descripcion_trabajo}`);
  console.log(`  Valor : ${fmt(rec.valor)}  ← INCORRECTO`);
  console.log(`\nNuevo valor: ${fmt(extraction.total)}`);

  const respuesta = await prompt("\n¿Actualizar este registro? (s/N): ");
  if (respuesta.toLowerCase() !== "s") { console.log("Cancelado."); return; }

  if (!DRY_RUN) {
    const { error } = await supabase
      .from("maintenance_records")
      .update({ valor: extraction.total, valor_necesita_revision: false })
      .eq("id", recordId);
    if (error) { console.error("Error al actualizar:", error.message); return; }
    console.log(`✅ Registro ${recordId} actualizado → ${fmt(extraction.total)}`);
  } else {
    console.log(`[DRY RUN] Se habría actualizado ${recordId} → ${fmt(extraction.total)}`);
  }
}

async function modeUpdate(supabase) {
  const idIdx  = args.indexOf("--update");
  const valIdx = args.indexOf("--valor");
  const recordId = args[idIdx + 1];
  const valor    = Number(args[valIdx + 1]);

  if (!recordId || !valor || isNaN(valor)) {
    console.error("Uso: --update <uuid> --valor <numero>"); process.exit(1);
  }

  const { data: rec } = await supabase
    .from("maintenance_records")
    .select("id, fecha, tipo, descripcion_trabajo, valor, vehicles(placa)")
    .eq("id", recordId)
    .single();

  if (!rec) { console.error(`Registro no encontrado: ${recordId}`); process.exit(1); }

  console.log(`\nRegistro: ${rec.vehicles?.placa} | ${rec.fecha} | ${rec.tipo}`);
  console.log(`Valor actual : ${fmt(rec.valor)}`);
  console.log(`Nuevo valor  : ${fmt(valor)}`);

  const respuesta = await prompt("\n¿Confirmar actualización? (s/N): ");
  if (respuesta.toLowerCase() !== "s") { console.log("Cancelado."); return; }

  if (!DRY_RUN) {
    const { error } = await supabase
      .from("maintenance_records")
      .update({ valor, valor_necesita_revision: false })
      .eq("id", recordId);
    if (error) { console.error("Error:", error.message); return; }
    console.log(`✅ Actualizado → ${fmt(valor)}`);
  } else {
    console.log(`[DRY RUN] Se habría actualizado → ${fmt(valor)}`);
  }
}

async function modeBatch(supabase, anthropic) {
  const folderArg = args[args.indexOf("--batch") + 1];
  if (!folderArg || folderArg.startsWith("--")) {
    console.error("Especifica carpeta: --batch ./facturas/"); process.exit(1);
  }
  const folderPath = resolve(folderArg);
  if (!existsSync(folderPath)) { console.error(`Carpeta no encontrada: ${folderPath}`); process.exit(1); }

  const validExts = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);
  const files = readdirSync(folderPath).filter(f => validExts.has(extname(f).toLowerCase()));

  if (!files.length) { console.log("No hay archivos de factura en la carpeta."); return; }

  // Cargar registros sospechosos
  const { data: suspicious } = await supabase
    .from("maintenance_records")
    .select("id, fecha, tipo, descripcion_trabajo, valor, numero_factura, vehicles(placa)")
    .gt("valor", umbral)
    .order("valor", { ascending: false });

  console.log(`\n${files.length} archivos en carpeta | ${suspicious?.length || 0} registros sospechosos en BD`);
  if (DRY_RUN) console.log("*** DRY RUN — no se actualizará nada ***\n");

  let processed = 0, updated = 0, errors = 0;

  for (const file of files) {
    const filePath = resolve(folderPath, file);
    const nameLower = file.toLowerCase();

    // Intentar hacer match por número de factura o placa+fecha en el nombre del archivo
    const matchedRecord = (suspicious || []).find(r => {
      const fac = (r.numero_factura || "").toLowerCase();
      const placa = (r.vehicles?.placa || "").toLowerCase();
      const fecha = (r.fecha || "").replace(/-/g, "");
      return (fac && nameLower.includes(fac)) ||
             (placa && fecha && nameLower.includes(placa) && nameLower.includes(fecha.slice(0, 6)));
    });

    process.stdout.write(`\n📄 ${file}`);

    let extraction;
    try {
      extraction = await extractFromInvoice(anthropic, filePath);
      process.stdout.write(` → ${fmt(extraction.total)}`);
      processed++;
    } catch (err) {
      process.stdout.write(` ❌ ${err.message}`);
      errors++;
      continue;
    }

    if (!matchedRecord) {
      process.stdout.write(" (sin match en BD — verifica manualmente con --extract + --record-id)");
      continue;
    }

    process.stdout.write(`\n  Match: ${matchedRecord.vehicles?.placa} ${matchedRecord.fecha} | valor actual: ${fmt(matchedRecord.valor)}`);

    if (!DRY_RUN) {
      const { error } = await supabase
        .from("maintenance_records")
        .update({ valor: extraction.total, valor_necesita_revision: false })
        .eq("id", matchedRecord.id);
      if (error) {
        process.stdout.write(` ❌ ${error.message}`);
        errors++;
      } else {
        process.stdout.write(" ✅ actualizado");
        updated++;
      }
    } else {
      process.stdout.write(" [DRY RUN — se actualizaría]");
    }
  }

  console.log(`\n\n─────────────────────────────────`);
  console.log(`Procesados : ${processed}/${files.length}`);
  console.log(`Actualizados: ${updated}`);
  console.log(`Errores    : ${errors}`);
  if (DRY_RUN) console.log("(DRY RUN — sin cambios reales)");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!MODE_LIST && !MODE_EXTRACT && !MODE_UPDATE && !MODE_BATCH) {
    console.log(`
Uso: node scripts/fix-maintenance-values.mjs <modo> [opciones]

Modos:
  --list                         Lista registros sospechosos (valor > umbral)
  --extract <archivo>            Extrae valor correcto de una factura
  --extract <archivo> --record-id <uuid>  Extrae y actualiza un registro
  --update <uuid> --valor <num>  Actualiza directamente un registro
  --batch <carpeta>              Procesa carpeta completa de facturas

Opciones:
  --umbral <num>   Umbral de sospecha en COP (default: 10000000)
  --dry-run        No actualiza la BD
`);
    process.exit(0);
  }

  const env = loadEnv();
  const supabase = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"], {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anthropic = new Anthropic({ apiKey: env["ANTHROPIC_API_KEY"] || process.env.ANTHROPIC_API_KEY });

  if (MODE_LIST)    await modeList(supabase);
  if (MODE_EXTRACT) await modeExtract(supabase, anthropic);
  if (MODE_UPDATE)  await modeUpdate(supabase);
  if (MODE_BATCH)   await modeBatch(supabase, anthropic);

  console.log();
}

main().catch(err => {
  console.error("\n❌ Error inesperado:", err.message || err);
  process.exit(1);
});
