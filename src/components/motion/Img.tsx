import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Wrapper className (the wrapper holds the placeholder tint + reserves space). */
  wrapperClassName?: string;
};

/**
 * Image with a blur-up style fade-in.
 *
 * The image starts slightly scaled + blurred over a neutral `bg-muted` tint and
 * settles into place once it has decoded, removing the hard "pop" and any flash
 * of empty space. It reserves layout via the caller's sizing classes (the img
 * fills the wrapper), so it does not introduce CLS.
 *
 * Reduced motion: the fade/blur transition collapses to instant via the global
 * `prefers-reduced-motion` rule in styles.css, so the image simply appears.
 */
export function Img({ className, wrapperClassName, onLoad, ...props }: ImgProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  // Cover cached images that finish before hydration attaches the onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <span className={cn("relative block overflow-hidden bg-muted", wrapperClassName)}>
      <img
        {...props}
        ref={ref}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        data-loaded={loaded ? "true" : "false"}
        className={cn(
          "transition-[opacity,filter,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-[1.03]",
          className,
        )}
      />
    </span>
  );
}
