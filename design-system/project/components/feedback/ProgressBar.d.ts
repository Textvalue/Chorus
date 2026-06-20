import * as React from 'react';
/** Horizontal progress bar — teal by default, green for completion. */
export interface ProgressBarProps {
  value?: number;
  tone?: 'teal' | 'green' | 'blue';
  height?: number;
  showLabel?: boolean;
  style?: React.CSSProperties;
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
