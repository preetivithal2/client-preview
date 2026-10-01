"use client";

// Edit an existing Chief Engineer Order — title, frequency, recipients, status.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CrewMember, DutyDefinition, DutyFrequency } from "../../lib/types";
import type { OrderEdit } from "../../lib/firestore/duty.service";

const FREQUENCY_OPTIONS: { value: DutyFrequency; label: string }[] = [
  { value: "ONE_OFF", label: "One-off" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

interface Props {
  order: DutyDefinition;
  crew: CrewMember[];
  onClose: () => void;
  onSave: (edit: OrderEdit) => Promise<boolean>;
}

export default function DutyEditModal({ order, crew, onClose, onSave }: Props) {
  const [title, setTitle] = useState(order.title);
  const [description, setDescription] = useState(order.description || "");
  const [frequency, setFrequency] = useState<DutyFrequency>(order.frequency);
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED">(order.status || "ACTIVE");
  const [selected, setSelected] = useState<Set<string>>(new Set(order.recipientIds || []));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Recipients: on-board crew, plus anyone already assigned (even if signed off)
  const selectable = useMemo(
    () => crew.filter((c) => c.onBoard || (order.recipientIds || []).includes(c.id!)),
    [crew, order.recipientIds]
  );

  const allSelected = selectable.length > 0 && selectable.every((c) => selected.has(c.id!));

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(selectable.map((c) => c.id!)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Portal target only exists in the browser.
  useEffect(() => { setMounted(true); }, []);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter an order name."); return; }
    if (selected.size === 0) { setError("Select at least one crew member."); return; }

    setSaving(true);
    const ok = await onSave({
      title: title.trim(),
      description: description.trim(),
      frequency,
      recipientIds: Array.from(selected),
      status,
    });
    setSaving(false);
    if (ok) onClose();
    else setError("Failed to save. Please try again.");
  };

  if (!mounted) return null;

  // Rendered into document.body so the overlay is positioned against the
  // VIEWPORT — never against a transformed/animated ancestor. Guarantees the
  // modal is centred on screen instantly, regardless of scroll position.
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[var(--clr-border)]">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--clr-bg-card)] backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--clr-text-primary)]">Edit Order</h3>
            <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-0.5">Update the order details, frequency, recipients or status.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition cursor-pointer" title="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
                Order Name <span className="text-[var(--clr-text-muted)]">*</span>
              </label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (error) setError(""); }}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as DutyFrequency)}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition">
                {FREQUENCY_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
              Description / Guidelines
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition" />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">
                Dispatched To <span className="text-[var(--clr-text-muted)]">*</span>
                <span className="ml-2 normal-case font-sans text-xs text-[var(--clr-text-secondary)]">({selected.size} selected)</span>
              </label>
              {selectable.length > 0 && (
                <button type="button" onClick={toggleAll}
                  className="px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer border text-white bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)]">
                  {allSelected ? "Clear All" : "Select All"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectable.map((c) => {
                const checked = selected.has(c.id!);
                return (
                  <label key={c.id}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition select-none ${
                      checked ? "border-[var(--clr-bg-accent)] bg-[var(--clr-bg-accent)]/5" : "border-[var(--clr-border)] bg-[var(--clr-bg-input)] hover:border-[var(--clr-ring)]"
                    }`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(c.id!)} className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--clr-text-primary)] truncate">{c.name}</span>
                      <span className="block text-[10px] font-mono text-[var(--clr-text-muted)] truncate">
                        {c.rank}{!c.onBoard ? " · signed off" : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="max-w-xs">
            <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "ARCHIVED")}
              className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition">
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {error && <p className="text-xs font-medium text-[var(--clr-text-red)]">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--clr-border)]">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
