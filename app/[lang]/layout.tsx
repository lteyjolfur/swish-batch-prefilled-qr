import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import { hasLocale, locales, type Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Unknown locales such as /de are a 404, not rendered on demand
export const dynamicParams = false;

const ogLocales: Record<Locale, string> = { en: "en_US", sv: "sv_SE" };

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { title, description } = getDictionary(lang).meta;
  return {
    metadataBase: new URL("https://swish-batch-prefilled-qr.vercel.app"),
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", sv: "/sv" },
    },
    openGraph: {
      title,
      description,
      locale: ogLocales[lang],
      images: ["/Screenshot.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
