import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { configSmtp, proveedorCorreo } from "./proveedor-correo";

const SMTP = { SMTP_HOST: "mail.ejemplo.com", SMTP_USER: "sistemas@ejemplo.com", SMTP_PASS: "x", NOTIFICATIONS_MAIL_FROM: "sistemas@ejemplo.com" };
const GRAPH = { AZURE_TENANT_ID: "t", AZURE_CLIENT_ID: "c", AZURE_CLIENT_SECRET: "s", NOTIFICATIONS_MAIL_FROM: "sistemas@ejemplo.com" };

describe("proveedorCorreo", () => {
  it("sin variables no hay proveedor (modo simulado)", () => {
    assert.equal(proveedorCorreo({}), "ninguno");
  });

  it("usa SMTP cuando están host, usuario, clave y remitente", () => {
    assert.equal(proveedorCorreo(SMTP), "smtp");
  });

  it("usa Graph cuando solo está configurado Graph", () => {
    assert.equal(proveedorCorreo(GRAPH), "graph");
  });

  it("si están los dos, gana SMTP", () => {
    assert.equal(proveedorCorreo({ ...GRAPH, ...SMTP }), "smtp");
  });

  it("sin remitente no hay proveedor aunque esté lo demás", () => {
    assert.equal(proveedorCorreo({ ...SMTP, NOTIFICATIONS_MAIL_FROM: "" }), "ninguno");
    assert.equal(proveedorCorreo({ ...GRAPH, NOTIFICATIONS_MAIL_FROM: undefined }), "ninguno");
  });

  it("SMTP incompleto cae a Graph si Graph está completo, y si no a ninguno", () => {
    assert.equal(proveedorCorreo({ ...GRAPH, SMTP_HOST: "mail.ejemplo.com" }), "graph");
    assert.equal(proveedorCorreo({ ...SMTP, SMTP_PASS: "" }), "ninguno");
  });

  it("ignora espacios en blanco en host, usuario y remitente", () => {
    assert.equal(proveedorCorreo({ ...SMTP, SMTP_HOST: "   " }), "ninguno");
    assert.equal(proveedorCorreo({ ...SMTP, NOTIFICATIONS_MAIL_FROM: "  " }), "ninguno");
  });
});

describe("configSmtp", () => {
  it("por defecto puerto 465 con TLS", () => {
    const c = configSmtp(SMTP);
    assert.deepEqual(c, { host: "mail.ejemplo.com", port: 465, secure: true, user: "sistemas@ejemplo.com", pass: "x" });
  });

  it("puerto 587 usa STARTTLS (secure=false)", () => {
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "587" }).secure, false);
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "587" }).port, 587);
  });

  it("SMTP_SECURE fuerza el modo sin importar el puerto", () => {
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "587", SMTP_SECURE: "true" }).secure, true);
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "465", SMTP_SECURE: "false" }).secure, false);
  });

  it("un puerto inválido cae al 465", () => {
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "abc" }).port, 465);
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "99999" }).port, 465);
    assert.equal(configSmtp({ ...SMTP, SMTP_PORT: "0" }).port, 465);
  });
});
