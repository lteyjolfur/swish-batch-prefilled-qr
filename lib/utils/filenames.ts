import type { PaymentRow } from "../csv/types";

/**
 * Builds a safe, ASCII-only PNG filename for a row. Diacritics are folded
 * (å → a, ö → o) and names already in `used` get a numeric suffix so ZIP
 * entries never overwrite each other.
 */
export function makeFilename(
  row: PaymentRow,
  index: number,
  used: Set<string>,
): string {
  const slugify = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const base =
    slugify(row.label ?? "") || slugify(row.message) || `payment-${index}`;

  let name = base;
  for (let n = 2; used.has(name); n++) {
    name = `${base}-${n}`;
  }
  used.add(name);
  return `${name}.png`;
}
