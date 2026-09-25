"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Info,
  Zap,
  Fuel,
  Wrench,
  Truck,
  Users,
  BarChart3,
} from "lucide-react";

type Insight = {
  categoria: "combustible" | "novedades" | "mantenimiento" | "disponibilidad" | "conductores";
  severidad: "crítico" | "alerta" | "info";
  titulo: string;
  descripcion: string;
  vehiculos_afectados?: string[];
  recomendacion?: string;
};

type InsightsResult = {
  insights: Insight[];
  resumen_ejecutivo: string;
  periodo: string;
  generado_en: string;
};

const categoriaIcono: Record<Insight["categoria"], typeof Fuel> = {
  combustible: Fuel,
  novedades: AlertTriangle,
  mantenimiento: Wrench,
  disponibilidad: Truck,
  conductores: Users,
};

const severidadConfig: Record<Insight["severidad"], { color: string; badgeVariant: "destructive" | "default" | "secondary"; icon: typeof AlertTriangle }> = {
  crítico: { color: "border-l-red-500", badgeVariant: "destructive", icon: Zap },
  alerta: { color: "border-l-yellow-500", badgeVariant: "default", icon: AlertTriangle },
  info: { color: "border-l-blue-500", badgeVariant: "secondary", icon: Info },
};

export function InsightsPanel() {
  const [result, setResult] = useState<InsightsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al generar insights");
        return;
      }

      setResult(data as InsightsResult);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const criticos = result?.insights.filter((i) => i.severidad === "crítico") ?? [];
  const alertas = result?.insights.filter((i) => i.severidad === "alerta") ?? [];
  const infos = result?.insights.filter((i) => i.severidad === "info") ?? [];

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Análisis de los últimos 90 días de operación de la flota.
          </p>
          {result && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Período: {result.periodo} · Generado: {new Date(result.generado_en).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
            </p>
          )}
        </div>
        <Button
          onClick={analyze}
          disabled={loading}
          className="bg-[#2BB6C7] hover:bg-[#2BB6C7]/90 gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Analizando…</>
          ) : (
            <><RefreshCw className="w-4 h-4" />Analizar ahora</>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <div className="relative">
            <BarChart3 className="w-10 h-10 opacity-20" />
            <Loader2 className="w-5 h-5 animate-spin absolute -bottom-1 -right-1 text-[#2BB6C7]" />
          </div>
          <p className="text-sm">Consultando datos de flota y generando análisis con IA…</p>
          <p className="text-xs">Esto puede tomar 15-30 segundos</p>
        </div>
      )}

      {/* Initial state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">Sin análisis disponible</p>
          <p className="text-xs text-center max-w-sm">
            Haz clic en &quot;Analizar ahora&quot; para que la IA examine los datos de combustible, novedades, mantenimientos y disponibilidad de la flota.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Resumen ejecutivo */}
          <Card className="border-[#2BB6C7]/30 bg-[#2BB6C7]/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#2BB6C7] flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Resumen ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{result.resumen_ejecutivo}</p>
            </CardContent>
          </Card>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Críticos", count: criticos.length, color: "text-red-600", bg: "bg-red-50 border-red-200" },
              { label: "Alertas", count: alertas.length, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
              { label: "Informativos", count: infos.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg border px-4 py-3 text-center ${item.bg}`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Insights list */}
          <div className="space-y-3">
            {result.insights.map((insight, i) => {
              const CategoriaIcon = categoriaIcono[insight.categoria];
              const sev = severidadConfig[insight.severidad];
              const SevIcon = sev.icon;

              return (
                <div
                  key={i}
                  className={`rounded-lg border border-l-4 ${sev.color} bg-card p-4 space-y-2`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <CategoriaIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm font-semibold truncate">{insight.titulo}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Badge variant={sev.badgeVariant} className="text-[10px] gap-1">
                        <SevIcon className="w-3 h-3" />
                        {insight.severidad}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {insight.categoria}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.descripcion}</p>

                  {insight.vehiculos_afectados && insight.vehiculos_afectados.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {insight.vehiculos_afectados.map((placa) => (
                        <Badge key={placa} variant="outline" className="text-[10px] font-mono">
                          {placa}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {insight.recomendacion && (
                    <div className="rounded bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Recomendación:</span>{" "}
                        {insight.recomendacion}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
