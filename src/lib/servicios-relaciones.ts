// Paciente y móvil de una página de servicios, unidos en memoria.
//
// Se piden aparte (`in`) y no embebidos en la consulta de `medical_services`: al embeber, PostgREST une paciente y
// móvil con CADA fila visible antes de ordenar y recortar la página. Con 30 mil servicios visibles (Regulación Bogotá) y
// la política de `vehicles` (una función por fila) eso tardaba 10 s y chocaba con el límite de 8 s del rol
// `authenticated`: «canceling statement due to statement timeout». Pidiendo solo los de la página son dos consultas
// de ≤ 100 filas. Sin dependencias de servidor, para probarlo.

interface FilaConRelaciones {
  patient_id?: number | null;
  vehicle_id?: string | null;
}

/** Valores distintos y no nulos, en orden de aparición. */
export function idsUnicos<T extends string | number>(valores: (T | null | undefined)[]): T[] {
  return Array.from(new Set(valores.filter((v): v is T => v !== null && v !== undefined)));
}

/** Trozos de como mucho `tamano` elementos: una URL con `in.(…)` no puede crecer sin límite. */
export function trozos<T>(lista: T[], tamano: number): T[][] {
  const salida: T[][] = [];
  for (let i = 0; i < lista.length; i += tamano) salida.push(lista.slice(i, i + tamano));
  return salida;
}

/**
 * Agrega `patients` y `vehicles` a cada fila con la misma forma que daba el embebido de PostgREST (objeto, o `null` si
 * no hay o no se puede ver). Con `conPaciente: false` no agrega la clave `patients`.
 */
export function unirPacienteYMovil<T extends FilaConRelaciones>(
  filas: T[],
  pacientes: { id: number }[] | null | undefined,
  moviles: { id: string; placa: string }[] | null | undefined,
  conPaciente = true
) {
  const porPaciente = new Map((pacientes ?? []).map((p) => [p.id, p]));
  const porMovil = new Map((moviles ?? []).map((m) => [m.id, { placa: m.placa }]));
  return filas.map((f) => ({
    ...f,
    ...(conPaciente ? { patients: f.patient_id != null ? (porPaciente.get(f.patient_id) ?? null) : null } : {}),
    vehicles: f.vehicle_id != null ? (porMovil.get(f.vehicle_id) ?? null) : null,
  }));
}
