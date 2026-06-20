import * as React from 'react';
/** Small status pill in the brand tones. */
export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'blue' | 'teal' | 'green' | 'amber' | 'navy';
  /** Soft tinted fill (default) vs solid. @default true */
  soft?: boolean;
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
