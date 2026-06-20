import * as React from 'react';

/** Square icon-only button for toolbars and compact actions. */
export interface IconButtonProps {
  children: React.ReactNode;
  variant?: 'ghost' | 'secondary' | 'primary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label'?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}
export function IconButton(props: IconButtonProps): JSX.Element;
