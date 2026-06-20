"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type ChildProps = {
  "data-id": string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type AnimatedBackgroundProps = {
  /** Each child MUST carry a unique `data-id`. */
  children: ReactElement<ChildProps>[] | ReactElement<ChildProps>;
  /** Controlled active id (segmented controls / nav). */
  defaultValue?: string;
  onValueChange?: (id: string | null) => void;
  /** Class for the sliding pill itself (electric-violet-soft, radius, etc.). */
  className?: string;
  transition?: Transition;
  /** Hover-follow (menus) vs click-select (segmented controls / nav). */
  enableHover?: boolean;
};

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
};

/**
 * The ONE shared sliding pill (motion-primitives `AnimatedBackground`).
 * A single `layoutId` slides an electric-violet-soft pill between options —
 * reused on every `.seg` segmented control + the rail/tab active state + Voice
 * tabs, so nav and filters read as one motion language. Reduced-motion = snap.
 */
export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  // Controlled when `defaultValue` is supplied (segmented controls / nav) — read
  // it directly, no mirror-into-state effect. Uncontrolled (hover menus) uses
  // internal state.
  const [internalId, setInternalId] = useState<string | null>(null);
  const activeId = defaultValue !== undefined ? defaultValue : internalId;
  const uniqueId = useId();
  const reduced = usePrefersReducedMotion();

  const setActive = (id: string | null) => {
    if (defaultValue === undefined) setInternalId(id);
    onValueChange?.(id);
  };

  return Children.map(children, (child, index) => {
    if (!isValidElement<ChildProps>(child)) return child;
    const id = child.props["data-id"];

    const interaction = enableHover
      ? { onMouseEnter: () => setActive(id), onMouseLeave: () => setActive(null) }
      : { onClick: () => setActive(id) };

    return cloneElement(
      child,
      {
        key: index,
        className: cn("relative inline-flex", child.props.className),
        "data-checked": activeId === id ? "true" : "false",
        ...interaction,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`pill-${uniqueId}`}
              className={cn("absolute inset-0 z-0", className)}
              transition={reduced ? { duration: 0 } : transition ?? DEFAULT_TRANSITION}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <span className="relative z-[1] inline-flex items-center justify-center gap-1.5">
          {child.props.children}
        </span>
      </>,
    );
  });
}
