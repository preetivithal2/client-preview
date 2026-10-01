"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function AiChatInput({ value, onChange, onSend, disabled }: Props) {
  return (
    <div className="shrink-0 bg-[var(--clr-bg-card)] border-t border-[var(--clr-border)] px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-[var(--clr-bg-subtle)] rounded-xl border border-[var(--clr-border)] px-4 py-2.5 focus-within:ring-2 focus-within:ring-[var(--clr-ring)] focus-within:border-[var(--clr-ring-solid)] transition">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm text-[var(--clr-text-primary)] placeholder-[var(--clr-text-muted)] outline-none"
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="p-2 text-white bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] rounded-lg transition shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-center text-[var(--clr-text-muted)] font-mono">
          AI responses are generated for assistance and can be wrong - Verify critical information
        </p>
      </div>
    </div>
  );
}
