import { VioletWord } from "@/components/brand/accents";
import { PrimaryCta, GhostCta } from "@/components/brand/Cta";
import { ScreenFrame } from "@/components/shared/ScreenFrame";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 lg:px-8">
      {/* modern violet mesh gradient — multi-stop, masked to fade into the paper */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(48% 42% at 18% 8%, rgba(126,58,255,0.20), transparent 62%)," +
              "radial-gradient(46% 40% at 84% 2%, rgba(189,170,255,0.26), transparent 60%)," +
              "radial-gradient(60% 55% at 58% -6%, rgba(118,31,255,0.12), transparent 66%)," +
              "radial-gradient(40% 38% at 92% 40%, rgba(158,122,255,0.12), transparent 60%)",
            maskImage: "linear-gradient(to bottom, black 50%, transparent 92%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 92%)",
          }}
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center pt-36 pb-14 text-center md:pt-44">
        <h1 className="text-balance font-display text-h1 font-semibold leading-[1.05] text-ink">
          High-performing LinkedIn posts in <VioletWord>your voice</VioletWord>.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-body-l text-ink-soft">
          Penkala learns your voice from your real posts, then checks every draft for AI tells before
          you see it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta>Start free</PrimaryCta>
          <GhostCta>Book a demo</GhostCta>
        </div>
      </div>

      <div className="mx-auto max-w-5xl pb-20 md:pb-28">
        <ScreenFrame label="Create · your draft, with the no-AI-tells check" ratio="16/9" />
      </div>
    </section>
  );
}
