import { cn } from "@/lib/utils";

/** Consistent section rhythm + max-width. `dark` flips to the ink ground (the one dark moment). `tint` uses bone. */
export function Section({
  children,
  id,
  dark = false,
  tint = false,
  className,
  inner,
}: {
  children: React.ReactNode;
  id?: string;
  dark?: boolean;
  tint?: boolean;
  className?: string;
  inner?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-5 lg:px-8",
        dark && "bg-ink-fixed text-paper-fixed",
        tint && "bg-bone",
        className
      )}
    >
      <div className={cn("mx-auto max-w-6xl py-20 md:py-28", inner)}>{children}</div>
    </section>
  );
}

/** Section heading block — eyebrow + H2 + optional intro, consistent spacing. */
export function SectionHead({
  eyebrow,
  title,
  intro,
  dark = false,
  center = false,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("label", dark ? "text-violet-bright" : "text-violet-deep")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display font-semibold text-h2",
          eyebrow && "mt-3",
          dark ? "text-paper-fixed" : "text-ink"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-4 text-body-l", dark ? "text-paper-fixed/70" : "text-ink-soft")}>
          {intro}
        </p>
      )}
    </div>
  );
}
