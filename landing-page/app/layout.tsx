import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Penkala: LinkedIn posts that sound like you",
  description:
    "Penkala learns how you think and how you talk, then drafts LinkedIn posts and checks them for AI tells before you see them. Built for founders.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <head>
        {/* No-flash theme init: applies the saved choice before paint. Default = light. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('penkala-theme')==='dark'){document.documentElement.dataset.theme='dark';}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
