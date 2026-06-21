import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SIGNUP_URL } from "@/lib/utils";

const COLS = [
  {
    head: "Product",
    links: [
      { href: "/product", label: "Overview" },
      { href: "/pricing", label: "Pricing" },
      { href: SIGNUP_URL, label: "Start free" },
    ],
  },
  {
    head: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about", label: "The name" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-faint">
            The team content operating system for B2B SaaS go-to-market teams.
          </p>
          <p className="mt-4 text-caption text-ink-faint">
            Named for Slavoljub Penkala, who reinvented the pen in 1906.
          </p>
        </div>

        {COLS.map((c) => (
          <div key={c.head}>
            <h4 className="label text-ink-faint">{c.head}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link
                    href={l.href}
                    className="text-[0.95rem] text-ink-soft transition-colors hover:text-violet-deep"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-caption text-ink-faint sm:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} Penkala</span>
          <span>Pipeline, not posts.</span>
        </div>
      </div>
    </footer>
  );
}
