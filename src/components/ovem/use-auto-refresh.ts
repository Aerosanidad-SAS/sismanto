"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AUTO_REFRESH_MS = 30_000;
const SOUND_KEY = "sismanto_sonido"; // la misma preferencia que AvisosServicios (/servicios)

/**
 * Refresca los datos del servidor cada 30 s mientras la pestaña está visible y `enabled` (mismo patrón que
 * barra-tablero.tsx). Al volver a la pestaña refresca de inmediato. Devuelve `refreshNow` para el botón manual.
 */
export function useAutoRefresh(enabled: boolean, intervalMs: number = AUTO_REFRESH_MS) {
  const router = useRouter();
  const refreshNow = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (!document.hidden) router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (!document.hidden) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, intervalMs, router]);

  return refreshNow;
}

/**
 * Sonido corto y vibración al llegar un servicio nuevo. Es el mismo tono «enCurso» de AvisosServicios (que no
 * exporta su beep); respeta el interruptor de sonido de /servicios. El navegador puede bloquear el audio hasta la
 * primera interacción: en ese caso solo queda el aviso visual.
 */
export function alertNewService() {
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {
    /* sin vibración */
  }
  try {
    if (localStorage.getItem(SOUND_KEY) === "off") return;
    const ctx = new AudioContext();
    [440, 554, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.connect(gain).connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      osc.start(t);
      osc.stop(t + 0.15);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    /* audio bloqueado o no disponible */
  }
}
