import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// La migración 142 ubica los ítems por su nombre exacto: un nombre mal escrito no falla, simplemente no mueve nada.
const sql = (archivo: string) => readFileSync(`scripts/migrations/${archivo}`, "utf8");
const m142 = sql("142_preoperacional_orden_frio_caliente.sql");
const sembrados = ["005_maintenance_items_checklist.sql", "008_fleet_vencimientos_checklist.sql", "094_motor_alertas_preoperacional.sql"]
  .map(sql)
  .join("\n");
const mapa = Array.from(m142.matchAll(/^\s*\('(.+)', '[1-4] · .+', \d+\),?$/gm), (m) => m[1]);

test("cada ítem que ordena la migración 142 existe en el catálogo sembrado (o es una copia en caliente)", () => {
  assert.ok(mapa.length > 50, "no se leyó el mapa de la migración 142");
  assert.equal(new Set(mapa).size, mapa.length, "un ítem aparece dos veces en el mapa");
  const faltan = mapa.filter((d) => !sembrados.includes(`'${d.replace(" (motor caliente)", "")}'`));
  assert.deepEqual(faltan, []);
});

test("cada copia en caliente tiene su ítem en frío y respeta si estaba desactivado", () => {
  const calientes = mapa.filter((d) => d.endsWith(" (motor caliente)"));
  assert.equal(calientes.length, 4);
  for (const d of calientes) {
    const frio = d.replace(" (motor caliente)", "");
    assert.ok(mapa.includes(frio), frio);
    assert.ok(m142.match(/ci\.descripcion IN \((.+)\)\n/)?.[1].includes(`'${frio}'`), frio);
  }
  assert.match(m142, /ci\.cantidad_esperada, 0, ci\.activo, ci\.lista/);
});
