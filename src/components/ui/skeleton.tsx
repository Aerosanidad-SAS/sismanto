import * as React from "react";

import { cn } from "@/lib/utils";

/** Placeholder block. Decorative: hidden from assistive tech. Pulse only when the user allows motion. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)} {...props} />;
}

export interface SkeletonRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Announced to screen readers while loading. */
  label?: string;
}

/** Wrap a group of <Skeleton/> so screen readers hear one "Cargando…" instead of nothing. */
export function SkeletonRegion({ label = "Cargando…", className, children, ...props }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" className={className} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
