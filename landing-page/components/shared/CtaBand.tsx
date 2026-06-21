import { PrimaryCta, GhostCta } from "@/components/brand/Cta";

/** The page's one dark moment — the tonal climax. Violet aurora glow on ink. */
export function CtaBand({
  title,
  sub,
  primary = "Start free",
  secondary = "Book a demo",
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  primary?: string;
  secondary?: string;
}) {
  return (
    <section className="px-5 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-ink-fixed ring-1 ring-white/10 px-6 py-20 text-center md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% -10%, rgba(126,58,255,0.40), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display font-semibold text-paper-fixed text-h1">
              {title}
            </h2>
            {sub && <p className="mx-auto mt-5 max-w-xl text-body-l text-paper-fixed/70">{sub}</p>}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <PrimaryCta dark>{primary}</PrimaryCta>
              <GhostCta dark>{secondary}</GhostCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
