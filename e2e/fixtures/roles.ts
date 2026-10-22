import path from "node:path";

// Contrato de entorno: E2E_<CLAVE>_USER y E2E_<CLAVE>_PASS (por ejemplo E2E_OVEM_MDE_USER).
// Un rol sin credenciales se omite en las pruebas; no falla.
export const ROLES = {
  ADMIN: { ruta: "/" },
  REGULACION_MDE: { ruta: "/servicios", centro: "CRA_MEDELLIN" },
  REGULACION_BOG: { ruta: "/servicios", centro: "CRA_BOGOTA" },
  OVEM_MDE: { ruta: "/ovem", centro: "CRA_MEDELLIN" },
  OVEM_BOG: { ruta: "/ovem", centro: "CRA_BOGOTA" },
  MEDICO: { ruta: "/pacientes" },
  AUXILIAR: { ruta: "/pacientes" },
  MANTENIMIENTO: { ruta: "/vehiculos" },
} as const;

export type RolClave = keyof typeof ROLES;

export const ROLES_CLAVES = Object.keys(ROLES) as RolClave[];

/** Centro operativo de los roles acotados a una ciudad; undefined para los demás. */
export const centroDe = (clave: RolClave) => (ROLES[clave] as { centro?: "CRA_MEDELLIN" | "CRA_BOGOTA" }).centro;

export const archivoSesion = (clave: RolClave) => path.join(__dirname, "..", ".auth", `${clave}.json`);

export const credenciales = (clave: RolClave) => ({
  usuario: process.env[`E2E_${clave}_USER`],
  clave: process.env[`E2E_${clave}_PASS`],
});

export const tieneCredenciales = (clave: RolClave) => {
  const c = credenciales(clave);
  return Boolean(c.usuario && c.clave);
};
