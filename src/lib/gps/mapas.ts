// URLs de mapas para mostrar una posición GPS. Puro: lo usan el servidor y el navegador.

/** Mapa de OpenStreetMap incrustable centrado en el punto, con marcador (sin llave ni dependencias). */
export function urlMapaOsm(lat: number, lon: number, radio = 0.01): string {
  const bbox = [lon - radio, lat - radio, lon + radio, lat + radio].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
}

export function urlGoogleMaps(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}`;
}
