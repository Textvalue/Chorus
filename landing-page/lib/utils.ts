import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className joiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The single source-of-truth CTA targets — swap these once, everywhere updates. */
export const SIGNUP_URL = "/#start"; // placeholder reverse-trial signup
export const BOOKING_URL = "/#demo"; // placeholder demo booking
