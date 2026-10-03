import { describe, expect, it } from "vitest";
import { validateRows } from "./validate";
import type { CsvRow } from "./types";

const row = (overrides: CsvRow = {}): CsvRow => ({
  payee: "1231231234",
  amount: "100",
  message: "Membership fee",
  ...overrides,
});

describe("validateRows", () => {
  it("accepts a valid row and applies defaults", () => {
    const { valid, errors } = validateRows([row()]);
    expect(errors).toEqual([]);
    expect(valid).toEqual([
      {
        payee: "1231231234",
        amount: 100,
        message: "Membership fee",
        label: undefined,
        size: 500,
      },
    ]);
  });

  it("trims whitespace and keeps the label", () => {
    const { valid } = validateRows([
      row({ payee: " 123 ", message: " Fee ", label: " Youth " }),
    ]);
    expect(valid[0]).toMatchObject({ payee: "123", message: "Fee", label: "Youth" });
  });

  it("treats an empty label as undefined", () => {
    const { valid } = validateRows([row({ label: "  " })]);
    expect(valid[0].label).toBeUndefined();
  });

  it.each([
    [{ payee: "" }, "Payee is required"],
    [{ amount: "" }, "Amount is required"],
    [{ amount: "abc" }, "Amount must be a valid number"],
    [{ amount: "0" }, "Amount must be greater than 0"],
    [{ amount: "-5" }, "Amount must be greater than 0"],
    [{ message: "" }, "Message is required"],
    [{ message: "x".repeat(51) }, "Message must be 50 characters or fewer"],
  ])("rejects %o with %s", (overrides, message) => {
    const { valid, errors } = validateRows([row(overrides)]);
    expect(valid).toEqual([]);
    expect(errors).toEqual([{ row: 1, message }]);
  });

  it("allows a 50 character message", () => {
    const { errors } = validateRows([row({ message: "x".repeat(50) })]);
    expect(errors).toEqual([]);
  });

  it.each(["300", "800", "2000"])("accepts size %s", (size) => {
    const { valid } = validateRows([row({ size })]);
    expect(valid[0].size).toBe(Number(size));
  });

  it.each(["299", "2001", "500.5", "big"])("rejects size %s", (size) => {
    const { errors } = validateRows([row({ size })]);
    expect(errors).toEqual([
      { row: 1, message: "Size must be a whole number between 300 and 2000" },
    ]);
  });

  it("reports 1-based row numbers and keeps valid rows", () => {
    const { valid, errors } = validateRows([
      row(),
      row({ payee: "" }),
      row({ amount: "x" }),
    ]);
    expect(valid).toHaveLength(1);
    expect(errors.map((e) => e.row)).toEqual([2, 3]);
  });
});
