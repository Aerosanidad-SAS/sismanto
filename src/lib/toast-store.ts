/**
 * Tiny external store for toasts (no dependencies). The Toaster component subscribes with
 * useSyncExternalStore; `toast()` can be called from anywhere in client code.
 */

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** e.g. {label: "Deshacer", onClick}. The toast closes after the action runs. */
  action?: ToastAction;
  /** ms. 0 = sticky until dismissed. Default: 5000; 8000 with action; 10000 for errors. */
  duration?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: ToastAction;
  duration: number;
}

export const MAX_VISIBLE_TOASTS = 4;

export function defaultDuration(input: Pick<ToastInput, "tone" | "action">): number {
  if (input.tone === "error") return 10_000;
  if (input.action) return 8_000;
  return 5_000;
}

type Listener = () => void;

export function createToastStore() {
  let items: ToastItem[] = [];
  let counter = 0;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l());

  return {
    getSnapshot: () => items,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add(input: ToastInput): string {
      counter += 1;
      const id = `toast-${counter}`;
      const tone = input.tone ?? "info";
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        tone,
        action: input.action,
        duration: input.duration ?? defaultDuration({ tone, action: input.action }),
      };
      items = [...items, item].slice(-MAX_VISIBLE_TOASTS);
      emit();
      return id;
    },
    dismiss(id?: string) {
      const next = id === undefined ? [] : items.filter((t) => t.id !== id);
      if (next.length === items.length) return;
      items = next;
      emit();
    },
  };
}

export const toastStore = createToastStore();

type ToastOptions = Omit<ToastInput, "title" | "tone">;

function add(input: ToastInput) {
  return toastStore.add(input);
}

/** `toast({title})` or `toast.success("Guardado")`. Returns the id (use `toast.dismiss(id)`). */
export const toast = Object.assign(add, {
  success: (title: string, opts: ToastOptions = {}) => add({ ...opts, title, tone: "success" }),
  error: (title: string, opts: ToastOptions = {}) => add({ ...opts, title, tone: "error" }),
  warning: (title: string, opts: ToastOptions = {}) => add({ ...opts, title, tone: "warning" }),
  info: (title: string, opts: ToastOptions = {}) => add({ ...opts, title, tone: "info" }),
  dismiss: (id?: string) => toastStore.dismiss(id),
});
