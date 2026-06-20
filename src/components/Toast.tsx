"use client";

import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Back-compat shim. The custom toast was retired in favor of Sonner (doc
 * mandate — one `<Toaster/>` at root, see Providers). Existing call sites keep
 * working: `const toast = useToast(); toast("Approved ✓")`.
 */
export const useToast = () => (msg: string) => sonnerToast.success(msg);

/** No-op passthrough — the real <Toaster/> now lives in <Providers/>. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
