"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle. The actual theme is set on <html data-theme> by the no-flash
 * script in the layout head (reads localStorage before paint); this button just
 * flips that attribute and persists the choice. Default is light.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("penkala-theme", next ? "dark" : "light");
    } catch {
      /* private mode / storage disabled — toggle still works for the session */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-rule text-ink-soft transition-colors hover:border-rule-strong hover:text-ink",
        className
      )}
    >
      {dark ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
    </button>
  );
}
