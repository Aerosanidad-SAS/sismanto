import assert from "node:assert/strict";
import { test } from "node:test";

import type { FilaUsuario } from "./etl-usuarios";
import { validarUsuario } from "./usuarios-carga";
import {
  archivosDeCorridaAnterior,
  cargoDe,
  centroDeCiudad,
  convertirUsuariosSisres,
  evaluarCarpetaDeSalida,
  limpiarCedula,
  resolverCedula,
  revisarColumnasSisres,
  ROLES_CON_CLAVE_PROPIA,
} from "./usuarios-sisres-a-plantilla";

const CENTROS = new Set(["CRA_BOGOTA", "CRA_MEDELLIN", "AIRPLAN", "CTG", "ADO"]);
const CLAVE = () => "ClaveDePrueba1";
const OPC = { claveAleatoria: CLAVE };

// Cargos de SISRES (scripts/cargo-sisres-a-rol.ts): 1 ADMIN, 3 ANALISTA, 4 REGULACION, 7 OVEM, 8 VISTA, 99 sin equivalente.
const fila = (o: Partial<FilaUsuario> = {}): FilaUsuario => ({
  id: "10",
  usuario: "1000000001",
  // Por omisión la identificación acompaña al usuario (así no hay avisos de «no coinciden» que no vienen al caso).
  identificacion: o.usuario ?? "1000000001",
  nombre1: "Persona",
  nombre2: "",
  apellido1: "Ficticia",
  apellido2: "",
  cargo: "7",
  correo: "persona.ficticia@ejemplo.com",
  ciudad: "Bogotá",
  estado: "1",
  ...o,
});

test("un OVEM normal entra con la cédula como clave (password_inicial vacío) y con su centro", () => {
  const r = convertirUsuariosSisres([fila()], OPC);
  assert.equal(r.plantilla.length, 1);
  assert.deepEqual(r.plantilla[0], {
    cedula: "1000000001",
    nombre_completo: "Persona Ficticia",
    rol: "OVEM",
    centro_operativo: "CRA_BOGOTA",
    ciudad: "Bogotá",
    email: "persona.ficticia@ejemplo.com",
    codigo_acceso: "",
    password_inicial: "",
  });
  assert.deepEqual(r.clavesEspeciales, []);
});

test("ADMIN, ANALISTA y GERENCIAL nunca entran con la cédula: reciben clave propia y quedan en la lista de entrega", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "1", usuario: "1000000011", cargo: "1" }), fila({ id: "2", usuario: "1000000012", cargo: "3", correo: "b@ejemplo.com" })],
    OPC
  );
  assert.deepEqual(ROLES_CON_CLAVE_PROPIA, ["ADMIN", "ANALISTA", "GERENCIAL"]);
  assert.deepEqual(
    r.plantilla.map((p) => [p.rol, p.password_inicial]),
    [["ADMIN", "ClaveDePrueba1"], ["ANALISTA", "ClaveDePrueba1"]]
  );
  assert.deepEqual(r.clavesEspeciales.map((c) => c.motivo), ["ROL_CON_CLAVE_PROPIA", "ROL_CON_CLAVE_PROPIA"]);
  assert.ok(r.plantilla.every((p) => p.password_inicial !== p.cedula));
});

test("una cédula de menos de 8 dígitos no puede ser la clave: recibe una clave aparte", () => {
  const r = convertirUsuariosSisres([fila({ usuario: "1234567", identificacion: "1234567" })], OPC);
  assert.equal(r.plantilla[0].password_inicial, "ClaveDePrueba1");
  assert.equal(r.clavesEspeciales[0].motivo, "CEDULA_CORTA");
});

test("quien no tiene correo NO se descarta: entra con la cédula y el sistema le crea un correo interno", () => {
  const r = convertirUsuariosSisres([fila({ correo: "" })], OPC);
  assert.equal(r.plantilla.length, 1);
  assert.equal(r.plantilla[0].email, "");
  assert.deepEqual(r.omitidas, []);
});

test("un correo repetido se queda con el registro más antiguo; el otro entra sin correo y con aviso", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "20", usuario: "1000000002", correo: "igual@ejemplo.com" }), fila({ id: "10", usuario: "1000000001", correo: "IGUAL@ejemplo.com" })],
    OPC
  );
  assert.deepEqual(r.plantilla.map((p) => [p.cedula, p.email]), [["1000000001", "igual@ejemplo.com"], ["1000000002", ""]]);
  assert.equal(r.avisos.length, 1);
  assert.equal(r.avisos[0].cedula, "1000000002");
});

test("una cédula repetida solo entra una vez (la del id más bajo)", () => {
  const r = convertirUsuariosSisres([fila({ id: "30" }), fila({ id: "5", nombre1: "Otra" })], OPC);
  assert.equal(r.plantilla.length, 1);
  assert.equal(r.plantilla[0].nombre_completo, "Otra Ficticia");
  assert.match(r.omitidas[0].motivo, /Cédula repetida con el usuario SISRES 5/);
});

test("un rol que ve solo su centro no se carga sin centro: va a omitidas con el motivo", () => {
  const r = convertirUsuariosSisres([fila({ ciudad: "Pasto" }), fila({ id: "11", usuario: "1000000002", ciudad: "" })], OPC);
  assert.deepEqual(r.plantilla, []);
  assert.equal(r.omitidas.length, 2);
  assert.match(r.omitidas[0].motivo, /necesita centro/);
});

test("un rol sin centro obligatorio (VISTA) entra aunque la ciudad no sea de un centro", () => {
  const r = convertirUsuariosSisres([fila({ cargo: "8", ciudad: "Pasto" })], OPC);
  assert.equal(r.plantilla.length, 1);
  assert.equal(r.plantilla[0].centro_operativo, "");
});

test("inactivos, cargos sin equivalente y filas sin id o sin nombre se omiten con su motivo", () => {
  const r = convertirUsuariosSisres(
    [
      fila({ id: "1", usuario: "1000000001", estado: "0" }),
      fila({ id: "2", usuario: "1000000002", cargo: "99" }),
      fila({ id: "", usuario: "1000000003" }),
      fila({ id: "4", usuario: "1000000004", nombre1: "", apellido1: "" }),
    ],
    OPC
  );
  assert.deepEqual(r.plantilla, []);
  assert.deepEqual(r.omitidas.map((o) => o.motivo.split(" ")[0]), ["Sin", "Inactivo", "Cargo", "Sin"]);
});

test("la cédula de SISRES con «.0» final se lee bien y no pierde dígitos", () => {
  const r = convertirUsuariosSisres([fila({ usuario: "1000000001.0", identificacion: "" })], OPC);
  assert.equal(r.plantilla[0].cedula, "1000000001");
});

test("centroDeCiudad: solo Bogotá y Medellín (con o sin tilde y mayúsculas); lo demás no se adivina", () => {
  assert.equal(centroDeCiudad("Bogotá D.C."), "CRA_BOGOTA");
  assert.equal(centroDeCiudad("MEDELLÍN"), "CRA_MEDELLIN");
  assert.equal(centroDeCiudad("medellin"), "CRA_MEDELLIN");
  assert.equal(centroDeCiudad("Cartagena"), null);
  assert.equal(centroDeCiudad(""), null);
  assert.equal(centroDeCiudad(undefined), null);
});

test("TODA fila de la plantilla generada pasa el mismo validador de la pantalla de carga masiva", () => {
  const r = convertirUsuariosSisres(
    [
      fila({ id: "1", usuario: "1000000001", cargo: "7" }),
      fila({ id: "2", usuario: "1000000002", cargo: "4", ciudad: "Medellín", correo: "" }),
      fila({ id: "3", usuario: "1000000003", cargo: "1" }),
      fila({ id: "4", usuario: "1234567", identificacion: "1234567", cargo: "7" }),
      fila({ id: "5", usuario: "1000000005", cargo: "8", ciudad: "Pasto" }),
    ],
    OPC
  );
  assert.equal(r.plantilla.length, 5);
  for (const p of r.plantilla) {
    const v = validarUsuario({ ...p }, CENTROS);
    assert.ok(v.ok, `la fila de ${p.rol} no pasa la validación: ${v.ok ? "" : JSON.stringify(v.errores)}`);
    // Quien no tiene clave escrita entra con la cédula; nadie con rol de más acceso la tiene.
    if (v.ok) assert.equal(v.valor.passwordEsCedula, p.password_inicial === "");
  }
  assert.ok(r.plantilla.filter((p) => p.password_inicial === "").every((p) => !ROLES_CON_CLAVE_PROPIA.includes(p.rol)));
});

test("una cédula con ceros a la izquierda se carga sin ellos y se avisa (quien la teclee con cero no entraría)", () => {
  const r = convertirUsuariosSisres([fila({ usuario: "0001234567", identificacion: "0001234567" })], OPC);
  assert.equal(r.plantilla[0].cedula, "1234567");
  assert.match(r.avisos[0].aviso, /ceros a la izquierda/);
});

test("frontera de la clave: 7 dígitos reciben clave aparte, 8 entran con la cédula", () => {
  const siete = convertirUsuariosSisres([fila({ usuario: "1234567", identificacion: "1234567" })], OPC);
  assert.equal(siete.clavesEspeciales[0].motivo, "CEDULA_CORTA");
  const ocho = convertirUsuariosSisres([fila({ usuario: "12345678", identificacion: "12345678" })], OPC);
  assert.deepEqual(ocho.clavesEspeciales, []);
  assert.equal(ocho.plantilla[0].password_inicial, "");
});

test("una cédula fuera de 5 a 15 dígitos se omite con su categoría (la pantalla la rechazaría)", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "1", usuario: "1234", identificacion: "1234" }), fila({ id: "2", usuario: "1234567890123456", identificacion: "1234567890123456" }), fila({ id: "3", usuario: "12345", identificacion: "12345" })],
    OPC
  );
  assert.deepEqual(r.omitidas.map((o) => o.categoria), ["CEDULA_FUERA_DE_RANGO", "CEDULA_FUERA_DE_RANGO"]);
  assert.equal(r.plantilla.length, 1);
});

test("cargoDe acepta «7», «07» y «7.0»; cualquier otra cosa se omite como cargo sin equivalente", () => {
  assert.equal(cargoDe("7"), 7);
  assert.equal(cargoDe("07"), 7);
  assert.equal(cargoDe("7.0"), 7);
  assert.equal(cargoDe("abc"), null);
  assert.equal(cargoDe(""), null);
  assert.equal(cargoDe("7.5"), null);
  const r = convertirUsuariosSisres([fila({ cargo: "7.0" }), fila({ id: "11", usuario: "1000000002", cargo: "abc" }), fila({ id: "12", usuario: "1000000003", cargo: "" })], OPC);
  assert.equal(r.plantilla.length, 1);
  assert.deepEqual(r.omitidas.map((o) => o.categoria), ["CARGO_SIN_EQUIVALENTE", "CARGO_SIN_EQUIVALENTE"]);
});

test("un correo inválido no deja a nadie fuera: entra sin correo y con aviso", () => {
  const r = convertirUsuariosSisres([fila({ correo: "no-es-un-correo" })], OPC);
  assert.equal(r.plantilla[0].email, "");
  assert.match(r.avisos[0].aviso, /Correo inválido/);
});

test("el id se ordena como número («9» gana frente a «10») para decidir quién se queda con una cédula repetida", () => {
  const r = convertirUsuariosSisres([fila({ id: "10", nombre1: "Diez" }), fila({ id: "9", nombre1: "Nueve" })], OPC);
  assert.equal(r.plantilla[0].nombre_completo, "Nueve Ficticia");
});

test("sin el stub, las claves reales cumplen el largo mínimo, no son la cédula y no se repiten", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "1", usuario: "1000000011", cargo: "1" }), fila({ id: "2", usuario: "1000000012", cargo: "3", correo: "b@ejemplo.com" })]
  );
  const claves = r.clavesEspeciales.map((c) => c.clave);
  assert.equal(claves.length, 2);
  for (const c of r.clavesEspeciales) {
    assert.ok(c.clave.length >= 8, "largo mínimo");
    assert.notEqual(c.clave, c.cedula);
  }
  assert.notEqual(claves[0], claves[1]);
});

test("un ADMIN con correo repetido conserva su clave propia (el correo cambia, la política no)", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "1", usuario: "1000000001", cargo: "7", correo: "igual@ejemplo.com" }), fila({ id: "2", usuario: "1000000002", cargo: "1", correo: "igual@ejemplo.com" })],
    OPC
  );
  const admin = r.plantilla.find((p) => p.rol === "ADMIN");
  assert.equal(admin?.email, "");
  assert.equal(admin?.password_inicial, "ClaveDePrueba1");
});

test("una ciudad que nombra las dos ciudades es ambigua: no se adivina el centro y el rol con centro se omite", () => {
  assert.equal(centroDeCiudad("Bogotá / Medellín"), null);
  const r = convertirUsuariosSisres([fila({ ciudad: "Bogotá / Medellín" })], OPC);
  assert.deepEqual(r.plantilla, []);
  assert.equal(r.omitidas[0].categoria, "SIN_CENTRO");
});

test("se pueden SUMAR roles con clave propia, pero no quitar los del sistema", () => {
  const mas = convertirUsuariosSisres([fila({ cargo: "4", ciudad: "Medellín" })], { claveAleatoria: CLAVE, rolesConClavePropia: ["REGULACION"] });
  assert.equal(mas.plantilla[0].password_inicial, "ClaveDePrueba1");
  assert.equal(mas.clavesEspeciales[0].motivo, "ROL_CON_CLAVE_PROPIA");
  const sinQuitar = convertirUsuariosSisres([fila({ cargo: "1" })], { claveAleatoria: CLAVE, rolesConClavePropia: [] });
  assert.equal(sinQuitar.plantilla[0].password_inicial, "ClaveDePrueba1");
});

test("las omitidas llevan una categoría fija (el resumen no cuenta por texto libre del CSV)", () => {
  const r = convertirUsuariosSisres(
    [fila({ id: "1", usuario: "1000000001", estado: "0" }), fila({ id: "2", usuario: "1000000002", cargo: "99" }), fila({ id: "", usuario: "1000000003" }), fila({ id: "4", usuario: "1000000004", nombre1: "", apellido1: "" })],
    OPC
  );
  assert.deepEqual(r.omitidas.map((o) => o.categoria).sort(), ["CARGO_SIN_EQUIVALENTE", "INACTIVO", "SIN_ID", "SIN_NOMBRE"]);
});

test("revisarColumnasSisres: avisa de columnas que faltan (separador «;») y de caracteres dañados", () => {
  assert.deepEqual(revisarColumnasSisres([fila()]), []);
  assert.match(revisarColumnasSisres([{ "id;usuario;cargo": "1;2;3" }])[0], /Faltan las columnas/);
  assert.match(revisarColumnasSisres([fila({ nombre1: "Mar�a" })])[0], /UTF-8/);
  assert.deepEqual(revisarColumnasSisres([]), ["El archivo no tiene filas."]);
});

test("evaluarCarpetaDeSalida: dentro del repo, la propia raíz y las carpetas sincronizadas", () => {
  const raiz = "/home/yo/proyecto";
  assert.equal(evaluarCarpetaDeSalida("/home/yo/proyecto", raiz).dentroDelRepo, true);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/proyecto/docs", raiz).dentroDelRepo, true);
  // Un hermano con el mismo prefijo NO está dentro del repo.
  assert.equal(evaluarCarpetaDeSalida("/home/yo/proyecto-otro/salida", raiz).dentroDelRepo, false);
  assert.equal(evaluarCarpetaDeSalida("/tmp/salida", raiz).dentroDelRepo, false);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/OneDrive/Escritorio/salida", raiz).sincronizada, true);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/Dropbox/x", raiz).sincronizada, true);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/Google Drive/x", raiz).sincronizada, true);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/Proton Drive/x", raiz).sincronizada, true);
  assert.equal(evaluarCarpetaDeSalida("/home/yo/Sync.com/x", raiz).sincronizada, true);
  assert.equal(evaluarCarpetaDeSalida("/tmp/salida", raiz).sincronizada, false);
});

test("archivosDeCorridaAnterior reconoce lo que dejó una corrida previa y deja pasar lo demás", () => {
  assert.deepEqual(
    archivosDeCorridaAnterior(["usuarios.csv", "usuarios-plantilla-01.xlsx", "usuarios-plantilla-12.xlsx", "claves-iniciales-especiales.csv", "usuarios-omitidas.csv", "notas.txt"]),
    ["usuarios-plantilla-01.xlsx", "usuarios-plantilla-12.xlsx", "claves-iniciales-especiales.csv", "usuarios-omitidas.csv"]
  );
});

test("limpiarCedula quita los puntos y comas de miles, y los espacios", () => {
  assert.equal(limpiarCedula("1.020.458.300"), "1020458300");
  assert.equal(limpiarCedula("1,020,458,300"), "1020458300");
  assert.equal(limpiarCedula("20.458.300"), "20458300");
  assert.equal(limpiarCedula(" 1 020 458 300 "), "1020458300");
  assert.equal(limpiarCedula("123.456"), "123456");
  assert.equal(limpiarCedula("1020458300"), "1020458300");
  assert.equal(limpiarCedula("0012345678"), "12345678");
});

test("limpiarCedula NO le agrega un dígito a una cédula con decimal («1234567.0» no es 12345670)", () => {
  assert.equal(limpiarCedula("1234567.0"), "1234567");
  assert.equal(limpiarCedula("1234567.5"), "1234567");
  assert.equal(limpiarCedula("123456.0"), "123456");
  assert.equal(limpiarCedula("1234567,0"), "1234567");
});

test("limpiarCedula devuelve null (o algo demasiado corto) para lo que no es una cédula", () => {
  assert.equal(limpiarCedula(""), null);
  assert.equal(limpiarCedula(undefined), null);
  assert.equal(limpiarCedula("ABC123"), null);
  assert.equal(limpiarCedula("12-345"), null);
  assert.equal(limpiarCedula("1.5"), "1");
});

test("resolverCedula: manda `usuario`; si no sirve usa `identificacion` y avisa; si no coinciden avisa", () => {
  const ok = resolverCedula(fila({ usuario: "1.020.458.300", identificacion: "1020458300" }));
  assert.deepEqual(ok, { cedula: "1020458300", aviso: null });
  const decimal = resolverCedula(fila({ usuario: "1234567.0", identificacion: "1234567" }));
  assert.deepEqual(decimal, { cedula: "1234567", aviso: null });
  const raro = resolverCedula(fila({ usuario: "1.5", identificacion: "1020458300" }));
  assert.equal(raro.cedula, "1020458300");
  assert.equal(raro.aviso?.categoria, "USUARIO_NO_ES_CEDULA");
  const distinto = resolverCedula(fila({ usuario: "123456789012", identificacion: "123456" }));
  assert.equal(distinto.cedula, "123456789012");
  assert.equal(distinto.aviso?.categoria, "USUARIO_DISTINTO_DE_IDENTIFICACION");
  assert.equal(resolverCedula(fila({ usuario: "", identificacion: "" })).cedula, null);
});

test("una cédula con puntos de miles entra limpia y su clave inicial es esa cédula (password_inicial vacío)", () => {
  const r = convertirUsuariosSisres([fila({ usuario: "1.020.458.300", identificacion: "1020458300" })], OPC);
  assert.equal(r.plantilla[0].cedula, "1020458300");
  assert.equal(r.plantilla[0].password_inicial, "");
  assert.deepEqual(r.avisos, []);
});

test("un `usuario` que no es cédula («1.5») usa la identificación y queda con aviso", () => {
  const r = convertirUsuariosSisres([fila({ usuario: "1.5", identificacion: "1020458300" })], OPC);
  assert.equal(r.plantilla[0].cedula, "1020458300");
  assert.equal(r.avisos[0].categoria, "USUARIO_NO_ES_CEDULA");
});

test("estadosCargados: por omisión solo el 1; se pueden sumar otros estados", () => {
  const filas = [fila({ id: "1", usuario: "1000000001", estado: "1" }), fila({ id: "2", usuario: "1000000002", estado: "2" }), fila({ id: "3", usuario: "1000000003", estado: "0" })];
  assert.deepEqual(convertirUsuariosSisres(filas, OPC).plantilla.map((p) => p.cedula), ["1000000001"]);
  assert.deepEqual(convertirUsuariosSisres(filas, { ...OPC, estadosCargados: ["1", "2"] }).plantilla.map((p) => p.cedula), ["1000000001", "1000000002"]);
});

test("centrosPorCiudad: una ciudad asignada a mano le da centro a los roles que lo necesitan; sin ella se omiten", () => {
  const f = fila({ ciudad: "CARTAGENA" });
  assert.equal(convertirUsuariosSisres([f], OPC).omitidas[0].categoria, "SIN_CENTRO");
  const r = convertirUsuariosSisres([f], { ...OPC, centrosPorCiudad: { Cartagena: "CTG" } });
  assert.equal(r.plantilla[0].centro_operativo, "CTG");
  assert.equal(centroDeCiudad("CÚCUTA", { Cucuta: "ADO" }), "ADO");
  assert.equal(centroDeCiudad("Bogotá", { Cartagena: "CTG" }), "CRA_BOGOTA");
});
