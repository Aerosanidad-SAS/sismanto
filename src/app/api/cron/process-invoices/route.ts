import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadFile, moveAndRenameFile, getReviewFolderId } from "@/lib/graph/client";
import { extractInvoice, buildFileName } from "@/lib/invoice/extractor";

export const maxDuration = 300; // Vercel Pro max; cap at 60 on Hobby

const BATCH_SIZE = 5;

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf:  "application/pdf",
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function POST(request: NextRequest): Promise<Response> {
  // Vercel cron sends: Authorization: Bearer {CRON_SECRET}
  // Fail-closed: if the secret is not configured, reject all requests.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Pick oldest pending jobs
  const { data: jobs, error: fetchErr } = await supabase
    .from("invoice_jobs")
    .select("id, onedrive_item_id, source_file_name")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: "No pending jobs" });
  }

  const results: Array<{ id: string; status: string; plate?: string | null }> = [];

  for (const job of jobs) {
    // Mark as processing to prevent double-processing on overlapping cron runs
    await supabase
      .from("invoice_jobs")
      .update({ status: "processing" })
      .eq("id", job.id);

    try {
      const itemId   = job.onedrive_item_id!;
      const fileName = job.source_file_name ?? "invoice.pdf";
      const mimeType = getMimeType(fileName);
      const ext      = fileName.split(".").pop() ?? "pdf";

      // ── 1. Download from OneDrive ─────────────────────────────────────────
      const buffer = await downloadFile(itemId);

      // ── 2. Extract with Claude ────────────────────────────────────────────
      const { data: extracted, lowConfidence } = await extractInvoice(buffer, mimeType);

      if (!extracted || lowConfidence) {
        // Move to review folder
        const reviewFolderId = await getReviewFolderId();
        const plate = extracted?.vehicle_plate ?? "SINPLACA";
        const newName = `REVISAR_${plate}_${fileName}`;
        await moveAndRenameFile(itemId, reviewFolderId, newName);

        await supabase
          .from("invoice_jobs")
          .update({
            status:         "needs_review",
            extracted_data: extracted ?? null,
            vehicle_plate:  extracted?.vehicle_plate ?? null,
            processed_at:   new Date().toISOString(),
            error_message:  lowConfidence
              ? "Baja confianza: placa o valor total no detectados"
              : "Extracción fallida",
          })
          .eq("id", job.id);

        results.push({ id: job.id, status: "needs_review", plate: extracted?.vehicle_plate });
        continue;
      }

      // ── 3. Lookup vehicle by plate (case-insensitive) ─────────────────────
      const plate = extracted.vehicle_plate!.toUpperCase().replace(/\s/g, "");
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("id, onedrive_folder_id")
        .ilike("placa", plate)
        .maybeSingle();

      // ── 4. Insert maintenance record ──────────────────────────────────────
      const { data: record, error: insertErr } = await supabase
        .from("maintenance_records")
        .insert({
          vehicle_id:             vehicle?.id ?? null,
          fecha:                  extracted.invoice_date ?? new Date().toISOString().slice(0, 10),
          kilometraje_actual:     0,
          tipo:                   (extracted.tipo ?? "CORRECTIVO") as "PREVENTIVO" | "CORRECTIVO",
          descripcion_trabajo:    extracted.work_description ?? null,
          proveedor:              extracted.supplier_name ?? null,
          valor:                  extracted.total_amount ?? null,
          numero_factura:         extracted.invoice_number ?? null,
          invoice_job_id:         job.id,
        })
        .select("id_manto")
        .single();

      if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

      // ── 5. Rename + move file ─────────────────────────────────────────────
      const newName = buildFileName(
        plate,
        extracted.invoice_date ?? new Date().toISOString().slice(0, 10),
        extracted.work_description ?? extracted.supplier_name ?? "Mantenimiento",
        ext
      );

      const targetFolderId =
        vehicle?.onedrive_folder_id ?? await getReviewFolderId();

      await moveAndRenameFile(itemId, targetFolderId, newName);

      // ── 6. Update job as completed ────────────────────────────────────────
      await supabase
        .from("invoice_jobs")
        .update({
          status:         "completed",
          extracted_data: extracted,
          vehicle_plate:  plate,
          vehicle_id:     vehicle?.id ?? null,
          processed_at:   new Date().toISOString(),
        })
        .eq("id", job.id);

      results.push({ id: job.id, status: "completed", plate });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabase
        .from("invoice_jobs")
        .update({
          status:        "error",
          error_message: msg,
          processed_at:  new Date().toISOString(),
        })
        .eq("id", job.id);

      results.push({ id: job.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

