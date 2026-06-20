"use client";
import { useEffect, useRef } from "react";
import { useVoiceInput } from "@/lib/useVoiceInput";

// Dictate into a text field: appends the spoken transcript to whatever is already there.
// Renders null until NEXT_PUBLIC_VAPI_PUBLIC_KEY is set, so it's invisible without the Vapi key.
export function MicButton({
  value,
  onChange,
  className = "btn ghost sm",
}: {
  value: string;
  onChange: (text: string) => void;
  className?: string;
}) {
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
    <button type="button" className={className} onClick={toggle} title="Dictate with your voice">
      {listening ? "● Listening… stop" : "🎤 Dictate"}
    </button>
  );
}
