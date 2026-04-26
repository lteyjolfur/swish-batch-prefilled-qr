import type { PaymentRow } from "../csv/types";

export function makeFilename(row: PaymentRow, index: number): string {
  let base = row.label || row.message || `payment-${index}`;
  base = base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${base}.png`;
}
