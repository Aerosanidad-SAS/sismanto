"use client";

import { useState } from "react";
import {
  approveInvoiceJob,
  dismissInvoiceJob,
  type InvoiceJob,
} from "@/app/api/actions/invoice-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/forms/date-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  jobs:       InvoiceJob[];
  vehicles:   { id: string; placa: string }[];
  categories: { id: number; nombre: string; grupo_padre: string | null }[];
}

interface FormState {
  vehicleId:          string;
  fecha:              string;
  tipo:               "PREVENTIVO" | "CORRECTIVO";
  descripcionTrabajo: string;
  proveedor:          string;
  valor:              string;
  numeroFactura:      string;
  categoriaId:        string;
  kilometrajeActual:  string;
}

function buildInitialForm(job: InvoiceJob): FormState {
  const d = job.extracted_data;
  return {
    vehicleId:          job.vehicle_id ?? "",
    fecha:              d?.invoice_date ?? "",
    tipo:               d?.tipo ?? "CORRECTIVO",
    descripcionTrabajo: d?.work_description ?? "",
    proveedor:          d?.supplier_name ?? "",
    valor:              d?.total_amount != null ? String(d.total_amount) : "",
    numeroFactura:      d?.invoice_number ?? "",
    categoriaId:        "",
    kilometrajeActual:  "0",
  };
}

function JobCard({
  job,
  vehicles,
  categories,
  onResolved,
}: {
  job:        InvoiceJob;
  vehicles:   Props["vehicles"];
  categories: Props["categories"];
  onResolved: (id: string) => void;
}) {
  const [form, setForm]       = useState<FormState>(() => buildInitialForm(job));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [open, setOpen]       = useState(true);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleApprove() {
    setError(null);
    if (!form.vehicleId) return setError("Selecciona un vehículo.");
    if (!form.fecha)     return setError("La fecha es requerida.");
    if (!form.proveedor) return setError("El proveedor es requerido.");
    const valor = parseFloat(form.valor);
    if (isNaN(valor))    return setError("El valor debe ser numérico.");

    setLoading(true);
    const res = await approveInvoiceJob({
      jobId:              job.id,
      vehicleId:          form.vehicleId,
      fecha:              form.fecha,
      tipo:               form.tipo,
      descripcionTrabajo: form.descripcionTrabajo,
      proveedor:          form.proveedor,
      valor,
      numeroFactura:      form.numeroFactura || undefined,
      categoriaId:        form.categoriaId ? Number(form.categoriaId) : undefined,
      kilometrajeActual:  Number(form.kilometrajeActual) || 0,
    });
    setLoading(false);
    if (res.error) return setError(res.error);
    onResolved(job.id);
  }

  async function handleDismiss() {
    setLoading(true);
    await dismissInvoiceJob(job.id, "Descartado manualmente en revisión");
    setLoading(false);
    onResolved(job.id);
  }

  const d = job.extracted_data;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div>
            <p className="font-medium">{job.source_file_name ?? "Sin nombre"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(job.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
              {job.vehicle_plate && (
                <span className="ml-2 font-mono bg-muted px-1 rounded">
                  {job.vehicle_plate}
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
            {/* Extracted data preview */}
            {d && (
              <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground mb-1">Datos extraídos</p>
                {d.invoice_number && <p>Factura: <span className="font-mono">{d.invoice_number}</span></p>}
                {d.invoice_date   && <p>Fecha:   {d.invoice_date}</p>}
                {d.supplier_name  && <p>Proveedor: {d.supplier_name}</p>}
                {d.total_amount   && <p>Total:   ${d.total_amount.toLocaleString("es-CO")} {d.currency}</p>}
                {d.line_items?.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer">Ver {d.line_items.length} ítem(s)</summary>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {d.line_items.map((item, i) => (
                        <li key={i}>
                          {item.description} × {item.quantity} = $
                          {item.total.toLocaleString("es-CO")}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {d.extraction_notes && (
                  <p className="text-muted-foreground italic">{d.extraction_notes}</p>
                )}
              </div>
            )}

            {/* Editable form */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Vehículo *</Label>
                <Select value={form.vehicleId} onValueChange={(v) => set("vehicleId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar placa" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.placa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Fecha *</Label>
                <DateField value={form.fecha} onChange={(v) => set("fecha", v)} />
              </div>

              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v as FormState["tipo"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                    <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select value={form.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.grupo_padre ? `${c.grupo_padre} › ` : ""}{c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label>Descripción del trabajo</Label>
                <Input
                  value={form.descripcionTrabajo}
                  onChange={(e) => set("descripcionTrabajo", e.target.value)}
                  placeholder="Cambio filtro aceite…"
                />
              </div>

              <div className="space-y-1">
                <Label>Proveedor *</Label>
                <Input
                  value={form.proveedor}
                  onChange={(e) => set("proveedor", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>N.º Factura</Label>
                <Input
                  value={form.numeroFactura}
                  onChange={(e) => set("numeroFactura", e.target.value)}
                  placeholder="F-2341"
                />
              </div>

              <div className="space-y-1">
                <Label>Valor (COP) *</Label>
                <Input
                  type="number"
                  value={form.valor}
                  onChange={(e) => set("valor", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Kilometraje actual</Label>
                <Input
                  type="number"
                  value={form.kilometrajeActual}
                  onChange={(e) => set("kilometrajeActual", e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprobar y guardar
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={loading}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Descartar
              </Button>
            </div>
          </div>
      )}
    </div>
  );
}

export function ReviewJobList({ jobs, vehicles, categories }: Props) {
  const [visible, setVisible] = useState<string[]>(jobs.map((j) => j.id));

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No hay facturas pendientes de revisión.
        </p>
      </div>
    );
  }

  const displayed = jobs.filter((j) => visible.includes(j.id));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {displayed.length} factura{displayed.length !== 1 ? "s" : ""} por revisar
      </p>
      {displayed.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          vehicles={vehicles}
          categories={categories}
          onResolved={(id) => setVisible((prev) => prev.filter((v) => v !== id))}
        />
      ))}
    </div>
  );
}
