import type { ErrorCode } from "../utils/errors";
import type { CsvRow, PaymentRow } from "./types";

// Pixel size of the QR image requested from Swish (API minimum is 300).
const DEFAULT_QR_SIZE = 500;
const MIN_QR_SIZE = 300;
const MAX_QR_SIZE = 2000;
export const MAX_MESSAGE_LENGTH = 50;

export type RowError = {
  row: number;
  code: ErrorCode;
  params?: Record<string, number>;
};

/**
 * Validates an array of CsvRow objects, returning valid PaymentRows and errors.
 */
export function validateRows(rows: CsvRow[]): {
  valid: PaymentRow[];
  errors: RowError[];
} {
  const valid: PaymentRow[] = [];
  const errors: RowError[] = [];

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
      errors.push({ row: rowNum, code: "payeeRequired" });
      return;
    }
    if (!/^\d+$/.test(payee)) {
      errors.push({
        row: rowNum,
        code: "payeeInvalid",
      });
      return;
    }
    if (!amountStr) {
      errors.push({ row: rowNum, code: "amountRequired" });
      return;
    }
    // Plain decimal numbers only, so "0x10" or "1e3" aren't silently accepted
    if (!/^-?\d+(\.\d+)?$/.test(amountStr)) {
      errors.push({ row: rowNum, code: "amountInvalid" });
      return;
    }
    const amount = Number(amountStr);
    if (amount <= 0) {
      errors.push({ row: rowNum, code: "amountNotPositive" });
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
      errors.push({
        row: rowNum,
        code: "amountTooManyDecimals",
      });
      return;
    }
    // Message is optional; when empty the payer can write their own
    if (message.length > MAX_MESSAGE_LENGTH) {
      errors.push({
        row: rowNum,
        code: "messageTooLong",
        params: { max: MAX_MESSAGE_LENGTH },
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
          code: "sizeOutOfRange",
          params: { min: MIN_QR_SIZE, max: MAX_QR_SIZE },
        });
        return;
      }
      size = parsedSize;
    }

    valid.push({ payee, amount, message, label, size });
  });

  return { valid, errors };
}
