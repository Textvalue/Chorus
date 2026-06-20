"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe `prefers-reduced-motion` hook.
 *
 * Every motion import in the app honors reduced-motion via THIS hook, never the
 * motion library's own handling — doing it here keeps one source of truth and
 * avoids the Next.js hydration mismatch you get when a library reads the media
 * query during render. Implemented with useSyncExternalStore so the server
 * snapshot is a stable `false` (markup matches) and the client subscribes to
 * live changes.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
