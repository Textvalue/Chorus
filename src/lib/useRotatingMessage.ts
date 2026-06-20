"use client";

import { useEffect, useState } from "react";

/**
 * Cycles through reassurance messages while a request is in flight, so a long
 * wait feels shorter. Resets to the first message whenever it (re)activates.
 */
export function useRotatingMessage(messages: string[], active = true, intervalMs = 2400): string {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active || messages.length <= 1) return;
    setI(0);
    const id = setInterval(() => setI((p) => (p + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, messages.length]);

  return messages[Math.min(i, messages.length - 1)] ?? "";
}
