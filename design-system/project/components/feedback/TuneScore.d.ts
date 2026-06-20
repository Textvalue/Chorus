import * as React from 'react';
/**
 * The "sounds like you" confidence ring — Tutti's signature in-tune score.
 */
export interface TuneScoreProps {
  /** 0–100 confidence. @default 96 */
  value?: number;
  size?: number;
  /** Sub-label under the percentage. @default "sounds like you" */
  label?: string;
  /** Status word above the label. @default "In tune" */
  caption?: string;
}
export function TuneScore(props: TuneScoreProps): JSX.Element;
