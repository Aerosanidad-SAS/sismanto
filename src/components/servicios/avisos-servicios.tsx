"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResumenAbiertosFinDeDia, getServiciosParaAvisos } from "@/app/api/actions/servicios-medicos";
import { getUmbralesEstancado } from "@/app/api/actions/servicios-estancados";
import { horasEstancado, UMBRALES_PROXIMOS_MIN } from "@/lib/servicios-lista";
import { claveAvisoFinDeDia, horaEnBogota, textoAvisoFinDeDia, tocaAvisoFinDeDia } from "@/lib/servicios-fin-de-dia";
import { cn } from "@/lib/utils";

/**
 * Avisos de la lista de servicios, como mostrarServicios.php:
 * - refresco cada 60 s;
 * - sonido y aviso 60, 30 y 15 min antes de la hora programada;
 * - aviso de servicios estancados (agrupado si son muchos);
 * - tono al pasar un servicio a CURSO o FINALIZADO;
 * - aviso de fin de día (de 8 p. m. a 11 p. m., una vez por hora) con los servicios que siguen abiertos y hay que cerrar.
 * El sonido se activa o apaga por navegador (localStorage), igual que SISRES.
 */

type TipoSonido = "click" | "alerta60" | "alerta30" | "alerta15" | "enCurso" | "finalizado" | "finDia";
type Aviso = { id: string; titulo: string; detalle: string; tono: "info" | "alerta" | "urgente" | "ok"; enlace?: string };

const REFRESCO_MS = 60_000;
const MAX_AVISOS_ESTANCADO_INDIVIDUALES = 3;
const CLAVE_SONIDO = "sismanto_sonido";

let ctxAudio: AudioContext | null = null;
/**
 * El navegador crea el audio en pausa hasta que la persona toca la página (política de autoplay): un beep pedido antes
 * de ese primer toque se perdía en silencio. Aquí se crea una vez y se reanuda cada vez que se pide un sonido; el primer
 * clic o tecla de la página lo deja funcionando (ver el efecto de `AvisosServicios`).
 */
function contextoAudio(): AudioContext | null {
  try {
    ctxAudio ??= new AudioContext();
    if (ctxAudio.state === "suspended") void ctxAudio.resume();
    return ctxAudio;
  } catch {
    return null;
  }
}
function beep(frecuencia: number, inicio: number, duracion: number, volumen: number, forma: OscillatorType = "sine") {
  const ctxAudio = contextoAudio();
  if (!ctxAudio) return;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = forma;
  osc.frequency.value = frecuencia;
  gain.gain.value = volumen;
  osc.connect(gain).connect(ctxAudio.destination);
  const t = ctxAudio.currentTime + inicio;
  osc.start(t);
  osc.stop(t + duracion);
}

// Mismos tonos que reproducirSonido() de SISRES, para que Regulación los reconozca.
const SONIDOS: Record<TipoSonido, () => void> = {
  click: () => beep(880, 0, 0.1, 0.2),
  alerta60: () => beep(440, 0, 0.35, 0.25),
  alerta30: () => {
    beep(523, 0, 0.2, 0.3);
    beep(523, 0.3, 0.2, 0.3);
  },
  alerta15: () => {
    beep(659, 0, 0.15, 0.45, "square");
    beep(659, 0.22, 0.15, 0.45, "square");
    beep(880, 0.44, 0.3, 0.55, "square");
  },
  enCurso: () => {
    beep(440, 0, 0.15, 0.3);
    beep(554, 0.18, 0.15, 0.3);
    beep(659, 0.36, 0.22, 0.4);
  },
  finalizado: () => {
    beep(523, 0, 0.15, 0.3);
    beep(659, 0.18, 0.15, 0.3);
    beep(784, 0.36, 0.15, 0.3);
    beep(1047, 0.54, 0.3, 0.4);
  },
  // Fin de día: cuatro tonos largos que bajan y suben, distinto de los avisos de hora para que no se confunda.
  finDia: () => {
    beep(587, 0, 0.3, 0.45, "triangle");
    beep(440, 0.4, 0.3, 0.45, "triangle");
    beep(587, 0.8, 0.3, 0.45, "triangle");
    beep(440, 1.2, 0.5, 0.5, "triangle");
  },
};

function leerStorage(storage: "local" | "session", clave: string): string | null {
  try {
    return (storage === "local" ? localStorage : sessionStorage).getItem(clave);
  } catch {
    return null;
  }
}
function escribirStorage(storage: "local" | "session", clave: string, valor: string) {
  try {
    (storage === "local" ? localStorage : sessionStorage).setItem(clave, valor);
  } catch {
    /* modo privado o almacenamiento bloqueado: el aviso se repetiría, no es grave */
  }
}

/** ¿Hay un diálogo abierto o el foco en un campo? Entonces no se refresca. */
function hayTrabajoEnCurso(): boolean {
  if (document.querySelector('[role="dialog"][data-state="open"]')) return true;
  const activo = document.activeElement;
  return !!activo?.matches('input, textarea, select, [contenteditable="true"]');
}

export function AvisosServicios({ etapasVisibles }: { etapasVisibles: Record<number, string> }) {
  const router = useRouter();
  const [sonidoOn, setSonidoOn] = useState(true);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [actualizado, setActualizado] = useState<string>("");
  const etapasPrevias = useRef<Record<number, string> | null>(null);
  const sonidoRef = useRef(true);
  // true mientras el navegador no deja sonar (nadie ha tocado la página todavía): se avisa para que no parezca roto.
  const [audioBloqueado, setAudioBloqueado] = useState(false);

  useEffect(() => {
    const on = leerStorage("local", CLAVE_SONIDO) !== "off";
    setSonidoOn(on);
    sonidoRef.current = on;
  }, []);

  // Desbloquea el audio con el primer clic, toque o tecla, y mantiene al día el aviso de «sonido bloqueado».
  useEffect(() => {
    const revisarAudio = () => {
      const ctx = contextoAudio();
      setAudioBloqueado(Boolean(ctx) && ctx?.state !== "running");
      if (ctx) ctx.onstatechange = () => setAudioBloqueado(ctx.state !== "running");
    };
    revisarAudio();
    const eventos = ["pointerdown", "keydown", "touchstart"] as const;
    for (const e of eventos) window.addEventListener(e, revisarAudio);
    return () => {
      for (const e of eventos) window.removeEventListener(e, revisarAudio);
    };
  }, []);

  const sonar = useCallback((tipo: TipoSonido) => {
    if (!sonidoRef.current && tipo !== "click") return;
    try {
      SONIDOS[tipo]();
    } catch {
      /* el navegador bloquea audio hasta la primera interacción */
    }
  }, []);

  const agregar = useCallback((nuevos: Aviso[]) => {
    if (nuevos.length === 0) return;
    setAvisos((prev) => [...nuevos.filter((n) => !prev.some((p) => p.id === n.id)), ...prev].slice(0, 6));
  }, []);

  const revisar = useCallback(async () => {
    // Umbral de estancados configurado por el ADMIN (migración 103): se lee en cada revisión para no quedar viejo.
    const [servicios, umbrales] = await Promise.all([getServiciosParaAvisos(), getUmbralesEstancado()]);
    const ahora = Date.now();
    const nuevos: Aviso[] = [];
    let peorSonido: TipoSonido | null = null;

    for (const s of servicios) {
      if (s.etapa !== "PROGRAMADO") continue;
      const faltan = (Date.parse(s.fecha_hora_programacion) - ahora) / 60_000;
      if (faltan <= 0) continue;
      // El umbral más cercano ya cruzado; cada umbral avisa una vez por sesión.
      const umbral = [...UMBRALES_PROXIMOS_MIN].reverse().find((u) => faltan <= u);
      if (!umbral) continue;
      const clave = `aviso_svc_${umbral}_${s.id}`;
      if (leerStorage("session", clave)) continue;
      escribirStorage("session", clave, "1");
      nuevos.push({
        id: clave,
        titulo: umbral === 15 ? `¡Servicio en ${Math.round(faltan)} minutos!` : `Servicio en ${Math.round(faltan)} minutos`,
        detalle: `#${s.id} · ${s.nombre_completo} · ${s.tipo_servicio}`,
        tono: umbral === 15 ? "urgente" : umbral === 30 ? "alerta" : "info",
      });
      const sonido: TipoSonido = `alerta${umbral}` as TipoSonido;
      if (!peorSonido || Number(sonido.slice(6)) < Number(peorSonido.slice(6))) peorSonido = sonido;
    }

    const estancados = servicios
      .map((s) => ({ s, horas: horasEstancado(s, ahora, umbrales) }))
      .filter((x): x is { s: (typeof servicios)[number]; horas: number } => x.horas !== null)
      .filter(({ s, horas }) => {
        const clave = `estancado_${s.id}_${horas}`;
        if (leerStorage("session", clave)) return false;
        escribirStorage("session", clave, "1");
        return true;
      });
    if (estancados.length > MAX_AVISOS_ESTANCADO_INDIVIDUALES) {
      nuevos.push({
        id: `estancados_${ahora}`,
        titulo: `⏰ ${estancados.length} servicios estancados`,
        detalle: `${estancados.filter((e) => e.s.etapa === "PROGRAMADO").length} en PROGRAMADO y ${
          estancados.filter((e) => e.s.etapa === "CURSO").length
        } en CURSO sin avanzar.`,
        tono: "alerta",
      });
    } else {
      for (const { s, horas } of estancados) {
        nuevos.push({
          id: `estancado_${s.id}_${horas}`,
          titulo: `⏰ Lleva ${horas} h en ${s.etapa}`,
          detalle: `#${s.id} · ${s.nombre_completo}`,
          tono: "alerta",
        });
      }
    }
    if (estancados.length > 0 && !peorSonido) peorSonido = "alerta15";

    // Fin de día: una consulta por hora y por sesión, solo entre las 8 p. m. y las 11 p. m. (hora de Colombia).
    let sonarFinDia = false;
    if (tocaAvisoFinDeDia(horaEnBogota(ahora))) {
      const clave = claveAvisoFinDeDia(ahora);
      if (!leerStorage("session", clave)) {
        try {
          const abiertos = await getResumenAbiertosFinDeDia();
          // Se marca como hecho incluso si no aplica o no quedan abiertos: no se vuelve a preguntar en esta hora.
          escribirStorage("session", clave, "1");
          const texto = abiertos.aplica ? textoAvisoFinDeDia(abiertos) : null;
          if (abiertos.aplica && texto) {
            nuevos.push({ id: clave, ...texto, tono: "urgente", enlace: abiertos.enlace });
            sonarFinDia = true;
          }
        } catch {
          /* sin red o sesión vencida: se reintenta en la próxima revisión, sin marcar la hora */
        }
      }
    }

    agregar(nuevos);
    if (sonarFinDia) sonar("finDia");
    else if (peorSonido) sonar(peorSonido);
  }, [agregar, sonar]);

  // Refresco periódico de la lista y de los avisos.
  useEffect(() => {
    const marcar = () =>
      setActualizado(new Date().toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour12: false }));
    // Al montar la página ya viene fresca: solo se revisan avisos.
    revisar();
    marcar();
    const t = setInterval(() => {
      // Refrescar re-renderiza el árbol del servidor: si hay un formulario
      // abierto o el usuario está escribiendo, le borraría lo que lleva y
      // aborta el guardado en curso. Los avisos sí se siguen revisando.
      if (!hayTrabajoEnCurso()) router.refresh();
      revisar();
      marcar();
    }, REFRESCO_MS);
    return () => clearInterval(t);
  }, [router, revisar]);

  // Cambios de etapa entre un refresco y otro (sobre los servicios visibles).
  useEffect(() => {
    const previas = etapasPrevias.current;
    etapasPrevias.current = etapasVisibles;
    if (!previas) return;
    const cambios: Aviso[] = [];
    for (const [id, etapa] of Object.entries(etapasVisibles)) {
      const antes = previas[Number(id)];
      if (!antes || antes === etapa) continue;
      if (etapa === "CURSO" || etapa === "FINALIZADO") {
        cambios.push({
          id: `etapa_${id}_${etapa}`,
          titulo: etapa === "CURSO" ? "Servicio en curso" : "Servicio finalizado",
          detalle: `#${id}: ${antes} → ${etapa}`,
          tono: etapa === "CURSO" ? "info" : "ok",
        });
      }
    }
    agregar(cambios);
    if (cambios.some((c) => c.titulo.includes("finalizado"))) sonar("finalizado");
    else if (cambios.length > 0) sonar("enCurso");
  }, [etapasVisibles, agregar, sonar]);

  const alternarSonido = () => {
    const on = !sonidoOn;
    setSonidoOn(on);
    sonidoRef.current = on;
    escribirStorage("local", CLAVE_SONIDO, on ? "on" : "off");
    if (on) sonar("click");
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {actualizado && (
          <span className="hidden text-xs text-muted-foreground sm:inline">Última actualización: {actualizado}</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={alternarSonido}
          aria-pressed={sonidoOn}
          className="h-11 gap-2 sm:h-9"
          title="Activar o desactivar las alertas sonoras"
        >
          {sonidoOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          Sonido {sonidoOn ? "ON" : "OFF"}
        </Button>
        {sonidoOn && audioBloqueado && (
          <span role="status" className="text-xs text-amber-700">
            Toca la página para activar el sonido
          </span>
        )}
      </div>

      {avisos.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
          role="status"
          aria-live="polite"
        >
          {avisos.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 shadow-lg",
                a.tono === "urgente" && "border-red-300 bg-red-50 text-red-900",
                a.tono === "alerta" && "border-amber-300 bg-amber-50 text-amber-900",
                a.tono === "info" && "border-sky-300 bg-sky-50 text-sky-900",
                a.tono === "ok" && "border-green-300 bg-green-50 text-green-900"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className={cn("text-xs", !a.enlace && "truncate")}>{a.detalle}</p>
                {a.enlace && (
                  <Link href={a.enlace} className="text-xs font-medium underline">
                    Ver los servicios abiertos
                  </Link>
                )}
              </div>
              <button
                type="button"
                aria-label="Cerrar aviso"
                className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-black/5"
                onClick={() => setAvisos((prev) => prev.filter((p) => p.id !== a.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
