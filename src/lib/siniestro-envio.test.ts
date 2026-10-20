import { test } from "node:test";
import assert from "node:assert/strict";
import {
  VIGENCIA_BORRADOR_MS,
  avisoSiniestroReportado,
  borradorTieneTexto,
  claveBorradorSiniestro,
  fechaHoraAIso,
  limpiarBorradoresSiniestro,
  leerBorradorSiniestro,
  serializarBorradorSiniestro,
  type BorradorSiniestro,
} from "./siniestro-envio";

const vacio: BorradorSiniestro = {
  fechaHora: "2026-10-15T10:30",
  lugar: "",
  descripcion: "",
  pacienteABordo: false,
  hayLesionados: false,
  lesionadosDetalle: "",
  hayTerceros: true,
  terceroPlaca: "",
  terceroNombre: "",
  terceroCedula: "",
  terceroTelefono: "",
  terceroAseguradora: "",
  sinTerceroMotivo: "",
  abogadoNombre: "",
  abogadoTelefono: "",
  abogadoCedula: "",
  abogadoCorreo: "",
  sinAbogado: false,
  sinAbogadoMotivo: "",
  sinDocumentos: false,
  sinDocumentosMotivo: "",
  intervinoAutoridad: false,
  numeroIpat: "",
  vehiculoOperativo: true,
};

test("fechaHoraAIso: vacío o inválido devuelve null en vez de lanzar", () => {
  assert.equal(fechaHoraAIso(""), null);
  assert.equal(fechaHoraAIso("no es fecha"), null);
  assert.match(fechaHoraAIso("2026-10-15T10:30") ?? "", /^2026-10-15T\d{2}:30:00\.000Z$/);
});

test("borrador: ida y vuelta conserva lo escrito", () => {
  const b = { ...vacio, lugar: "Calle 80 con 30", hayLesionados: true, vehiculoOperativo: false };
  const leido = leerBorradorSiniestro(serializarBorradorSiniestro(b, 1_000), 2_000);
  assert.deepEqual(leido, b);
});

test("borrador: vencido, dañado o sin forma devuelve null", () => {
  const raw = serializarBorradorSiniestro(vacio, 0);
  assert.equal(leerBorradorSiniestro(raw, VIGENCIA_BORRADOR_MS + 1), null);
  assert.equal(leerBorradorSiniestro("{no json", 0), null);
  assert.equal(leerBorradorSiniestro(null, 0), null);
  assert.equal(leerBorradorSiniestro(JSON.stringify({ guardadoAt: 0, campos: [] }), 0), null);
});

test("borrador: ignora campos con el tipo equivocado y deja pasar el resto", () => {
  const raw = JSON.stringify({ guardadoAt: 0, campos: { lugar: 5, descripcion: "choque", hayLesionados: "si" } });
  assert.deepEqual(leerBorradorSiniestro(raw, 1), { descripcion: "choque" });
});

test("borradorTieneTexto: la fecha por defecto no cuenta como algo escrito", () => {
  assert.equal(borradorTieneTexto(vacio), false);
  assert.equal(borradorTieneTexto({ ...vacio, lugar: "  " }), false);
  assert.equal(borradorTieneTexto({ ...vacio, lugar: "Vía al aeropuerto" }), true);
});

test("la clave separa conductor y vehículo", () => {
  assert.notEqual(claveBorradorSiniestro("u1", "v1"), claveBorradorSiniestro("u2", "v1"));
  assert.notEqual(claveBorradorSiniestro("u1", "v1"), claveBorradorSiniestro("u1", "v2"));
});

test("aviso: avisa del NO APTO pedido y, sobre todo, del que falló", () => {
  assert.doesNotMatch(avisoSiniestroReportado("TRG540", { solicitudNoApto: false, noAptoFallo: false }), /NO APTO/);
  assert.match(avisoSiniestroReportado("TRG540", { solicitudNoApto: true, noAptoFallo: false }), /Coordinación debe avalarlo/);
  assert.match(avisoSiniestroReportado("TRG540", { solicitudNoApto: false, noAptoFallo: true }), /Llama a Regulación/);
});

test("limpiarBorradoresSiniestro: quita vencidos y dañados, respeta vigentes y claves ajenas; sin filtro borra todo", () => {
  const datos = new Map<string, string>([
    [claveBorradorSiniestro("u1", "v1"), serializarBorradorSiniestro({ ...vacio, lugar: "Vía" }, 10_000)],
    [claveBorradorSiniestro("u1", "v2"), serializarBorradorSiniestro({ ...vacio, lugar: "Viejo" }, 0)],
    [claveBorradorSiniestro("u1", "v3"), "{dañado"],
    ["otra_clave", "x"],
  ]);
  const storage = {
    get length() {
      return datos.size;
    },
    key: (i: number) => [...datos.keys()][i] ?? null,
    getItem: (k: string) => datos.get(k) ?? null,
    removeItem: (k: string) => void datos.delete(k),
  };
  limpiarBorradoresSiniestro(storage, VIGENCIA_BORRADOR_MS + 5_000, true);
  assert.deepEqual([...datos.keys()], [claveBorradorSiniestro("u1", "v1"), "otra_clave"]);
  limpiarBorradoresSiniestro(storage, 0, false);
  assert.deepEqual([...datos.keys()], ["otra_clave"]);
});
