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
});
