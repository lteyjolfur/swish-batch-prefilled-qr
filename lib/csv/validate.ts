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
    const payee = row.payee?.trim() ?? "";
    const amountStr = row.amount?.trim() ?? "";
    const message = row.message?.trim() ?? "";
    const label = row.label?.trim() || undefined;
    const sizeStr = row.size?.trim() ?? "";
    let size = 1000;
    if (sizeStr) {
      const parsedSize = Number(sizeStr);
      if (isFinite(parsedSize) && parsedSize > 0) {
        size = parsedSize;
      }
    }

    if (!payee) {
      errors.push({ row: rowNum, message: "Payee is required" });
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

    valid.push({ payee, amount, message, label, size });
  });

  return { valid, errors };
}
