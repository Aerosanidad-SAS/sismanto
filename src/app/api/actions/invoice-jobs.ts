"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/app/api/actions/auth";
import { revalidatePath } from "next/cache";
import { moveAndRenameFile, getReviewFolderId } from "@/lib/graph/client";
import { buildFileName } from "@/lib/invoice/extractor";
import type { ExtractedInvoice } from "@/lib/invoice/extractor";

export interface InvoiceJob {
  id:               string;
  created_at:       string;
  status:           string;
  source_file_name: string | null;
  source_file_path: string | null;
  onedrive_item_id: string | null;
  extracted_data:   ExtractedInvoice | null;
  vehicle_plate:    string | null;
  vehicle_id:       string | null;
  error_message:    string | null;
  processed_at:     string | null;
}

export async function getJobsForReview(): Promise<{ data?: InvoiceJob[]; error?: string }> {
  await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoice_jobs")
    .select(
      "id, created_at, status, source_file_name, source_file_path, onedrive_item_id, extracted_data, vehicle_plate, vehicle_id, error_message, processed_at"
    )
    .eq("status", "needs_review")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: (data as InvoiceJob[]) ?? [] };
}

export interface ApproveJobData {
  jobId:               string;
  vehicleId:           string;
  fecha:               string;
  tipo:                "PREVENTIVO" | "CORRECTIVO";
  descripcionTrabajo:  string;
  proveedor:           string;
  valor:               number;
  numeroFactura?:      string;
  categoriaId?:        number;
  kilometrajeActual:   number;
}

export async function approveInvoiceJob(
  data: ApproveJobData
): Promise<{ success?: boolean; idManto?: number; error?: string }> {
  const profile = await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);

  const supabase    = createClient();
  const adminClient = createAdminClient();

  // Fetch the job to get onedrive_item_id
  const { data: job, error: jobErr } = await supabase
    .from("invoice_jobs")
    .select("id, onedrive_item_id, source_file_name, extracted_data, vehicle_plate")
    .eq("id", data.jobId)
    .eq("status", "needs_review")
    .single();

  if (jobErr || !job) return { error: "Job no encontrado o ya procesado." };

  // Fetch vehicle for onedrive_folder_id
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, placa, onedrive_folder_id")
    .eq("id", data.vehicleId)
    .single();

  // Insert maintenance record
  const { data: record, error: insertErr } = await supabase
    .from("maintenance_records")
    .insert({
      vehicle_id:          data.vehicleId,
      fecha:               data.fecha,
      kilometraje_actual:  data.kilometrajeActual || 0,
      tipo:                data.tipo,
      categoria_id:        data.categoriaId ?? null,
      descripcion_trabajo: data.descripcionTrabajo,
      proveedor:           data.proveedor,
      valor:               data.valor,
      numero_factura:      data.numeroFactura || null,
      invoice_job_id:      data.jobId,
      created_by:          profile.user_id,
    })
    .select("id_manto")
    .single();

  if (insertErr) return { error: insertErr.message };

  // Move + rename file if we have a OneDrive item ID
  if (job.onedrive_item_id) {
    try {
      const plate     = vehicle?.placa ?? job.vehicle_plate ?? "SINPLACA";
      const ext       = (job.source_file_name ?? "invoice.pdf").split(".").pop() ?? "pdf";
      const newName   = buildFileName(plate, data.fecha, data.descripcionTrabajo, ext);
      const targetFolderId =
        vehicle?.onedrive_folder_id ?? await getReviewFolderId();
      await moveAndRenameFile(job.onedrive_item_id, targetFolderId, newName);
    } catch {
      // File move failure is non-fatal — the record is already saved
    }
  }

  // Update job status
  await adminClient
    .from("invoice_jobs")
    .update({
      status:       "completed",
      vehicle_id:   data.vehicleId,
      processed_at: new Date().toISOString(),
      reviewed_by:  profile.user_id,
      reviewed_at:  new Date().toISOString(),
    })
    .eq("id", data.jobId);

  revalidatePath("/invoices/review");
  revalidatePath("/mantenimientos");

  return { success: true, idManto: record.id_manto };
}

export async function dismissInvoiceJob(
  jobId: string,
  note?: string
): Promise<{ success?: boolean; error?: string }> {
  const profile = await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("invoice_jobs")
    .update({
      status:        "error",
      error_message: note ?? "Descartado manualmente",
      processed_at:  new Date().toISOString(),
      reviewed_by:   profile.user_id,
      reviewed_at:   new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/invoices/review");
  return { success: true };
}
