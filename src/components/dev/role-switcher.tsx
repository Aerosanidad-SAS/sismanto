"use client";

import { useEffect, useState, useTransition } from "react";
import { UserCog } from "lucide-react";
import {
  getRoleSwitcherState,
  returnToAdmin,
  switchToRole,
  type RoleSwitcherState,
} from "@/app/api/actions/role-switcher";
import { cn } from "@/lib/utils";
import { ROLES_SELECTOR } from "@/lib/role-switcher";

/**
 * Selector de roles para desarrollo ("Ver como…"). En producción, o sin ROLE_SWITCHER_ENABLED, la acción de
 * servidor responde `enabled: false` y estos componentes no pintan nada. Ver ENTORNOS.md.
 */

const VOLVER = "__volver__";

function useRoleSwitcherState() {
  const [state, setState] = useState<RoleSwitcherState | null>(null);
  useEffect(() => {
    let cancelled = false;
    getRoleSwitcherState()
      .then((s) => !cancelled && setState(s))
      .catch(() => !cancelled && setState({ enabled: false }));
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

/** Al cambiar la sesión se recarga la página completa para que cookies, menú y datos sean los del nuevo rol. */
function irA(route: string) {
  window.location.assign(route);
}

export function RoleSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const state = useRoleSwitcherState();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!state?.enabled) return null;

  const impersonating = state.mode === "impersonating";

  function onChange(value: string) {
    setError(null);
    startTransition(async () => {
      const res = value === VOLVER ? await returnToAdmin() : await switchToRole(value);
      if (res.error) setError(res.error);
      else if (res.route) irA(res.route);
    });
  }

  return (
    <div className={cn("mb-2", collapsed && "lg:flex lg:justify-center")}>
      <label
        className={cn("block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1", collapsed && "lg:sr-only")}
        htmlFor="role-switcher"
      >
        Ver como (solo pruebas)
      </label>
      <div className="relative">
        {collapsed && (
          <UserCog className="pointer-events-none absolute left-1/2 top-1/2 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground lg:block" aria-hidden />
        )}
        <select
          id="role-switcher"
          value={impersonating ? (state.currentRole ?? "") : "ADMIN"}
          disabled={pending}
          title="Ver como (solo pruebas)"
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground min-h-[44px] lg:min-h-10 disabled:opacity-60",
            collapsed && "lg:w-10 lg:px-0 lg:text-transparent"
          )}
        >
          <option value="ADMIN" disabled={impersonating}>
            ADMIN (mi sesión)
          </option>
          {impersonating && state.canReturn && <option value={VOLVER}>↩ Volver a ADMIN</option>}
          {ROLES_SELECTOR.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 px-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function RoleSwitchBanner() {
  const state = useRoleSwitcherState();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!state?.enabled || state.mode !== "impersonating") return null;

  function volver() {
    setError(null);
    startTransition(async () => {
      const res = await returnToAdmin();
      if (res.error) setError(res.error);
      else if (res.route) irA(res.route);
    });
  }

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <span>
        Viendo como <strong>{state.currentRole}</strong> (usuario de prueba)
      </span>
      {state.canReturn ? (
        <button
          type="button"
          onClick={volver}
          disabled={pending}
          className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-black/80 disabled:opacity-60"
        >
          Volver a ADMIN
        </button>
      ) : (
        <span className="text-xs">La sesión de origen expiró: cierra sesión y entra como administrador.</span>
      )}
      {error && <span className="text-xs text-red-900">{error}</span>}
    </div>
  );
}
