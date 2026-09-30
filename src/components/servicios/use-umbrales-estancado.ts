"use client";

import { useEffect, useState } from "react";
import { getUmbralesEstancado } from "@/app/api/actions/servicios-estancados";
import { UMBRAL_ESTANCADO_HORAS, type UmbralesEstancado } from "@/lib/servicios-lista";

/**
 * Umbrales de servicios estancados configurados por el ADMIN (migración 098). Mientras llegan se usan los de por
 * defecto, que son los mismos que había fijos en el código.
 */
export function useUmbralesEstancado(): UmbralesEstancado {
  const [umbrales, setUmbrales] = useState<UmbralesEstancado>(UMBRAL_ESTANCADO_HORAS);
  useEffect(() => {
    let vigente = true;
    getUmbralesEstancado().then((u) => vigente && setUmbrales(u));
    return () => {
      vigente = false;
    };
  }, []);
  return umbrales;
}
