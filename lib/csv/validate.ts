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
    // Swish numbers are often written with spaces or dashes ("123 123 12 34")
    const payee = row.payee?.replace(/[\s-]/g, "") ?? "";
    // Allow thousands spaces ("1 000") and Swedish decimal commas ("100,50")
    const amountStr = row.amount?.replace(/\s/g, "").replace(",", ".") ?? "";
    const message = row.message?.trim() ?? "";
    const label = row.label?.trim() || undefined;
    const sizeStr = row.size?.trim() ?? "";

    if (!payee) {
      errors.push({ row: rowNum, message: "Payee is required" });
      return;
    }
    if (!/^\d+$/.test(payee)) {
      errors.push({
        row: rowNum,
        message: "Payee must be a Swish number (digits only)",
      });
      return;
    }
    if (!amountStr) {
      errors.push({ row: rowNum, message: "Amount is required" });
      return;
    }
    // Plain decimal numbers only, so "0x10" or "1e3" aren't silently accepted
    if (!/^-?\d+(\.\d+)?$/.test(amountStr)) {
      errors.push({ row: rowNum, message: "Amount must be a valid number" });
      return;
    }
    const amount = Number(amountStr);
    if (amount <= 0) {
      errors.push({ row: rowNum, message: "Amount must be greater than 0" });
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
      errors.push({
        row: rowNum,
        message: "Amount can have at most 2 decimals",
      });
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
