import { Section } from "@/components/shared/Section";
import { VioletWord } from "@/components/brand/accents";

export function DreamOutcome() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance font-display text-h2 font-semibold text-ink">
          Build the authority your buyers <VioletWord>follow</VioletWord>.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-body-l text-ink-soft">
          Penkala helps your whole team publish high-performing content that builds authority and
          pulls your buyers into the conversation.
        </p>
      </div>
    </Section>
  );
}
