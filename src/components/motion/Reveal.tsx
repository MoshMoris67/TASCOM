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
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  threshold?: number;
};

/**
 * Fades + rises its children in as they enter the viewport, once.
 *
 * Sequencing (critical for the transition to actually play):
 *   1. Server render: no `data-reveal` attribute — children are fully visible
 *      (good for SSR, crawlers, no-JS, no CLS).
 *   2. Client mount: `data-reveal=""` is applied — the `[data-reveal]` CSS rule
 *      hides the element with opacity 0 + translateY, but the transition is
 *      already armed.
 *   3. Observer confirms entry: `data-reveal="visible"` flips to the visible
 *      state and the browser animates the change.
 *
 * Under `prefers-reduced-motion`, steps 2 and 3 are skipped entirely so the
 * element never disappears or animates.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  y = 20,
  x = 0,
  threshold,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ threshold });

  useEffect(() => setMounted(true), []);

  const ready = mounted && inView !== undefined;
  // If reduced motion is on, never hide/transition — render normally.
  // If not ready yet (before first observer tick), also render normally.
  const animate = ready && !reduced;
  // After mount, arm the hidden state so the transition has a from/to pair.
  const state: string | undefined = !mounted
    ? undefined
    : !animate
      ? ""
      : inView
        ? "visible"
        : "";

  return (
    <Tag
      ref={ref}
      data-reveal={state}
      className={className}
      style={animate ? revealVars(y, delay, x) : undefined}
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
  if (!animate) {
    // After mount but before reduced-motion check, still arm hidden state so
    // the transition can play once we know motion is allowed.
    if (mounted && !reduced && inView === undefined) {
      const childProps = child.props as { style?: React.CSSProperties };
      return cloneElement(child as ReactElement<Record<string, unknown>>, {
        ref: ref as Ref<unknown>,
        "data-reveal": "",
        style: { ...childProps.style, ...revealVars(y ?? 20, delay) },
      });
    }
    return child;
  }

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

function revealVars(y: number, delay: number, x = 0): React.CSSProperties {
  return {
    "--reveal-y": `${y}px`,
    "--reveal-x": `${x}px`,
    "--reveal-delay": `${delay}ms`,
  } as React.CSSProperties;
}
