"use client";

interface Props {
  loading: boolean;
  thinkingSteps: string[];
  streamingText: string;
}

export default function AiThinkingIndicator({ loading, thinkingSteps, streamingText }: Props) {
  // Initial loading — shown immediately while waiting for first event
  if (loading && thinkingSteps.length === 0 && streamingText === "") {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--clr-bg-accent)] flex items-center justify-center text-white shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        </div>
        <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-2xl rounded-tl-sm px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--clr-bg-accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-[var(--clr-bg-accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-[var(--clr-bg-accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            {/* <span className="text-sm text-[var(--clr-text-muted)] ml-2 font-mono">AI is thinking…</span> */}
          </div>
        </div>
      </div>
    );
  }

  // Thinking steps — progress updates from the server
  if (thinkingSteps.length > 0) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--clr-bg-accent)] flex items-center justify-center text-white shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        </div>
        <div className="bg-[var(--clr-bg-subtle)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] space-y-1.5">
          {thinkingSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[var(--clr-text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--clr-bg-accent)] animate-pulse shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Streaming text — response is being written
  if (streamingText) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--clr-bg-accent)] flex items-center justify-center text-white shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        </div>
        <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] sm:max-w-[85%] leading-relaxed overflow-x-auto">
          <div className="prose prose-sm max-w-none dark:prose-invert text-sm text-[var(--clr-text-primary)]">
            <p className="whitespace-pre-wrap">{streamingText}</p>
          </div>
          <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--clr-text-primary)] animate-pulse rounded-sm align-text-bottom" />
        </div>
      </div>
    );
  }

  return null;
}
