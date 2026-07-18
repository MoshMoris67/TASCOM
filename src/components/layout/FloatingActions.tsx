import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { school } from "@/lib/school-info";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
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
