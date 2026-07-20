import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
  type ReactElement,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";
import { useInView, usePrefersReducedMotion } from "@/hooks/use-in-view";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  threshold?: number;
};

/**
 * Fades + rises its children in as they enter the viewport, once.
 *
 * No motion/attributes are applied until the observer has reported back at
 * least once (`inView` is `undefined` until then). This prevents a flash of
 * hidden content on client mount or for elements already in view.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  y = 20,
  threshold,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold });

  useEffect(() => setMounted(true), []);

  // Wait for both mount and the first observer tick before deciding.
  const ready = mounted && inView !== undefined;
  // If reduced motion is on, never hide/transition — render normally.
  const animate = ready && !reduced;
  const state = animate ? (inView ? "visible" : "") : undefined;

  return (
    <Tag
      ref={ref}
      data-reveal={state}
      className={className}
      style={animate ? revealVars(y, delay) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * RevealItem: injects reveal behaviour into an existing element without adding
 * a wrapper. It clones the child and attaches the ref + data attributes +
 * styles directly onto it, so the DOM structure (and therefore any grid/flex
 * layout) is unchanged.
 */
function RevealItem({
  child,
  delay,
  y,
  threshold,
}: {
  child: ReactElement;
  delay: number;
  y?: number;
  threshold?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold });

  useEffect(() => setMounted(true), []);

  const ready = mounted && inView !== undefined;
  const animate = ready && !reduced;
  if (!animate) return child;

  const childProps = child.props as { style?: React.CSSProperties };
  const revealState = inView ? "visible" : "";

  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    ref: ref as Ref<unknown>,
    "data-reveal": revealState,
    style: { ...childProps.style, ...revealVars(y ?? 20, delay) },
  });
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  stagger?: number;
  baseDelay?: number;
  y?: number;
  threshold?: number;
};

/**
 * Reveals a set of sibling elements in sequence. The container renders exactly
 * as before (same tag, same className, same children order/nesting). Each
 * direct child element gains reveal behaviour via cloneElement — no extra DOM
 * nodes are introduced, so existing grid/flex layouts are untouched.
 */
export function RevealGroup({
  children,
  className,
  as,
  stagger = 90,
  baseDelay = 0,
  y,
  threshold,
}: RevealGroupProps) {
  const Tag = (as ?? "div") as ElementType;
  const items = Children.toArray(children);

  return (
    <Tag className={className}>
      {items.map((child, i) =>
        isValidElement(child) ? (
          <RevealItem
            key={child.key ?? i}
            child={child}
            delay={baseDelay + i * stagger}
            y={y}
            threshold={threshold}
          />
        ) : (
          child
        ),
      )}
    </Tag>
  );
}

function revealVars(y: number, delay: number): React.CSSProperties {
  return {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delay}ms`,
  } as React.CSSProperties;
}
