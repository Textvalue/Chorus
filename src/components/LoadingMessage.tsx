"use client";

import { useRotatingMessage } from "@/lib/useRotatingMessage";

/**
 * Spinner + a reassurance line that alternates while waiting. The rotating copy
 * makes a slow request feel easier. Each message soft-fades in (.fade) on change.
 */
export function LoadingMessage({
  messages,
  interval,
  className,
}: {
  messages: string[];
  interval?: number;
  className?: string;
}) {
  const msg = useRotatingMessage(messages, true, interval);
  return (
    <span className={`slabel ${className ?? ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <span className="spinner" />
      <span key={msg} className="fade">{msg}</span>
    </span>
  );
}

// Writing/pen-themed reassurance copy (Penkala). Real, honest, a little warm.
export const WRITING_MESSAGES = [
  "Studying how you actually write…",
  "Finding your rhythm…",
  "Choosing words you'd really use…",
  "Catching AI tells before you see them…",
  "Putting pen to paper…",
  "Almost there…",
];

export const IDEAS_MESSAGES = [
  "Reading your beliefs…",
  "Looking for angles only you can own…",
  "Sketching a few directions…",
  "Lining up your best ideas…",
];

export const IMAGE_MESSAGES = [
  "Sketching your visual…",
  "Mixing the palette…",
  "Composing the frame…",
  "Adding the finishing strokes…",
  "This one takes a minute…",
];

export const CAROUSEL_MESSAGES = [
  "Outlining your slides…",
  "Drawing each panel…",
  "Keeping it on-brand…",
  "Stitching the story together…",
  "Building all five slides…",
];

export const PROFILE_MESSAGES = [
  "Reading the profile…",
  "Listening for the real voice…",
  "Finding what to sharpen…",
  "Writing the makeover…",
];

export const THINKING_MESSAGES = [
  "Taking it all in…",
  "Pulling out the threads…",
  "Turning thoughts into ideas…",
  "Almost there…",
];

export const TUNING_MESSAGES = [
  "Reading your site and your posts…",
  "Listening for how you really write…",
  "Learning what you believe…",
  "Mapping your company's story…",
  "Tuning your first voice…",
  "This part is worth the wait…",
];
