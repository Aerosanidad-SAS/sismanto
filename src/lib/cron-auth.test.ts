import assert from "node:assert/strict";
import { test } from "node:test";

import { cronAutorizado } from "./cron-auth";

test("autoriza solo el encabezado exacto que Vercel manda", () => {
  assert.equal(cronAutorizado("Bearer abc123", "abc123"), true);
  assert.equal(cronAutorizado("Bearer abc124", "abc123"), false);
  assert.equal(cronAutorizado(null, "abc123"), false);
  assert.equal(cronAutorizado("", "abc123"), false);
  // Largos distintos: nunca debe reventar comparando buffers de tamaño distinto.
  assert.equal(cronAutorizado("Bearer abc", "abc123"), false);
  assert.equal(cronAutorizado("Bearer abc123extra", "abc123"), false);
  // Sin el prefijo "Bearer " no autoriza, aunque el secreto coincida.
  assert.equal(cronAutorizado("abc123", "abc123"), false);
});
