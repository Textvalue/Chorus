"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Client provider boundary (mounted inside the server layouts).
 * - Sonner: the one app-wide <Toaster/>.
 *
 * NOTE: Lenis smooth-scroll was removed (2026-06). Its global scroll inertia
 * (lerp 0.18) added latency to every wheel/trackpad gesture and made moving
 * through the app feel sluggish — native scroll is instant. Re-wrap a specific
 * marketing surface in <ReactLenis> if the inertia effect is wanted there only.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
