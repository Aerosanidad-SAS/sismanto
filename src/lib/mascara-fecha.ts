// Máscara de escritura de fechas dd/mm/aaaa para los campos de fecha: quien teclea solo números ve las barras
// puestas. Si ya escribió barras, se respeta lo que escribió. Puro, para probarlo.

/** «09031988» → «09/03/1988»; «0903» → «09/03»; con barras escritas a mano no cambia (máx. 10 caracteres). */
export function aplicarMascaraFecha(crudo: string): string {
  if (crudo.includes("/")) return crudo.slice(0, 10);
  const d = crudo.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
