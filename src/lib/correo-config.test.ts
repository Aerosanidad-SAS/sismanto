import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { proveedorCorreo, configSmtp } from "./notifications/proveedor-correo";
import {
  CAMPOS_CORREO,
  mezclarCorreo,
  NOMBRE_REMITENTE_POR_DEFECTO,
  VALIDAR_CORREO,
  VALIDAR_HOST,
  VALIDAR_NOMBRE,
  VALIDAR_PUERTO,
} from "./correo-config";

describe("validaciones", () => {
  it("servidor: solo un nombre de host, sin esquema, espacios ni comillas", () => {
    for (const v of ["mail.aerosanidadsas.com", "smtp.gmail.com", "a-b.c.co"]) assert.equal(VALIDAR_HOST(v), null, v);
    for (const v of ["https://mail.x.com", "mail.x.com ", "'mail.x.com'", "mail", "mail.x.com:465", "mail x.com", ""]) assert.ok(VALIDAR_HOST(v), v);
  });

  it("puerto: número de 1 a 65535", () => {
    for (const v of ["465", "587", "25", "65535"]) assert.equal(VALIDAR_PUERTO(v), null, v);
    for (const v of ["0", "65536", "abc", "46 5", "-1", "4.5"]) assert.ok(VALIDAR_PUERTO(v), v);
  });

  it("correo: completo y sin comillas ni espacios", () => {
    assert.equal(VALIDAR_CORREO("sistemas@aerosanidadsas.com"), null);
    for (const v of ["'sistemas@x.com'", "sistemas", "a@b", "a b@c.com", '"a@b.com"']) assert.ok(VALIDAR_CORREO(v), v);
  });

  it("nombre del remitente: sin saltos de línea ni comillas (evita inyectar encabezados)", () => {
    assert.equal(VALIDAR_NOMBRE("SISMANTO — Aerosanidad"), null);
    assert.ok(VALIDAR_NOMBRE("Hola\r\nBcc: x@y.com"));
    assert.ok(VALIDAR_NOMBRE('Con "comillas"'));
  });

  it("todo campo del catálogo tiene variable de entorno de respaldo y los secretos no se validan como correo", () => {
    for (const c of CAMPOS_CORREO) assert.ok(c.env, c.clave);
    assert.equal(CAMPOS_CORREO.find((c) => c.clave === "smtp_pass")?.secreto, true);
  });
});

describe("mezclarCorreo", () => {
  const ENV = { SMTP_HOST: "mail.vercel.com", SMTP_USER: "env@x.com", SMTP_PASS: "clave-env", NOTIFICATIONS_MAIL_FROM: "env@x.com" };

  it("sin nada guardado, deja el entorno tal cual", () => {
    const r = mezclarCorreo(ENV, {});
    assert.equal(r.env.SMTP_HOST, "mail.vercel.com");
    assert.equal(r.nombreRemitente, NOMBRE_REMITENTE_POR_DEFECTO);
    assert.deepEqual(r.desdeLaAplicacion, []);
    assert.equal(proveedorCorreo(r.env), "smtp");
  });

  it("lo guardado en la aplicación pisa al entorno, campo por campo", () => {
    const r = mezclarCorreo(ENV, { smtp_host: "mail.nuevo.com", smtp_pass: "clave-nueva" });
    assert.equal(r.env.SMTP_HOST, "mail.nuevo.com");
    assert.equal(r.env.SMTP_PASS, "clave-nueva");
    assert.equal(r.env.SMTP_USER, "env@x.com"); // no se tocó
    assert.deepEqual(r.desdeLaAplicacion.sort(), ["smtp_host", "smtp_pass"]);
  });

  it("solo con lo escrito en la aplicación (sin variables) ya hay correo: el remitente sale del usuario", () => {
    const r = mezclarCorreo({}, { smtp_host: "mail.x.com", smtp_user: "u@x.com", smtp_pass: "p" });
    assert.equal(proveedorCorreo(r.env), "smtp");
    assert.equal(r.env.NOTIFICATIONS_MAIL_FROM, "u@x.com");
    const cfg = configSmtp(r.env);
    assert.deepEqual([cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass], ["mail.x.com", 465, true, "u@x.com", "p"]);
  });

  it("el correo remitente escrito tiene prioridad sobre el usuario", () => {
    const r = mezclarCorreo({}, { smtp_host: "mail.x.com", smtp_user: "u@x.com", smtp_pass: "p", smtp_remitente: "avisos@x.com" });
    assert.equal(r.env.NOTIFICATIONS_MAIL_FROM, "avisos@x.com");
  });

  it("puerto 587 escrito en la aplicación cambia a STARTTLS", () => {
    const r = mezclarCorreo(ENV, { smtp_port: "587" });
    const cfg = configSmtp(r.env);
    assert.deepEqual([cfg.port, cfg.secure], [587, false]);
  });

  it("el nombre del remitente sale de la aplicación, o del entorno, o del valor por defecto", () => {
    assert.equal(mezclarCorreo(ENV, { smtp_nombre: "Aerosanidad Sistemas" }).nombreRemitente, "Aerosanidad Sistemas");
    assert.equal(mezclarCorreo({ ...ENV, SMTP_FROM_NAME: "Desde entorno" }, {}).nombreRemitente, "Desde entorno");
    assert.equal(mezclarCorreo(ENV, { smtp_nombre: "   " }).nombreRemitente, NOMBRE_REMITENTE_POR_DEFECTO);
  });

  it("valores en blanco guardados no pisan al entorno", () => {
    const r = mezclarCorreo(ENV, { smtp_host: "   ", smtp_pass: "" });
    assert.equal(r.env.SMTP_HOST, "mail.vercel.com");
    assert.equal(r.env.SMTP_PASS, "clave-env");
  });

  it("no modifica el entorno que recibe", () => {
    const original = { ...ENV };
    mezclarCorreo(ENV, { smtp_host: "otro.com" });
    assert.deepEqual(ENV, original);
  });
});
