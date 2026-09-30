import assert from "node:assert/strict";
import { test } from "node:test";

import {
  faltantesHojaDeVida,
  numero,
  validarDocumento,
  validarUltimoMantenimiento,
  validarVehiculo,
} from "./hoja-de-vida";

test("numero entiende formato colombiano y anglosajón", () => {
  assert.equal(numero("62.648,00"), 62648);
  assert.equal(numero("$ 1.234.567"), 1234567);
  assert.equal(numero("1,234.5"), 1234.5);
  assert.equal(numero("153473"), 153473);
  assert.equal(numero("abc"), null);
  assert.equal(numero(""), null);
});

test("vehículo mínimo válido: placa y centro; lo demás queda vacío y se reporta como faltante", () => {
  const r = validarVehiculo({ placa: " jzo-514 ", centro_operativo: "CRA_MEDELLIN" });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.valor.placa, "JZO514");
  assert.equal(r.valor.marca, null);
  assert.ok(faltantesHojaDeVida(r.valor).includes("km_actual"));
  assert.ok(faltantesHojaDeVida(r.valor).includes("bateria_auxiliar"));
});

test("vehículo: catálogo inválido, fecha mal escrita y km sin fecha son errores con su columna", () => {
  const r = validarVehiculo({
    placa: "ABC123",
    centro_operativo: "BOGOTA",
    tipo_vehiculo: "MOTO",
    fds_desde: "03/10/2025",
    km_actual: "77328",
  });
  assert.ok(!r.ok);
  if (r.ok) return;
  const columnas = r.errores.map((e) => e.columna);
  assert.ok(columnas.includes("centro_operativo"));
  assert.ok(columnas.includes("tipo_vehiculo"));
  assert.ok(columnas.includes("fds_desde"));
  assert.ok(columnas.includes("fecha_km_actual"));
});

test("vehículo: MOTO ya no es tipo válido; VAN y DOMI sí", () => {
  assert.ok(!validarVehiculo({ placa: "ABC123", centro_operativo: "ADO", tipo_vehiculo: "MOTO" }).ok);
  assert.ok(validarVehiculo({ placa: "ABC123", centro_operativo: "ADO", tipo_vehiculo: "VAN" }).ok);
  assert.ok(validarVehiculo({ placa: "ABC123", centro_operativo: "ADO", tipo_vehiculo: "domi" }).ok);
});

test("documento: valida vigencia, valor y tipo", () => {
  const ok = validarDocumento({
    placa: "abc123",
    tipo: "SOAT",
    vigencia_desde: "2026-03-01",
    vigencia_hasta: "2027-02-28",
    valor: "1.250.000",
    estimado: "si",
  });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.valor.valor, 1250000);
    assert.equal(ok.valor.estimado, true);
  }
  assert.ok(!validarDocumento({ placa: "ABC123", tipo: "SEGURO", vigencia_desde: "2026-03-01", vigencia_hasta: "2027-02-28", valor: 1 }).ok);
  assert.ok(!validarDocumento({ placa: "ABC123", tipo: "RTM", vigencia_desde: "2027-03-01", vigencia_hasta: "2026-02-28", valor: 1 }).ok);
  assert.ok(!validarDocumento({ placa: "ABC123", tipo: "RTM", vigencia_desde: "2026-03-01", vigencia_hasta: "2027-02-28", valor: "x" }).ok);
});

test("último mantenimiento: exige placa, tarea y fecha; km opcional", () => {
  assert.ok(validarUltimoMantenimiento({ placa: "ABC123", item_plan: "Cambio de aceite", fecha_realizado: "2026-08-01" }).ok);
  assert.ok(!validarUltimoMantenimiento({ placa: "ABC123", fecha_realizado: "2026-08-01" }).ok);
  assert.ok(!validarUltimoMantenimiento({ placa: "ABC123", item_plan: "x", fecha_realizado: "2026-13-01" }).ok);
});

test("documento sin valor es válido (solo vencimiento); con valor exige inicio de vigencia", () => {
  const sinValor = validarDocumento({ placa: "ABC123", tipo: "RTM", vigencia_hasta: "2027-04-15", notas: "valor pendiente" });
  assert.ok(sinValor.ok);
  if (sinValor.ok) {
    assert.equal(sinValor.valor.valor, null);
    assert.equal(sinValor.valor.vigencia_desde, null);
  }
  assert.ok(!validarDocumento({ placa: "ABC123", tipo: "RTM", vigencia_hasta: "2027-04-15", valor: 100000 }).ok);
});
