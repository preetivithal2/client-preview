"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  role: "user" | "assistant";
  text: string;
}

export default function AiChatMessage({ role, text }: Props) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex items-start gap-3 ${!isAssistant ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
          isAssistant
            ? "bg-[var(--clr-bg-accent)] text-white"
            : "bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)] text-[var(--clr-text-secondary)]"
        }`}
      >
        {isAssistant ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" />
            <circle cx="17" cy="16" r="2.5" />
            <circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        ) : (
          "U"
        )}
      </div>

      {/* Bubble with Markdown Rendering */}
      <div
        className={`px-4 py-3 rounded-2xl leading-relaxed text-sm ${
          isAssistant
            ? "bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-tl-sm text-[var(--clr-text-primary)] max-w-[90%] sm:max-w-[85%] overflow-x-auto"
            : "bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)] rounded-tr-sm max-w-[75%] sm:max-w-[65%]"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-[var(--clr-border)] [&_th]:border [&_th]:border-[var(--clr-border)] [&_th]:bg-[var(--clr-bg-subtle)] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_td]:border [&_td]:border-[var(--clr-border)] [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-sm [&_code]:bg-[var(--clr-bg-subtle)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-[var(--clr-bg-subtle)] [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-sm [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-0 [&_p]:leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_strong]:font-bold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
}
