import { describe, expect, it } from "vitest";
import { format } from "./format";
import { en } from "./dictionaries/en";
import { sv } from "./dictionaries/sv";

describe("format", () => {
  it("replaces placeholders", () => {
    expect(format("Row {row}: {msg}", { row: 3, msg: "bad" })).toBe(
      "Row 3: bad",
    );
  });

  it("replaces every occurrence", () => {
    expect(format("{a}-{a}", { a: "x" })).toBe("x-x");
  });

  it("leaves unknown placeholders as they are", () => {
    expect(format("Hi {name}")).toBe("Hi {name}");
    expect(format("Hi {name} {x}", { x: 1 })).toBe("Hi {name} 1");
  });

  it("returns text without placeholders unchanged", () => {
    expect(format("Plain")).toBe("Plain");
  });
});

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

function flatten(obj: object, prefix = ""): [string, string][] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : flatten(value, `${prefix}${key}.`),
  );
}

describe("dictionaries", () => {
  it("use the same placeholders in every language", () => {
    const svEntries = new Map(flatten(sv));
    for (const [key, text] of flatten(en)) {
      expect(placeholders(svEntries.get(key) ?? ""), key).toEqual(
        placeholders(text),
      );
    }
  });
});
