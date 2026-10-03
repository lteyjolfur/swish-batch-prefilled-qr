import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Generate Swish QR codes in bulk from a CSV file, with clean branded output ready for sharing or printing.";

export const metadata: Metadata = {
  metadataBase: new URL("https://swish-batch-prefilled-qr.vercel.app"),
  title: "Swish Batch QR Generator",
  description,
  openGraph: {
    title: "Swish Batch QR Generator",
    description,
    images: ["/Screenshot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
