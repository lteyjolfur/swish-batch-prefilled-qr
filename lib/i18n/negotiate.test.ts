import { describe, expect, it } from "vitest";
import { pickLocale } from "./negotiate";

describe("pickLocale", () => {
  it.each([
    ["sv-SE", "sv"],
    ["en-US", "en"],
    ["sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7", "sv"],
    ["de,sv;q=0.5", "sv"],
    ["de,fr", "en"],
    ["en;q=0.5,sv;q=0.9", "sv"],
    ["en,sv", "en"],
    ["SV", "sv"],
    ["*", "en"],
    ["sv;q=0", "en"],
    ["sv;q=abc,en;q=0.5", "en"],
    ["", "en"],
    [";;;,,,", "en"],
    ["!!!garbage???", "en"],
  ])("%j -> %s", (header, expected) => {
    expect(pickLocale(header)).toBe(expected);
  });

  it("falls back to English for null", () => {
    expect(pickLocale(null)).toBe("en");
  });
});
