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
    expect(valid[0]).toMatchObject({
      payee: "123",
      message: "Fee",
      label: "Youth",
    });
  });

  it.each([
    ["123 123 12 34", "1231231234"],
    ["070-123 45 67", "0701234567"],
  ])("strips spaces and dashes from payee %s", (payee, expected) => {
    const { valid } = validateRows([row({ payee })]);
    expect(valid[0].payee).toBe(expected);
  });

  it.each([
    ["100,50", 100.5],
    ["100.5", 100.5],
    ["1 000", 1000],
    ["0,5", 0.5],
  ])("parses amount %s as %s", (amount, expected) => {
    const { valid, errors } = validateRows([row({ amount })]);
    expect(errors).toEqual([]);
    expect(valid[0].amount).toBe(expected);
  });

  it("treats an empty label as undefined", () => {
    const { valid } = validateRows([row({ label: "  " })]);
    expect(valid[0].label).toBeUndefined();
  });

  it.each<[CsvRow, string, Record<string, number>?]>([
    [{ payee: "" }, "payeeRequired"],
    [{ payee: "abc123" }, "payeeInvalid"],
    [{ payee: "+46701234567" }, "payeeInvalid"],
    [{ amount: "" }, "amountRequired"],
    [{ amount: "abc" }, "amountInvalid"],
    [{ amount: "0x10" }, "amountInvalid"],
    [{ amount: "1e3" }, "amountInvalid"],
    [{ amount: "0" }, "amountNotPositive"],
    [{ amount: "-5" }, "amountNotPositive"],
    [{ amount: "10.999" }, "amountTooManyDecimals"],
    [{ message: "x".repeat(51) }, "messageTooLong", { max: 50 }],
  ])("rejects %o with %s", (overrides, code, params) => {
    const { valid, errors } = validateRows([row(overrides)]);
    expect(valid).toEqual([]);
    expect(errors).toEqual([{ row: 1, code, ...(params && { params }) }]);
  });

  it("accepts a row without a message", () => {
    const { valid, errors } = validateRows([row({ message: "" })]);
    expect(errors).toEqual([]);
    expect(valid[0].message).toBe("");

    const missing = validateRows([{ payee: "123", amount: "100" }]);
    expect(missing.errors).toEqual([]);
    expect(missing.valid[0].message).toBe("");
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
      {
        row: 1,
        code: "sizeOutOfRange",
        params: { min: 300, max: 2000 },
      },
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
