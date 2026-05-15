"use client";

import { useState, useCallback, useRef } from "react";
import { FileUp, Loader2, CheckCircle2, XCircle, Trash2, RotateCcw, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  extractInvoiceAction,
  aprobarFacturaMantenimiento,
} from "@/app/api/actions/extract-invoice";
import type { ExtractedInvoiceData, AprobarFacturaData, DuplicadoInfo } from "@/app/api/actions/extract-invoice";
import { formatCurrency } from "@/lib/utils";

interface Vehicle { id: string; placa: string }
interface Category { id: number; nombre: string; grupo_padre: string | null }

type Status = "pending" | "extracting" | "preview" | "approving" | "done" | "error" | "discarded";

interface QueueItem {
  uid: string;
  file: File;
  status: Status;
  extracted?: ExtractedInvoiceData;
  error?: string;
  savedId?: number;
  duplicado?: DuplicadoInfo;
  pendingApproveData?: AprobarFacturaData; // guardado mientras el usuario confirma duplicado
}

const VALID_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 8;

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  compact,
  onFiles,
}: {
  compact: boolean;
  onFiles: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => VALID_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
      );
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => VALID_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    );
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-dashed rounded-lg px-4 py-2"
      >
        <FileUp className="h-4 w-4" />
        Agregar más facturas
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleChange} />
      </button>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <FileUp className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-lg font-medium">Arrastra las facturas aquí</p>
      <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar archivos</p>
      <p className="text-xs text-muted-foreground mt-3">PDF, JPG, PNG, WEBP — máx. {MAX_SIZE_MB} MB por archivo</p>
      <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Preview Form ─────────────────────────────────────────────────────────────

function InvoicePreviewForm({
  item,
  vehicles,
  categories,
  onApprove,
  onDiscard,
}: {
  item: QueueItem;
  vehicles: Vehicle[];
  categories: Category[];
  onApprove: (data: AprobarFacturaData) => void;
  onDiscard: () => void;
}) {
  const ext = item.extracted!;
  const matchedVehicle = vehicles.find(
    (v) => v.placa.toLowerCase() === (ext.placa || "").toLowerCase()
  );

  const [vehicleId, setVehicleId] = useState(matchedVehicle?.id || "");
  const [fecha, setFecha] = useState(ext.fecha || new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<"PREVENTIVO" | "CORRECTIVO">(ext.tipo || "CORRECTIVO");
  const [descripcion, setDescripcion] = useState(ext.descripcion_trabajo || "");
  const [proveedor, setProveedor] = useState(ext.proveedor || "");
  const [factura, setFactura] = useState(ext.numero_factura || "");
  const [valor, setValor] = useState(String(ext.valor ?? ""));
  const [categoriaId, setCategoriaId] = useState("");
  const [km, setKm] = useState("0");
  const [tfs, setTfs] = useState("0");
  const [notas, setNotas] = useState(ext.notas_extraccion || "");
  const [validationError, setValidationError] = useState("");

  const handleApprove = () => {
    if (!vehicleId) return setValidationError("Selecciona el vehículo.");
    if (!fecha) return setValidationError("La fecha es requerida.");
    if (!descripcion || descripcion.length < 5) return setValidationError("Descripción muy corta (mín. 5 chars).");
    if (!proveedor) return setValidationError("El proveedor es requerido.");
    setValidationError("");
    onApprove({
      vehicleId,
      fecha,
      tipo,
      descripcionTrabajo: descripcion,
      proveedor,
      valor: Number(valor) || 0,
      numeroFactura: factura || undefined,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      kilometrajeActual: Number(km) || 0,
      tiempoFueraServicioHoras: Number(tfs) || 0,
      notasAdicionales: notas || undefined,
    });
  };

  const gruposCategoria = categories.reduce(
    (acc, c) => {
      const g = c.grupo_padre || "Otros";
      if (!acc[g]) acc[g] = [];
      acc[g].push(c);
      return acc;
    },
    {} as Record<string, Category[]>
  );

  const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <div className="space-y-4">
      {/* Desglose de ítems extraídos */}
      {ext.items && ext.items.length > 0 && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
          <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Ítems detectados por Claude</p>
          {ext.items.map((it, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {it.cantidad} × {it.descripcion}
              </span>
              <span className="font-mono">{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
          <div className="border-t pt-1 mt-1 flex justify-between font-medium">
            <span>Total calculado</span>
            <span className="font-mono">{formatCurrency(ext.valor ?? ext.items.reduce((s, i) => s + i.subtotal, 0))}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vehículo */}
        <div className="space-y-1">
          <Label>Vehículo *</Label>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={inputClass}>
            <option value="">— Seleccionar —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.placa}</option>
            ))}
          </select>
          {ext.placa && !matchedVehicle && (
            <p className="text-xs text-amber-600">
              Claude detectó placa &quot;{ext.placa}&quot; — no encontrada en la flota.
            </p>
          )}
        </div>

        {/* Fecha */}
        <div className="space-y-1">
          <Label>Fecha *</Label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
        </div>

        {/* Tipo */}
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as "PREVENTIVO" | "CORRECTIVO")} className={inputClass}>
            <option value="PREVENTIVO">PREVENTIVO</option>
            <option value="CORRECTIVO">CORRECTIVO</option>
          </select>
        </div>

        {/* Categoría */}
        <div className="space-y-1">
          <Label>Categoría (opcional)</Label>
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputClass}>
            <option value="">— Sin categoría —</option>
            {Object.entries(gruposCategoria).map(([grupo, cats]) => (
              <optgroup key={grupo} label={grupo}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div className="space-y-1">
          <Label>Proveedor *</Label>
          <input type="text" value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={inputClass} placeholder="Nombre del taller" />
        </div>

        {/* Nº Factura */}
        <div className="space-y-1">
          <Label>Nº Factura</Label>
          <input type="text" value={factura} onChange={(e) => setFactura(e.target.value)} className={inputClass} placeholder="F-0001" />
        </div>

        {/* Valor */}
        <div className="space-y-1">
          <Label>Valor (COP) *</Label>
          <input
            type="number"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={`${inputClass} font-mono`}
            placeholder="0"
          />
        </div>

        {/* Kilometraje */}
        <div className="space-y-1">
          <Label>Kilometraje (si conocido)</Label>
          <input type="number" min="0" value={km} onChange={(e) => setKm(e.target.value)} className={`${inputClass} font-mono`} placeholder="0" />
        </div>

        {/* Tiempo fuera de servicio */}
        <div className="space-y-1">
          <Label>Horas fuera de servicio</Label>
          <input type="number" min="0" step="0.5" value={tfs} onChange={(e) => setTfs(e.target.value)} className={inputClass} placeholder="0" />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <Label>Descripción del trabajo *</Label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Trabajos realizados, repuestos usados..."
        />
      </div>

      {/* Notas adicionales */}
      <div className="space-y-1">
        <Label>Notas adicionales</Label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Observaciones, notas de extracción..."
        />
      </div>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleApprove} className="flex-1">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Aprobar y guardar
        </Button>
        <Button variant="outline" onClick={onDiscard}>
          <Trash2 className="mr-2 h-4 w-4" />
          Descartar
        </Button>
      </div>
    </div>
  );
}

// ─── Queue Item Card ──────────────────────────────────────────────────────────

function QueueItemCard({
  item,
  vehicles,
  categories,
  onApprove,
  onDiscard,
  onRetry,
}: {
  item: QueueItem;
  vehicles: Vehicle[];
  categories: Category[];
  onApprove: (uid: string, data: AprobarFacturaData, forzar?: boolean) => void;
  onDiscard: (uid: string) => void;
  onRetry: (uid: string) => void;
}) {
  const fileIcon = item.file.type === "application/pdf"
    ? <FileText className="h-4 w-4 text-muted-foreground" />
    : <Image className="h-4 w-4 text-muted-foreground" />;

  const isDuplicateWarning = item.status === "preview" && !!item.duplicado;

  const statusBadge = isDuplicateWarning
    ? <Badge variant="outline" className="border-orange-500 text-orange-600">Posible duplicado</Badge>
    : {
        pending:    <Badge variant="secondary">En cola</Badge>,
        extracting: <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Extrayendo...</Badge>,
        preview:    <Badge variant="outline" className="border-amber-500 text-amber-600">Pendiente revisión</Badge>,
        approving:  <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Guardando...</Badge>,
        done:       <Badge className="bg-green-600 hover:bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" />Guardado</Badge>,
        error:      <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Error</Badge>,
        discarded:  <Badge variant="secondary" className="text-muted-foreground">Descartada</Badge>,
      }[item.status];

  return (
    <Card className={item.status === "discarded" ? "opacity-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {fileIcon}
            <CardTitle className="text-sm font-medium truncate">{item.file.name}</CardTitle>
            <span className="text-xs text-muted-foreground shrink-0">
              ({(item.file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          {statusBadge}
        </div>
      </CardHeader>

      {/* Banner de duplicado detectado */}
      {isDuplicateWarning && item.duplicado && item.pendingApproveData && (
        <CardContent className="pt-0 pb-3">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2 text-sm">
            <p className="font-medium text-orange-800">
              Ya existe un registro similar en la base de datos:
            </p>
            <p className="text-orange-700">
              <span className="font-mono">{item.duplicado.placa}</span>
              {" · "}{item.duplicado.fecha}
              {item.duplicado.valor ? ` · ${formatCurrency(item.duplicado.valor)}` : ""}
              {item.duplicado.descripcion ? ` · ${item.duplicado.descripcion.slice(0, 60)}` : ""}
            </p>
            <p className="text-orange-700 text-xs">
              ID #{item.duplicado.idManto} — ¿Quieres guardar este registro de todas formas?
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="border-orange-400 text-orange-700 hover:bg-orange-100"
                onClick={() => onApprove(item.uid, item.pendingApproveData!, true)}
              >
                Sí, guardar de todas formas
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDiscard(item.uid)}
              >
                Descartar
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      {(item.status === "preview" || item.status === "approving") && item.extracted && !item.duplicado && (
        <CardContent className={isDuplicateWarning ? "pt-0" : undefined}>
          <InvoicePreviewForm
            item={item}
            vehicles={vehicles}
            categories={categories}
            onApprove={(data) => onApprove(item.uid, data)}
            onDiscard={() => onDiscard(item.uid)}
          />
        </CardContent>
      )}

      {item.status === "error" && (
        <CardContent className="pt-0">
          <p className="text-sm text-destructive mb-3">{item.error}</p>
          <Button variant="outline" size="sm" onClick={() => onRetry(item.uid)}>
            <RotateCcw className="mr-2 h-3 w-3" />
            Reintentar
          </Button>
        </CardContent>
      )}

      {item.status === "done" && (
        <CardContent className="pt-0">
          <p className="text-sm text-green-600">
            Mantenimiento #{item.savedId} guardado correctamente.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InvoiceUploader({
  vehicles,
  categories,
}: {
  vehicles: Vehicle[];
  categories: Category[];
}) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const processingRef = useRef(false);

  const updateItem = (uid: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((i) => (i.uid === uid ? { ...i, ...patch } : i)));

  const processItem = useCallback(async (uid: string, file: File) => {
    updateItem(uid, { status: "extracting" });
    const formData = new FormData();
    formData.append("file", file);
    const result = await extractInvoiceAction(formData);
    if (result.error) {
      updateItem(uid, { status: "error", error: result.error });
    } else {
      updateItem(uid, { status: "preview", extracted: result.data });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback(
    async (files: File[]) => {
      const items: QueueItem[] = files.map((f) => ({
        uid: crypto.randomUUID(),
        file: f,
        status: "pending",
      }));
      setQueue((prev) => [...prev, ...items]);

      // Process sequentially so the user sees one at a time
      if (!processingRef.current) {
        processingRef.current = true;
        for (const item of items) {
          await processItem(item.uid, item.file);
        }
        processingRef.current = false;
      }
    },
    [processItem]
  );

  const handleApprove = useCallback(async (uid: string, data: AprobarFacturaData, forzar = false) => {
    updateItem(uid, { status: "approving", duplicado: undefined, pendingApproveData: undefined });
    const result = await aprobarFacturaMantenimiento(data, forzar);
    if (result.duplicado) {
      // Pausar y mostrar confirmación al usuario
      updateItem(uid, { status: "preview", duplicado: result.duplicado, pendingApproveData: data });
    } else if (result.error) {
      updateItem(uid, { status: "preview", error: result.error });
    } else {
      updateItem(uid, { status: "done", savedId: result.idManto });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDiscard = useCallback((uid: string) => {
    updateItem(uid, { status: "discarded" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(
    async (uid: string) => {
      const item = queue.find((i) => i.uid === uid);
      if (!item) return;
      updateItem(uid, { status: "pending", error: undefined });
      await processItem(uid, item.file);
    },
    [queue, processItem]
  );

  const activeCount = queue.filter((i) => !["done", "discarded"].includes(i.status)).length;
  const doneCount = queue.filter((i) => i.status === "done").length;
  const hasQueue = queue.length > 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <DropZone compact={hasQueue} onFiles={addFiles} />

      {/* Summary bar */}
      {hasQueue && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {queue.length} archivo{queue.length !== 1 ? "s" : ""} —{" "}
            {doneCount} guardado{doneCount !== 1 ? "s" : ""}
            {activeCount > 0 && `, ${activeCount} pendiente${activeCount !== 1 ? "s" : ""}`}
          </span>
          {queue.every((i) => ["done", "discarded", "error"].includes(i.status)) && (
            <button
              onClick={() => setQueue([])}
              className="text-xs hover:text-foreground transition-colors"
            >
              Limpiar lista
            </button>
          )}
        </div>
      )}

      {/* Queue */}
      <div className="space-y-3">
        {queue.map((item) => (
          <QueueItemCard
            key={item.uid}
            item={item}
            vehicles={vehicles}
            categories={categories}
            onApprove={(uid, data, forzar) => handleApprove(uid, data, forzar)}
            onDiscard={handleDiscard}
            onRetry={handleRetry}
          />
        ))}
      </div>
    </div>
  );
}
