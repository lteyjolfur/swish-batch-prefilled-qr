import { describe, expect, it } from "vitest";
import { makeFilename } from "./filenames";
import type { PaymentRow } from "../csv/types";

const row = (label?: string, message = "Fee"): PaymentRow => ({
  payee: "1231231234",
  amount: 100,
  message,
  label,
  size: 500,
});

describe("makeFilename", () => {
  it("slugifies the label", () => {
    expect(makeFilename(row("Youth Group"), 1, new Set())).toBe("youth-group.png");
  });

  it("folds Swedish diacritics instead of dropping them", () => {
    expect(makeFilename(row("Årsavgift"), 1, new Set())).toBe("arsavgift.png");
    expect(makeFilename(row("Träning Över 18"), 1, new Set())).toBe(
      "traning-over-18.png",
    );
  });

  it("collapses and trims separators", () => {
    expect(makeFilename(row("  Fee -- 2026!! "), 1, new Set())).toBe("fee-2026.png");
  });

  it("falls back to the message, then to the row index", () => {
    expect(makeFilename(row(undefined, "Training fee"), 1, new Set())).toBe(
      "training-fee.png",
    );
    expect(makeFilename(row("€€€", "Kiosk"), 1, new Set())).toBe("kiosk.png");
    expect(makeFilename(row("€€€", "!!!"), 7, new Set())).toBe("payment-7.png");
  });

  it("dedupes names already used", () => {
    const used = new Set<string>();
    const names = [row("A"), row("A"), row("a"), row("A-2")].map((r, i) =>
      makeFilename(r, i + 1, used),
    );
    expect(names).toEqual(["a.png", "a-2.png", "a-3.png", "a-2-2.png"]);
    expect(new Set(names).size).toBe(names.length);
  });
});
