import { Section } from "@/components/shared/Section";
import { FeatureRow } from "@/components/home/FeatureRow";

const rows = [
  {
    title: "Draft a post from a two-minute voice note.",
    body: "Talk it through or type a few lines. Penkala shapes it into a post in your voice and runs the check, so you start from a real draft instead of a blank page.",
    shot: "Create · composer and the check",
  },
  {
    title: "Give every post a visual worth the scroll.",
    body: "Penkala suggests proven visuals and infographics, then builds the one you choose in your brand kit, so every post looks designed without a designer.",
    shot: "Visuals · on-brand in one click",
  },
  {
    title: "Sound like the expert you already are.",
    body: "Penkala learns what you believe in a short interview, so your posts carry a point of view that generic AI can't fake, and people start following you for it.",
    shot: "Voice · your interview and what it captured",
  },
  {
    title: "Never run out of things to post.",
    body: "Penkala serves up ideas pulled from what you believe and what's gaining traction in your niche, so there's always a post ready to write.",
    shot: "Ideas · cards from your beliefs and your niche",
  },
  {
    title: "Warm up your target leads.",
    body: "Penkala surfaces the latest posts from people at the accounts you're chasing and drafts a comment in your voice. You read it and post it yourself, so you show up where deals start without ever sounding automated.",
    shot: "Engage · your accounts' latest posts",
  },
];

export function Features() {
  return (
    <Section>
      <div className="space-y-20 md:space-y-28">
        {rows.map((r, i) => (
          <FeatureRow key={r.title} {...r} flip={i % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}
