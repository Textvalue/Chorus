// Engage — the warm feed, second act (PRD §5.12). A cookie-free LinkedIn-style read feed of the
// people you've marked; Penkala drafts the comment in your voice; sends are human-clicked only.
import { getOrg, getMembers } from "@/lib/store";
import { TopBar, Icon } from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { EngageFeed } from "@/components/EngageFeed";

export const dynamic = "force-dynamic";

export default async function EngagePage() {
  const [org, members] = await Promise.all([getOrg(), getMembers()]);
  const owner = members.find((m) => m.member_id === org?.owner_member_id) ?? members[0];

  return (
    <div className="main-inner">
      {/* One aligned column — header, trust banner, list filter, and feed share a width. */}
      <div className="mx-auto w-full max-w-[680px]">
        <TopBar
          title="Engage"
          subtitle="Warm your target accounts. Penkala drafts the comment in your voice — you read it, you post it."
          action={<Badge variant="secondary">Cookie-free feed</Badge>}
        />

        {/* Compliance moat (§5.12) — neutral trust banner, NOT a warning color. */}
        <Alert className="mb-5">
          <Icon.lock size={18} color="var(--accent)" />
          <AlertTitle>Nothing sends itself</AlertTitle>
          <AlertDescription>
            The feed is built from cookie-free data — never your logged-in session. Every comment is a
            deliberate, human click. That&apos;s the compliance moat.
          </AlertDescription>
        </Alert>

        <EngageFeed author={owner?.name ?? "You"} />
      </div>
    </div>
  );
}
