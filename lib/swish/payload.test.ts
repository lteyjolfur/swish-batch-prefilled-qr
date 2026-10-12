import { describe, expect, it } from "vitest";
import { toSwishPayload } from "./payload";

describe("toSwishPayload", () => {
  it("builds a locked prefilled payload with the row's size", () => {
    expect(
      toSwishPayload({
        payee: "1231231234",
        amount: 150,
        message: "Training fee",
        label: "Youth",
        size: 800,
      }),
    ).toEqual({
      format: "png",
      payee: { value: "1231231234", editable: false },
      amount: { value: 150, editable: false },
      message: { value: "Training fee", editable: false },
      size: 800,
    });
  });

  const row = {
    payee: "1231231234",
    amount: 150,
    message: "Training fee",
    size: 500,
  };

  it("leaves the message editable when lockMessage is false", () => {
    expect(toSwishPayload(row, { lockMessage: false }).message).toEqual({
      value: "Training fee",
      editable: true,
    });
  });

  it("locks the message when lockMessage is true", () => {
    expect(toSwishPayload(row, { lockMessage: true }).message).toEqual({
      value: "Training fee",
      editable: false,
    });
  });

  it("omits the message when it is empty", () => {
    const payload = toSwishPayload({ ...row, message: "" });
    expect(payload).not.toHaveProperty("message");
    expect(payload.payee.editable).toBe(false);
    expect(payload.amount.editable).toBe(false);
  });
});
