/**
 * Sub-page hero. Same violet-mesh top as the home hero, but compact:
 * centered H1 + subhead + an optional actions/helper slot. Mesh fades into paper.
 * Reused by /pricing and /product.
 */
export function PageHero({
  title,
  subhead,
  children,
  mesh = true,
}: {
  title: React.ReactNode;
  subhead?: React.ReactNode;
  children?: React.ReactNode;
  mesh?: boolean;
}) {
  return (
    <section className="relative overflow-hidden px-5 lg:px-8">
      {mesh && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(46% 44% at 20% 6%, rgba(126,58,255,0.16), transparent 62%)," +
                "radial-gradient(44% 40% at 82% 0%, rgba(189,170,255,0.22), transparent 60%)," +
                "radial-gradient(58% 52% at 60% -8%, rgba(118,31,255,0.10), transparent 66%)",
              maskImage: "linear-gradient(to bottom, black 45%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 95%)",
            }}
          />
        </div>
      )}
      <div className="mx-auto flex max-w-3xl flex-col items-center pt-36 pb-12 text-center md:pt-44 md:pb-14">
        <h1 className="text-balance font-display text-h1 font-semibold leading-[1.05] text-ink">
          {title}
        </h1>
        {subhead && (
          <p className="mt-6 max-w-xl text-pretty text-body-l text-ink-soft">{subhead}</p>
        )}
        {children}
      </div>
    </section>
  );
}
