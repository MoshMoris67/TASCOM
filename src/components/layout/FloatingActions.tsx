import { ArrowUp, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { school } from "@/lib/school-info";
import { cn } from "@/lib/utils";
import { AIChatPanel } from "@/components/ai/AIChatPanel";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {chatOpen && <AIChatPanel onClose={() => setChatOpen(false)} />}
      <button
        type="button"
        aria-label="Ask Talents College AI"
        className="group relative size-14 grid place-items-center rounded-full bg-gradient-to-r from-flag-red via-flag-red to-[#c0392b] text-white shadow-elegant hover:scale-105 transition-transform motion-reduce:transition-none"
        onClick={() => setChatOpen((v) => !v)}
      >
        <Sparkles className="size-6" />

        {/*
          The corner marker was a bare dot with no fill of its own, so it read as
          a stray pixel rather than a badge. It now carries a filled background,
          a ring that separates it from the button, and a label.
        */}
        <span
          className={cn(
            "absolute -top-1 -right-1 rounded-full bg-flag-yellow px-1.5 py-0.5",
            "text-[10px] font-bold uppercase leading-none tracking-wide text-flag-black",
            "shadow-md ring-2 ring-background",
          )}
        >
          AI
        </span>

        {/* Resting label, so the button says what it does before it's clicked. */}
        <span
          className={cn(
            "pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap",
            "rounded-full bg-flag-black/90 px-3 py-1.5 text-xs font-semibold text-flag-yellow shadow-elegant backdrop-blur-sm",
            "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
            chatOpen
              ? "opacity-0 translate-x-1"
              : "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0",
          )}
        >
          Ask the school assistant
        </span>
      </button>
      <a
        href={`https://wa.me/${school.contacts.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="size-14 grid place-items-center rounded-full bg-[oklch(0.68_0.17_150)] text-white shadow-elegant hover:scale-105 transition-transform"
      >
        <MessageCircle className="size-6" />
      </a>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "size-12 grid place-items-center rounded-full bg-flag-black text-flag-yellow shadow-elegant transition-all",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}
