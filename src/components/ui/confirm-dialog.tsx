"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmOptions {
  title: string;
  /** State the consequence ("El vehículo saldrá de la programación de hoy."). */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for irreversible or hard-to-undo actions. */
  destructive?: boolean;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** Controlled confirmation dialog on top of AlertDialog. Prefer `useConfirm()` for imperative flows. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-touch">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={cn("min-h-touch", destructive && buttonVariants({ variant: "destructive" }))}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Promise-based confirmation, replacement for `window.confirm()`.
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (!(await confirm({ title: "¿Eliminar el vehículo?", destructive: true }))) return;
 *   ...
 *   return (<>{...}{dialog}</>);   // render `dialog` once in the component
 *
 * Resolves `true` on confirm, `false` on cancel, Escape or outside click. A second call while one is
 * open resolves the first with `false`.
 */
export function useConfirm() {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const settle = React.useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = React.useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        settle(false);
        resolverRef.current = resolve;
        setOptions(opts);
      }),
    [settle]
  );

  // If the component unmounts with a pending question, answer "no".
  React.useEffect(() => () => settle(false), [settle]);

  const dialog = (
    <ConfirmDialog
      {...(options ?? { title: "" })}
      open={options !== null}
      onOpenChange={(open) => {
        if (!open) {
          settle(false);
          setOptions(null);
        }
      }}
      onConfirm={() => {
        settle(true);
        setOptions(null);
      }}
    />
  );

  return { confirm, dialog };
}
