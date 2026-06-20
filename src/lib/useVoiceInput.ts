"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Voice dictation via Vapi (transcription-focused: a silent assistant, we only read the user's
// final transcript). Renders inert when NEXT_PUBLIC_VAPI_PUBLIC_KEY is absent. Vapi is imported
// dynamically inside the effect so it never runs during SSR.
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

const DICTATION_ASSISTANT = {
  firstMessage: "",
  transcriber: { provider: "deepgram", model: "nova-3", language: "en-US" },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are a silent transcriber. Never speak or respond." }],
  },
  voice: { provider: "vapi", voiceId: "Elliot" },
};

type Msg = { type?: string; role?: string; transcriptType?: string; transcript?: string };

export function useVoiceInput() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapiRef = useRef<any>(null);
  const available = !!PUBLIC_KEY;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partial, setPartial] = useState("");

  useEffect(() => {
    if (!PUBLIC_KEY) return;
    let disposed = false;
    (async () => {
      const Vapi = (await import("@vapi-ai/web")).default;
      if (disposed) return;
      const v = new Vapi(PUBLIC_KEY);
      vapiRef.current = v;
      v.on("call-start", () => setListening(true));
      v.on("call-end", () => { setListening(false); setPartial(""); });
      v.on("error", (e: unknown) => { console.error("[vapi]", e); setListening(false); });
      v.on("message", (m: Msg) => {
        if (m.type !== "transcript" || m.role !== "user" || !m.transcript) return;
        if (m.transcriptType === "final") {
          setTranscript((prev) => (prev ? prev + " " : "") + m.transcript!.trim());
          setPartial("");
        } else {
          setPartial(m.transcript);
        }
      });
    })();
    return () => {
      disposed = true;
      vapiRef.current?.stop?.();
      vapiRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    setTranscript("");
    setPartial("");
    vapiRef.current?.start?.(DICTATION_ASSISTANT);
  }, []);
  const stop = useCallback(() => vapiRef.current?.stop?.(), []);

  const live = (transcript + " " + partial).trim();
  return { available, listening, transcript, live, start, stop };
}
