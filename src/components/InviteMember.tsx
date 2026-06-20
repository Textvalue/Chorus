"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./ds";

// Adds a voice to the ensemble from a LinkedIn URL (captures voice DNA + POV into the current org).
export function InviteMember() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add() {
    if (!url.trim() || busy) return;
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/members/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedin_url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not add member");
      setUrl("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn pri" onClick={() => setOpen(true)}>
        <Icon.plus size={16} color="#fff" /> Invite member
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
      <input
        className="field"
        style={{ width: 280 }}
        placeholder="LinkedIn profile URL"
        value={url}
        autoFocus
        disabled={busy}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <button className="btn pri" onClick={add} disabled={busy || !url.trim()}>
        {busy ? <span className="spinner" /> : <Icon.plus size={16} color="#fff" />} Add voice
      </button>
      <button className="btn" onClick={() => { setOpen(false); setErr(""); }} disabled={busy}>
        Cancel
      </button>
      {err && <span style={{ color: "var(--amber-500)", fontSize: 13, width: "100%", textAlign: "right" }}>{err}</span>}
    </div>
  );
}
