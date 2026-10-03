import type { CsvRow, PaymentRow } from "./types";

// Pixel size of the QR image requested from Swish (API minimum is 300).
const DEFAULT_QR_SIZE = 500;
const MIN_QR_SIZE = 300;
const MAX_QR_SIZE = 2000;

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

    let size = DEFAULT_QR_SIZE;
    if (sizeStr) {
      const parsedSize = Number(sizeStr);
      if (
        !Number.isInteger(parsedSize) ||
        parsedSize < MIN_QR_SIZE ||
        parsedSize > MAX_QR_SIZE
      ) {
        errors.push({
          row: rowNum,
          message: `Size must be a whole number between ${MIN_QR_SIZE} and ${MAX_QR_SIZE}`,
        });
        return;
      }
      size = parsedSize;
    }

    valid.push({ payee, amount, message, label, size });
  });

  return { valid, errors };
}
