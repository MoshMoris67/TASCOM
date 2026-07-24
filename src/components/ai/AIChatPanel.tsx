import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant, type ChatMessage } from "@/lib/ai-assistant";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const SUGGESTIONS = [
  "How do I apply?",
  "When does next term start?",
  "What subjects are offered?",
  "Where are you located?",
];

const LINK_PATHS = [
  "/apply",
  "/media",
  "/academics",
  "/contact",
  "/admissions",
  "/admissions/check-status",
  "/news",
  "/gallery",
  "/student-life",
  "/portal",
];

function linkify(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let matchedPath = "";

    for (const p of LINK_PATHS) {
      const idx = remaining.indexOf(p);
      if (idx === -1) continue;
      // Earliest match wins; on a tie the LONGER path wins, otherwise
      // "/admissions/check-status" would be linked as "/admissions" with a
      // dangling "/check-status" left as plain text.
      if (earliest === -1 || idx < earliest || (idx === earliest && p.length > matchedPath.length)) {
        earliest = idx;
        matchedPath = p;
      }
    }

    if (earliest === -1) {
      nodes.push(remaining);
      break;
    }

    if (earliest > 0) {
      nodes.push(remaining.slice(0, earliest));
    }

    const label = matchedPath.split("/").filter(Boolean).join(" ") || matchedPath;
    nodes.push(
      <Link
        key={key++}
        to={matchedPath}
        className="underline font-semibold text-flag-red hover:text-flag-red/80"
      >
        {label}
      </Link>,
    );

    remaining = remaining.slice(earliest + matchedPath.length);
  }

  return nodes.length === 0 ? [text] : nodes;
}

export function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ask = useServerFn(askAssistant);

  // Stable per-conversation id so the server can rate-limit a runaway tab
  // without affecting other visitors.
  const sessionId = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  useEffect(() => {
    setOpen(true);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = async (text?: string) => {
    const message = text ?? input;
    if (!message.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: message.trim() };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await ask({
        data: {
          message: message.trim(),
          history: newHistory.slice(0, -1),
          sessionId: sessionId.current,
        },
      });
      setHistory([...newHistory, { role: "assistant", content: res.reply }]);
      if (res.suggestions?.length) {
        setSuggestions(res.suggestions);
        setShowSuggestions(true);
      }
    } catch {
      setHistory([
        ...newHistory,
        { role: "assistant", content: "Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[380px] max-h-[520px] flex flex-col rounded-3xl border border-border bg-background shadow-elegant overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-flag-red via-flag-red to-[#c0392b] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,var(--flag-yellow),transparent_60%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <span className="relative grid size-9 place-items-center rounded-xl bg-white/15 backdrop-blur-sm text-white">
            <Bot className="size-5" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-flag-yellow border-2 border-flag-red" />
          </span>
          <div>
            <div className="font-display font-bold text-sm leading-tight">TASCOM AI Assistant</div>
            <div className="text-xs text-white/80">Online — powered by school data</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="relative z-10 grid size-8 place-items-center rounded-full hover:bg-white/15 transition-colors text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && (
          <div className="text-center py-6">
            <div className="inline-flex size-12 place-items-center rounded-full bg-flag-black text-flag-yellow mb-3">
              <Sparkles className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ask me anything about admissions, academics, events or contacts.
            </p>
          </div>
        )}

        {history.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              // Replies are composed with newlines and bullet lists — without
              // pre-wrap they collapse into a single unreadable paragraph.
              "whitespace-pre-wrap",
              m.role === "user"
                ? "ml-auto bg-flag-red text-white rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm",
            )}
          >
            {m.role === "assistant" ? linkify(m.content) : m.content}
          </div>
        ))}

        {loading && (
          <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {showSuggestions && !loading && suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {history.length === 0 ? "Suggested" : "You might also ask"}
            </div>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-left text-sm hover:border-flag-red hover:text-flag-red transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border bg-card/50 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-flag-red"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-flag-red text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-flag-red/90"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
