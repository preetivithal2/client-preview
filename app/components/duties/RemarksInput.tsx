"use client";

// Single-line remarks editor for the duties table.
//
// The stored value arrives as `initialValue` and lives in local state while the
// user types. Firestore is written only on blur or Enter — never per keystroke —
// so the table no longer re-renders (and the DB is no longer hit) on every
// character. Callers remount this component (via `key`) when the stored value
// changes externally, which resets the draft.

import { useRef, useState } from "react";

interface Props {
  initialValue: string;
  editable: boolean;
  onSave: (next: string) => void | Promise<void>;
}

export default function RemarksInput({ initialValue, editable, onSave }: Props) {
  const [draft, setDraft] = useState(initialValue);
  const saved = useRef(initialValue);

  const commit = () => {
    if (draft === saved.current) return;
    saved.current = draft;
    void onSave(draft);
  };

  return (
    <input
      type="text"
      value={draft}
      disabled={!editable}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur(); // blur triggers commit
        } else if (e.key === "Escape") {
          setDraft(saved.current);
          e.currentTarget.blur();
        }
      }}
      placeholder={editable ? "Log official verbal warning / disciplinary note…" : "—"}
      className={`block w-full min-w-0 px-3 py-1.5 rounded-lg text-xs border transition ${
        editable
          ? "bg-white border-red-200 text-red-900 placeholder:text-red-300 focus:ring-2 focus:ring-red-200 font-medium"
          : "bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] border-transparent cursor-not-allowed"
      }`}
    />
  );
}
