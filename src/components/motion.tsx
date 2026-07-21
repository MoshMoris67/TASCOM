import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-motion primitives for Talents College Mukono.
 *
 * Design goals (why these are safe to add to an SSR site):
 *  - Everything renders fully VISIBLE by default. The "hidden" state is only
 *    ever added by client-side JS, so with no JS / no observer the site looks
 *    exactly as it does today — content can never get stuck invisible.
 *  - Only elements that are BELOW the fold at mount ever animate, so there is
 *    no flash on content that is already on screen.
 *  - prefers-reduced-motion is fully respected.
 */

const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";
// Run layout work before paint on the client; fall back to useEffect on the server.
const useIsoLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

function prefersReducedMotion() {
  return canUseDOM && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function canHover() {
  return canUseDOM && window.matchMedia("(hover: hover)").matches;
}

type RevealVariant = "up" | "left" | "right" | "zoom";

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  amount = 0.18,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** stagger, in milliseconds */
  delay?: number;
  /** how much of the element must be visible to trigger (0-1) */
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    // Only arm (hide) elements that are below the fold at mount — anything
    // already on screen renders normally with no animation and no flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) return;

    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-shown", "");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

export function TiltCard({
  children,
  className,
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  /** maximum tilt in degrees */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = !prefersReducedMotion() && canHover();
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!enabled.current || !el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("motion-tilt", className)}>
      {children}
    </div>
  );
}

export function Magnetic({
  children,
  className,
  strength = 0.4,
}: {
  children: ReactNode;
  className?: string;
  /** 0 = none, 1 = follows the cursor exactly */
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = !prefersReducedMotion() && canHover();
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!enabled.current || !el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("motion-magnetic inline-block", className)}
    >
      {children}
    </span>
  );
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const d = document.documentElement;
        const max = d.scrollHeight - d.clientHeight;
        const p = max > 0 ? d.scrollTop / max : 0;
        if (ref.current) ref.current.style.transform = `scaleX(${p})`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="motion-progress" aria-hidden="true" />;
}

/**
 * Wrap any grid/flex container so its DIRECT children reveal with a stagger as
 * the group scrolls into view, and (optionally) tilt toward the cursor on hover.
 * Give it the same className the grid div had, so the cards stay its direct
 * children. One wrap replaces dozens of per-card wrappers.
 */
export function CardGrid({
  children,
  className,
  variant = "up",
  stagger = 90,
  tilt = false,
  tiltMax = 8,
  amount = 0.14,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** delay between successive cards, in ms */
  stagger?: number;
  /** enable 3D hover tilt on the cards */
  tilt?: boolean;
  tiltMax?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tiltEnabled = useRef(false);
  const active = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    // Only arm groups that are below the fold at mount — no flash on visible ones.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) return;
    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-shown", "");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    tiltEnabled.current = tilt && !prefersReducedMotion() && canHover();
  }, [tilt]);

  const directChild = (target: EventTarget | null): HTMLElement | null => {
    const group = ref.current;
    if (!group) return null;
    let node = target as HTMLElement | null;
    while (node && node.parentElement !== group) node = node.parentElement;
    return node && node.parentElement === group ? node : null;
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled.current) return;
    const node = directChild(e.target);
    if (!node) return;
    if (active.current && active.current !== node) active.current.style.transform = "";
    active.current = node;
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    node.style.transform = `perspective(900px) rotateY(${px * tiltMax}deg) rotateX(${-py * tiltMax}deg)`;
  };
  const onLeave = () => {
    if (active.current) {
      active.current.style.transform = "";
      active.current = null;
    }
  };

  return (
    <div
      ref={ref}
      data-reveal-group={variant}
      data-tilt={tilt ? "" : undefined}
      style={{ ["--rg" as string]: `${stagger}ms` } as CSSProperties}
      className={className}
      onPointerMove={tilt ? onMove : undefined}
      onPointerLeave={tilt ? onLeave : undefined}
    >
      {children}
    </div>
  );
}

export function useInView<T extends Element>(amount = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return { ref, inView };
}
