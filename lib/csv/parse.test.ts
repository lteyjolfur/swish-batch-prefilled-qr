import { describe, expect, it } from "vitest";
import { parseCsv } from "./parse";

describe("parseCsv", () => {
  it("parses rows keyed by header and skips empty lines", () => {
    const rows = parseCsv(
      "payee,amount,message,label\n123,100,Fee,Youth\n\n456,50,Kiosk,\n",
    );
    expect(rows).toEqual([
      { payee: "123", amount: "100", message: "Fee", label: "Youth" },
      { payee: "456", amount: "50", message: "Kiosk", label: "" },
    ]);
  });

  it("handles quoted fields with commas", () => {
    const rows = parseCsv('payee,amount,message\n123,100,"Fee, spring"\n');
    expect(rows[0].message).toBe("Fee, spring");
  });

  it("throws on rows with the wrong number of fields", () => {
    expect(() => parseCsv("payee,amount,message\n123,100\n")).toThrow(
      "Invalid CSV format",
    );
  });
});
