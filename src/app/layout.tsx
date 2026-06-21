import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

// General Sans is the primary UI + body face (Choir restraint, "feels designed" lift).
// Self-hosted woff2 (ITF-FFL, free) — no third-party request, no layout shift.
const sans = localFont({
  src: [
    { path: "../../public/fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/GeneralSans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

// Instrument Serif is retained ONLY for the rare display flourish (brand mark, em emphasis).
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Penkala — the team content OS",
  description:
    "Turn company strategy and each person's real writing voice into on-brand content. One brand, many distinct voices.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
