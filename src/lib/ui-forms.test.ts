import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fieldIds, formatFileSize, joinIds, matchesAccept, validateFile } from "./ui-forms";

describe("joinIds", () => {
  it("skips empty values and deduplicates", () => {
    assert.equal(joinIds("a", undefined, false, null, "", "b", "a"), "a b");
  });
  it("splits ids that already contain several", () => {
    assert.equal(joinIds("a b", "b c"), "a b c");
  });
  it("returns undefined when empty", () => {
    assert.equal(joinIds(undefined, false), undefined);
  });
});

describe("fieldIds", () => {
  it("derives hint and error ids", () => {
    assert.deepEqual(fieldIds(":r1:"), { control: ":r1:", hint: ":r1:-hint", error: ":r1:-error" });
  });
});

describe("formatFileSize", () => {
  it("formats units with decimal comma", () => {
    assert.equal(formatFileSize(0), "0 B");
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(1536), "1,5 KB");
    assert.equal(formatFileSize(5 * 1024 * 1024), "5,0 MB");
    assert.equal(formatFileSize(25 * 1024 * 1024), "25 MB");
  });
  it("handles invalid input", () => {
    assert.equal(formatFileSize(-1), "0 B");
    assert.equal(formatFileSize(Number.NaN), "0 B");
  });
});

describe("matchesAccept", () => {
  const xlsx = { name: "Flota.XLSX", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  const png = { name: "foto.png", type: "image/png" };
  it("accepts anything when empty", () => {
    assert.equal(matchesAccept(png, ""), true);
    assert.equal(matchesAccept(png, undefined), true);
  });
  it("matches extension case-insensitively", () => {
    assert.equal(matchesAccept(xlsx, ".xlsx,.xls"), true);
    assert.equal(matchesAccept(png, ".xlsx,.xls"), false);
  });
  it("matches wildcard and exact MIME", () => {
    assert.equal(matchesAccept(png, "image/*"), true);
    assert.equal(matchesAccept(png, "application/pdf"), false);
    assert.equal(matchesAccept({ name: "a", type: "application/pdf" }, "application/pdf"), true);
  });
});

describe("validateFile", () => {
  it("rejects wrong type, empty and oversized files", () => {
    assert.equal(validateFile({ name: "a.txt", type: "text/plain", size: 10 }, { accept: ".xlsx" }).ok, false);
    assert.equal(validateFile({ name: "a.xlsx", type: "", size: 0 }, { accept: ".xlsx" }).ok, false);
    const big = validateFile(
      { name: "a.xlsx", type: "", size: 6 * 1024 * 1024 },
      { accept: ".xlsx", maxBytes: 5 * 1024 * 1024 }
    );
    assert.equal(big.ok, false);
    if (!big.ok) assert.match(big.message, /5,0 MB/);
  });
  it("accepts a valid file", () => {
    assert.deepEqual(validateFile({ name: "a.xlsx", type: "", size: 100 }, { accept: ".xlsx", maxBytes: 1000 }), {
      ok: true,
    });
  });
});
