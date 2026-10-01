"use client";

// CREW ROSTER MANAGER — database-backed (Firestore "crewMembers")
import { useMemo, useState } from "react";
import { useCrewMembers } from "../../lib/hooks/useCrewMembers";
import { useAllDropdowns } from "../../lib/hooks/useAllDropdowns";
import { CrewMember } from "../../lib/types";
import AlertDialog from "../common/AlertDialog";

// Fallback rank list (only used if the Reported-By dropdown has not been seeded yet)
const FALLBACK_RANKS = [
  "Chief Engineer", "1st Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer",
  "Electrical Engineer", "Electro-Technical Officer", "Oiler", "Motorman", "Fitter", "Wiper", "Cadet",
];

export default function CrewRosterManager() {
  const { data: crew, loading, error: loadError, refetch, add, update, remove } = useCrewMembers();
  const { getOptions } = useAllDropdowns();

  // Rank options come from the Reported-By ranks already in the database.
  const dbRanks = useMemo(() => getOptions("reportedBy"), [getOptions]);
  const rankOptions = useMemo(() => {
    const set = new Set<string>();
    [...dbRanks, ...(crew?.map((c) => c.rank) ?? [])].forEach((r) => r && set.add(r));
    const list = Array.from(set);
    return list.length > 0 ? list : FALLBACK_RANKS;
  }, [dbRanks, crew]);

  // Add / Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [onBoard, setOnBoard] = useState(true);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [dialog, setDialog] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const onboardCount = crew?.filter((c) => c.onBoard).length ?? 0;

  const resetForm = () => { setEditingId(null); setName(""); setRank(""); setOnBoard(true); setFormError(""); };

  const startEdit = (c: CrewMember) => {
    setEditingId(c.id ?? null);
    setName(c.name);
    setRank(c.rank || "");
    setOnBoard(c.onBoard);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError("Please enter the crew member's full name."); return; }
    if (!rank) { setFormError("Please select a rank."); return; }

    setSaving(true);
    setFormError("");
    if (editingId) {
      const ok = await update(editingId, { name: name.trim(), rank, onBoard });
      setSaving(false);
      if (ok) { resetForm(); } else { setFormError("Failed to update. Please try again."); }
    } else {
      const id = await add({ name: name.trim(), rank, onBoard, department: "Engine Room" });
      setSaving(false);
      if (id) { resetForm(); } else { setFormError("Failed to add. Please try again."); }
    }
  };

  const requestDelete = (c: CrewMember) => {
    setDialog({
      title: "Remove Crew Member?",
      message: `Remove ${c.name} (${c.rank}) from the roster? This cannot be undone.`,
      onConfirm: async () => { await remove(c.id!); },
    });
  };

  /** Use the crew/rank names already stored in the Reported-By dropdown. */
  const importFromReportedBy = async () => {
    if (!dbRanks.length) return;
    const existing = new Set((crew ?? []).map((c) => c.name.trim().toLowerCase()));
    const fresh = dbRanks.filter((r) => !existing.has(r.trim().toLowerCase()));
    if (fresh.length === 0) { setNotice("Already up to date — every Reported-By entry is on the roster."); return; }
    let ok = 0;
    for (const r of fresh) {
      const id = await add({ name: r.trim(), rank: r.trim(), onBoard: true, department: "Engine Room" });
      if (id) ok++;
    }
    setNotice(`Imported ${ok} crew member${ok > 1 ? "s" : ""} from the Reported-By list.`);
    if (!ok) setFormError("Import failed. Check permissions and retry.");
  };

  if (loading && crew.length === 0) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] p-10 animate-pulse">
        <div className="h-6 w-48 bg-[var(--clr-border)] rounded mb-4" />
        <div className="h-24 bg-[var(--clr-border)] rounded-xl mb-3" />
        <div className="h-64 bg-[var(--clr-border)] rounded-xl" />
      </div>
    );
  }

  if (loadError && crew.length === 0) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] p-6 text-sm text-[var(--clr-text-red)]">
        Failed to load crew roster. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {notice && (
        <div className="p-3 bg-green-100 border border-green-200 text-green-800 text-sm font-medium rounded-xl flex items-center justify-between gap-2">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice(null)} className="text-green-700 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* ───────────── ADD / EDIT FORM ───────────── */}
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">
              {editingId ? "Edit Crew Member" : "Add Crew Member"}
            </h3>
            <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-0.5">
              {editingId ? "Update the details below." : "Register an engine-room crew member on board."}
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="px-3 py-1.5 text-xs font-semibold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] rounded-lg transition cursor-pointer">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
                Full Name <span className="text-[var(--clr-text-muted)]">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (formError) setFormError(""); }}
                placeholder="e.g. Petros Karalis"
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition placeholder:text-[var(--clr-text-muted)]" />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1.5">
                Rank <span className="text-[var(--clr-text-muted)]">*</span>
              </label>
              <select value={rank} onChange={(e) => { setRank(e.target.value); if (formError) setFormError(""); }}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-input)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition">
                <option value="">Select Rank</option>
                {rankOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none pb-2">
                <input type="checkbox" checked={onBoard} onChange={(e) => setOnBoard(e.target.checked)}
                  className="w-4 h-4 accent-[var(--clr-bg-accent)] rounded cursor-pointer" />
                <span className="text-sm font-medium text-[var(--clr-text-primary)]">Currently On Board</span>
              </label>
            </div>
          </div>

          {formError && <p className="mt-3 text-xs font-medium text-[var(--clr-text-red)]">{formError}</p>}

          <div className="mt-5 pt-4 border-t border-[var(--clr-border)] flex items-center justify-between gap-3 flex-wrap">
            <button type="button" onClick={importFromReportedBy}
              className="text-xs font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-dashed border-[var(--clr-border)] px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
              ⬇ Use existing crew names from the Reported-By list
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              {saving ? "Saving…" : editingId ? "Update Member" : "Add Crew Member"}
            </button>
          </div>
        </form>
      </div>

      {/* ───────────── CREW TABLE ───────────── */}
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--clr-border)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Crew Roster</h3>
            <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] bg-[var(--clr-bg-muted)] px-2.5 py-1 rounded">
              {crew.length} total
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> {onboardCount} on board
            </span>
          </div>
        </div>

        {crew.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-[var(--clr-text-muted)] font-mono mb-3">No crew members yet. Add one above.</p>
            {dbRanks.length > 0 && (
              <button onClick={importFromReportedBy}
                className="px-4 py-2 text-xs font-bold text-white bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] rounded-xl transition cursor-pointer">
                Import {dbRanks.length} from Reported-By list
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--clr-bg-subtle)]">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest w-12">#</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Name</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Rank</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Joined</th>
                  <th className="text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Status</th>
                  <th className="text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clr-border)]">
                {crew.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-[var(--clr-bg-card-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-muted)]">{crew.length - idx}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--clr-bg-accent)]/10 border border-[var(--clr-border)] flex items-center justify-center text-sm font-bold text-[var(--clr-text-primary)] shrink-0">
                          {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <span className="font-semibold text-[var(--clr-text-primary)]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--clr-bg-muted)] text-[var(--clr-text-primary)] border border-[var(--clr-border)]">
                        {c.rank || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)]">
                      {c.joinedDate || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {c.onBoard ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> ON BOARD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> SIGNED OFF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(c)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 transition cursor-pointer" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => requestDelete(c)}
                          className="p-1.5 text-[var(--clr-text-secondary)] hover:text-red-600 transition cursor-pointer" title="Remove">
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
      </div>

      {/* Delete confirmation */}
      {dialog && (
        <AlertDialog open={true} type="confirm" title={dialog.title} message={dialog.message}
          confirmLabel="Remove" onConfirm={dialog.onConfirm} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
