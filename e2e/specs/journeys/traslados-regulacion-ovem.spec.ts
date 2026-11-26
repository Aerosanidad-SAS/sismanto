import { test, expect, type Browser, type Locator, type Page } from "@playwright/test";
import { PREFIJO } from "../../fixtures/datos";
import { archivoSesion, tieneCredenciales, type RolClave } from "../../fixtures/roles";

// Journey: Regulación crea un servicio TEST- de cada tipo, se lo asigna al móvil reservado y el OVEM lo recorre paso a
// paso hasta FINALIZADO. Los pasos son los del tipo (src/lib/estado-servicio.ts). Todo lleva el prefijo TEST-.
// Corre en serie: comparten el móvil KQX040 y la lista «Mis servicios» del mismo OVEM.
test.describe.configure({ mode: "serial" });
test.setTimeout(150_000); // crear + 7 pasos con confirmaciones, dos sesiones, contra un despliegue real

const MOVIL = process.env.E2E_VEHICULO_MDE ?? "KQX040";

const SIMPLE = ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a destino", "Paciente entregado"];
const DOBLE = ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a punto intermedio", "Salida de regreso", "Llegada a origen", "Paciente entregado"];
const AEREO = ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a aeropuerto", "Salida de aeropuerto", "Llegada a destino", "Paciente entregado"];
const DOMICILIARIA = ["Inicio de desplazamiento", "Inicio de atención", "Fin de atención"];

type Caso = { id: string; tipo: string; pasos: string[]; creador: RolClave; domiciliaria?: boolean };

const CASOS: Caso[] = [
  { id: "X-10", tipo: "TAB SIMPLE", pasos: SIMPLE, creador: "REGULACION_MDE" },
  { id: "X-11", tipo: "TAB DOBLE", pasos: DOBLE, creador: "REGULACION_MDE" },
  { id: "X-12", tipo: "TAM SIMPLE", pasos: SIMPLE, creador: "REGULACION_MDE" },
  { id: "X-13", tipo: "TAM DOBLE", pasos: DOBLE, creador: "REGULACION_MDE" },
  { id: "X-14", tipo: "MEDICINA DOMICILIARIA", pasos: DOMICILIARIA, creador: "REGULACION_MDE", domiciliaria: true },
  // Regulación no ofrece el traslado aéreo (SRG-06): lo crea la administración.
  { id: "X-15", tipo: "TRASLADO AEREO", pasos: AEREO, creador: "ADMIN" },
];

/** «dd/mm/aaaa hh:mm» en hora de Colombia, `minutos` después de ahora (el formulario no acepta ISO). */
function horaColombia(minutos: number): string {
  const d = new Date(Date.now() + minutos * 60_000);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/** Abre un combobox de catálogo del formulario y elige la opción. */
async function elegir(page: Page, dialogo: Locator, selector: string, opcion: string) {
  await dialogo.locator(selector).click();
  await page.getByRole("option", { name: opcion, exact: true }).click();
}

async function crearServicio(page: Page, c: Caso, nombre: string, indice: number) {
  await page.goto("/servicios?nuevo=1");
  const dialogo = page.getByRole("dialog");
  await dialogo.locator("#tipo_servicio").click();
  await page.getByRole("option", { name: c.tipo, exact: true }).click();
  await dialogo.locator("#nombre_completo").fill(nombre);
  await dialogo.locator("#vehicle_id").click();
  await page.getByRole("option", { name: new RegExp(MOVIL) }).click();
  // shortcut: pocos minutos adelante para que caiga en la vista «Hoy»; falla si se corre a las 23:55 (el día cambia), pasar a la vista «Todos».
  await dialogo.locator("#fecha_hora_programacion").fill(horaColombia(2 + indice * 3));
  if (!c.domiciliaria) {
    // TAB y TAM no se despachan sin ciudad de origen y de destino (#343).
    for (const parada of ["origen", "destino"]) {
      await elegir(page, dialogo, `#departamento_${parada}`, "Antioquia");
      await elegir(page, dialogo, `#ciudad_${parada}`, "Medellín");
    }
    await dialogo.locator("#direccion_origen").fill(`${PREFIJO} Calle 10 #20-30, Medellín`);
  }
  await dialogo.locator("#direccion_destino").fill(`${PREFIJO} ${c.domiciliaria ? "Domicilio Calle 5 #6-7" : "Clínica Las Américas"}, Medellín`);
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialogo, "el servicio no se guardó").toBeHidden({ timeout: 20_000 });

  // Debe quedar en la lista de Regulación como PROGRAMADO y con el móvil.
  await page.goto("/servicios");
  const fila = page.locator("tr", { hasText: nombre });
  await expect(fila).toContainText("PROGRAMADO", { timeout: 20_000 });
  await expect(fila).toContainText(MOVIL);
}

/** Abre «Mis servicios» del OVEM y espera la tarjeta; si tarda, lo anota (#388) y recarga una vez. */
async function abrirTarjeta(ovem: Page, nombre: string) {
  const abrir = async () => {
    await ovem.goto("/ovem");
    await ovem.getByRole("button", { name: /^Mis servicios/ }).click();
  };
  await abrir();
  try {
    await ovem.getByText(nombre).waitFor({ timeout: 6_000 });
  } catch {
    test.info().annotations.push({ type: "issue", description: "#388: la tarjeta no apareció en 6 s; apareció tras recargar" });
    await abrir();
    await ovem.getByText(nombre).waitFor({ timeout: 15_000 });
  }
}

/** La tarjeta más chica que contiene el nombre del paciente Y la lista de pasos: así no se mezcla con otros servicios. */
const tarjeta = (ovem: Page, nombre: string) =>
  ovem
    .locator("div", { has: ovem.getByText(nombre) })
    .filter({ has: ovem.getByText(/\((hecho|pendiente)\)/) })
    .last();

async function recorrer(ovem: Page, nombre: string, pasos: string[]) {
  for (const paso of pasos) {
    const boton = ovem.locator("div", { has: ovem.getByText(nombre) }).filter({ has: ovem.getByRole("button", { name: paso, exact: true }) }).last().getByRole("button", { name: paso, exact: true });
    await expect(boton, `no hay botón «${paso}»`).toBeVisible({ timeout: 15_000 });
    await boton.click();
    // El primer paso (pasa a CURSO) y el último (pasa a FINALIZADO) piden confirmación; los intermedios no.
    const confirmar = ovem.getByRole("button", { name: "Sí, registrar" });
    if (await confirmar.isVisible().catch(() => false)) await confirmar.click();
    else if (paso === pasos[0] || paso === pasos[pasos.length - 1]) await confirmar.click({ timeout: 5_000 });
    if (paso !== pasos[pasos.length - 1]) {
      await expect(tarjeta(ovem, nombre).getByText("(hecho)").first(), `«${paso}» no quedó hecho`).toBeVisible({ timeout: 15_000 });
    }
  }
  // Al finalizar, el servicio sale de «Mis servicios».
  await expect(ovem.getByText(nombre)).toBeHidden({ timeout: 20_000 });
}

async function contextoDe(browser: Browser, rol: RolClave, baseURL: string | undefined, movil = false) {
  return browser.newContext({ baseURL, storageState: archivoSesion(rol), ...(movil ? { viewport: { width: 390, height: 844 } } : {}) });
}

for (const [i, c] of CASOS.entries()) {
  test(`${c.id}: ${c.tipo}: ${c.creador === "ADMIN" ? "la administración" : "Regulación"} crea, el OVEM recorre y finaliza`, async ({ browser, baseURL }) => {
    test.skip(!tieneCredenciales(c.creador) || !tieneCredenciales("OVEM_MDE"), `sin credenciales para ${c.creador} y OVEM_MDE`);
    const nombre = `${PREFIJO} E2E ${c.id} ${c.tipo} ${Date.now().toString().slice(-6)}`;

    const regCtx = await contextoDe(browser, c.creador, baseURL);
    const ovemCtx = await contextoDe(browser, "OVEM_MDE", baseURL, true);
    try {
      await crearServicio(await regCtx.newPage(), c, nombre, i);
      const ovem = await ovemCtx.newPage();
      await abrirTarjeta(ovem, nombre);
      await recorrer(ovem, nombre, c.pasos);

      // Regulación lo ve FINALIZADO.
      const reg = (await regCtx.pages())[0];
      await reg.goto("/servicios");
      await expect(reg.locator("tr", { hasText: nombre })).toContainText("FINALIZADO", { timeout: 20_000 });
    } finally {
      await regCtx.close();
      await ovemCtx.close();
    }
  });
}
