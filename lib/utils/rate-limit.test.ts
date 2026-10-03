import { describe, expect, it } from "vitest";
import { createRateLimiter, getClientIp } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit per window, then blocks", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 100).allowed).toBe(true);
    expect(check("a", 200)).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it("tracks keys independently", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("b", 0).allowed).toBe(true);
    expect(check("a", 0).allowed).toBe(false);
  });

  it("resets after the window", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 999).allowed).toBe(false);
    expect(check("a", 1000).allowed).toBe(true);
  });

  it("evicts expired keys when the map is full", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    check("a", 0);
    check("b", 0);
    check("c", 1500); // a and b expired and are evicted
    expect(check("c", 1500).allowed).toBe(false);
    expect(check("a", 1500).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost", { headers });

  it("prefers x-real-ip", () => {
    expect(getClientIp(req({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe(
      "1.1.1.1",
    );
  });

  it("falls back to the first x-forwarded-for entry", () => {
    expect(getClientIp(req({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" }))).toBe("2.2.2.2");
  });

  it("returns unknown when no header is present", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
