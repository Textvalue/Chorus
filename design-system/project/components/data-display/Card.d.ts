import * as React from 'react';
/**
 * Surface container — white, hairline border, soft rounding and lift.
 */
export interface CardProps {
  children: React.ReactNode;
  padding?: string;
  /** Adds hover lift + pointer. @default false */
  interactive?: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}
export function Card(props: CardProps): JSX.Element;
