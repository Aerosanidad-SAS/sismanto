import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diagnosticarEntorno, estadoDe, evaluarVariable, resumenCorreo, tieneBordesSospechosos } from "./entorno-diagnostico";

const SMTP = { SMTP_HOST: "mail.ejemplo.com", SMTP_USER: "a@ejemplo.com", SMTP_PASS: "clave-secreta", NOTIFICATIONS_MAIL_FROM: "a@ejemplo.com" };

describe("estadoDe", () => {
  it("distingue falta, vacía y con valor", () => {
    assert.equal(estadoDe(undefined), "falta");
    assert.equal(estadoDe(""), "vacia");
    assert.equal(estadoDe("   "), "vacia");
    assert.equal(estadoDe("x"), "con_valor");
  });
});

describe("tieneBordesSospechosos", () => {
  it("detecta comillas y espacios en los bordes, no en el medio", () => {
    for (const v of ['"mail.x.com"', "'mail.x.com'", " mail.x.com", "mail.x.com ", "`x`"]) assert.equal(tieneBordesSospechosos(v), true, v);
    for (const v of ["mail.x.com", "cla ve", 'a"b', undefined, ""]) assert.equal(tieneBordesSospechosos(v), false, String(v));
  });
});

describe("evaluarVariable", () => {
  const requerida = { nombre: "SMTP_HOST", importancia: "requerida" as const, paraQue: "" };
  const opcional = { nombre: "SMTP_PORT", importancia: "opcional" as const, paraQue: "" };
  const prohibida = { nombre: "ROLE_SWITCHER_ENABLED", importancia: "debe_faltar_en_produccion" as const, paraQue: "" };

  it("requerida: con valor está bien; vacía o ausente falta", () => {
    assert.equal(evaluarVariable(requerida, { SMTP_HOST: "x" }).veredicto, "bien");
    assert.equal(evaluarVariable(requerida, { SMTP_HOST: "" }).veredicto, "falta");
    assert.equal(evaluarVariable(requerida, {}).veredicto, "falta");
  });

  it("con comillas en los bordes pide revisar", () => {
    assert.equal(evaluarVariable(requerida, { SMTP_HOST: '"mail.x.com"' }).veredicto, "revisar");
  });

  it("opcional sin poner no es un problema", () => {
    assert.equal(evaluarVariable(opcional, {}).veredicto, "opcional_sin_poner");
    assert.equal(evaluarVariable(opcional, { SMTP_PORT: "587" }).veredicto, "bien");
  });

  it("la que debe faltar: si existe, sobra", () => {
    assert.equal(evaluarVariable(prohibida, {}).veredicto, "bien");
    assert.equal(evaluarVariable(prohibida, { ROLE_SWITCHER_ENABLED: "true" }).veredicto, "sobra");
  });

  it("nunca devuelve el valor de la variable", () => {
    const fila = evaluarVariable(requerida, { SMTP_HOST: "valor-muy-secreto" });
    assert.ok(!JSON.stringify(fila).includes("valor-muy-secreto"));
  });
});

describe("resumenCorreo", () => {
  it("con las cuatro del SMTP y la llave de servicio, la recuperación está disponible", () => {
    const r = resumenCorreo({ ...SMTP, SUPABASE_SERVICE_ROLE_KEY: "k" });
    assert.equal(r.proveedor, "smtp");
    assert.deepEqual(r.faltanSmtp, []);
    assert.equal(r.recuperacionDisponible, true);
  });

  it("dice exactamente cuáles del SMTP faltan o están vacías", () => {
    const r = resumenCorreo({ SMTP_HOST: "mail.x.com", SMTP_USER: "", NOTIFICATIONS_MAIL_FROM: "a@x.com", SUPABASE_SERVICE_ROLE_KEY: "k" });
    assert.equal(r.proveedor, "ninguno");
    assert.deepEqual(r.faltanSmtp, ["SMTP_USER", "SMTP_PASS"]);
    assert.equal(r.recuperacionDisponible, false);
  });

  it("sin la llave de servicio no hay recuperación aunque haya correo", () => {
    assert.equal(resumenCorreo({ ...SMTP }).recuperacionDisponible, false);
  });
});

describe("diagnosticarEntorno", () => {
  it("cuenta las requeridas pendientes", () => {
    const vacio = diagnosticarEntorno({});
    assert.ok(vacio.requeridasPendientes >= 8);
    const completo = diagnosticarEntorno({
      ...SMTP,
      NEXT_PUBLIC_SUPABASE_URL: "u",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "a",
      SUPABASE_SERVICE_ROLE_KEY: "s",
      CRON_SECRET: "c",
    });
    assert.equal(completo.requeridasPendientes, 0);
  });
});
