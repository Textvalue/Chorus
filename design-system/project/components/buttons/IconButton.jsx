import React from 'react';

/** Square icon-only button. Same surfaces as Button; use for toolbar / compact actions. */
export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  style = {},
  ...rest
}) {
  const dim = { sm: 32, md: 40, lg: 48 }[size];
  const variants = {
    ghost: { bg: 'transparent', color: 'var(--text-body)', border: 'transparent', hover: 'var(--gray-100)' },
    secondary: { bg: 'var(--surface-card)', color: 'var(--text-strong)', border: 'var(--border-strong)', hover: 'var(--gray-50)' },
    primary: { bg: 'var(--action-primary)', color: '#fff', border: 'transparent', hover: 'var(--action-primary-hover)' },
    accent: { bg: 'var(--action-accent)', color: '#fff', border: 'transparent', hover: 'var(--action-accent-hover)' },
  }[variant];
  const [hover, setHover] = React.useState(false);
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, flex: 'none',
        color: variants.color,
        background: hover && !disabled ? variants.hover : variants.bg,
        border: `1px solid ${variants.border}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
