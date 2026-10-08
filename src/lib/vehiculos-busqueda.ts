// Búsqueda de la lista de vehículos (buscador de SISRES: placa, tipo y ciudad; aquí además marca, modelo y línea).
// Puro, para probarlo. No distingue mayúsculas ni tildes; todas las palabras deben aparecer (en cualquier campo).

export interface VehiculoBuscable {
  placa: string;
  tipo_vehiculo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  linea?: string | null;
  centro_operativo?: string | null;
  estado_actual?: string | null;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export function coincideVehiculo(v: VehiculoBuscable, texto: string): boolean {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const pajar = normalizar(
    [v.placa, v.tipo_vehiculo, v.marca, v.modelo, v.linea, v.centro_operativo, v.estado_actual].filter(Boolean).join(" ")
  );
  return palabras.every((p) => pajar.includes(p));
}
