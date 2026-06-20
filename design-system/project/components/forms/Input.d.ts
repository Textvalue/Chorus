import * as React from 'react';
/** Labeled text input with hint / error states. */
export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
  id?: string;
}
export function Input(props: InputProps): JSX.Element;
