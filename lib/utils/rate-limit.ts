/**
 * Simple in-memory fixed-window rate limiter.
 *
 * State lives in the server instance, so on Vercel each instance counts
 * separately and counts reset on cold start. That's enough to stop casual
 * abuse of the Swish API; use Vercel Firewall or a shared store (e.g. Redis)
 * if a hard global limit is ever needed.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(
    key: string,
    now = Date.now(),
  ): { allowed: boolean; retryAfterSeconds: number } {
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      // Drop expired entries before growing the map past its cap
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) {
          if (v.resetAt <= now) hits.delete(k);
        }
        if (hits.size >= maxKeys) hits.clear();
      }
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count++;
    return {
      allowed: entry.count <= limit,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  };
}

/** Client IP as reported by the platform proxy (Vercel sets these headers). */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
