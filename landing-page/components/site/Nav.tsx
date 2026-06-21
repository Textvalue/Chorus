"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { SIGNUP_URL, BOOKING_URL } from "@/lib/utils";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-paper/80 backdrop-blur-md border-b border-rule"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href={BOOKING_URL}
            className="text-[0.95rem] text-ink-soft transition-colors hover:text-ink"
          >
            Book a demo
          </Link>
          <Link
            href={SIGNUP_URL}
            className="inline-flex items-center rounded-full bg-violet px-4 py-2 text-[0.9rem] font-medium text-white transition-all hover:bg-violet-deep hover:-translate-y-px"
          >
            Start free
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <button
            className="text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-rule bg-paper md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-ink-soft hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={SIGNUP_URL}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit items-center rounded-full bg-violet px-4 py-2 text-[0.9rem] font-medium text-white"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
