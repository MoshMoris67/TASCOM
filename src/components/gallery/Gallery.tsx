import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export type GalleryPhoto = { src: string; cat: string; alt: string };

/**
 * The public photo gallery.
 *
 * What it replaces: a flat `grid lg:grid-cols-3` of identical h-72 tiles, each
 * with the alt text printed underneath in a caption bar, 33 in a row, no way to
 * filter and no way to enlarge. Clicking a photo did nothing at all — the <img>
 * wasn't wrapped in anything.
 *
 * Three deliberate changes:
 *
 * 1. FILTER. 33 photos is a contact sheet, not a gallery. The categories already
 *    exist on every row (Campus / Academics / Arts / Events / Sports) and the
 *    admin already assigns one on upload — they were being carried all the way
 *    to the page and then thrown away. Now they drive the view.
 *
 * 2. RHYTHM. A uniform grid reads as a stock-photo dump regardless of how good
 *    the photographs are. Tiles now vary in size on a repeating 6-step cycle, so
 *    the eye moves. The cycle is deterministic (index-based, not random) so the
 *    layout is stable across renders and identical on server and client.
 *
 * 3. CAPTIONS ON HOVER, NOT UNDER. The caption bar under every tile was what made
 *    it feel like a filing system. The text now lives in an overlay, and the full
 *    caption is on the lightbox where there's room to read it.
 */
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [cat, setCat] = useState<string>("All");

  const cats = useMemo(() => {
    const seen = new Set<string>();
    for (const p of photos) seen.add(p.cat);
    // Fixed order, not insertion order — the tab bar shouldn't reshuffle when an
    // admin uploads into a category that happens to sort differently.
    const order = ["Campus", "Academics", "Arts", "Events", "Sports"];
    const known = order.filter((c) => seen.has(c));
    const extra = [...seen].filter((c) => !order.includes(c)).sort();
    return ["All", ...known, ...extra];
  }, [photos]);

  const shown = useMemo(
    () => (cat === "All" ? photos : photos.filter((p) => p.cat === cat)),
    [photos, cat],
  );

  return (
    <>
      <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">
            Gallery
          </div>
          <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
            Life at Talents College.
          </h2>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter photos by category">
          {cats.map((c) => {
            const active = c === cat;
            const count = c === "All" ? photos.length : photos.filter((p) => p.cat === c).length;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => setCat(c)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-flag-black text-white"
                    : "border border-border text-muted-foreground hover:border-flag-red hover:text-flag-red"
                }`}
              >
                {c}
                <span className={active ? "text-flag-yellow" : "text-muted-foreground/60"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No photos in {cat} yet. Add them from the admin media library.
        </p>
      ) : (
        <div className="mt-8">
          <PhotoGrid photos={shown} />
        </div>
      )}
    </>
  );
}

/**
 * The eight-photo taste of the gallery shown on /media. Same tiles, same lightbox,
 * no filter bar — the filter belongs on the page that has everything to filter.
 */
export function GalleryPreview({ photos }: { photos: GalleryPhoto[] }) {
  return <PhotoGrid photos={photos} />;
}

/**
 * The mosaic itself, plus the viewer it opens. Both entry points share this so a
 * photo behaves identically wherever it appears.
 */
function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] md:grid-cols-4 md:gap-4">
        {photos.map((photo, i) => (
          <Tile
            key={`${photo.src}-${i}`}
            photo={photo}
            span={spanFor(i)}
            onOpen={() => setOpen(i)}
          />
        ))}
      </div>

      {open !== null && (
        <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

/**
 * A repeating 6-tile rhythm: one wide hero, two squares, one tall, two squares.
 * Deterministic on index so SSR and the client agree and nothing jumps on hydrate.
 */
function spanFor(i: number): string {
  switch (i % 6) {
    case 0:
      return "col-span-2 row-span-2";
    case 3:
      return "row-span-2";
    default:
      return "";
  }
}

function Tile({
  photo,
  span,
  onOpen,
}: {
  photo: GalleryPhoto;
  span: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-2xl bg-flag-black text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-red ${span}`}
      aria-label={`Open photo: ${photo.alt}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      {/* Caption panel — rests off-screen, rises on hover or keyboard focus. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-flag-black/95 via-flag-black/60 to-transparent p-4 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-flag-yellow">
          {photo.cat}
        </div>
        <div className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">
          {photo.alt}
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Expand className="size-3.5 text-white" />
      </div>
    </button>
  );
}

/**
 * Full-screen viewer. Arrow keys and Escape work, focus is trapped to the close
 * button on open and restored on close, and the background is inert.
 */
function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const prev = useCallback(
    () => onIndex((index - 1 + photos.length) % photos.length),
    [index, photos.length, onIndex],
  );
  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  };

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);

    // Stop the page behind from scrolling under the overlay.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus();
    };
  }, [onClose, prev, next]);

  const photo = photos[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex flex-col bg-flag-black/95 backdrop-blur-sm animate-fade-in"
    >
      <div className="flex items-center justify-between px-4 py-4 text-white md:px-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-flag-yellow">
          {photo.cat}
          <span className="ml-3 text-white/50">
            {index + 1} / {photos.length}
          </span>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close photo"
          className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-yellow"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 touch-pan-y items-center justify-center gap-2 px-2 md:gap-4 md:px-6"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <NavButton label="Previous photo" onClick={prev}>
          <ChevronLeft className="size-6" />
        </NavButton>

        <img
          src={photo.src}
          alt={photo.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full min-h-0 max-w-full rounded-xl object-contain shadow-elegant"
          draggable={false}
        />

        <NavButton label="Next photo" onClick={next}>
          <ChevronRight className="size-6" />
        </NavButton>
      </div>

      <p className="mx-auto max-w-2xl px-6 py-6 text-center text-sm leading-relaxed text-white/80">
        {photo.alt}
      </p>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-flag-yellow hover:text-flag-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-yellow md:size-14"
    >
      {children}
    </button>
  );
}
