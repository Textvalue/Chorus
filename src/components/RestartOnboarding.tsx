"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Wipes the workspace and sends the user back into tuning from scratch.
export function RestartOnboarding({
  className = "restart",
  children = "Restart onboarding",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function restart() {
    if (busy) return;
    if (!window.confirm("Restart onboarding? This clears your workspace and starts tuning from scratch.")) return;
    setBusy(true);
    try {
      await fetch("/api/onboarding/reset", { method: "POST" });
      router.push("/onboarding");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button className={className} onClick={restart} disabled={busy}>
      {busy ? "Resetting…" : children}
    </button>
  );
}
