import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_VISIBLE_TOASTS, createToastStore, defaultDuration } from "./toast-store";

describe("toast store", () => {
  it("adds with defaults and notifies subscribers", () => {
    const store = createToastStore();
    let calls = 0;
    const off = store.subscribe(() => {
      calls += 1;
    });
    const id = store.add({ title: "Guardado" });
    assert.equal(calls, 1);
    assert.deepEqual(
      store.getSnapshot().map((t) => [t.id, t.tone, t.duration]),
      [[id, "info", 5000]]
    );
    off();
    store.add({ title: "Otro" });
    assert.equal(calls, 1);
  });

  it("dismisses one or all; unknown id does not notify", () => {
    const store = createToastStore();
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });
    const a = store.add({ title: "a" });
    store.add({ title: "b" });
    calls = 0;
    store.dismiss("nope");
    assert.equal(calls, 0);
    store.dismiss(a);
    assert.equal(store.getSnapshot().length, 1);
    store.dismiss();
    assert.equal(store.getSnapshot().length, 0);
  });

  it("keeps only the latest MAX_VISIBLE_TOASTS", () => {
    const store = createToastStore();
    for (let i = 0; i < MAX_VISIBLE_TOASTS + 2; i++) store.add({ title: `t${i}` });
    const titles = store.getSnapshot().map((t) => t.title);
    assert.equal(titles.length, MAX_VISIBLE_TOASTS);
    assert.equal(titles[titles.length - 1], `t${MAX_VISIBLE_TOASTS + 1}`);
  });

  it("picks longer durations for actions and errors", () => {
    assert.equal(defaultDuration({}), 5000);
    assert.equal(defaultDuration({ action: { label: "Deshacer", onClick() {} } }), 8000);
    assert.equal(defaultDuration({ tone: "error" }), 10000);
  });
});
