import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

// General Sans (Fontshare) is the primary UI/body face — clean Swiss-grotesque, the new design's
// "feels designed" lift over Inter. Loaded via the Fontshare CDN (self-host the .woff2 for prod).
// Instrument Serif stays available for the rare display moment.
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
    <html lang="en" className={serif.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
