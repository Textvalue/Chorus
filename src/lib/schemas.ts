import { z } from "zod";

// ---- Org research extraction (Exa text -> structured org) ----
export const OrgExtractSchema = z.object({
  name: z.string().describe("Company name"),
  positioning: z.string().describe("One-paragraph positioning statement"),
  icp: z.object({
    personas: z.array(z.string()).describe("3-5 buyer persona titles/descriptions"),
    pains: z
      .array(
        z.object({
          pain: z.string(),
          weekly_trigger: z
            .string()
            .describe("The recurring weekly moment that makes this pain felt — REQUIRED"),
          severity: z.enum(["high", "medium", "low"]),
        })
      )
      .describe("3-5 concrete pains, each with a weekly trigger"),
    anti_personas: z.array(z.string()).describe("Who this is NOT for"),
  }),
  competitors: z.array(
    z.object({ name: z.string(), url: z.string(), note: z.string() })
  ),
  brand_dna: z.object({
    voice_rules: z.array(z.string()).describe("How the company should sound"),
    narrative_atoms: z.object({
      audience: z.string(),
      problem: z.string(),
      outcome: z.string(),
      proof: z.string(),
      offer: z.string(),
    }),
  }),
});
export type OrgExtract = z.infer<typeof OrgExtractSchema>;

// ---- Member extraction pass A: voice_dna (HOW) ----
export const VoiceDnaSchema = z.object({
  traits: z.array(z.string()).describe("Tone/style traits, e.g. direct, warm, contrarian"),
  sentence_patterns: z.array(z.string()).describe("Rhythm/structure observations"),
  signature_terms: z.array(z.string()).describe("Distinctive words/phrases they actually use"),
  phrases_to_avoid: z.array(z.string()).describe("AI-tell words they'd never use"),
});

// ---- Member extraction pass B: expert_pov (WHAT) ----
export const ExpertPovSchema = z.object({
  beliefs: z.array(z.string()).describe("Contrarian/strong beliefs inferred from posts"),
  topics: z.array(z.string()).describe("Recurring topics they want to be known for"),
  hot_takes: z.array(z.string()).describe("Spiky opinions / hot takes"),
});

// ---- Generation ----
export const GenerateSchema = z.object({
  body: z.string().describe("The full LinkedIn post, ready to publish, in the member's voice"),
  voice_match: z.number().describe("Self-assessed score 0-100 for how much it sounds like the member"),
  why: z.object({
    belief: z.string(),
    hook: z.string(),
    your_words: z.string(),
    rhythm: z.string(),
  }),
});

// ---- Brain dump -> ideas + pov enrichment ----
export const BrainDumpSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      angle: z.string(),
      tag: z.string().describe("e.g. contrarian, story, how-to, timely"),
    })
  ),
  pov_updates: z.object({
    new_beliefs: z.array(z.string()),
    new_topics: z.array(z.string()),
    new_hot_takes: z.array(z.string()),
    confirm: z.boolean().describe("Whether enough signal to flip POV status to confirmed"),
  }),
});

// ---- Ideas expansion ----
export const IdeasSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      angle: z.string(),
      source_type: z
        .enum(["belief", "pain"])
        .describe("'belief' = led by the author's POV; 'pain' = led by a company audience pain"),
      source: z
        .string()
        .describe("The specific belief/topic or company pain it came from (short label)"),
      tag: z.string(),
    })
  ),
});

// ---- Discover: sophisticated trending-content analysis for a topic ----
// Grounded in the repo's own LinkedIn frameworks (hooks.json / frameworks.json /
// linkedin-algorithm-rules.json — see lib/contentFrameworks.ts) AND the org/author context.
export const DiscoverSchema = z.object({
  topic: z.string().describe("The cleaned topic that was analyzed"),
  maturity: z
    .enum(["emerging", "hot", "saturated"])
    .describe("How crowded this topic already is on LinkedIn"),
  trend: z.string().describe("One-line headline: the pattern that's winning for this topic right now"),
  summary: z
    .string()
    .describe("2-3 sentences on the state of play for this topic, grounded in what actually wins"),
  formats: z
    .array(
      z.object({
        label: z.string().describe("Format, e.g. Carousel / document, Formatted text, Text + image, Text-only"),
        strength: z.enum(["highest", "high", "baseline", "declining", "penalized"]),
        multiplier: z.string().describe("REAL engagement multiplier vs plain text from the algorithm rules, e.g. '3.7-6.6x'"),
        note: z.string().describe("Why this format fits THIS topic specifically"),
      })
    )
    .describe("How formats perform for this topic — multipliers MUST come from the provided algorithm rules, never invented"),
  hooks: z
    .array(
      z.object({
        text: z.string().describe("A ready-to-use hook (ideal 6-8 words) in the author's voice, on this topic"),
        type: z.string().describe("Emotional hook type: curiosity | counter_narrative | credibility | fear | surprise | education | identity | counter_intuitive | eloquence"),
        why: z.string().describe("Why this hook works for this topic"),
      })
    )
    .describe("3-5 hook angles, each tagged with its emotional hook type"),
  winning_structure: z.object({
    framework: z.string().describe("Recommended framework from the catalog (PAIPS, PAS, BAB, AIDA, ACCA, PPPP...)"),
    rhythm: z.string().describe("The beat-by-beat structure to follow"),
    length: z.string().describe("Optimal length + fold guidance for the recommended format"),
  }),
  avoid: z
    .array(
      z.object({
        what: z.string().describe("A saturated angle OR a real algorithm suppression signal"),
        why: z.string(),
      })
    )
    .describe("Saturated angles + real suppression signals (links in body, hashtag stuffing, engagement bait)"),
  algorithm: z
    .object({
      best_time: z.string().describe("Best posting window for this audience"),
      cadence: z.string().describe("Posting frequency guidance"),
      cta: z.string().describe("CTA recommendation"),
    })
    .describe("Algorithm cheat-sheet, grounded in the real rules"),
  ideas: z
    .array(
      z.object({
        title: z.string(),
        angle: z.string(),
        pillar: z.string().describe("Synthesis | Contrarian | Access | Simplifying"),
        format: z.string().describe("Recommended format, e.g. carousel, formatted text, text + image"),
        hook_type: z.string(),
        tag: z.string(),
      })
    )
    .describe("5 postable ideas grounded in BOTH the analysis and the company/author context"),
});
export type DiscoverResult = z.infer<typeof DiscoverSchema>;

// ---- LinkedIn profile optimizer ----
export const ProfileMakeoverSchema = z.object({
  overall_score: z.number().describe("Profile strength 0-100"),
  verdict: z.string().describe("One blunt line: what's holding the profile back most"),
  sections: z
    .array(
      z.object({
        name: z.string().describe("headline | about | experience | featured | banner"),
        score: z.number().describe("0-100"),
        issue: z.string().describe("What's wrong now"),
        fix: z.string().describe("The specific fix"),
      })
    )
    .describe("Section-by-section audit"),
  headline: z.object({
    current: z.string(),
    options: z
      .array(
        z.object({
          text: z.string().describe("A ready-to-paste rewritten headline"),
          formula: z.string().describe("Which headline formula it uses"),
          why: z.string(),
        })
      )
      .describe("3 distinct rewritten headline options"),
  }),
  about: z.object({
    current_read: z.string().describe("Brief honest read on the current About"),
    rewrite: z.string().describe("Full rewritten About section, in the member's voice, ready to paste"),
  }),
  priorities: z
    .array(
      z.object({
        change: z.string(),
        why: z.string(),
        effort: z.string().describe("quick | medium | involved"),
      })
    )
    .describe("Ordered top changes to make first"),
});
export type ProfileMakeover = z.infer<typeof ProfileMakeoverSchema>;

// ---- Carousel plan (5 slides: hook / value x3 / cta) ----
export const CarouselSchema = z.object({
  slides: z
    .array(
      z.object({
        kind: z.string().describe("hook | value | cta"),
        title: z.string().describe("Short bold slide title (<= 8 words)"),
        body: z.string().describe("1-2 short lines of supporting text"),
      })
    )
    .describe("Exactly 5 slides: 1 hook, 3 value, 1 cta"),
});
export type Carousel = z.infer<typeof CarouselSchema>;
