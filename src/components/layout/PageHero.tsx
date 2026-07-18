import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Page hero.
 *
 * Previously this was a single flat `bg-flag-black` slab used identically on every
 * route, which is why the whole site read as one repeated page. It now has two
 * independent axes:
 *
 *   tone   - the colour world of the band (navy / ink / cream / sky)
 *   layout - how the image relates to the copy (banner / split / feature)
 *
 * Pick a different pair per section of the site. Nothing else needs to change.
 */

export type HeroTone = "navy" | "ink" | "cream" | "sky";
export type HeroLayout = "banner" | "split" | "feature";

const toneStyles: Record<
  HeroTone,
  { shell: string; eyebrow: string; title: string; body: string; crumb: string; crumbActive: string; rule: string; fact: string }
> = {
  // Deep navy, photo washed underneath. The classic - now used sparingly.
  navy: {
    shell: "bg-flag-black text-white",
    eyebrow: "text-flag-yellow",
    title: "text-white",
    body: "text-white/80",
    crumb: "text-white/60 hover:text-flag-yellow",
    crumbActive: "text-white",
    rule: "bg-white/15",
    fact: "bg-white/[0.05]",
  },
  // Near-black editorial. Tighter, quieter, more serious.
  ink: {
    shell: "bg-[oklch(0.16_0.04_258)] text-white",
    eyebrow: "text-flag-blue",
    title: "text-white",
    body: "text-white/70",
    crumb: "text-white/50 hover:text-flag-blue",
    crumbActive: "text-white/90",
    rule: "bg-white/10",
    fact: "bg-white/[0.04]",
  },
  // Warm cream with navy type. The big break from the navy monotony.
  cream: {
    shell: "bg-flag-yellow text-flag-black",
    eyebrow: "text-flag-red",
    title: "text-flag-black",
    body: "text-flag-black/70",
    crumb: "text-flag-black/55 hover:text-flag-red",
    crumbActive: "text-flag-black",
    rule: "bg-flag-black/10",
    fact: "bg-flag-yellow",
  },
  // Blue gradient. Bright and outward-facing.
  sky: {
    shell: "bg-gradient-to-br from-flag-red via-flag-red to-flag-blue text-white",
    eyebrow: "text-flag-yellow",
    title: "text-white",
    body: "text-white/85",
    crumb: "text-white/65 hover:text-flag-yellow",
    crumbActive: "text-white",
    rule: "bg-white/20",
    fact: "bg-white/[0.08]",
  },
};

function Crumbs({ crumbs, tone }: { crumbs: { label: string; to?: string }[]; tone: HeroTone }) {
  const t = toneStyles[tone];
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
      <Link to="/" className={t.crumb}>
        Home
      </Link>
      {crumbs.map((c) => (
        <span key={c.label} className="flex items-center gap-1.5">
          <ChevronRight className={cn("size-3.5 opacity-50", t.crumb)} />
          {c.to ? (
            <Link to={c.to} className={t.crumb}>
              {c.label}
            </Link>
          ) : (
            <span className={t.crumbActive}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  crumbs,
  actions,
  facts,
  tone = "navy",
  layout = "banner",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
  /** Optional strip of hard numbers under the copy. Fills the band and earns its space. */
  facts?: { value: string; label: string }[];
  tone?: HeroTone;
  layout?: HeroLayout;
}) {
  const t = toneStyles[tone];

  const copy = (
    <div className={layout === "banner" ? "max-w-3xl" : ""}>
      {crumbs && <Crumbs crumbs={crumbs} tone={tone} />}
      {eyebrow && (
        <div className={cn("flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]", t.eyebrow)}>
          <span className="inline-block h-px w-6 bg-current opacity-60" />
          {eyebrow}
        </div>
      )}
      <h1
        className={cn(
          "mt-3 font-display font-black leading-[1.05]",
          layout === "banner" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl",
          t.title,
        )}
      >
        {title}
      </h1>
      {description && <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", t.body)}>{description}</p>}
      {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      {facts && facts.length > 0 && (
        <dl className={cn("mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4", t.rule)}>
          {facts.map((f) => (
            <div key={f.label} className={cn("px-4 py-4", t.fact)}>
              <dt className={cn("font-display text-2xl font-black", t.title)}>{f.value}</dt>
              <dd className={cn("mt-0.5 text-[11px] uppercase tracking-[0.14em]", t.body)}>{f.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );

  // SPLIT - copy left, a real framed photo right. Reads as a page, not a banner.
  if (layout === "split" && image) {
    return (
      <section className={cn("relative overflow-hidden", t.shell)}>
        <Watermark tone={tone} />
        <div className="relative container-page grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          {copy}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2.25rem] bg-current opacity-[0.06]" aria-hidden />
            <img
              src={image}
              alt={imageAlt}
              className="relative aspect-[4/3] w-full rounded-[1.75rem] object-cover shadow-elegant"
            />
          </div>
        </div>
        <div className="h-1 flag-stripe" />
      </section>
    );
  }

  // FEATURE - tall, photo full-bleed and legible, copy sitting low.
  if (layout === "feature" && image) {
    return (
      <section className="relative overflow-hidden bg-flag-black text-white">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-flag-black via-flag-black/75 to-flag-black/25" />
        <div className="relative container-page flex min-h-[26rem] flex-col justify-end py-14 md:min-h-[32rem] md:py-20">
          {copy}
        </div>
        <div className="h-1 flag-stripe" />
      </section>
    );
  }

  // BANNER - the original shape, kept for form and utility pages.
  return (
    <section className={cn("relative overflow-hidden", t.shell)}>
      {image && (
        <>
          <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div
            className={cn(
              "absolute inset-0",
              tone === "cream"
                ? "bg-gradient-to-b from-flag-yellow/85 to-flag-yellow"
                : "bg-gradient-to-b from-flag-black/75 via-flag-black/70 to-flag-black",
            )}
          />
        </>
      )}
      {!image && <Watermark tone={tone} />}
      <div className="relative container-page py-16 md:py-24">{copy}</div>
      <div className="h-1 flag-stripe" />
    </section>
  );
}

/** Faint geometric field so an image-less hero isn't a dead flat rectangle. */
function Watermark({ tone }: { tone: HeroTone }) {
  const stroke = tone === "cream" ? "oklch(0.22 0.06 258 / 0.07)" : "rgb(255 255 255 / 0.06)";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute -right-20 -top-24 h-[34rem] w-[34rem]" viewBox="0 0 200 200" fill="none">
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx="100" cy="100" r={18 + i * 13} stroke={stroke} strokeWidth="0.7" />
        ))}
        <path d="M100 12 L172 100 L100 188 L28 100 Z" stroke={stroke} strokeWidth="0.7" />
      </svg>
      <svg className="absolute -bottom-28 -left-24 h-[24rem] w-[24rem]" viewBox="0 0 200 200" fill="none">
        {[...Array(9)].map((_, i) => (
          <line key={i} x1={i * 24} y1="0" x2={i * 24 + 90} y2="200" stroke={stroke} strokeWidth="0.7" />
        ))}
      </svg>
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`container-page py-16 md:py-24 scroll-mt-24 md:scroll-mt-28 ${className}`}>
      {children}
    </section>
  );
}

/**
 * Alternating band background. Wrap a <Section> in this to break up a long run of
 * white cards - the other half of why the site felt monotonous.
 */
export function Band({
  children,
  tone = "muted",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: "muted" | "cream" | "navy";
  className?: string;
  id?: string;
}) {
  const bg =
    tone === "cream" ? "bg-flag-yellow text-flag-black" : tone === "navy" ? "bg-flag-black text-white" : "bg-muted";
  return (
    <div id={id} className={cn(bg, "scroll-mt-24 md:scroll-mt-28", className)}>
      {children}
    </div>
  );
}
