import { randomInt } from "node:crypto";

/**
 * Clave temporal para cuando un administrador restablece la clave de alguien (migración 095: `debe_cambiar_password`).
 * Sin caracteres que se confundan al dictarla o leerla en el celular (0/O, 1/l/I). Solo servidor (node:crypto).
 */
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const LARGO_CLAVE_TEMPORAL = 10;

export function generarClaveTemporal(entero: (maximo: number) => number = (n) => randomInt(0, n)): string {
  let clave = "";
  for (let i = 0; i < LARGO_CLAVE_TEMPORAL; i++) clave += ALFABETO[entero(ALFABETO.length)];
  return clave;
}
