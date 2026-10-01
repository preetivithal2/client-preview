"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AiChatMessage from "./AiChatMessage";
import AiChatInput from "./AiChatInput";
import AiThinkingIndicator from "./AiThinkingIndicator";

type Message = { role: "user" | "assistant"; text: string };

function getWelcomeForRoute(pathname: string): string {
  if (pathname === "/" || pathname === "/dashboard")
    return `Hi there! I can see you're on the **Dashboard**. Want a quick summary of open jobs, high priority faults, or recent activity?`;
  if (pathname.startsWith("/work-logs"))
    return `Hey! Need help with **Work Logs**? I can find specific jobs, check statuses, summarize recent entries, or look up spares used.`;
  if (pathname.startsWith("/records"))
    return `Looking at **Records**? I can search through job records, filter by status or priority, or give you a quick count.`;
  if (pathname.startsWith("/equipment"))
    return `Browsing **Equipment**? Ask me about any machine's specs, serial numbers, or which department it belongs to.`;
  if (pathname.startsWith("/regulations") || pathname.startsWith("/regulatory-library"))
    return `Checking **Regulations**? I can explain MARPOL annexes, list all regulations, or find specific compliance requirements.`;
  if (pathname.startsWith("/environmental-log"))
    return `In the **Environmental Logs** section — need help with bilge water, incinerator, or fuel changeover entries?`;
  if (pathname.startsWith("/dropdowns"))
    return `In the **Dropdowns** editor — need help configuring options or seeing current values?`;
  if (pathname.startsWith("/ai"))
    return `Welcome to the **AI Assistant**! How can I help you today?`;
  return `Hello! I'm Michail, your engineering assistant. Ask me anything about regulations, equipment or work logs — I'm here to help.`;
}

export default function AiFloatingWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: getWelcomeForRoute(pathname) }]);

  // Close panel and update welcome when route changes
  useEffect(() => {
    setOpen(false);
    setMessages([{ role: "assistant", text: getWelcomeForRoute(pathname) }]);
  }, [pathname]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinkingSteps, streamingText]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setThinkingSteps([]);
    setStreamingText("");
    setLoading(true);

    try {
      // Send conversation history so AI remembers context (skip the seed welcome message)
      const welcomeText = getWelcomeForRoute(pathname);
      const historyPayload = messages
        .filter((m) => !(m.role === "assistant" && m.text === welcomeText))
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: historyPayload }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "", replyText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line.startsWith("event: ")) continue;
          const eventType = line.slice(7).trim();
          const dataLine = lines[li + 1];
          if (!dataLine?.startsWith("data: ")) continue;
          const data = JSON.parse(dataLine.slice(6));

          switch (eventType) {
            case "step":
              setThinkingSteps((prev) => [...prev, data.text]);
              break;
            case "token":
              replyText += data.text;
              setStreamingText(replyText);
              break;
            case "usage":
              setTokenUsage(data);
              break;
            case "done":
              setMessages((prev) => [...prev, { role: "assistant", text: replyText }]);
              setStreamingText("");
              setThinkingSteps([]);
              break;
            case "error":
              throw new Error(data.message);
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message || "Failed."}` }]);
      setStreamingText("");
      setThinkingSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => setOpen((prev) => !prev);

  // Don't render on the full AI page
  if (pathname.startsWith("/ai")) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white shadow-lg hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="AI Assistant"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        )}
      </button>

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full sm:w-[360px] bg-[var(--clr-bg-card)] border-l border-[var(--clr-border)] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--clr-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--clr-bg-accent)] flex items-center justify-center text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
                <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--clr-text-primary)]">Michail — AI Assistant</h2>
              <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">Online · Ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/ai"
              className="text-[10px] font-mono text-[var(--clr-text-accent-gold)] hover:underline">
              Full Chat →
            </Link>
            <button onClick={toggle}
              className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition rounded-lg hover:bg-[var(--clr-bg-subtle)] cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <AiChatMessage key={i} role={msg.role} text={msg.text} />
          ))}
          <AiThinkingIndicator loading={loading} thinkingSteps={thinkingSteps} streamingText={streamingText} />
          <div ref={bottomRef} />
        </div>

        {/* Token Usage */}
        {tokenUsage && !loading && (
          <div className="shrink-0 px-4 py-1.5 border-t border-[var(--clr-border)]">
            <p className="text-[9px] font-mono text-[var(--clr-text-muted)] text-center">
              {tokenUsage.promptTokens} in · {tokenUsage.completionTokens} out · {tokenUsage.totalTokens} total tokens
            </p>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-[var(--clr-border)] px-4 py-3">
          <AiChatInput value={input} onChange={setInput} onSend={handleSend} disabled={loading} />
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] sm:bg-black/10 sm:backdrop-blur-none" onClick={toggle} />
      )}
    </>
  );
}
