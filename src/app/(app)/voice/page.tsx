// Voice — My Voice (how you sound + what you believe + core memory),
// Winning content (TWE analysis, sample for now), and Company Brand DNA.
import { getOrg, getMembers, getPosts } from "@/lib/store";
import { VoiceView } from "@/components/VoiceView";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);
  const me = members.find((m) => m.member_id === org?.owner_member_id) ?? members[0];

  const vd = me?.voice_dna ?? { traits: [], sentence_patterns: [], signature_terms: [], phrases_to_avoid: [] };
  const pov = me?.expert_pov ?? { beliefs: [], topics: [], hot_takes: [], status: "inferred" };

  // Core memory — real corrections first, otherwise derive from the captured voice rules.
  const corr = me?.corrections ?? [];
  let memory = corr.slice(-4).reverse().map((c) => ({
    text:
      c.note ||
      (c.kind === "edit"
        ? `You refined a draft${c.topic ? ` on “${c.topic}”` : ""} — Penkala learned the pattern.`
        : c.kind === "reject"
        ? "You rejected a draft — folded into your never-say list."
        : "A brain-dump sharpened your point of view."),
    src: `learned from a ${c.kind}`,
  }));
  if (memory.length === 0) {
    memory = [
      ...(vd.phrases_to_avoid ?? []).slice(0, 2).map((w) => ({ text: `You never say “${w}” — Penkala drops it before you see the draft.`, src: "from your voice rules" })),
      ...(vd.signature_terms ?? []).slice(0, 1).map((w) => ({ text: `“${w}” is one of your signatures — weighted up in generation.`, src: "from your samples" })),
    ];
  }

  return (
    <VoiceView
      me={{
        name: me?.name ?? "You",
        traits: vd.traits ?? [],
        signature: vd.signature_terms ?? [],
        avoid: vd.phrases_to_avoid ?? [],
        beliefs: pov.beliefs ?? [],
        topics: pov.topics ?? [],
        povStatus: pov.status ?? "inferred",
        sampleCount: me?.prose_samples?.length ?? 0,
        memory,
      }}
      postCount={posts.filter((p) => p.member_id === me?.member_id).length}
      company={{
        positioning: org?.positioning ?? "",
        personas: org?.icp?.personas ?? [],
        pains: org?.icp?.pains ?? [],
        antiPersonas: org?.icp?.anti_personas ?? [],
        voiceRules: org?.brand_dna?.voice_rules ?? [],
        atoms: Object.entries(org?.brand_dna?.narrative_atoms ?? {}) as [string, string][],
        competitors: org?.competitors ?? [],
      }}
      isOwner
    />
  );
}
