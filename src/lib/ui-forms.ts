/**
 * Pure helpers behind the form/feedback components in src/components/ui (Field, FileDrop).
 * No React imports so they can be tested with node:test.
 */

/** Joins ids for `aria-describedby`, skipping empty values. Returns undefined when nothing is left. */
export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const out = ids.flatMap((id) => (id ? id.split(/\s+/).filter(Boolean) : []));
  const unique = Array.from(new Set(out));
  return unique.length ? unique.join(" ") : undefined;
}

/** Derives the ids used by a field from one base id (React `useId()` output is valid; colons are kept). */
export function fieldIds(base: string) {
  return {
    control: base,
    hint: `${base}-hint`,
    error: `${base}-error`,
  };
}

const UNITS = ["B", "KB", "MB", "GB"] as const;

/** "1,5 MB" (es-CO decimal comma). Base 1024. Invalid or negative input returns "0 B". */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? String(Math.round(value)) : value.toFixed(value >= 10 ? 0 : 1).replace(".", ",");
  return `${rounded} ${UNITS[unit]}`;
}

/**
 * Same semantics as the `accept` attribute of <input type="file">: comma-separated list of
 * extensions (".xlsx"), exact MIME types ("application/pdf") or wildcards ("image/*"). Empty = anything.
 */
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  const rules = (accept ?? "")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export type FileValidation = { ok: true } | { ok: false; message: string };

/** Validates a file against `accept` and `maxBytes`. Messages are user-facing (es, tuteo). */
export function validateFile(
  file: { name: string; type: string; size: number },
  opts: { accept?: string; maxBytes?: number } = {}
): FileValidation {
  if (!matchesAccept(file, opts.accept)) {
    return { ok: false, message: `El archivo «${file.name}» no es de un tipo permitido${acceptHint(opts.accept)}.` };
  }
  if (file.size === 0) {
    return { ok: false, message: `El archivo «${file.name}» está vacío.` };
  }
  if (opts.maxBytes !== undefined && file.size > opts.maxBytes) {
    return {
      ok: false,
      message: `El archivo «${file.name}» pesa ${formatFileSize(file.size)} y el máximo es ${formatFileSize(opts.maxBytes)}.`,
    };
  }
  return { ok: true };
}

function acceptHint(accept?: string): string {
  const list = (accept ?? "").split(",").map((r) => r.trim()).filter(Boolean);
  return list.length ? ` (${list.join(", ")})` : "";
}
