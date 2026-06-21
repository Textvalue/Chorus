import Link from "next/link";
import { cn, SIGNUP_URL, BOOKING_URL } from "@/lib/utils";

/** Primary CTA. On dark ground, flips to paper-fill / ink-text. */
export function PrimaryCta({
  href = SIGNUP_URL,
  children = "Start free",
  dark = false,
  className,
}: {
  href?: string;
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-[0.95rem] font-medium transition-all hover:-translate-y-px",
        dark
          ? "bg-paper-fixed text-ink-fixed hover:bg-ev-100"
          : "bg-violet text-white hover:bg-violet-deep",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** Quiet text-link CTA. */
export function GhostCta({
  href = BOOKING_URL,
  children = "Book a demo",
  dark = false,
  className,
}: {
  href?: string;
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-[0.95rem] font-medium transition-colors",
        dark ? "text-paper-fixed/75 hover:text-paper-fixed" : "text-ink-soft hover:text-ink",
        className
      )}
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
