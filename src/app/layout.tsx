import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chorus — Team Content OS",
  description: "Company strategy + each person's real voice, turned into on-brand LinkedIn posts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
