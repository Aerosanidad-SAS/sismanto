"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast, toastStore, type ToastItem, type ToastTone } from "@/lib/toast-store";

export { toast };

const TONES: Record<ToastTone, { icon: LucideIcon; classes: string; iconClasses: string }> = {
  success: { icon: CheckCircle2, classes: "border-success/40", iconClasses: "text-success" },
  error: { icon: XCircle, classes: "border-destructive/40", iconClasses: "text-destructive" },
  warning: { icon: AlertTriangle, classes: "border-warning", iconClasses: "text-warning-foreground" },
  info: { icon: Info, classes: "border-info/40", iconClasses: "text-info" },
};

function ToastCard({ item }: { item: ToastItem }) {
  const { icon: Icon, classes, iconClasses } = TONES[item.tone];
  const [paused, setPaused] = React.useState(false);

  // Auto-dismiss, paused while the pointer or focus is inside (WCAG 2.2.1 Timing Adjustable).
  React.useEffect(() => {
    if (item.duration <= 0 || paused) return;
    const timer = window.setTimeout(() => toastStore.dismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.id, item.duration, paused]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2",
        classes
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClasses)} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
      </div>
      {item.action ? (
        <button
          type="button"
          className="inline-flex min-h-touch shrink-0 items-center rounded-md px-3 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            item.action?.onClick();
            toastStore.dismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Cerrar aviso"
        className="inline-flex h-touch w-touch shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring -my-1 -mr-1"
        onClick={() => toastStore.dismiss(item.id)}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Mount once (root layout). Two live regions: polite (`role="status"`) for success/info/warning and
 * assertive (`role="alert"`) for errors. Use `toast.success("Guardado")`, `toast.error(...)`,
 * or `toast({ title, action: { label: "Deshacer", onClick } })`.
 */
export function Toaster() {
  const items = React.useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, () => []);
  const polite = items.filter((t) => t.tone !== "error");
  const assertive = items.filter((t) => t.tone === "error");

  const region = "flex flex-col gap-2";
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-0 sm:max-w-sm"
    >
      <div role="status" aria-live="polite" aria-atomic="false" className={region}>
        {polite.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="false" className={region}>
        {assertive.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
