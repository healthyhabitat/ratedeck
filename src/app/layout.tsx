import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://ratedeck.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "RateDeck — Freelance rate card from skills + market",
  description:
    "Enter skills, experience, market, and engagement type. Get hourly + project ranges, a transparent formula, positioning, client email, and negotiation scripts. Free preview. Full card $1.",
  openGraph: {
    title: "RateDeck — know what to charge",
    description:
      "Skills + context → freelance rate card + justification email. Free preview in your browser.",
    type: "website",
    url: siteUrl,
    siteName: "RateDeck",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RateDeck — Skills → rate card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RateDeck",
    description:
      "Skills + market → freelance rate card with transparent formula. Full unlock $1.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <nav className="print:hidden border-b border-white/5 bg-[#070b14]/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <Link
                href="/"
                className="text-sm font-bold tracking-tight text-amber-100"
              >
                Rate<span className="text-amber-500">Deck</span>
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href="/create"
                  className="text-slate-300 transition hover:text-amber-200"
                >
                  Create
                </Link>
                <Link
                  href="/create"
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-[#070b14] hover:bg-amber-500"
                >
                  Get started — free
                </Link>
              </div>
            </div>
          </nav>
          <div className="flex-1">{children}</div>
          <footer className="print:hidden border-t border-white/5 py-8 text-center text-xs text-slate-500">
            <p>
              RateDeck · Defensible freelance rates ·{" "}
              <a
                href="https://github.com/healthyhabitat/ratedeck"
                className="text-slate-400 underline-offset-2 hover:text-amber-400 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
