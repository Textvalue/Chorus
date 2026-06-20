import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutti — the team content OS",
  description:
    "Your team. In tune. Your brand. Heard everywhere. Tutti turns company strategy and each person's real voice into on-brand content that plays beautifully together.",
  icons: { icon: "/brand/spark.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
