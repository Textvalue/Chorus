import * as React from 'react';
/** Circular avatar — image or auto-tinted initials, with optional instrument marker. */
export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  /** Tooltip label for the small teal instrument marker (e.g. "Cello"). */
  instrument?: string | null;
  style?: React.CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
