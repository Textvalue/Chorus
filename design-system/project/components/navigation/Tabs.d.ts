import * as React from 'react';
/** Underline tab bar — active tab gets a teal indicator. */
export interface TabItem { id: string; label: string; count?: number; }
export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
