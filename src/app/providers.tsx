"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Client provider boundary (mounted inside the server layouts).
 * - Lenis: subtle smooth-scroll inertia (§4.1) — disabled under reduced motion.
 * - Sonner: the one app-wide <Toaster/>.
 */
export function Providers({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        smoothWheel: !reduced,
        duration: reduced ? 0 : 0.8,
        lerp: 0.18,
      }}
    >
      <TooltipProvider delay={200}>{children}</TooltipProvider>
      <Toaster />
    </ReactLenis>
  );
}
