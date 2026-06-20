import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Editorial pairing: clean sans for UI/body, an elegant serif for display headings.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tutti — the team content OS",
  description:
    "Turn company strategy and each person's real writing voice into on-brand content. One brand, many distinct voices.",
  icons: { icon: "/brand/spark.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
