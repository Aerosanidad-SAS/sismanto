import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, MinusCircle, XCircle, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        success: "border-success/30 bg-success-soft text-success",
        warning: "border-warning/60 bg-warning-soft text-warning-foreground",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-info/30 bg-info-soft text-info",
        neutral: "border-border bg-muted text-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export type StatusTone = NonNullable<VariantProps<typeof statusBadgeVariants>["tone"]>;

const DEFAULT_ICONS: Record<StatusTone, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  neutral: MinusCircle,
};

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: StatusTone;
  /** Replaces the default icon of the tone. Pass `null` only for very dense tables (the text still carries the meaning). */
  icon?: LucideIcon | null;
  /** Visible text. Status is never conveyed by color alone. */
  children: React.ReactNode;
}

/** Icon + text status pill. One source for service, vehicle and alert states. */
export function StatusBadge({ tone = "neutral", icon, className, children, ...props }: StatusBadgeProps) {
  const Icon = icon === null ? null : icon ?? DEFAULT_ICONS[tone];
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)} {...props}>
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}

export { statusBadgeVariants };
