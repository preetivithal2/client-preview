"use client";

// CHIEF ENGINEER ORDERS — database-backed (Firestore)
import { useMemo, useState } from "react";
import { useCrewMembers } from "../../lib/hooks/useCrewMembers";
import { useDutyDefinitions } from "../../lib/hooks/useDutyDefinitions";
import { DutyDefinition, DutyFrequency } from "../../lib/types";
import type { OrderEdit } from "../../lib/firestore/duty.service";
import DutyEditModal from "./DutyEditModal";
import AlertDialog from "../common/AlertDialog";

const FREQUENCY_OPTIONS: { value: DutyFrequency; label: string }[] = [
  { value: "ONE_OFF", label: "One-off" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

function freqStyle(freq: DutyFrequency): string {
  switch (freq) {
    case "DAILY": return "bg-blue-100 text-blue-700 border-blue-200";
    case "WEEKLY": return "bg-purple-100 text-purple-700 border-purple-200";
    case "MONTHLY": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function DutyDispatchManager() {
  const { data: crew, loading: crewLoading } = useCrewMembers();
  const { data: orders, loading: ordersLoading, dispatch, update, remove } = useDutyDefinitions();

  const onBoard = useMemo(() => crew.filter((c) => c.onBoard), [crew]);
  const crewMap = useMemo(() => new Map(crew.map((c) => [c.id!, c])), [crew]);

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

  const activeCount = orders.filter((o) => o.status === "ACTIVE").length;

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
            Assign a duty to one or more crew. Each recipient receives an independent copy — nobody overwrites another's status.
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

      {/* ───────────── ORDERS LIST ───────────── */}
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Dispatched Orders</h3>
            <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] bg-[var(--clr-bg-muted)] px-2.5 py-1 rounded">
              {activeCount} active
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-[var(--clr-text-muted)] font-mono text-sm">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-[var(--clr-text-muted)] font-mono">No orders dispatched yet. Use the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--clr-bg-subtle)]">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Order</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Frequency</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Dispatched To</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Since</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Status</th>
                  <th className="text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clr-border)]">
                {orders.map((o) => {
                  const names = o.recipientIds.map((id) => crewMap.get(id)?.name).filter(Boolean) as string[];
                  return (
                    <tr key={o.id} className="hover:bg-[var(--clr-bg-card-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[var(--clr-text-primary)]">{o.title}</p>
                        {o.description && <p className="text-xs text-[var(--clr-text-muted)] max-w-[260px] truncate" title={o.description}>{o.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${freqStyle(o.frequency)}`}>
                          {FREQUENCY_OPTIONS.find((f) => f.value === o.frequency)?.label ?? o.frequency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {names.length > 0 ? names.map((name) => (
                            <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] border border-[var(--clr-border)]">
                              {name}
                            </span>
                          )) : (
                            <span className="text-xs text-[var(--clr-text-muted)]">{o.recipientIds.length} crew</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)]">{o.startDate}</td>
                      <td className="py-3 px-4">
                        {o.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">ARCHIVED</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditOrder(o)}
                            className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer" title="Edit order">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteOrder(o)}
                            className="p-1.5 text-[var(--clr-text-secondary)] hover:text-red-600 transition cursor-pointer" title="Delete order">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
