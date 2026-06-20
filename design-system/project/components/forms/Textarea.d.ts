import * as React from 'react';
/** Multiline text area for riffs, drafts, belief capture. */
export interface TextareaProps {
  label?: string;
  hint?: string;
  rows?: number;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
  id?: string;
}
export function Textarea(props: TextareaProps): JSX.Element;
