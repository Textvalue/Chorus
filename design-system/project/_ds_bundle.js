/* @ds-bundle: {"format":3,"namespace":"DesignSystem_42715e","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"Stat","sourcePath":"components/data-display/Stat.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"ProgressMeter","sourcePath":"components/feedback/ProgressMeter.jsx"},{"name":"TuneScore","sourcePath":"components/feedback/TuneScore.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"StepNav","sourcePath":"components/navigation/StepNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"4d2d07e32741","components/buttons/IconButton.jsx":"dae6d82999f0","components/data-display/Avatar.jsx":"5aceb4a6eb4b","components/data-display/Badge.jsx":"0677a4f1a5d6","components/data-display/Card.jsx":"680efa9f34ac","components/data-display/Stat.jsx":"daa521e79b33","components/feedback/ProgressBar.jsx":"0320ad4c6ff5","components/feedback/ProgressMeter.jsx":"e628fbb9952a","components/feedback/TuneScore.jsx":"a558a6d7c975","components/forms/Checkbox.jsx":"fbc920156e83","components/forms/Input.jsx":"036867529a03","components/forms/Switch.jsx":"3e352b8b2a73","components/forms/Textarea.jsx":"26855c726a56","components/navigation/StepNav.jsx":"cd9fc8aae90a","components/navigation/Tabs.jsx":"ceada8faf247","ui_kits/tutti-app/CreateScreen.jsx":"cb0cb696af4e","ui_kits/tutti-app/EnsembleScreen.jsx":"b5421f353978","ui_kits/tutti-app/RehearsalScreen.jsx":"b209d7dbc53f","ui_kits/tutti-app/Sidebar.jsx":"3d81b16067a9","ui_kits/tutti-app/StudioScreen.jsx":"f095bf7d06ab","ui_kits/tutti-app/TuningScreen.jsx":"5e945516232e","ui_kits/tutti-app/icons.jsx":"d7f411787245"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_42715e = window.DesignSystem_42715e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tutti primary button. Variants map to the brand's action colors:
 * blue = primary action, teal = musical/brand moments, green = success/on-key.
 */
function Button({
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
    sm: {
      height: 'var(--control-sm)',
      padding: '0 14px',
      font: 'var(--fs-sm)',
      radius: 'var(--radius-sm)',
      gap: '6px'
    },
    md: {
      height: 'var(--control-md)',
      padding: '0 18px',
      font: 'var(--fs-sm)',
      radius: 'var(--radius-md)',
      gap: '8px'
    },
    lg: {
      height: 'var(--control-lg)',
      padding: '0 24px',
      font: 'var(--fs-body)',
      radius: 'var(--radius-md)',
      gap: '9px'
    }
  }[size];
  const variants = {
    primary: {
      bg: 'var(--action-primary)',
      color: '#fff',
      border: 'transparent',
      hover: 'var(--action-primary-hover)'
    },
    accent: {
      bg: 'var(--action-accent)',
      color: '#fff',
      border: 'transparent',
      hover: 'var(--action-accent-hover)'
    },
    success: {
      bg: 'var(--action-success)',
      color: '#fff',
      border: 'transparent',
      hover: 'var(--action-success-hover)'
    },
    secondary: {
      bg: 'var(--surface-card)',
      color: 'var(--text-strong)',
      border: 'var(--border-strong)',
      hover: 'var(--gray-50)'
    },
    ghost: {
      bg: 'transparent',
      color: 'var(--text-body)',
      border: 'transparent',
      hover: 'var(--gray-100)'
    }
  }[variant];
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizes.gap,
      height: sizes.height,
      padding: sizes.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontSize: sizes.font,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-0.005em',
      color: variants.color,
      background: disabled ? 'var(--gray-200)' : hover ? variants.hover : variants.bg,
      border: `1px solid ${disabled ? 'var(--gray-200)' : variants.border}`,
      borderRadius: sizes.radius,
      boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.65 : 1,
      transform: active && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square icon-only button. Same surfaces as Button; use for toolbar / compact actions. */
function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  style = {},
  ...rest
}) {
  const dim = {
    sm: 32,
    md: 40,
    lg: 48
  }[size];
  const variants = {
    ghost: {
      bg: 'transparent',
      color: 'var(--text-body)',
      border: 'transparent',
      hover: 'var(--gray-100)'
    },
    secondary: {
      bg: 'var(--surface-card)',
      color: 'var(--text-strong)',
      border: 'var(--border-strong)',
      hover: 'var(--gray-50)'
    },
    primary: {
      bg: 'var(--action-primary)',
      color: '#fff',
      border: 'transparent',
      hover: 'var(--action-primary-hover)'
    },
    accent: {
      bg: 'var(--action-accent)',
      color: '#fff',
      border: 'transparent',
      hover: 'var(--action-accent-hover)'
    }
  }[variant];
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: 'none',
      color: variants.color,
      background: hover && !disabled ? variants.hover : variants.bg,
      border: `1px solid ${variants.border}`,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
/** Circular avatar. Initials with deterministic brand-tinted fill, or an image. */
function Avatar({
  name = '',
  src = null,
  size = 40,
  instrument = null,
  style = {}
}) {
  const palette = [['var(--blue-100)', 'var(--blue-700)'], ['var(--teal-100)', 'var(--teal-700)'], ['var(--green-100)', 'var(--green-700)'], ['var(--navy-700)', '#fff']];
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  const [bg, fg] = palette[h % palette.length];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: 999,
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      color: fg,
      fontSize: size * 0.38,
      fontWeight: 700,
      fontFamily: 'var(--font-sans)'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials), instrument && /*#__PURE__*/React.createElement("span", {
    title: instrument,
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: size * 0.42,
      height: size * 0.42,
      borderRadius: 999,
      background: 'var(--teal-500)',
      color: '#fff',
      border: '2px solid var(--surface-card)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.22
    }
  }, "\u266A"));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/** Small status pill. Tones: neutral, blue, teal, green (in-tune), amber, navy. */
function Badge({
  children,
  tone = 'neutral',
  soft = true,
  style = {}
}) {
  const tones = {
    neutral: {
      soft: ['var(--gray-100)', 'var(--slate-600)'],
      solid: ['var(--slate-500)', '#fff']
    },
    blue: {
      soft: ['var(--blue-50)', 'var(--blue-700)'],
      solid: ['var(--blue-500)', '#fff']
    },
    teal: {
      soft: ['var(--teal-50)', 'var(--teal-700)'],
      solid: ['var(--teal-500)', '#fff']
    },
    green: {
      soft: ['var(--green-50)', 'var(--green-700)'],
      solid: ['var(--green-500)', '#fff']
    },
    amber: {
      soft: ['#FCF3E0', 'var(--amber-500)'],
      solid: ['var(--amber-400)', 'var(--navy-900)']
    },
    navy: {
      soft: ['var(--navy-900)', '#fff'],
      solid: ['var(--navy-900)', '#fff']
    }
  }[tone];
  const [bg, fg] = soft ? tones.soft : tones.solid;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: bg,
      color: fg,
      fontSize: 'var(--fs-2xs)',
      fontWeight: 700,
      letterSpacing: '0.02em',
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Surface container. Default: white, hairline border, soft rounding & lift. */
function Card({
  children,
  padding = 'var(--space-6)',
  interactive = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      padding,
      transform: hover ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Stat.jsx
try { (() => {
/** A labeled metric. Big number + label, optional delta (green up / slate flat). */
function Stat({
  value,
  label,
  delta = null,
  deltaTone = 'green',
  align = 'left',
  style = {}
}) {
  const tone = {
    green: 'var(--green-600)',
    blue: 'var(--blue-600)',
    slate: 'var(--slate-500)'
  }[deltaTone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-h2)',
      fontWeight: 800,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em',
      lineHeight: 1.05
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, label), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 600,
      color: tone,
      marginTop: 2
    }
  }, delta));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
/** Horizontal progress bar. Tone teal (musical) by default; green for "done". */
function ProgressBar({
  value = 0,
  tone = 'teal',
  height = 8,
  showLabel = false,
  style = {}
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = {
    teal: 'var(--teal-500)',
    green: 'var(--green-500)',
    blue: 'var(--blue-500)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height,
      background: 'var(--gray-200)',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: fill,
      borderRadius: 999,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 700,
      color: 'var(--text-strong)',
      minWidth: 34,
      textAlign: 'right'
    }
  }, pct, "%"));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressMeter.jsx
try { (() => {
/**
 * Character-progression readout: rows of "dimension → % complete" with a
 * green check when done. Mirrors real maturity (Brand DNA, Voice Match, …).
 */
function ProgressMeter({
  items = [],
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      ...style
    }
  }, items.map((it, i) => {
    const done = it.value >= 100;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        flex: 'none',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? 'var(--green-500)' : 'var(--gray-200)'
      }
    }, done && /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 110,
        flex: 'none',
        fontSize: 'var(--fs-sm)',
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, it.label), /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
      value: it.value,
      tone: done ? 'green' : 'teal',
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 42,
        textAlign: 'right',
        fontSize: 'var(--fs-sm)',
        fontWeight: 700,
        color: done ? 'var(--green-600)' : 'var(--text-body)'
      }
    }, it.value, "%"));
  }));
}
Object.assign(__ds_scope, { ProgressMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressMeter.jsx", error: String((e && e.message) || e) }); }

// components/feedback/TuneScore.jsx
try { (() => {
/**
 * The "sounds like you" confidence ring — the signature in-tune score.
 * Green arc = on key. Warm framing, never an error.
 */
function TuneScore({
  value = 96,
  size = 132,
  label = 'sounds like you',
  caption = 'In tune'
}) {
  const stroke = Math.max(8, size * 0.075);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--gray-200)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--green-500)",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: offset,
    style: {
      transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.26,
      fontWeight: 800,
      color: 'var(--text-strong)',
      lineHeight: 1,
      letterSpacing: '-0.02em'
    }
  }, pct, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.10,
      fontWeight: 700,
      color: 'var(--green-600)',
      marginTop: 4
    }
  }, caption), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.082,
      color: 'var(--text-muted)'
    }
  }, label)));
}
Object.assign(__ds_scope, { TuneScore });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/TuneScore.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Checkbox with label. Checked = green (on-key / done). */
function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  style = {}
}) {
  const [on, setOn] = React.useState(checked);
  React.useEffect(() => setOn(checked), [checked]);
  const toggle = () => {
    if (disabled) return;
    const v = !on;
    setOn(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    style: {
      width: 20,
      height: 20,
      flex: 'none',
      borderRadius: 'var(--radius-xs)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: on ? 'var(--green-500)' : 'var(--surface-card)',
      border: `1.5px solid ${on ? 'var(--green-500)' : 'var(--border-strong)'}`,
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input with optional label, hint and error. Friendly focus ring. */
function Input({
  label,
  hint,
  error,
  prefix = null,
  type = 'text',
  size = 'md',
  style = {},
  id,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = {
    sm: 'var(--control-sm)',
    md: 'var(--control-md)',
    lg: 'var(--control-lg)'
  }[size];
  const borderColor = error ? 'var(--green-600)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--fs-sm)',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 14px',
      background: 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'inline-flex'
    }
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-strong)'
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: error ? 'var(--green-700)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Toggle switch. On = teal (musical/active). */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  style = {}
}) {
  const [on, setOn] = React.useState(checked);
  React.useEffect(() => setOn(checked), [checked]);
  const toggle = () => {
    if (disabled) return;
    const v = !on;
    setOn(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    style: {
      width: 40,
      height: 24,
      borderRadius: 999,
      flex: 'none',
      background: on ? 'var(--teal-500)' : 'var(--gray-300)',
      position: 'relative',
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 18 : 2,
      width: 20,
      height: 20,
      borderRadius: 999,
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multiline text area — for riffs, drafts, belief capture. */
function Textarea({
  label,
  hint,
  rows = 4,
  style = {},
  id,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--fs-sm)',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      padding: '12px 14px',
      resize: 'vertical',
      background: 'var(--surface-card)',
      border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 1.55,
      color: 'var(--text-strong)',
      outline: 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StepNav.jsx
try { (() => {
/** Vertical step list for Tuning / onboarding. Done = green check, current = blue ring. */
function StepNav({
  steps = [],
  current = 0,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      ...style
    }
  }, steps.map((label, i) => {
    const done = i < current;
    const active = i === current;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--blue-50)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        flex: 'none',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--fs-xs)',
        fontWeight: 700,
        background: done ? 'var(--green-500)' : active ? 'var(--blue-500)' : 'var(--surface-card)',
        color: done || active ? '#fff' : 'var(--text-muted)',
        border: done || active ? 'none' : '1.5px solid var(--border-strong)'
      }
    }, done ? /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    })) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-sm)',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--text-strong)' : done ? 'var(--text-body)' : 'var(--text-muted)'
      }
    }, label));
  }));
}
Object.assign(__ds_scope, { StepNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StepNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Underline tabs. Active = navy text with a teal indicator. */
function Tabs({
  tabs = [],
  value,
  onChange,
  style = {}
}) {
  const [active, setActive] = React.useState(value ?? (tabs[0] && tabs[0].id));
  React.useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);
  const select = id => {
    setActive(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(t.id),
      style: {
        position: 'relative',
        appearance: 'none',
        background: 'none',
        border: 'none',
        padding: '10px 14px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 600,
        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
        transition: 'color var(--dur-fast)'
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 6,
        fontSize: 'var(--fs-2xs)',
        fontWeight: 700,
        color: on ? 'var(--teal-600)' : 'var(--text-muted)',
        background: on ? 'var(--teal-50)' : 'var(--gray-100)',
        padding: '1px 6px',
        borderRadius: 999
      }
    }, t.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: -1,
        height: 2.5,
        borderRadius: 2,
        background: 'var(--teal-500)',
        opacity: on ? 1 : 0,
        transition: 'opacity var(--dur-fast)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/CreateScreen.jsx
try { (() => {
// Tutti app — Create: topic → two members' drafts, Sounds Flat gate, "why this sounds like you".
const {
  Card,
  Button,
  Textarea,
  Badge,
  Avatar,
  TuneScore
} = window.DesignSystem_42715e;
function WhyRow({
  k,
  v
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 13,
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 84,
      flex: 'none',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-body)',
      fontWeight: 500
    }
  }, v));
}
function DraftCard({
  name,
  instrument,
  score,
  body,
  why
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    instrument: instrument,
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, instrument, " \xB7 their part")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "In tune \xB7 ", score, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--text-body)',
      whiteSpace: 'pre-line',
      background: 'var(--gray-50)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px'
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px dashed var(--border-strong)',
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 4
    }
  }, "Why this sounds like you"), why.map(w => /*#__PURE__*/React.createElement(WhyRow, {
    key: w[0],
    k: w[0],
    v: w[1]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "success",
    size: "sm"
  }, "Approve"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Tweak")));
}
function CreateScreen() {
  const TopBar = window.TuttiTopBar;
  const I = window.TuttiIcons;
  const [generated, setGenerated] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Create",
    subtitle: "One topic. Each member in their own voice."
  }), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "Belief used"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-body)'
    }
  }, "\"Employee advocacy is unison \u2014 lifeless noise.\"")), /*#__PURE__*/React.createElement(Textarea, {
    rows: 2,
    defaultValue: "Why pushing the same post to every employee kills your brand."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, I.sparkles({
    size: 15,
    color: 'var(--teal-500)'
  }), " Anchored to real samples + the Score \xB7 context loaded"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: I.sparkles({
      size: 16,
      color: '#fff'
    }),
    onClick: () => setGenerated(true)
  }, "Generate for the team"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--green-50)',
      border: '1px solid var(--green-100)',
      marginBottom: 20
    }
  }, I.check({
    size: 18,
    color: 'var(--green-600)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--green-700)',
      fontWeight: 600
    }
  }, "Sounds Flat passed."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-body)'
    }
  }, "One generic draft was caught and quietly regenerated \u2014 you only see the in-tune ones.")), generated && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(DraftCard, {
    name: "Maya Patel",
    instrument: "Violin",
    score: 96,
    body: "Your employee advocacy program is making everyone sound the same.\n\nI watched a 40-person team post the identical paragraph last week. Forty cellos, one note. That's not reach — it's an echo.\n\nGive people the score, not the script.",
    why: [['Belief', 'unison vs harmony'], ['Hook', 'pattern interrupt'], ['Your words', '"echo", "the score"'], ['Rhythm', 'short, punchy lines']]
  }), /*#__PURE__*/React.createElement(DraftCard, {
    name: "Jordan Lee",
    instrument: "Cello",
    score: 94,
    body: "Most advocacy tools optimize for the wrong thing: volume.\n\nWe ran the math on a client's team. Same post, 30 shares, near-zero replies. The algorithm reads sameness as spam.\n\nDistinct voices on one strategy beat identical voices every time.",
    why: [['Belief', 'reward value not volume'], ['Hook', 'data-led'], ['Your words', '"ran the math"'], ['Rhythm', 'measured, analytical']]
  })));
}
window.TuttiCreateScreen = CreateScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/CreateScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/EnsembleScreen.jsx
try { (() => {
// Tutti app — Ensemble: team roster, instruments, unison alarm.
const {
  Card,
  Button,
  Badge,
  Avatar,
  ProgressBar
} = window.DesignSystem_42715e;
function EnsembleScreen() {
  const TopBar = window.TuttiTopBar;
  const I = window.TuttiIcons;
  const team = [['Alex Johnson', 'Content Lead', 'Conductor', 100], ['Maya Patel', 'Copywriter', 'Violin', 96], ['Jordan Lee', 'Designer', 'Cello', 92], ['Taylor Kim', 'Social Manager', 'Flute', 88], ['Casey Brown', 'Analyst', 'Timpani', 71]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Your ensemble",
    subtitle: "One brand DNA, many distinct voices, one workspace.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I.plus({
        size: 16,
        color: '#fff'
      })
    }, "Invite member")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-4)"
  }, team.map(([n, role, inst, score], i) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 8px',
      borderBottom: i < team.length - 1 ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: n,
    instrument: inst,
    size: 42
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, role)), /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, inst), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 120
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: score,
    tone: score >= 90 ? 'green' : 'teal',
    showLabel: true
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: 'center',
      background: 'var(--gray-50)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ensemble.png",
    alt: "",
    style: {
      height: 150,
      mixBlendMode: 'multiply'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--text-strong)',
      marginTop: 6
    }
  }, "5 players \xB7 1 score"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "70% of invites have completed Tuning")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      borderColor: 'var(--teal-100)',
      background: 'var(--teal-50)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-600)',
      marginTop: 2
    }
  }, I.waveform({
    size: 22
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--teal-700)',
      marginBottom: 4
    }
  }, "Unison alarm"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, "Your string section is playing in unison this week \u2014 three drafts share the same hook. Spread out."))))));
}
window.TuttiEnsembleScreen = EnsembleScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/EnsembleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/RehearsalScreen.jsx
try { (() => {
// Tutti app — Rehearsal: drafts & approval queue.
const {
  Card,
  Button,
  Badge,
  Avatar,
  Tabs
} = window.DesignSystem_42715e;
function QueueRow({
  name,
  instrument,
  status,
  text,
  score
}) {
  const tone = {
    Draft: 'neutral',
    Pending: 'blue',
    Approved: 'green',
    Scheduled: 'teal'
  }[status];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      padding: '16px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    instrument: instrument,
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, name), /*#__PURE__*/React.createElement(Badge, {
    tone: tone
  }, status), score && /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, score, "% in tune")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, text)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, status === 'Pending' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    variant: "success",
    size: "sm"
  }, "Approve"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Edit")) : /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Open")));
}
function RehearsalScreen() {
  const TopBar = window.TuttiTopBar;
  const [tab, setTab] = React.useState('pending');
  const rows = {
    pending: [['Maya Patel', 'Violin', 'Pending', 'Your employee advocacy program is making everyone sound the same…', 96], ['Jordan Lee', 'Cello', 'Pending', 'Most advocacy tools optimize for the wrong thing: volume…', 94]],
    drafts: [['Taylor Kim', 'Flute', 'Draft', 'Three things I changed about how our team shows up on LinkedIn…', 88], ['Casey Brown', 'Timpani', 'Draft', 'A quick story about the first time a post actually landed…', 71]],
    approved: [['Maya Patel', 'Violin', 'Approved', 'The blank page is not a talent problem. It is a tuning problem…', 97], ['Alex Johnson', 'Conductor', 'Scheduled', 'We stopped measuring posts by volume. Here is what happened…', 95]]
  };
  const list = rows[tab] || [];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Rehearsal",
    subtitle: "Drafts, feedback, approvals. Every edit teaches the model.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "accent"
    }, "Start a Tutti campaign")
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      id: 'pending',
      label: 'Pending',
      count: 2
    }, {
      id: 'drafts',
      label: 'Drafts',
      count: 2
    }, {
      id: 'approved',
      label: 'Approved & Live'
    }],
    style: {
      marginBottom: 6
    }
  }), list.map((r, i) => /*#__PURE__*/React.createElement(QueueRow, {
    key: i,
    name: r[0],
    instrument: r[1],
    status: r[2],
    text: r[3],
    score: r[4]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14,
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Reject is a correction, not a failure \u2014 it just helps the next draft land closer.")));
}
window.TuttiRehearsalScreen = RehearsalScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/RehearsalScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/Sidebar.jsx
try { (() => {
// Tutti app — left sidebar (navigation rail + workspace footer).
const {
  Avatar,
  Badge
} = window.DesignSystem_42715e;
function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '10px 12px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: active ? 'var(--blue-50)' : hover ? 'var(--gray-100)' : 'transparent',
      color: active ? 'var(--blue-700)' : 'var(--text-body)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: active ? 'var(--blue-600)' : 'var(--slate-500)',
      display: 'inline-flex'
    }
  }, icon({
    size: 19
  })), label);
}
function Sidebar({
  route,
  setRoute
}) {
  const I = window.TuttiIcons;
  const nav = [['studio', 'Studio', I.studio], ['create', 'Create', I.create], ['rehearsal', 'Rehearsal', I.rehearsal], ['ensemble', 'Ensemble', I.ensemble], ['tuning', 'Tuning', I.tune]];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 248,
      flex: 'none',
      height: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '0 8px 18px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/spark.png",
    alt: "",
    style: {
      height: 26,
      mixBlendMode: 'multiply'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: '-0.04em',
      color: 'var(--navy)'
    }
  }, "tutti")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: '8px 12px 4px'
    }
  }, "Workspace"), nav.map(([id, label, icon]) => /*#__PURE__*/React.createElement(NavItem, {
    key: id,
    icon: icon,
    label: label,
    active: route === id,
    onClick: () => setRoute(id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "12-day streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, "Level 12 \xB7 2,350 XP")), /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, "L12")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 6px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--gray-50)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Alex Johnson",
    instrument: "Conductor",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "Alex Johnson"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, "Bandleader \xB7 Acme")))));
}
window.TuttiSidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/StudioScreen.jsx
try { (() => {
// Tutti app — Studio (home dashboard): progression, in-tune score, reach, ensemble.
const {
  Card,
  Badge,
  Stat,
  TuneScore,
  ProgressMeter,
  Avatar,
  Button
} = window.DesignSystem_42715e;
function TopBar({
  title,
  subtitle,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      color: 'var(--text-muted)',
      fontSize: 15
    }
  }, subtitle)), action);
}
window.TuttiTopBar = TopBar;
function StudioScreen({
  setRoute
}) {
  const I = window.TuttiIcons;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "You're getting in tune",
    subtitle: "Keep going \u2014 beautiful sounds ahead.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I.create({
        size: 16,
        color: '#fff'
      }),
      onClick: () => setRoute('create')
    }, "Create a post")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 20,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      gap: 28,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(TuneScore, {
    value: 96
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 14
    }
  }, "Character progression"), /*#__PURE__*/React.createElement(ProgressMeter, {
    items: [{
      label: 'Brand DNA',
      value: 100
    }, {
      label: 'Voice Match',
      value: 96
    }, {
      label: 'Audience',
      value: 80
    }, {
      label: 'Team',
      value: 60
    }, {
      label: 'Guidelines',
      value: 40
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/badge-on-key.png",
    alt: "",
    style: {
      height: 96
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "New badge earned"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 14
    }
  }, "On Key \xB7 your drafts pass Sounds Flat first try")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "+150 XP \xB7 Rising Star next"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, "Fill the stadium"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "\u2191 78%")), /*#__PURE__*/React.createElement(Stat, {
    value: "12.4M",
    label: "Total impressions \xB7 last 30 days"
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venue-ladder.png",
    alt: "Practice Room \u2192 Stadium",
    style: {
      width: '100%',
      marginTop: 18
    }
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 14
    }
  }, "Your ensemble"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, [['Maya Patel', 'Violin', 96], ['Jordan Lee', 'Cello', 92], ['Taylor Kim', 'Flute', 88], ['Casey Brown', 'Timpani', 71]].map(([n, inst, score]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: n,
    instrument: inst,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, inst)), /*#__PURE__*/React.createElement(Badge, {
    tone: score >= 90 ? 'green' : 'teal'
  }, score, "% in tune")))))));
}
window.TuttiStudioScreen = StudioScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/StudioScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/TuningScreen.jsx
try { (() => {
// Tutti app — Tuning (onboarding): step nav + company tuning form + musician.
const {
  Card,
  Button,
  Input,
  StepNav,
  Badge,
  ProgressBar
} = window.DesignSystem_42715e;
function TuningScreen() {
  const TopBar = window.TuttiTopBar;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Let's get your brand in tune",
    subtitle: "Calibrating each voice before you play. About 2 minutes."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-4)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      padding: '4px 12px 8px'
    }
  }, "Onboarding \xB7 Tuning"), /*#__PURE__*/React.createElement(StepNav, {
    current: 1,
    steps: ['About your company', 'Brand DNA', 'Audience', 'Team', 'Voice & tone']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 12px 4px'
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 32,
    tone: "teal",
    showLabel: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 8
    }
  }, "Step 2 of 5"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 20
    }
  }, "Brand DNA"), /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, "Auto-researched")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 14,
      marginTop: 6
    }
  }, "We pulled this from your public surface. Verify in ~60 seconds \u2014 every fact carries a source."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Positioning",
    defaultValue: "The team content OS \u2014 harmony, not unison."
  }), /*#__PURE__*/React.createElement(Input, {
    label: "One-line pitch",
    defaultValue: "A whole team sounds like one brand, every post still human."
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-strong)',
      marginBottom: 8
    }
  }, "Validated pains"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "\u2713 Blank-page freeze \xB7 Monday"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "\u2713 Generic AI tells"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "+ Add a pain")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Looks right \u2192"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Edit details"))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      background: 'var(--gray-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -6,
      right: -18,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-body)',
      boxShadow: 'var(--shadow-sm)',
      whiteSpace: 'nowrap'
    }
  }, "This might squeak a bit."), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/musician-unsure.png",
    alt: "",
    style: {
      height: 220,
      mixBlendMode: 'multiply'
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      marginTop: 4,
      maxWidth: 240
    }
  }, "Off-key just means we haven't learned your voice yet. We'll get there.")))));
}
window.TuttiTuningScreen = TuningScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/TuningScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tutti-app/icons.jsx
try { (() => {
// Tutti line icons — single weight (1.8), round caps. Plain SVG, no deps.
const I = (paths, vb = '24') => ({
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.8,
  style = {}
} = {}) => React.createElement('svg', {
  width: size,
  height: size,
  viewBox: `0 0 ${vb} ${vb}`,
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  style
}, paths.map((d, i) => React.createElement('path', {
  key: i,
  d
})));
const Icons = {
  studio: I(['M3 12 12 3l9 9', 'M5 10v10h14V10', 'M9 20v-6h6v6']),
  create: I(['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z']),
  rehearsal: I(['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11']),
  ensemble: I(['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']),
  tune: I(['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6']),
  audience: I(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87']),
  note: I(['M9 18V5l12-2v13', 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z']),
  waveform: I(['M2 12h2', 'M6 8v8', 'M10 4v16', 'M14 7v10', 'M18 9v6', 'M22 12h0']),
  star: I(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z']),
  check: I(['M20 6 9 17l-5-5']),
  growth: I(['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6']),
  sparkles: I(['M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3Z', 'M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15Z']),
  plus: I(['M12 5v14', 'M5 12h14']),
  search: I(['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M21 21l-4.3-4.3']),
  bell: I(['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0']),
  send: I(['M22 2 11 13', 'M22 2 15 22l-4-9-9-4 20-7Z']),
  calendar: I(['M3 4h18v18H3z', 'M16 2v4', 'M8 2v4', 'M3 10h18']),
  copy: I(['M9 9h11v11H9z', 'M5 15H4V4h11v1']),
  chevronRight: I(['M9 18l6-6-6-6']),
  flat: I(['M9 3v14', 'M9 9c2-1.5 5-1 5 1.5S11 16 9 17']) // musical flat ♭
};
window.TuttiIcons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tutti-app/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ProgressMeter = __ds_scope.ProgressMeter;

__ds_ns.TuneScore = __ds_scope.TuneScore;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.StepNav = __ds_scope.StepNav;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
