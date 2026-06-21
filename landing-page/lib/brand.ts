/**
 * SVG-safe hex mirror of the brand tokens.
 * CSS custom properties do NOT resolve inside SSR <svg fill="..."> attributes,
 * so animated-SVG concept diagrams import these literals instead of var(--...).
 * Keep in sync with app/globals.css.
 */
export const brand = {
  paper: "#faf9f7",
  bone: "#f1f0ec",
  linen: "#e6e4de",
  sand: "#dcd9d1",
  ink: "#16151a",
  inkSoft: "#3a3942",
  inkFaint: "#6e6c78",
  rule: "#e6e4de",
  // electric-violet 11-stop scale
  v50: "#f4f1ff",
  v100: "#ebe6ff",
  v200: "#d9d0ff",
  v300: "#bdaaff",
  v400: "#9e7aff",
  v500: "#8145ff",
  v600: "#761fff", // PRIMARY accent
  v700: "#7218f4",
  v800: "#5a0bcc", // ink/hover, violet-text-on-light (AA)
  v900: "#4b0ba7",
  v950: "#2c0372",
  // semantic — never decorative
  success: "#0E9F6E",
  warning: "#B26B00",
} as const;
