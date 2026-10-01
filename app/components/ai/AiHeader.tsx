"use client";

interface Props {
  title: string;
  onNewChat: () => void;
  onToggleHistory: () => void;
}

export default function AiHeader({ title, onNewChat, onToggleHistory }: Props) {
  return (
    <div className="shrink-0 bg-[var(--clr-bg-card)] border-b border-[var(--clr-border)] px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--clr-bg-accent)] flex items-center justify-center text-white shadow-sm shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" /><circle cx="17" cy="16" r="2.5" /><circle cx="7" cy="16" r="2.5" />
            <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-[var(--clr-text-primary)] truncate">{title}</h1>
          <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">Your AI marine engineering assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-ring)] rounded-lg transition cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
        <button onClick={onToggleHistory}
          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-subtle)] rounded-lg transition cursor-pointer lg:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
