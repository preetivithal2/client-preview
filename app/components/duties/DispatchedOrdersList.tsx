"use client";

// DISPATCHED ORDERS LIST — the filterable, printable register of orders the
// Chief Engineer has already dispatched.
//
// Filtering is fully controlled and instant (no submit step): the title search
// and the crew-member dropdown are AND-combined, and the print button at the
// bottom of the controls hands ONLY the visible rows to OrdersPrint. The
// dispatch form, edit modal and delete confirmation stay in DutyDispatchManager;
// this component only owns the list, its filters and the print job.

import { useMemo, useState } from "react";
import { CrewMember, DutyDefinition, DutyFrequency } from "../../lib/types";
import OrdersPrint from "./OrdersPrint";

interface Props {
  orders: DutyDefinition[];
  crew: CrewMember[];
  loading: boolean;
  onEdit: (order: DutyDefinition) => void;
  onDelete: (order: DutyDefinition) => void;
}

const FREQ_LABEL = (f: DutyFrequency): string =>
  f === "DAILY" ? "Daily" : f === "WEEKLY" ? "Weekly" : f === "MONTHLY" ? "Monthly" : "One-off";

const freqStyle = (freq: DutyFrequency): string => {
  switch (freq) {
    case "DAILY": return "bg-blue-100 text-blue-700 border-blue-200";
    case "WEEKLY": return "bg-purple-100 text-purple-700 border-purple-200";
    case "MONTHLY": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

/** YYYY-MM-DD → "07 Oct 2026". Parsed as UTC so the date never shifts. */
const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DispatchedOrdersList({ orders, crew, loading, onEdit, onDelete }: Props) {
  // Filters — one selection + one search term, combined with AND.
  const [crewMemberId, setCrewMemberId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [printing, setPrinting] = useState(false);

  const crewMap = useMemo(() => new Map(crew.map((c) => [c.id!, c])), [crew]);

  // Only crew who are actually recipients of an order can narrow the list to
  // something non-empty; unknown/removed crew still render as "Unknown" below.
  const crewOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const o of orders) for (const id of o.recipientIds ?? []) ids.add(id);
    return crew
      .filter((c) => c.id && ids.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders, crew]);

  const visible = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return orders.filter((o) => {
      if (crewMemberId && !(o.recipientIds ?? []).includes(crewMemberId)) return false;
      if (q && !o.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, crewMemberId, keyword]);

  const applied = crewMemberId !== "" || keyword.trim() !== "";
  const activeCount = orders.filter((o) => o.status === "ACTIVE").length;

  const crewName = (id: string): string => crewMap.get(id)?.name ?? "Unknown crew";

  const filterSummary = useMemo(() => {
    const out: string[] = [];
    if (crewMemberId) out.push(`Orders for: ${crewName(crewMemberId).toUpperCase()}`);
    if (keyword.trim()) out.push(`Title contains "${keyword.trim()}"`);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewMemberId, keyword, crewMap]);

  const clearFilters = () => {
    setCrewMemberId("");
    setKeyword("");
  };

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--clr-border)] space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Dispatched Orders</h3>
            <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] bg-[var(--clr-bg-muted)] px-2.5 py-1 rounded">
              {activeCount} active
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPrinting(true)}
            disabled={loading || visible.length === 0}
            title="Print the currently visible orders"
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--clr-border)] bg-[var(--clr-bg-subtle)] text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            🖨 Print Orders
          </button>
        </div>

        {/* Filters — every change updates the list immediately. */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="order-title-search" className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
              Search by Task Title
            </label>
            <input
              id="order-title-search"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search task title…"
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-xl bg-[var(--clr-bg-input)] text-sm text-[var(--clr-text-primary)] placeholder:text-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
            />
          </div>

          <div className="sm:w-64">
            <label htmlFor="order-crew-filter" className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
              Filter by Crew Member
            </label>
            <select
              id="order-crew-filter"
              value={crewMemberId}
              onChange={(e) => setCrewMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--clr-border)] rounded-xl bg-[var(--clr-bg-input)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer"
            >
              <option value="">All crew members</option>
              {crewOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!applied}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold border border-[var(--clr-border)] bg-[var(--clr-bg-subtle)] text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            Clear Filter
          </button>
        </div>

        <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">
          {visible.length} of {orders.length} order{orders.length === 1 ? "" : "s"} shown
          {applied && " — filtered"}
        </p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-[var(--clr-text-muted)] font-mono text-sm">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="py-14 text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm text-[var(--clr-text-muted)] font-mono">No orders dispatched yet. Use the form above.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-14 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm text-[var(--clr-text-primary)] font-bold">No orders match these filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-sm font-bold text-[var(--clr-text-accent-gold)] hover:underline cursor-pointer"
          >
            Clear filters to see all orders →
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--clr-bg-subtle)]">
              <tr>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Date</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Order</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Frequency</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Assigned To</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Status</th>
                <th className="text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clr-border)]">
              {visible.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--clr-bg-card-hover)] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)] whitespace-nowrap">{formatDate(o.startDate)}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[var(--clr-text-primary)]">{o.title}</p>
                    {o.description && (
                      <p className="text-xs text-[var(--clr-text-muted)] max-w-[260px] truncate" title={o.description}>{o.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${freqStyle(o.frequency)}`}>
                      {FREQ_LABEL(o.frequency)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(o.recipientIds ?? []).length > 0 ? (o.recipientIds ?? []).map((id) => (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] border border-[var(--clr-border)]">
                          {crewName(id)}
                        </span>
                      )) : (
                        <span className="text-xs text-[var(--clr-text-muted)]">No crew assigned</span>
                      )}
                    </div>
                  </td>
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
                      <button onClick={() => onEdit(o)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer" title="Edit order">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(o)}
                        className="p-1.5 text-[var(--clr-text-secondary)] hover:text-red-600 transition cursor-pointer" title="Delete order">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Print document — mounting it triggers the browser print dialog and it
          receives only the rows currently visible under the filters. */}
      {printing && (
        <OrdersPrint
          orders={visible}
          crew={crew}
          filterSummary={filterSummary}
          onClose={() => setPrinting(false)}
        />
      )}
    </div>
  );
}
