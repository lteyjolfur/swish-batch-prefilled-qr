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
    if (!isFinite(amount)) {
      errors.push({ row: rowNum, message: "Amount must be a valid number" });
      return;
    }
    if (amount <= 0) {
      errors.push({ row: rowNum, message: "Amount must be greater than 0" });
      return;
    }
    if (!message) {
      errors.push({ row: rowNum, message: "Message is required" });
      return;
    }
    if (message.length > 50) {
      errors.push({
        row: rowNum,
        message: "Message must be 50 characters or fewer",
      });
      return;
    }

    valid.push({ name, amount, message });
  });

  return { valid, errors };
}
