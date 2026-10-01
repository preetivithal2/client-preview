"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getAllChats, deleteChat, updateChatTitle, getChatMessages, createChat, addChatMessage } from "../../lib/ai/chat-history";
import type { ChatEntry } from "../../lib/ai/chat-history";
import AiHeader from "../../components/ai/AiHeader";
import AiChatMessage from "../../components/ai/AiChatMessage";
import AiThinkingIndicator from "../../components/ai/AiThinkingIndicator";
import AiChatInput from "../../components/ai/AiChatInput";
import AiHistoryPanel from "../../components/ai/AiHistoryPanel";
import AlertDialog from "../../components/common/AlertDialog";

type Message = { role: "user" | "assistant"; text: string };

const WELCOME = `Hello! I'm your AI Assistant. Ask me anything about regulations, equipment or work logs — I'm here to help.`;

const SUGGESTIONS = [
  "I want to check records, How can AI assistant can help me?",
  "Show me recent work logs for Main Engine",
  "What is MARPOL Annex I?",
];

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<ChatEntry[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialog, setDialog] = useState<{ type: "alert" | "confirm"; title: string; message: string; onConfirm?: () => void } | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinkingSteps, streamingText]);

  useEffect(() => {
    (async () => {
      try { setSessions(await getAllChats()); }
      catch { /* ignore */ }
      finally { setInitialLoading(false); }
    })();
  }, []);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const msgs = await getChatMessages(sessionId);
      const formatted: Message[] = msgs.map((m) => ({ role: m.role, text: m.text }));
      setMessages(formatted.length > 0 ? formatted : [{ role: "assistant", text: WELCOME }]);
    } catch { setMessages([{ role: "assistant", text: WELCOME }]); }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setThinkingSteps([]);
    setStreamingText("");
    setLoading(true);

    try {
      // Ensure we have a real Firestore session before sending
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        try {
          currentSessionId = await createChat(userText.slice(0, 60));
          setActiveSessionId(currentSessionId);
          getAllChats().then(setSessions);
        } catch { /* Firestore save best-effort */ }
      }
      // Save user message to Firestore (client-side, authenticated)
      if (currentSessionId) {
        try { await addChatMessage(currentSessionId, "user", userText); } catch { /* best-effort */ }
      }

      // Send conversation history so AI remembers context (skip the seed welcome message)
      const historyPayload = messages
        .filter((m) => !(m.role === "assistant" && m.text === WELCOME))
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sessionId: currentSessionId, history: historyPayload }),
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
            case "session":
              if (!activeSessionId && data.sessionId) {
                setActiveSessionId(data.sessionId);
                getAllChats().then(setSessions);
              }
              break;
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
              // Save AI response to Firestore (client-side, authenticated)
              if (currentSessionId) {
                try { addChatMessage(currentSessionId, "assistant", replyText); } catch { /* best-effort */ }
                getAllChats().then(setSessions);
              }
              break;
            case "error":
              throw new Error(data.message);
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message || "Failed to get response."}` }]);
      setStreamingText("");
      setThinkingSteps([]);
    } finally { setLoading(false); }
  };

  const MAX_CHATS = 10;

  const handleNewChat = () => {
    if (sessions.length >= MAX_CHATS) {
      setDialog({ type: "alert", title: "Chat Limit Reached", message: `You have reached the maximum of ${MAX_CHATS} conversations. Please delete an old one to start a new chat.` });
      return;
    }
    setActiveSessionId(null);
    setMessages([{ role: "assistant", text: WELCOME }]);
    setThinkingSteps([]);
    setStreamingText("");
  };

  const handleSelectSession = async (session: ChatEntry) => {
    setActiveSessionId(session.id!);
    setThinkingSteps([]);
    setStreamingText("");
    await loadSessionMessages(session.id!);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Show confirmation dialog before deleting
    const session = sessions.find(s => s.id === id);
    setDialog({
      type: "confirm",
      title: "Delete Conversation?",
      message: `Are you sure you want to delete "${session?.title || "this conversation"}"? This cannot be undone.`,
      onConfirm: async () => {
        await deleteChat(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) handleNewChat();
      },
    });
  };

  const handleRenameSession = async (id: string) => {
    const newTitle = prompt("Rename conversation:");
    if (newTitle?.trim()) {
      await updateChatTitle(id, newTitle.trim());
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s)));
    }
  };

  const handleClearAllHistory = () => {
    setDialog({
      type: "confirm",
      title: "Delete All History?",
      message: "Are you sure you want to delete all chat conversations? This action cannot be undone.",
      onConfirm: async () => {
        for (const s of sessions) if (s.id) await deleteChat(s.id);
        setSessions([]);
        handleNewChat();
      },
    });
  };

  if (initialLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-[var(--clr-bg-page)] flex items-center justify-center animate-pulse">
        <div className="text-sm font-mono text-[var(--clr-text-muted)]">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--clr-bg-page)] flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <AiHeader
          title={activeSessionId ? sessions.find((s) => s.id === activeSessionId)?.title || "AI Marine Assistant" : "AI Marine Assistant"}
          onNewChat={handleNewChat}
          onToggleHistory={() => setHistoryOpen(!historyOpen)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
            {messages.map((msg, i) => (
              <AiChatMessage key={i} role={msg.role} text={msg.text} />
            ))}

            <AiThinkingIndicator loading={loading} thinkingSteps={thinkingSteps} streamingText={streamingText} />

            {messages.length === 1 && !loading && !streamingText && (
              <div className="pl-11">
                <p className="text-xs font-mono text-[var(--clr-text-muted)] mb-2 uppercase tracking-wider">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => setInput(s)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-[var(--clr-border)] bg-[var(--clr-bg-card)] hover:bg-[var(--clr-bg-subtle)] text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Token Usage */}
        {tokenUsage && !loading && (
          <div className="shrink-0 px-4 sm:px-6 py-1.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-card)]">
            <p className="text-[10px] font-mono text-[var(--clr-text-muted)] text-center">
              {tokenUsage.promptTokens} prompt tokens · {tokenUsage.completionTokens} completion tokens · {tokenUsage.totalTokens} total
            </p>
          </div>
        )}

        <AiChatInput value={input} onChange={setInput} onSend={handleSend} disabled={loading} />
      </div>

      <AiHistoryPanel
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
        onClearAll={handleClearAllHistory}
        onClose={() => setHistoryOpen(false)}
        open={historyOpen}
      />

      {dialog && (
        <AlertDialog
          open={true}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.type === "confirm" ? "Delete" : "OK"}
          onConfirm={dialog.onConfirm}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
