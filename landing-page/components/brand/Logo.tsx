import Link from "next/link";

/**
 * Penkala wordmark — the violet P-nib mark (the Slavoljub Penkala heritage) + the name.
 * The mark is a transparent PNG so it sits on light, dark, and the violet hero mesh.
 * Reusable as favicon / avatar via the `size` (height in px) prop.
 */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden
      style={{ height: size, width: "auto" }}
      className="select-none"
    />
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-display font-semibold text-ink tracking-[-0.02em] ${className}`}
      aria-label="Penkala home"
    >
      <Mark size={24} />
      <span className="text-[1.15rem]">Penkala</span>
    </Link>
  );
}
