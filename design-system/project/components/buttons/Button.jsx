import React from 'react';

/**
 * Tutti primary button. Variants map to the brand's action colors:
 * blue = primary action, teal = musical/brand moments, green = success/on-key.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { height: 'var(--control-sm)', padding: '0 14px', font: 'var(--fs-sm)', radius: 'var(--radius-sm)', gap: '6px' },
    md: { height: 'var(--control-md)', padding: '0 18px', font: 'var(--fs-sm)', radius: 'var(--radius-md)', gap: '8px' },
    lg: { height: 'var(--control-lg)', padding: '0 24px', font: 'var(--fs-body)', radius: 'var(--radius-md)', gap: '9px' },
  }[size];

  const variants = {
    primary: { bg: 'var(--action-primary)', color: '#fff', border: 'transparent', hover: 'var(--action-primary-hover)' },
    accent: { bg: 'var(--action-accent)', color: '#fff', border: 'transparent', hover: 'var(--action-accent-hover)' },
    success: { bg: 'var(--action-success)', color: '#fff', border: 'transparent', hover: 'var(--action-success-hover)' },
    secondary: { bg: 'var(--surface-card)', color: 'var(--text-strong)', border: 'var(--border-strong)', hover: 'var(--gray-50)' },
    ghost: { bg: 'transparent', color: 'var(--text-body)', border: 'transparent', hover: 'var(--gray-100)' },
  }[variant];

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: sizes.gap,
        height: sizes.height, padding: sizes.padding,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)', fontSize: sizes.font, fontWeight: 600,
        lineHeight: 1, letterSpacing: '-0.005em',
        color: variants.color,
        background: disabled ? 'var(--gray-200)' : (hover ? variants.hover : variants.bg),
        border: `1px solid ${disabled ? 'var(--gray-200)' : variants.border}`,
        borderRadius: sizes.radius,
        boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        transform: active && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
