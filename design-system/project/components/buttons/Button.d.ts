import * as React from 'react';

/**
 * Tutti primary button — blue (primary), teal (brand/musical), green (success).
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual intent. @default "primary" */
  variant?: 'primary' | 'accent' | 'success' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}
export function Button(props: ButtonProps): JSX.Element;
