/**
 * Exportación de pacientes a Excel — mismas 21 columnas que
 * export/exportExcelPacientes.php de SISRES. Sin dependencias de servidor:
 * lo usan la página, la acción y el cliente.
 */

import { celdaExcelSegura } from "@/lib/servicios-lista";

/** Tope de exportación, igual que EXPORT_MAX_FILAS en exportExcelPacientes.php. */
export const EXPORT_PACIENTES_MAX_FILAS = 50000;

/**
 * Quién puede bajar el listado completo. En SISRES es el permiso configurable
 * `act_exportar_pacientes`; acá se fija por rol entre los que ya ven todos los
 * pacientes (patients_select), sin MEDICO/AUXILIAR_ENFERMERIA/VISTA porque es
 * un volcado masivo de datos personales.
 */
export const ROLES_EXPORTAR_PACIENTES = ["ADMIN", "REGULACION", "COORDINACION", "ANALISTA"] as const;

export interface PacienteExport {
  id: number;
  cedula: string;
  tipo_documento: string | null;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  barrio: string | null;
  localidad: string | null;
  departamento: string | null;
  ciudad: string | null;
  rh: string | null;
  sexo: string | null;
  estatura: string | null;
  eps: string | null;
  celular: string | null;
  correo: string | null;
  activo: boolean | null;
}

/** Edad en años cumplidos a `hoyIso` (YYYY-MM-DD); "" si no hay fecha válida. La edad no se guarda (migración 038). */
export function edadEnAnios(fechaNacimiento: string | null, hoyIso: string): number | "" {
  if (!fechaNacimiento) return "";
  const [ny, nm, nd] = fechaNacimiento.slice(0, 10).split("-").map(Number);
  const [hy, hm, hd] = hoyIso.split("-").map(Number);
  if (![ny, nm, nd, hy, hm, hd].every(Number.isFinite)) return "";
  let edad = hy - ny;
  if (hm < nm || (hm === nm && hd < nd)) edad--;
  return edad < 0 ? "" : edad;
}

export const COLUMNAS_EXPORT_PACIENTES: [titulo: string, valor: (p: PacienteExport, hoyIso: string) => unknown][] = [
  ["ID", (p) => p.id],
  ["CEDULA", (p) => p.cedula],
  ["TIPO DOCUMENTO", (p) => p.tipo_documento],
  ["NOMBRE 1", (p) => p.nombre1],
  ["NOMBRE 2", (p) => p.nombre2],
  ["APELLIDO 1", (p) => p.apellido1],
  ["APELLIDO 2", (p) => p.apellido2],
  ["FECHA DE NACIMIENTO", (p) => p.fecha_nacimiento?.slice(0, 10)],
  ["EDAD", (p, hoy) => edadEnAnios(p.fecha_nacimiento, hoy)],
  ["DIRECCION", (p) => p.direccion],
  ["BARRIO", (p) => p.barrio],
  ["LOCALIDAD", (p) => p.localidad],
  ["DEPARTAMENTO", (p) => p.departamento],
  ["CIUDAD", (p) => p.ciudad],
  ["RH", (p) => p.rh],
  ["SEXO", (p) => p.sexo],
  ["ESTATURA", (p) => p.estatura],
  ["EPS", (p) => p.eps],
  ["CELULAR", (p) => p.celular],
  ["CORREO", (p) => p.correo],
  ["ESTADO", (p) => (p.activo === false ? "Inactivo" : "Activo")],
];

/** Matriz lista para `aoa_to_sheet`: encabezados + una fila por paciente, con celdas a prueba de fórmulas. */
export function matrizExportPacientes(pacientes: PacienteExport[], hoyIso: string): (string | number)[][] {
  return [
    COLUMNAS_EXPORT_PACIENTES.map(([titulo]) => titulo),
    ...pacientes.map((p) => COLUMNAS_EXPORT_PACIENTES.map(([, valor]) => celdaExcelSegura(valor(p, hoyIso)))),
  ];
}
