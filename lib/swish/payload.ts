import type { PaymentRow } from "../csv/types";

export function toSwishPayload(row: PaymentRow) {
  return {
    format: "png",
    payee: {
      value: row.payee,
      editable: false,
    },
    amount: {
      value: row.amount,
      editable: false,
    },
    message: {
      value: row.message,
      editable: false,
    },
    size: row.size ?? 1000,
  };
}
