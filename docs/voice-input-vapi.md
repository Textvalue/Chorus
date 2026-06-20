# Voice input (Vapi) — implementation guide

Goal: let people **dictate** a note instead of typing it — primarily the **Riff** 60-second note
(`/riff`, `BrainDumpView`), optionally Create and onboarding. Spoken audio → live transcript → drops
into the existing textarea, then the normal flow runs.

Status: **researched + env placeholders added; not wired yet** (waiting on the Vapi key).

---

## TL;DR decision

Vapi is a real-time **voice-agent** platform (STT → LLM → TTS), not a batch transcription API — there
is **no upload-a-file endpoint**, it's live/streaming only. It works fine for dictation if you run a
*silent* assistant and only read the user-side transcript events. Because you specifically chose Vapi,
this guide leads with Vapi. If you later decide pure dictation isn't worth the per-minute cost, the
browser-native **Web Speech API is free and ~10 lines** — included at the bottom as a drop-in swap
behind the same hook interface.

Cost (Vapi): ~**$0.05/min** platform + STT pass-through (Deepgram Nova-3 ~$0.015/min) ≈ **$0.065/min**.
Free tier: ~60 min + a starting credit. Whisper-only would be $0.006/min; Web Speech API is $0.

---

## 1. Env (already added)

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=   # browser Web SDK (safe to expose; set domain allowlist in dashboard)
VAPI_API_KEY=                  # server/private — only needed if you fetch call artifacts server-side
```
Keys come from **dashboard.vapi.ai → API Keys**. The public key only reaches `api.vapi.ai/call/web`;
the private key is server-only. No `ASSISTANT_ID` needed — we pass an inline assistant config.

## 2. Install

```bash
npm install @vapi-ai/web
```

## 3. The dictation hook — `src/lib/useVoiceInput.ts`

Captures only the user's **final** transcript segments, accumulates them, exposes a plain string. The
assistant is configured silent (no first message, "stay silent" prompt) so it behaves like a recorder.
SSR-safe: instantiated inside `useEffect`, `"use client"` only.

```ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// Transcription-focused inline assistant: real transcriber, silent model/voice.
const DICTATION_ASSISTANT = {
  firstMessage: "",
  firstMessageMode: "assistant-speaks-first-with-model-generated-message" as const,
  transcriber: { provider: "deepgram", model: "nova-3", language: "en-US" },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are a silent transcriber. Never speak or respond." }],
  },
  // a voice is required by the schema, but it never talks because the model stays silent
  voice: { provider: "vapi", voiceId: "Elliot" },
};

export function useVoiceInput() {
  const vapiRef = useRef<Vapi | null>(null);
  const [available] = useState<boolean>(!!PUBLIC_KEY);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");      // committed (final) text
  const [partial, setPartial] = useState("");            // in-progress words

  useEffect(() => {
    if (!PUBLIC_KEY) return;
    const v = new Vapi(PUBLIC_KEY);
    vapiRef.current = v;
    v.on("call-start", () => setListening(true));
    v.on("call-end", () => { setListening(false); setPartial(""); });
    v.on("error", (e) => { console.error("[vapi]", e); setListening(false); });
    v.on("message", (m: { type?: string; role?: string; transcriptType?: string; transcript?: string }) => {
      if (m.type !== "transcript" || m.role !== "user" || !m.transcript) return;
      if (m.transcriptType === "final") {
        setTranscript((prev) => (prev ? prev + " " : "") + m.transcript!.trim());
        setPartial("");
      } else {
        setPartial(m.transcript);
      }
    });
    return () => { v.stop(); vapiRef.current = null; };
  }, []);

  const start = useCallback(() => {
    setTranscript(""); setPartial("");
    vapiRef.current?.start(DICTATION_ASSISTANT as never);
  }, []);
  const stop = useCallback(() => vapiRef.current?.stop(), []);

  // live = committed + in-progress, for display/binding
  return { available, listening, transcript, live: (transcript + " " + partial).trim(), start, stop };
}
```

## 4. Mic button — `src/components/MicButton.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { useVoiceInput } from "@/lib/useVoiceInput";

/** Dictate into any textarea: calls onText with the running transcript. */
export function MicButton({ onText }: { onText: (text: string) => void }) {
  const { available, listening, live, start, stop } = useVoiceInput();
  useEffect(() => { if (live) onText(live); }, [live, onText]);
  if (!available) return null; // hidden until NEXT_PUBLIC_VAPI_PUBLIC_KEY is set
  return (
    <button type="button" className={`btn ${listening ? "accent" : "ghost"} sm`}
      onClick={listening ? stop : start} title="Dictate">
      {listening ? "● Listening… tap to stop" : "🎤 Dictate"}
    </button>
  );
}
```

## 5. Wire it into Riff (and anywhere else)

In `src/components/BrainDumpView.tsx`, the composer already owns `text`/`setText`. Add the button and
let dictation fill the field:

```tsx
import { MicButton } from "./MicButton";
// inside the composer footer, next to the Process button:
<MicButton onText={setText} />
```

Same one-liner works in `CreateView` (dictate the topic) and the onboarding voice step. Because
`MicButton` renders `null` when the key is absent, **you can merge this now and it stays invisible
until you add the key** — no dead UI in the meantime.

## 6. (Optional) server-side transcript artifact

After a call ends you can also pull the full transcript server-side with the private key — only needed
if you want the authoritative record rather than the live stream:

```ts
// VAPI_API_KEY (server only)
const r = await fetch(`https://api.vapi.ai/call/${callId}`, {
  headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
});
const call = await r.json();
// call.artifact.transcript
```
For Riff/dictation you don't need this — the live `transcript` from the hook is enough.

---

## Free alternative (drop-in, same `useVoiceInput` shape)

If you decide not to pay per minute, swap the hook body for the browser **Web Speech API** — zero cost,
zero deps, same return shape, so `MicButton` and the wiring don't change. Caveat: Chrome/Edge/Safari
only (no Firefox), and Chrome routes audio through Google for recognition.

```ts
// drop-in replacement internals for useVoiceInput()
const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
// new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
// rec.onresult → accumulate e.results[i].isFinal ? final : interim
```

Recommendation: ship the **Web Speech API** version first (free, instant) behind the `useVoiceInput`
interface; switch the internals to **Vapi** if you want better accuracy/noise handling or multilingual.
Either way the components above don't change.

---

## Sources
- Web SDK: https://docs.vapi.ai/sdk/web · Quickstart: https://docs.vapi.ai/quickstart/web
- Events / transcript message shape: https://docs.vapi.ai/server-url/events
- Transcriber config: https://docs.vapi.ai/customization/voice-pipeline-configuration
- Official React example: https://github.com/VapiAI/example-client-javascript-react
- Pricing: https://vapi.ai/pricing · Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
