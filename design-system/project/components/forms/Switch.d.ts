import * as React from 'react';
/** Toggle switch — on state is teal. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: React.CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
