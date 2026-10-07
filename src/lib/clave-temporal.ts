import { randomInt } from "node:crypto";

// Solo servidor (usa node:crypto). Alfabeto sin O/0 ni I/1/L para que se pueda dictar por teléfono sin confundirse.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const LARGO_CLAVE_TEMPORAL = 10;

/** Clave temporal para entregar en persona: aleatoria (generador criptográfico), cumple el mínimo de 8 y no es una cédula. */
export function generarClaveTemporal(largo: number = LARGO_CLAVE_TEMPORAL): string {
  let clave = "";
  for (let i = 0; i < largo; i++) clave += ALFABETO[randomInt(0, ALFABETO.length)];
  return clave;
}
