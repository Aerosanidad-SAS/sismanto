import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statTileVariants = cva("rounded-xl border bg-card p-4 text-card-foreground", {
  variants: {
    tone: {
      default: "border-border",
      success: "border-success/40 bg-success-soft",
      warning: "border-warning bg-warning-soft",
      danger: "border-destructive/40 bg-destructive/5",
      info: "border-info/40 bg-info-soft",
    },
  },
  defaultVariants: { tone: "default" },
});

export interface StatTileProps extends VariantProps<typeof statTileVariants> {
  label: string;
  value: React.ReactNode;
  /** Context under the value: unit, comparison, last update. Text, not color. */
  hint?: React.ReactNode;
  icon?: LucideIcon;
  /** Makes the whole tile a link. */
  href?: string;
  className?: string;
}

/** Single metric: label, big number, optional hint and icon. Replaces the ad-hoc counters. */
export function StatTile({ label, value, hint, icon: Icon, href, tone, className }: StatTileProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
      </div>
      <p className="mt-1 text-3xl font-semibold tabular-nums leading-none">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </>
  );
  const classes = cn(statTileVariants({ tone }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          classes,
          "block transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}

export { statTileVariants };
