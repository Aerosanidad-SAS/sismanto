import * as React from "react";
import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** One clear next step, e.g. <Button>Crear vehículo</Button>. */
  action?: React.ReactNode;
}

/** Nothing to show yet. Say what is missing and offer the action that fills it. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center",
        className
      )}
      {...props}
    >
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Shows the retry button. In `error.tsx` pass Next's `reset`. */
  onRetry?: () => void;
  retryLabel?: string;
}

/** Load failure with a way out. `role="alert"` announces it. */
export function ErrorState({
  title = "No pudimos cargar esta información",
  description = "Revisa tu conexión e inténtalo de nuevo.",
  onRetry,
  retryLabel = "Reintentar",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center",
        className
      )}
      {...props}
    >
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-2 min-h-touch" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
