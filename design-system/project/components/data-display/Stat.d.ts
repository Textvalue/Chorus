import * as React from 'react';
/** A labeled metric — big number, label, optional delta. */
export interface StatProps {
  value: React.ReactNode;
  label: string;
  delta?: string | null;
  deltaTone?: 'green' | 'blue' | 'slate';
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}
export function Stat(props: StatProps): JSX.Element;
