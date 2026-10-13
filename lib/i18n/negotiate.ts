import { defaultLocale, hasLocale, type Locale } from "./config";

// Picks the best supported locale from an Accept-Language header such as
// "sv-SE,sv;q=0.9,en-US;q=0.8". Never throws; falls back to the default.
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(";");
      const qParam = params
        .map((p) => p.trim())
        .find((p) => p.toLowerCase().startsWith("q="));
      const parsed = qParam ? Number(qParam.slice(2)) : 1;
      const q = Number.isFinite(parsed) ? parsed : 0;
      const primary = tag.trim().toLowerCase().split("-")[0];
      return { primary, q, index };
    })
    .filter((c) => c.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { primary } of candidates) {
    if (hasLocale(primary)) return primary;
  }
  return defaultLocale;
}
