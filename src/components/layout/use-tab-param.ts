"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Active tab kept in the URL (`?tab=carga`) so a tab can be linked and survives a reload.
 * Switching uses `history.replaceState` (synced with `useSearchParams` by Next 14.1+): no server round trip, no new
 * history entry per click, and other query params are preserved. Unknown values fall back to `fallback`.
 */
export function useTabParam(valid: readonly string[], fallback: string) {
  const raw = useSearchParams().get("tab");
  const value = raw !== null && valid.includes(raw) ? raw : fallback;

  const setValue = useCallback((next: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
  }, []);

  return [value, setValue] as const;
}
