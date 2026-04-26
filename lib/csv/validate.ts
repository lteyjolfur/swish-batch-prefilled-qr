import type { CsvRow, PaymentRow } from "./types";

/**
 * Validates an array of CsvRow objects, returning valid PaymentRows and errors.
 */
export function validateRows(rows: CsvRow[]): {
  valid: PaymentRow[];
  errors: { row: number; message: string }[];
} {
  const valid: PaymentRow[] = [];
  const errors: { row: number; message: string }[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 1; // 1-based, excluding header
    const name = row.name?.trim() ?? "";
    const amountStr = row.amount?.trim() ?? "";
    const message = row.message?.trim() ?? "";

    if (!name) {
      errors.push({ row: rowNum, message: "Name is required" });
      return;
    }
    if (!amountStr) {
      errors.push({ row: rowNum, message: "Amount is required" });
      return;
    }
    const amount = Number(amountStr);
    if (isNaN(amount)) {
      errors.push({ row: rowNum, message: "Amount must be a number" });
      return;
    }
    if (!message) {
      errors.push({ row: rowNum, message: "Message is required" });
      return;
    }

    valid.push({ name, amount, message });
  });

  return { valid, errors };
}
