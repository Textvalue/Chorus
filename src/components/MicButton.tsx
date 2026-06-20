"use client";
import { useEffect, useRef } from "react";
import { useVoiceInput } from "@/lib/useVoiceInput";

// Sleek, minimal icon-only dictation button. Appends the spoken transcript to the field.
// Renders null until NEXT_PUBLIC_VAPI_PUBLIC_KEY is set.
export function MicButton({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const { available, listening, live, start, stop } = useVoiceInput();
  const baseRef = useRef("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!listening) return;
    const base = baseRef.current;
    onChangeRef.current((base + (base && live ? " " : "") + live).trim());
  }, [live, listening]);

  if (!available) return null;

  function toggle() {
    if (listening) stop();
    else {
      baseRef.current = value || "";
      start();
    }
  }

  return (
    <>
      <style>{MIC_CSS}</style>
      <button
        type="button"
        className="tt-mic"
        data-on={listening}
        onClick={toggle}
        aria-label={listening ? "Stop dictation" : "Dictate with your voice"}
        title={listening ? "Listening… click to stop" : "Dictate"}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      </button>
    </>
  );
}

const MIC_CSS = `
.tt-mic{
  width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;
  border:1px solid var(--border-strong,#d8dde4);background:var(--surface-card,#fff);
  color:var(--text-muted,#6b7280);cursor:pointer;transition:.16s ease;
}
.tt-mic:hover{color:var(--text-strong,#1a1a1a);border-color:var(--text-muted,#9aa3af);background:var(--gray-50,#f7f8fa)}
.tt-mic:active{transform:scale(.94)}
.tt-mic[data-on="true"]{color:var(--accent-ink,#5a0bcc);border-color:var(--accent,#761fff);background:var(--accent-soft,#ebe6ff);animation:ttmic 1.8s ease-out infinite}
@keyframes ttmic{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent,#761fff) 32%,transparent)}70%{box-shadow:0 0 0 9px color-mix(in srgb,var(--accent,#761fff) 0%,transparent)}100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent,#761fff) 0%,transparent)}}
@media (prefers-reduced-motion:reduce){.tt-mic[data-on="true"]{animation:none}}
`;
