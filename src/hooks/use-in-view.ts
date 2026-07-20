import { useEffect, useRef, useState } from "react";

/**
 * Returns true when the user has `prefers-reduced-motion: reduce` set.
 *
 * SSR-safe: renders `false` on the server and on the first client paint, then
 * corrects on mount. Callers use it to skip motion entirely.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export type UseInViewOptions = {
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
  /** Root margin, e.g. "0px 0px -10% 0px" to trigger slightly before entry. */
  rootMargin?: string;
  /** Reveal only the first time it enters, then stop observing. Default true. */
  once?: boolean;
};

const DEFAULT_ROOT_MARGIN = "0px 0px -10% 0px";

/**
 * Dependency-light scroll-reveal primitive built on IntersectionObserver.
 *
 * - `inView` starts `undefined`. Only after the first observer tick is it set
 *   to `true` or `false`. Callers should render their content normally while
 *   `inView` is `undefined` and only apply hidden/revealed styling once it is
 *   defined. That avoids a flash where content vanishes on mount and reappears
 *   one frame later.
 * - Reveal-once by default, and it unobserves itself after the first entry so
 *   there is no lingering observer cost.
 * - Degrades gracefully: if IntersectionObserver is unavailable, it reports
 *   `inView: true` immediately so content is never trapped hidden.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const { threshold = 0.15, rootMargin = DEFAULT_ROOT_MARGIN, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
