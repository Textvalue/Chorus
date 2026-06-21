import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { ScreenFrame } from "@/components/shared/ScreenFrame";

export function TeamExpansion() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead title="Get your whole team posting consistently." />
          <div className="mt-6 max-w-md space-y-4">
            <p className="text-body-l text-ink-soft">
              Penkala gives every person their own voice on top of one shared company brand.
            </p>
            <p className="text-body text-ink-soft">
              So ten people post consistently without sounding the same, and without waiting on a
              weekly review meeting.
            </p>
          </div>
        </div>
        <Reveal>
          <ScreenFrame label="Team · roster and shared brand" ratio="4/3" />
        </Reveal>
      </div>
    </Section>
  );
}
