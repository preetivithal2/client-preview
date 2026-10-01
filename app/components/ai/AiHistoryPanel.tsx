"use client";

import type { ChatEntry } from "../../lib/ai/chat-history";

interface Props {
  sessions: ChatEntry[];
  activeSessionId: string | null;
  onSelect: (session: ChatEntry) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onRename: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  open: boolean;
}

export default function AiHistoryPanel({
  sessions, activeSessionId, onSelect, onDelete, onRename, onClearAll, onClose, open,
}: Props) {
  return (
    <>
      <div
        className={`${open ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 fixed lg:relative right-0 top-0 lg:top-auto z-30 w-72 sm:w-80 h-full bg-[var(--clr-bg-card)] border-l border-[var(--clr-border)] shadow-xl lg:shadow-none flex flex-col transition-transform duration-200 ease-in-out`}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-[var(--clr-border)]">
          <h2 className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Chat History</h2>
          <div className="flex items-center gap-1">
            {sessions.length > 0 && (
              <button onClick={onClearAll}
                className="p-1.5 text-[var(--clr-text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--clr-bg-subtle)] transition cursor-pointer" title="Clear all history">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
            <button onClick={onClose}
              className="p-1.5 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] rounded-lg hover:bg-[var(--clr-bg-subtle)] transition cursor-pointer lg:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="w-10 h-10 mx-auto text-[var(--clr-text-muted)] mb-3" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              <p className="text-sm text-[var(--clr-text-muted)]">No chat history yet</p>
              <p className="text-xs text-[var(--clr-text-muted)] mt-1">Start a conversation above</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button key={session.id} onClick={() => onSelect(session)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition cursor-pointer group ${
                  activeSessionId === session.id
                    ? "bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]"
                    : "hover:bg-[var(--clr-bg-subtle)] border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--clr-text-primary)] truncate">{session.title}</p>
                    <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-1 opacity-60">
                      {session.updatedAt?.toDate?.()?.toLocaleDateString() || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onRename(session.id!); }}
                      className="p-1 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] rounded-md hover:bg-[var(--clr-bg-card)] transition cursor-pointer" title="Rename">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </button>
                    <button onClick={(e) => onDelete(e, session.id!)}
                      className="p-1 text-[var(--clr-text-muted)] hover:text-red-500 rounded-md hover:bg-[var(--clr-bg-card)] transition cursor-pointer" title="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--clr-border)] px-4 py-3">
          <p className="text-[10px] font-mono text-[var(--clr-text-muted)] text-center">
            {sessions.length}/10 conversations
          </p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={onClose} />
      )}
    </>
  );
}
