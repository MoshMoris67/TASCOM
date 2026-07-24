import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun, X, Phone, ChevronDown, Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchLatestNews, type NewsPost } from "@/lib/news";
import { school } from "@/lib/school-info";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import crest from "@/assets/crest.png";

type MenuItem = {
  label: string;
  to: string;
  /** Routes that should light this item up, beyond `to` itself. */
  match?: string[];
  submenu?: { label: string; to: string; hash?: string }[];
};

// Hoisted out of the component: this never changes, and it was being rebuilt on
// every render (including every scroll tick), which also made it unusable as an
// effect dependency.
const menuItems: MenuItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About",
    to: "/about",
    submenu: [
      { label: "About Us", to: "/about" },
      { label: "History", to: "/about", hash: "history" },
      { label: "Our Mission", to: "/about", hash: "mission" },
      { label: "Administration", to: "/about", hash: "administration" },
      { label: "Our Staff", to: "/about", hash: "staff" },
    ],
  },
  {
    label: "Admissions",
    to: "/admissions",
    match: ["/admissions/check-status"],
    submenu: [
      { label: "How to Apply", to: "/admissions", hash: "apply" },
      { label: "Fees Structure", to: "/admissions", hash: "fees" },
      { label: "Apply Online", to: "/admissions", hash: "apply" },
      { label: "Check Application Status", to: "/admissions/check-status" },
    ],
  },
  {
    label: "Academics",
    to: "/academics",
    submenu: [
      { label: "Curriculum", to: "/academics", hash: "curriculum" },
      { label: "Departments & Subjects", to: "/academics", hash: "departments" },
      { label: "Timetable", to: "/academics", hash: "calendar" },
      { label: "Exam Results", to: "/academics", hash: "exam-results" },
    ],
  },
  {
    // Media was merged in here. `match` keeps this item highlighted on the
    // routes that used to belong to Media, so /news/<slug> and /gallery still
    // light up a nav item instead of none.
    label: "Student Life",
    to: "/student-life",
    match: ["/media", "/news", "/gallery", "/events"],
    submenu: [
      { label: "Clubs & Societies", to: "/student-life", hash: "clubs" },
      { label: "Sports", to: "/student-life", hash: "sports" },
      { label: "News & Events", to: "/student-life", hash: "news" },
      { label: "Gallery", to: "/student-life", hash: "gallery" },
    ],
  },
  { label: "Alumni", to: "/alumni" },
  { label: "Contact", to: "/contact" },
];

/** Which nav item owns the current route. -1 when none (e.g. /auth, /admin). */
function activeIndexFor(pathname: string) {
  return menuItems.findIndex((item) => {
    if (item.to === "/") return pathname === "/";
    const candidates = [item.to, ...(item.match ?? [])];
    return candidates.some((c) => pathname === c || pathname.startsWith(c + "/"));
  });
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [mobileDropdownIndex, setMobileDropdownIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const [newsOpen, setNewsOpen] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsPost[]>([]);

  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const headerRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const loadLatestNews = useServerFn(fetchLatestNews);

  useEffect(() => {
    if (!newsOpen) return;
    loadLatestNews()
      .then(setNewsItems)
      .catch(() => setNewsItems([]));
  }, [newsOpen, loadLatestNews]);

  const activeIndex = activeIndexFor(pathname);

  // The indicator follows the pointer, falls back to an open dropdown, and rests
  // on the current route when neither applies.
  const highlightIndex = hoverIndex ?? openDropdownIndex ?? (activeIndex >= 0 ? activeIndex : null);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = highlightIndex === null ? null : itemRefs.current[highlightIndex];
    if (!nav || !el) {
      setIndicator((i) => (i.visible ? { ...i, visible: false } : i));
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    setIndicator({ left: elBox.left - navBox.left, width: elBox.width, visible: true });
  }, [highlightIndex]);

  // Measured in an effect rather than at render: the pill has to know real pixel
  // widths, which don't exist during SSR. `visible` gates it so it fades in once
  // rather than flashing at 0,0 on hydration.
  useEffect(() => {
    measure();
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    itemRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    // Webfonts land after first paint and reflow the labels underneath us.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    setOpen(false);
    setMobileDropdownIndex(null);
    setOpenDropdownIndex(null);
  }, [pathname]);

  /*
    Anything that has to avoid sitting under the header needs to know how tall
    it is, and that changes with breakpoint (the contact strip is md-only) and
    with zoom. Publishing it as a custom property means overlays can subtract a
    measured value instead of a hardcoded guess.

    Skipped while the mobile menu is expanded: that inflates the wrapper to the
    full menu height, which is not the height an overlay should avoid.
  */
  useEffect(() => {
    const el = stickyRef.current;
    if (!el || open) return;
    const publish = () => {
      document.documentElement.style.setProperty("--site-header-h", `${el.offsetHeight}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [open]);

  // Close dropdowns on outside click, and on Escape.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!headerRef.current || !(e.target instanceof Node)) return;
      if (!headerRef.current.contains(e.target)) setOpenDropdownIndex(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdownIndex(null);
        setOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // The whole block sticks, contact strip included, so nothing scrolls out of
  // reach. `position` is also set inline: `sticky` and `relative` are the same
  // utility group, and whichever Tailwind emits last wins regardless of the
  // order they're written in the class string. The inline rule can't be lost
  // that way.
  return (
    <div ref={stickyRef} className="sticky top-0 z-50" style={{ position: "sticky", top: 0 }}>
      <div className="hidden md:block bg-flag-black text-white text-xs">
        <div className="container-page flex items-center justify-between py-2">
          <div className="flex items-center gap-4 opacity-80">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3" />
              {school.contacts.headTeacher}
            </span>
            <span>{school.contacts.email}</span>
          </div>
          <div className="opacity-80">
            Reg. No. {school.registration} · Ministry of Education &amp; Sports
          </div>
        </div>
      </div>

      <header
        ref={(el) => {
          headerRef.current = el;
        }}
        className={cn(
          // Same treatment as the AI chat panel header: brand gradient left to
          // right, warm radial bloom over it, white type on top.
          "relative bg-linear-to-r/oklab from-flag-red via-flag-red via-50% to-flag-warm text-white",
          "border-b border-white/15",
          "shadow-[0_10px_30px_-14px_rgb(0_0_0/0.45)]",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/25 before:content-['']",
        )}
      >
        {/*
          The bloom is clipped by its own layer. `overflow-hidden` on the header
          itself would also clip the desktop dropdowns, which are positioned at
          `top-full` — i.e. entirely outside the header's box.
        */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,var(--flag-yellow),transparent_60%)]" />
          <div className="absolute -top-40 -right-24 size-[500px] rounded-full opacity-[0.10] bg-[radial-gradient(circle_at_center,var(--flag-yellow),transparent_70%)]" />
        </div>
        <div
          className={cn(
            "container-page relative z-10 flex items-center justify-between gap-3 sm:gap-6 xl:gap-10",
            "h-20 md:h-24",
          )}
        >
          <Link to="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-4 lg:shrink-0">
            <img
              src={crest}
              alt="Talents College Mukono crest"
              width={204}
              height={241}
              className={cn(
                "w-auto shrink-0 rounded-lg bg-white p-0.5 object-contain drop-shadow-sm",
                "transition-[height,transform] duration-500 ease-out motion-reduce:transition-none",
                "group-hover:scale-105",
                "h-11 md:h-14",
              )}
            />
            {/*
              Hidden between lg and xl on purpose. At 1024px the wordmark, the nav,
              the toggle and Apply Now do not all fit — the nav is `whitespace-nowrap`,
              so instead of wrapping it would overflow the container. Dropping the
              wordmark for that one band frees ~240px, which is what pays for the
              extra padding below.
            */}
            <div className="block min-w-0 lg:hidden xl:block leading-tight">
              <div
                className={cn(
                  "font-display font-bold tracking-tight text-[0.8rem] sm:text-[0.95rem] md:text-lg",
                  "lg:whitespace-nowrap",
                )}
              >
                TALENTS COLLEGE MUKONO
              </div>
              {/* Collapses away on scroll — part of the shrink, not a separate trick. */}
              <div
                className={cn(
                  "truncate text-[9px] uppercase tracking-[0.14em] text-white/75",
                  "sm:text-[10px] sm:tracking-[0.18em] md:text-[11px]",
                )}
              >
                Power of Knowledge
              </div>
            </div>
          </Link>

          <nav
            ref={(el) => {
              navRef.current = el;
            }}
            onMouseLeave={() => setHoverIndex(null)}
            className="relative hidden items-center gap-1 lg:flex"
          >
            {/*
              One sliding indicator for the whole bar, instead of a border-bottom on
              each item. It measures the target and animates transform + width, so it
              travels between items rather than blinking on and off.
            */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-0 top-1/2",
                "transition-[transform,width,opacity] duration-300 motion-reduce:transition-none",
                indicator.visible ? "opacity-100" : "opacity-0",
              )}
              style={{
                transform: `translate3d(${indicator.left}px, -50%, 0)`,
                width: indicator.width,
                height: 36,
                transitionTimingFunction: EASE,
              }}
            >
              <span className="absolute inset-0 rounded-full bg-white/15" />
              <span className="absolute -bottom-1.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-flag-yellow" />
            </span>

            {menuItems.map((item, index) => {
              const isActive = index === activeIndex;
              const shared = cn(
                "relative z-10 whitespace-nowrap rounded-full px-3.5 py-2",
                "text-[13px] tracking-tight transition-colors duration-200 motion-reduce:transition-none",
                isActive
                  ? "font-bold text-flag-yellow"
                  : "font-semibold text-white/85 hover:text-white",
              );

              if (item.submenu) {
                const isOpen = openDropdownIndex === index;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setHoverIndex(index)}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownIndex(isOpen ? null : index);
                      }}
                      aria-expanded={isOpen}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(shared, "inline-flex items-center gap-1")}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-3 opacity-60 transition-transform duration-300 motion-reduce:transition-none",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "absolute left-0 top-full z-20 min-w-[230px] origin-top rounded-3xl border border-border p-3",
                        "bg-popover/90 backdrop-blur-xl backdrop-saturate-150 shadow-xl",
                        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                        isOpen
                          ? "pointer-events-auto mt-3 translate-y-0 scale-100 opacity-100"
                          : "pointer-events-none mt-1 -translate-y-1 scale-[0.98] opacity-0",
                      )}
                    >
                      <div className="grid gap-1">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            hash={sub.hash}
                            className={cn(
                              "block rounded-2xl px-4 py-2 text-sm text-foreground/80",
                              "transition-[background-color,color,padding] duration-200 motion-reduce:transition-none",
                              "hover:bg-muted hover:pl-5 hover:text-foreground",
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setHoverIndex(index)}
                  aria-current={isActive ? "page" : undefined}
                  className={shared}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            <Popover open={newsOpen} onOpenChange={setNewsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifications"
                   className={cn(
                     "grid size-10 place-items-center rounded-full bg-white/15 text-white relative",
                     "transition-[background-color,color,transform] duration-200 motion-reduce:transition-none",
                     "hover:bg-flag-yellow hover:text-flag-black active:scale-95",
                   )}
                 >
                   <Bell className="size-5" />
                   {newsItems.length > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-flag-yellow text-[10px] font-bold text-flag-black ring-2 ring-[#c0392b]">
                      {newsItems.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
                <div className="text-xs font-semibold uppercase tracking-widest text-flag-red mb-3">
                  Latest news
                </div>
                <div className="space-y-3">
                  {newsItems.map((item) => (
                    <Link
                      key={item.slug}
                      to="/news/$slug"
                      params={{ slug: item.slug }}
                      className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-flag-red"
                      onClick={() => setNewsOpen(false)}
                    >
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.published_at).toDateString()}
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-snug">{item.title}</div>
                    </Link>
                  ))}
                  {newsItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No news yet.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className={cn(
                "grid size-9 sm:size-10 place-items-center rounded-full bg-white/15 text-white",
                "transition-[background-color,color,transform] duration-200 motion-reduce:transition-none",
                "hover:bg-flag-yellow hover:text-flag-black active:scale-95",
              )}
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link
              to="/admissions"
              hash="apply"
              className={cn(
                "hidden items-center whitespace-nowrap rounded-full bg-flag-yellow px-4 text-[13px] font-bold text-flag-black lg:inline-flex",
                "shadow-sm transition-[transform,background-color] duration-200 hover:bg-white active:scale-95 motion-reduce:transition-none",
                "h-10",
              )}
            >
              Apply Now
            </Link>
            <button
              type="button"
              className={cn(
                "grid size-10 place-items-center rounded-full bg-white/15 text-white lg:hidden",
                "transition-[background-color,color] duration-200 motion-reduce:transition-none",
                "hover:bg-flag-yellow hover:text-flag-black",
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className={cn(
            "relative z-10 overflow-hidden border-t border-white/15 transition-all duration-300 ease-out lg:hidden",
            "motion-reduce:transition-none",
            open ? "max-h-[1000px] opacity-100" : "max-h-0 border-t-0 opacity-0",
          )}
        >
          <nav className="container-page flex flex-col gap-1.5 py-5">
            {menuItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  {item.submenu ? (
                    <button
                      type="button"
                      onClick={() =>
                        setMobileDropdownIndex(mobileDropdownIndex === index ? null : index)
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border bg-white/10 px-4 py-3 text-left text-base font-semibold",
                        "transition-colors duration-200 motion-reduce:transition-none",
                        isActive
                          ? "border-flag-yellow/70 text-flag-yellow"
                          : "border-white/20 text-white hover:border-flag-yellow/50",
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-300 motion-reduce:transition-none",
                          mobileDropdownIndex === index && "rotate-180",
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center rounded-2xl border bg-white/10 px-4 py-3 text-base font-semibold",
                        "transition-colors duration-200 motion-reduce:transition-none",
                        isActive
                          ? "border-flag-yellow/70 text-flag-yellow"
                          : "border-white/20 text-white hover:border-flag-yellow/50",
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.submenu && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none",
                        mobileDropdownIndex === index
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="grid gap-1 px-3 py-1">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            hash={sub.hash}
                            className="block rounded-2xl px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white motion-reduce:transition-none"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              to="/admissions"
              hash="apply"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-flag-yellow text-sm font-bold text-flag-black transition-colors hover:bg-white motion-reduce:transition-none"
            >
              Apply Now
            </Link>
          </nav>
        </div>

        <div className="relative z-10 h-1 flag-stripe" />
      </header>
    </div>
  );
}
