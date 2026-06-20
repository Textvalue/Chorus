"use client";

import { useState } from "react";
import { Avatar, Icon } from "@/components/ds";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { useToast } from "./Toast";

/**
 * The drafted-in-your-voice comment card (Engage). Client island so the comment
 * can be tweaked in place before you copy it out. In-session edit only.
 */
export function EngageDraft({
  author,
  replyingTo,
  voiceMatch,
  initialDraft,
}: {
  author: string;
  replyingTo: string;
  voiceMatch: number;
  initialDraft: string;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState(initialDraft);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialDraft);

  function save() {
    setDraft(value.trim() || draft);
    setEditing(false);
    toast("Comment updated");
  }

  return (
    <Card className="px-5">
      <div className="eyebrow mb-1">Drafted in your voice</div>
      <div className="mb-3.5 flex items-center gap-2.5">
        <Avatar name={author} size={32} />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-[var(--text-strong)]">{author}</div>
          <div className="text-xs text-[var(--text-muted)]">Replying to {replyingTo}</div>
        </div>
        <Badge variant="secondary">
          <AnimatedNumber value={voiceMatch} suffix="%" /> sounds like you
        </Badge>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          autoFocus
          className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-[14.5px] leading-relaxed text-[var(--text-strong)] outline-none focus:border-[var(--border-focus)] focus:shadow-[var(--focus-shadow)]"
        />
      ) : (
        <TextEffect
          as="div"
          per="word"
          preset="fade-in-blur"
          className="rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-4 py-3.5 text-[14.5px] leading-relaxed text-[var(--text-body)] whitespace-pre-wrap"
        >
          {draft}
        </TextEffect>
      )}

      {/* Sounds Flat gate passed — semantic green */}
      <div className="mt-3.5 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--green-100)] bg-[var(--green-50)] px-3.5 py-2.5">
        <Icon.check size={16} color="var(--green-600)" stroke={2.4} />
        <span className="text-[13px] font-semibold text-[var(--green-700)]">Sounds Flat passed — no AI tells.</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {editing ? (
          <>
            <Button size="sm" onClick={save}>
              <Icon.check size={14} /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setValue(draft); setEditing(false); }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => { navigator.clipboard?.writeText(draft); toast("Copied — opening LinkedIn"); }}>
              <Icon.copy size={14} /> Copy comment
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setValue(draft); setEditing(true); }}>
              <Icon.edit size={14} /> Tweak
            </Button>
            <Button size="sm" variant="ghost">
              <Icon.eye size={14} /> Open post
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
