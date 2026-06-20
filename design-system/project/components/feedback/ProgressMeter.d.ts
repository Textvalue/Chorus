import * as React from 'react';
/** Character-progression readout — dimension rows with %, green check when complete. */
export interface ProgressMeterItem { label: string; value: number; }
export interface ProgressMeterProps {
  items: ProgressMeterItem[];
  style?: React.CSSProperties;
}
export function ProgressMeter(props: ProgressMeterProps): JSX.Element;
