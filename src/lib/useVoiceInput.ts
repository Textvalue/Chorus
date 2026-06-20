"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Pure dictation via the browser-native Web Speech API (speech-to-text only — no LLM, no voice,
// so nothing ever talks back). Free, no key. Chrome / Edge / Safari (not Firefox). Same interface
// as before, so MicButton and its wiring are unchanged.
/* eslint-disable @typescript-eslint/no-explicit-any */

export function useVoiceInput() {
  const recRef = useRef<any>(null);
  const [available, setAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState(""); // committed (final) text
  const [partial, setPartial] = useState(""); // in-progress words

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setAvailable(true);

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let fin = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += text;
        else interim += text;
      }
      if (fin) setTranscript((prev) => (prev ? prev + " " : "") + fin.trim());
      setPartial(interim);
    };
    rec.onend = () => { setListening(false); setPartial(""); };
    rec.onerror = () => { setListening(false); setPartial(""); };

    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch { /* ignore */ }
      recRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    setTranscript("");
    setPartial("");
    try {
      recRef.current?.start();
      setListening(true);
    } catch { /* already started */ }
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  const live = (transcript + " " + partial).trim();
  return { available, listening, transcript, live, start, stop };
}
