import type { PaymentRow } from "../csv/types";

export type SwishOptions = {
  /** Stop the payer from changing the message. Defaults to true. */
  lockMessage?: boolean;
};

export function toSwishPayload(
  row: PaymentRow,
  { lockMessage = true }: SwishOptions = {},
) {
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
    // Swish doesn't encode an empty message, so leave it out; the payer can
    // then always write one, whatever lockMessage says.
    ...(row.message && {
      message: {
        value: row.message,
        editable: !lockMessage,
      },
    }),
    size: row.size,
  };
}
