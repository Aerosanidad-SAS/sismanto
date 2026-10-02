import type { HTMLAttributes } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Placeholder block. The pulse is skipped for people who ask the OS for reduced motion. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)} {...props} />;
}

/** Announces the loading state once to assistive tech; the blocks inside are decorative. */
function LoadingRegion({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-3.5 py-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="px-3.5 py-3">
        <Skeleton className="h-7 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
      {Array.from({ length: count }, (_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn("h-64 w-full", className)} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

/** Title + four KPI cards + table: the generic shape of a dashboard screen. */
export function PageSkeleton({ label = "Cargando la pantalla" }: { label?: string }) {
  return (
    <LoadingRegion label={label} className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <KpiGridSkeleton />
      <TableSkeleton />
    </LoadingRegion>
  );
}

/** Fallback for the KPIs screen: four cards and a chart. */
export function KpisSkeleton() {
  return (
    <LoadingRegion label="Cargando indicadores" className="space-y-6">
      <KpiGridSkeleton />
      <ChartSkeleton />
    </LoadingRegion>
  );
}

/** Fallback for form screens. */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <LoadingRegion label="Cargando el formulario" className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Full-viewport placeholder for the root segment (outside the dashboard shell). */
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <PageSkeleton />
      </div>
    </div>
  );
}

/** Dashboard chrome while there is nothing to show yet (client shell waiting on a redirect). */
export function ShellContentSkeleton() {
  return <PageSkeleton label="Redirigiendo" />;
}
