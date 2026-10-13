import { NextResponse, type NextRequest } from "next/server";
import { pickLocale } from "./lib/i18n/negotiate";

// Redirects "/" to the locale matching the browser's Accept-Language header.
export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

// Only the root: the API, assets and analytics never pass through here.
export const config = { matcher: ["/"] };
