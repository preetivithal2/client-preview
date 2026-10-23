"use client";

// CHIEF ENGINEER ORDERS — database-backed (Firestore)
import { useMemo, useState } from "react";
import { useCrewMembers } from "../../lib/hooks/useCrewMembers";
import { useDutyDefinitions } from "../../lib/hooks/useDutyDefinitions";
import { DutyDefinition, DutyFrequency } from "../../lib/types";
import type { OrderEdit } from "../../lib/firestore/duty.service";
import DutyEditModal from "./DutyEditModal";
import DispatchedOrdersList from "./DispatchedOrdersList";
import AlertDialog from "../common/AlertDialog";

const FREQUENCY_OPTIONS: { value: DutyFrequency; label: string }[] = [
  { value: "ONE_OFF", label: "One-off" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export default function DutyDispatchManager() {
  const { data: crew, loading: crewLoading } = useCrewMembers();
  const { data: orders, loading: ordersLoading, dispatch, update, remove } = useDutyDefinitions();

  const onBoard = useMemo(() => crew.filter((c) => c.onBoard), [crew]);

  // Dispatch form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<DutyFrequency>("ONE_OFF");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState("");
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Edit / delete an existing order
  const [editOrder, setEditOrder] = useState<DutyDefinition | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<DutyDefinition | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const allSelected = onBoard.length > 0 && onBoard.every((c) => selected.has(c.id!));
  const selectedCount = selected.size;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(onBoard.map((c) => c.id!)));
    if (dispatchMsg) setDispatchMsg(null);
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (dispatchMsg) setDispatchMsg(null);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setFormError("Please enter a task title."); return; }
    if (selected.size === 0) { setFormError("Select at least one crew member to dispatch to."); return; }
    setFormError("");
    setSending(true);

    const recipients = onBoard.filter((c) => selected.has(c.id!));
    const defId = await dispatch({
      title: title.trim(),
      description: description.trim(),
      frequency,
      recipientIds: recipients.map((c) => c.id!),
      crew: recipients.map((c) => ({ id: c.id!, name: c.name, rank: c.rank })),
    });
    setSending(false);

    if (defId) {
      setDispatchMsg(`Dispatched "${title.trim()}" to ${recipients.length} crew member${recipients.length > 1 ? "s" : ""} — each received an independent copy.`);
      setTitle(""); setDescription(""); setFrequency("ONE_OFF"); setSelected(new Set());
    } else {
      setFormError("Dispatch failed. Check permissions and retry.");
    }
  };

  /** Save edits to an order, creating clones for any newly added recipients. */
  const handleSaveEdit = async (edit: OrderEdit): Promise<boolean> => {
    if (!editOrder?.id) return false;
    const original = new Set(editOrder.recipientIds || []);
    const addedCrew = crew
      .filter((c) => edit.recipientIds.includes(c.id!) && !original.has(c.id!))
      .map((c) => ({ id: c.id!, name: c.name, rank: c.rank }));
    const ok = await update(editOrder.id, edit, addedCrew);
    if (ok) setNotice(`Order updated${addedCrew.length ? ` — ${addedCrew.length} new crew member${addedCrew.length > 1 ? "s" : ""} added` : ""}.`);
    return ok;
  };

  /** Delete an order and all of its per-crew entries. */
  const confirmDelete = async () => {
    if (!deleteOrder?.id) return;
    const title = deleteOrder.title;
    const ok = await remove(deleteOrder.id);
    if (ok) setNotice(`Deleted "${title}" and all of its crew entries.`);
    else setFormError("Failed to delete the order. Please try again.");
    setDeleteOrder(null);
  };

  const isLoading = crewLoading || ordersLoading;

  return (
    <div className="space-y-6 animate-fadeIn">
      {dispatchMsg && (
        <div className="p-3 bg-green-100 border border-green-200 text-green-800 text-sm font-medium rounded-xl flex items-center gap-2">
          <span>✓</span> {dispatchMsg}
        </div>
      )}

      {notice && (
        <div className="p-3 bg-green-100 border border-green-200 text-green-800 text-sm font-medium rounded-xl flex items-center justify-between gap-2">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice(null)} className="text-green-700 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* ───────────── DISPATCH FORM ───────────── */}
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--clr-border)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Dispatch New Order</h3>
          <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-0.5">
            Assign a duty to one or more crew. Each recipient receives an independent copy — nobody overwrites another&apos;s status.
            {frequency !== "ONE_OFF" && " Recurring orders auto-create each due entry as the date arrives."}
          </p>
        </div>

        <form onSubmit={handleDispatch} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
                Task Title <span className="text-[var(--clr-text-muted)]">*</span>
              </label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (formError) setFormError(""); }}
                placeholder="e.g. Morning Meeting / HELMET / Filter Cleaning"
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition placeholder:text-[var(--clr-text-muted)]" />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
                Frequency
              </label>
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
              placeholder="e.g. Mandatory attendance at 08:00 for Tool Box Talk."
              className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition placeholder:text-[var(--clr-text-muted)]" />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">
                Recipients <span className="text-[var(--clr-text-muted)]">*</span>
                <span className="ml-2 normal-case font-sans text-xs text-[var(--clr-text-secondary)]">
                  ({selectedCount} of {onBoard.length} on board selected)
                </span>
              </label>
              {onBoard.length > 0 && (
                <button type="button" onClick={toggleAll}
                  className="px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer border text-white bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)]">
                  {allSelected ? "Clear All" : "Select All"}
                </button>
              )}
            </div>

            {onBoard.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-[var(--clr-border)] text-sm text-[var(--clr-text-muted)]">
                No crew on board yet — add them under <span className="font-bold">Engine Room Duties ▸ Crew Roster</span> first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {onBoard.map((c) => {
                  const checked = selected.has(c.id!);
                  return (
                    <label key={c.id}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition select-none ${
                        checked ? "border-[var(--clr-bg-accent)] bg-[var(--clr-bg-accent)]/5" : "border-[var(--clr-border)] bg-[var(--clr-bg-input)] hover:border-[var(--clr-ring)]"
                      }`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleOne(c.id!)} className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer" />
                      <span className="w-8 h-8 rounded-full bg-[var(--clr-bg-muted)] border border-[var(--clr-border)] flex items-center justify-center text-xs font-bold text-[var(--clr-text-primary)] shrink-0">
                        {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--clr-text-primary)] truncate">{c.name}</span>
                        <span className="block text-[10px] font-mono text-[var(--clr-text-muted)] truncate">{c.rank}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {formError && <p className="text-xs font-medium text-[var(--clr-text-red)]">{formError}</p>}

          <div className="flex justify-end pt-2 border-t border-[var(--clr-border)]">
            <button type="submit" disabled={sending || onBoard.length === 0}
              className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {sending ? "Dispatching…" : `Dispatch to ${selectedCount > 0 ? `${selectedCount} Crew Member${selectedCount > 1 ? "s" : ""}` : "Crew"}`}
            </button>
          </div>
        </form>
      </div>

      {/* ───────────── ORDERS LIST (filters + print) ───────────── */}
      <DispatchedOrdersList
        orders={orders}
        crew={crew}
        loading={isLoading}
        onEdit={setEditOrder}
        onDelete={setDeleteOrder}
      />

      {/* Edit order modal */}
      {editOrder && (
        <DutyEditModal
          order={editOrder}
          crew={crew}
          onClose={() => setEditOrder(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete confirmation */}
      {deleteOrder && (
        <AlertDialog
          open={true}
          type="confirm"
          title="Delete Order?"
          message={`Delete "${deleteOrder.title}" and all of its crew entries? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onClose={() => setDeleteOrder(null)}
        />
      )}
    </div>
  );
}
