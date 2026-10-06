import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Standard KPI tile. Its layout depends on the width of the card itself (container query units), not on the viewport,
 * so it holds up in any grid column: the title wraps beside the help trigger, the corner icon never gets pushed out, and the
 * value shrinks between 16px and 24px instead of overflowing.
 * Place tiles in `grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]` so the column count follows the available width.
 */
export function KpiCard({
  title,
  help,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  help?: React.ReactNode;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 [container-type:inline-size]", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-3.5 py-3">
        <div className="flex min-w-0 items-start gap-2">
          <CardTitle className="text-sm font-medium leading-tight">{title}</CardTitle>
          {help ? <span className="shrink-0">{help}</span> : null}
        </div>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent className="px-3.5 py-3">{children}</CardContent>
    </Card>
  );
}

export function KpiValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "whitespace-nowrap font-bold leading-tight tabular-nums text-[clamp(1rem,10cqw,1.5rem)]",
        className
      )}
    >
      {children}
    </p>
  );
}

export function KpiCaption({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-1 break-words text-xs text-muted-foreground", className)}>{children}</p>;
}
