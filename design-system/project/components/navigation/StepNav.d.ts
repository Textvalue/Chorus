import * as React from 'react';
/** Vertical step list for Tuning / onboarding flows. */
export interface StepNavProps {
  steps: string[];
  /** Index of the active step; earlier steps render as done. @default 0 */
  current?: number;
  style?: React.CSSProperties;
}
export function StepNav(props: StepNavProps): JSX.Element;
