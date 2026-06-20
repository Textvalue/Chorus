// Data model — shapes from plan.md §2. Team isolation keys on (org_id, member_id).

export type Pain = { pain: string; weekly_trigger: string; severity: "high" | "medium" | "low" };
export type Competitor = { name: string; url: string; note: string };

export type Org = {
  org_id: string;
  name: string;
  website: string;
  icp: {
    personas: string[];
    pains: Pain[]; // weekly_trigger REQUIRED on every pain — hook source + generic filter
    anti_personas: string[];
  };
  positioning: string;
  competitors: Competitor[];
  brand_dna: {
    voice_rules: string[];
    narrative_atoms: {
      audience: string;
      problem: string;
      outcome: string;
      proof: string;
      offer: string;
    };
  };
  owner_member_id: string | null;
};

export type VoiceDna = {
  traits: string[];
  sentence_patterns: string[];
  signature_terms: string[];
  phrases_to_avoid: string[];
};

export type ExpertPov = {
  beliefs: string[];
  topics: string[];
  hot_takes: string[];
  status: "inferred" | "confirmed";
};

export type Correction = {
  at: string; // ISO timestamp
  kind: "edit" | "reject" | "brain_dump";
  topic?: string;
  before?: string;
  after?: string;
  note?: string;
};

export type Member = {
  member_id: string;
  org_id: string;
  name: string;
  headline: string;
  linkedin_url: string;
  voice_dna: VoiceDna;
  prose_samples: string[]; // 3-5 verbatim posts — the active ingredient
  expert_pov: ExpertPov;
  corrections: Correction[];
};

export type Post = {
  id: string;
  member_id: string;
  org_id: string;
  topic: string;
  angle: string;
  body: string;
  generated_body: string; // original generation — diff target for corrections
  status: "draft" | "approved" | "rejected";
  voice_match: number; // 0-100
  created_at: string;
  edits: { at: string; before: string; after: string }[];
  image_url?: string | null; // generated post image / infographic
  carousel?: { url: string; title: string; body: string; kind: string }[] | null;
};

export type Store = {
  org: Org | null;
  members: Member[];
  posts: Post[];
};
