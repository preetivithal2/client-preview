"use client";

// CREW PERFORMANCE CARDS — database-backed (Firestore)
import { useEffect, useMemo, useRef, useState } from "react";
import { useCrewMembers } from "../../lib/hooks/useCrewMembers";
import { useCrewTasks } from "../../lib/hooks/useCrewTasks";
import { useAllCrewTasks } from "../../lib/hooks/useAllCrewTasks";
import { useDutyDefinitions } from "../../lib/hooks/useDutyDefinitions";
import { CrewMember, DutyTask } from "../../lib/types";
import CrewListFilters, {
  CrewFilterState,
  EMPTY_CREW_FILTERS,
  RatingLabel,
  isFiltered,
} from "./CrewListFilters";
import CrewPerformancePrint, { CrewPrintMember } from "./CrewPerformancePrint";

type TierKey = "VERY GOOD" | "GOOD" | "SATISFACTORY" | "POOR";
type PeriodKey = "MONTH" | "7D" | "30D" | "ALL";

const TIERS: { key: TierKey; dot: string; badge: string; label: string }[] = [
  { key: "VERY GOOD", dot: "bg-green-500", badge: "bg-green-100 text-green-700 border-green-200", label: "VERY GOOD" },
  { key: "GOOD", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700 border-blue-200", label: "GOOD" },
  { key: "SATISFACTORY", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200", label: "SATISFACTORY" },
  { key: "POOR", dot: "bg-red-500", badge: "bg-red-100 text-red-700 border-red-200", label: "POOR" },
];
const tierMeta = (k: TierKey) => TIERS.find((t) => t.key === k)!;

const PERIODS: { key: PeriodKey; label: string; days: number | null }[] = [
  { key: "MONTH", label: "This month", days: null },
  { key: "7D", label: "Last 7 days", days: 7 },
  { key: "30D", label: "Last 30 days", days: 30 },
  { key: "ALL", label: "All", days: 0 },
];

function tierOf(pct: number, unexc: number): TierKey {
  if (pct < 50 || unexc >= 2) return "POOR";
  if (pct >= 90 && unexc === 0) return "VERY GOOD";
  if (pct >= 75) return "GOOD";
  return "SATISFACTORY";
}
const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

/** Lower bound (inclusive) for a period tab — shared by the card and the filters. */
function periodCutoff(period: PeriodKey): string {
  if (period === "ALL") return "0000-01-01";
  if (period === "7D" || period === "30D") {
    const d = new Date();
    d.setDate(d.getDate() - PERIODS.find((p) => p.key === period)!.days!);
    return d.toISOString().slice(0, 10);
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

interface CrewStats {
  rating: RatingLabel;
  pct: number;
  total: number;
  yes: number;
  excused: number;
  unexcused: number;
  rows: DutyTask[];
}

/** One member's period totals, using the same maths as the KPI badge.
 *  The reported rating is the EFFECTIVE tier — a manual kpiOverride wins, exactly
 *  as the badge renders it — so filtering by a label always matches what is shown. */
function crewStatsOf(tasks: DutyTask[], cutoff: string, override: string | null): CrewStats {
  const rows = tasks.filter((t) => t.dueDate >= cutoff);
  const answered = rows.filter((r) => r.completed === "YES" || r.completed === "NO");
  const yes = rows.filter((r) => r.completed === "YES").length;
  const excused = rows.filter((r) => r.justification === "EXCUSED").length;
  const unexcused = rows.filter((r) => r.justification === "UNEXCUSED").length;
  const pct = answered.length > 0 ? Math.round((yes / answered.length) * 100) : 0;
  const autoTier = tierOf(pct, unexcused);
  const rating = ((override as TierKey | null) ?? autoTier) as RatingLabel;
  return { rating, pct, total: rows.length, yes, excused, unexcused, rows };
}

export default function CrewPerformanceManager() {
  const { data: crew, refetch: crewRefetch, update: updateCrew } = useCrewMembers();
  const { data: definitions, ensureRecurring } = useDutyDefinitions();

  const onBoard = useMemo(() => crew.filter((c) => c.onBoard), [crew]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("MONTH");
  const [filters, setFilters] = useState<CrewFilterState>(EMPTY_CREW_FILTERS);
  const [printJob, setPrintJob] = useState<CrewPrintMember[] | null>(null);

  // All crew's tasks — the left list rates and filters every member, not just
  // the selected one. The right card still uses useCrewTasks for its editing.
  const allTasks = useAllCrewTasks();
  const cutoff = useMemo(() => periodCutoff(period), [period]);

  const tasksByCrew = useMemo(() => {
    const map = new Map<string, DutyTask[]>();
    for (const t of allTasks.data) {
      const list = map.get(t.crewMemberId);
      if (list) list.push(t);
      else map.set(t.crewMemberId, [t]);
    }
    return map;
  }, [allTasks.data]);

  const statsById = useMemo(() => {
    const map = new Map<string, CrewStats>();
    for (const c of onBoard) {
      if (c.id) map.set(c.id, crewStatsOf(tasksByCrew.get(c.id) ?? [], cutoff, c.kpiOverride ?? null));
    }
    return map;
  }, [onBoard, tasksByCrew, cutoff]);

  const orderOptions = useMemo(
    () => definitions.filter((d) => d.status === "ACTIVE").map((d) => ({ id: d.id!, title: d.title })),
    [definitions]
  );
  const rankOptions = useMemo(
    () => Array.from(new Set(onBoard.map((c) => c.rank).filter(Boolean))).sort(),
    [onBoard]
  );
  const crewOptions = useMemo(
    () => onBoard.filter((c) => c.id).map((c) => ({ id: c.id!, name: c.name, rank: c.rank })),
    [onBoard]
  );

  // All six filters, AND-combined.
  const visible = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    const order = filters.orderId ? definitions.find((d) => d.id === filters.orderId) : null;
    return onBoard.filter((c) => {
      if (kw && !c.name.toLowerCase().includes(kw)) return false;
      if (filters.rank && c.rank !== filters.rank) return false;
      if (filters.rating && statsById.get(c.id!)?.rating !== filters.rating) return false;
      if (filters.crewMemberId && c.id !== filters.crewMemberId) return false;
      if (order && !(order.recipientIds ?? []).includes(c.id!)) return false;
      return true;
    });
  }, [onBoard, filters, statsById, definitions]);

  // Keep a valid selection: when the selected member is filtered out, fall to
  // the first visible one.
  useEffect(() => {
    if (visible.length && (!selectedId || !visible.some((c) => c.id === selectedId))) {
      setSelectedId(visible[0].id!);
    }
  }, [visible, selectedId]);

  // A filter combination that matches nobody: the dropdowns keep their values,
  // the left panel offers a way back, and the card shows a placeholder instead
  // of the previously selected member. Suppressed while the tasks are loading,
  // when every rating still reads as POOR.
  const noMatches = !allTasks.loading && onBoard.length > 0 && visible.length === 0 && isFiltered(filters);

  // Materialize due recurring clones once on mount, then reload roster+tasks.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      await ensureRecurring();
      await crewRefetch();
    })();
  }, [ensureRecurring, crewRefetch]);

  const tasks = useCrewTasks(selectedId);
  const selectedCrew = onBoard.find((c) => c.id === selectedId) ?? null;

  // Period filter
  const rows: DutyTask[] = useMemo(
    () => tasks.data.filter((t) => t.dueDate >= cutoff),
    [tasks.data, cutoff]
  );

  const periodLabel = PERIODS.find((p) => p.key === period)!.label;
  const nameOf = (id: string) => onBoard.find((c) => c.id === id)?.name ?? "—";

  const filterSummary = useMemo(() => {
    const out: string[] = [];
    if (filters.keyword.trim()) out.push(`Name contains "${filters.keyword.trim()}"`);
    if (filters.rank) out.push(`Role: ${filters.rank}`);
    if (filters.rating) out.push(`Rating: ${filters.rating}`);
    if (filters.crewMemberId) out.push(`Crew member: ${nameOf(filters.crewMemberId)}`);
    if (filters.orderId) out.push(`Order: ${definitions.find((d) => d.id === filters.orderId)?.title ?? "—"}`);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, onBoard, definitions]);

  const printMemberOf = (c: CrewMember): CrewPrintMember => {
    const s = statsById.get(c.id!) ?? crewStatsOf([], cutoff, c.kpiOverride ?? null);
    return {
      name: c.name,
      rank: c.rank,
      ratingLabel: s.rating,
      pct: s.pct,
      total: s.total,
      yes: s.yes,
      excused: s.excused,
      unexcused: s.unexcused,
      rows: s.rows,
    };
  };

  const answeredRows = rows.filter((r) => r.completed === "YES" || r.completed === "NO");
  const yesCount = rows.filter((r) => r.completed === "YES").length;
  const excusedCount = rows.filter((r) => r.justification === "EXCUSED").length;
  const unexcusedCount = rows.filter((r) => r.justification === "UNEXCUSED").length;
  const pct = answeredRows.length > 0 ? Math.round((yesCount / answeredRows.length) * 100) : 0;
  const autoTier = tierOf(pct, unexcusedCount);
  const overrideTier = (selectedCrew?.kpiOverride as TierKey | null | undefined) ?? null;
  const effectiveTier: TierKey = overrideTier ?? autoTier;

  const savePatch = async (id: string, patch: Partial<DutyTask>) => {
    await tasks.save(id, patch);
  };

  // The left list's ratings depend only on `completed` and `justification`, so
  // only those two refresh the whole-crew task set — deliberately NOT in
  // savePatch, which also backs the per-keystroke remarks input.
  const changeCompleted = async (t: DutyTask, value: "" | "YES" | "NO") => {
    if (value === "YES") await savePatch(t.id!, { completed: "YES", justification: "", approval: "", remarks: "" });
    else if (value === "NO") await savePatch(t.id!, { completed: "NO" });
    else await savePatch(t.id!, { completed: "", justification: "", approval: "", remarks: "" });
    await allTasks.refetch();
  };
  const changeJustification = async (t: DutyTask, value: "" | "EXCUSED" | "UNEXCUSED") => {
    const patch: Partial<DutyTask> = { justification: value };
    if (value === "EXCUSED") patch.remarks = "";
    await savePatch(t.id!, patch);
    await allTasks.refetch();
  };
  const setOverride = async (tier: TierKey | null) => {
    if (!selectedId) return;
    await updateCrew(selectedId, { kpiOverride: tier });
  };

  /* ───────── render ───────── */
  if (onBoard.length === 0) {
    return (
      <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] p-12 text-center">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-sm text-[var(--clr-text-muted)] font-mono mb-3">No crew on board yet.</p>
        <a href="/crew-roster" className="text-sm font-bold text-[var(--clr-text-accent-gold)] hover:underline">Add crew in the Roster →</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-fadeIn">
      {/* ───────────── CREW SELECTOR ───────────── */}
      <aside>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-primary)]">Engine Crew</h3>
          <button
            type="button"
            onClick={() => setPrintJob(visible.map(printMemberOf))}
            disabled={visible.length === 0}
            title="Print all currently filtered crew members"
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border border-[var(--clr-border)] bg-[var(--clr-bg-card)] text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            🖨 Print All
          </button>
        </div>

        <CrewListFilters
          filters={filters}
          onChange={setFilters}
          crewOptions={crewOptions}
          rankOptions={rankOptions}
          orderOptions={orderOptions}
        />

        <p className="mt-3 mb-2 text-[10px] font-mono text-[var(--clr-text-muted)]">
          {visible.length} of {onBoard.length} shown
        </p>

        {noMatches && (
          <p className="mb-2">
            <button
              type="button"
              onClick={() => setFilters(EMPTY_CREW_FILTERS)}
              className="text-sm font-bold text-[var(--clr-text-accent-gold)] hover:underline cursor-pointer text-left"
            >
              Clear filters to see all crew →
            </button>
          </p>
        )}

        <div className="space-y-2">
          {visible.map((c) => {
            const active = c.id === selectedId;
            const ov = (c.kpiOverride as TierKey | null | undefined) ?? null;
            const dotColor = ov ? tierMeta(ov).dot : "bg-slate-300";
            return (
              <button key={c.id}
                onClick={() => setSelectedId(c.id!)}
                className={`w-full text-left px-3.5 py-3 rounded-xl border transition cursor-pointer ${
                  active ? "border-[var(--clr-bg-accent)] bg-[var(--clr-bg-accent)]/5" : "border-[var(--clr-border)] bg-[var(--clr-bg-card)] hover:border-[var(--clr-ring)]"
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--clr-bg-muted)] border border-[var(--clr-border)] flex items-center justify-center text-xs font-bold text-[var(--clr-text-primary)] shrink-0">
                    {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--clr-text-primary)] truncate">{c.name}</span>
                    <span className="block text-[10px] font-mono text-[var(--clr-text-muted)] truncate">{c.rank}</span>
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} title={ov ?? "Auto"} />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ───────────── PERFORMANCE CARD ───────────── */}
      <section className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] shadow-sm overflow-hidden">
        {noMatches ? (
          <div className="py-24 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-lg font-bold text-[var(--clr-text-primary)]">No Performer</p>
            <p className="text-sm text-[var(--clr-text-muted)] font-mono mt-1">No crew found for the selected filters.</p>
          </div>
        ) : (
          <>
        {/* Card header + KPI badge + period */}
        <div className="px-6 py-5 border-b border-[var(--clr-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--clr-bg-accent)]/10 border border-[var(--clr-border)] flex items-center justify-center text-base font-bold text-[var(--clr-text-primary)]">
              {selectedCrew?.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--clr-text-primary)] leading-tight">{selectedCrew?.name}</h2>
              <p className="text-xs font-mono text-[var(--clr-text-secondary)]">
                {selectedCrew?.rank} · {PERIODS.find((p) => p.key === period)?.label}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* KPI badge + override */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => selectedCrew && setPrintJob([printMemberOf(selectedCrew)])}
                disabled={!selectedCrew}
                title="Print this crew member's performance card"
                className="px-3 py-2 text-xs font-bold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] bg-[var(--clr-bg-subtle)] hover:bg-[var(--clr-bg-card-hover)] border border-[var(--clr-border)] rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🖨 Print
              </button>

              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${tierMeta(effectiveTier).badge}`}>
                <span className={`w-3 h-3 rounded-full ${tierMeta(effectiveTier).dot}`} />
                <div>
                  <p className="text-sm font-extrabold leading-none">{tierMeta(effectiveTier).label}</p>
                  <p className="text-[9px] font-mono mt-0.5 opacity-80">
                    {overrideTier ? "MANUAL OVERRIDE" : `${pct}% complete · ${unexcusedCount} unexcused`}
                  </p>
                </div>
              </div>

              {overrideTier ? (
                <button onClick={() => setOverride(null)}
                  className="px-3 py-2 text-xs font-bold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] bg-[var(--clr-bg-subtle)] hover:bg-[var(--clr-bg-card-hover)] border border-[var(--clr-border)] rounded-xl transition cursor-pointer flex items-center gap-1.5">
                  Reset override
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[var(--clr-text-muted)]">Manual:</span>
                  {TIERS.map((t) => (
                    <button key={t.key} onClick={() => setOverride(t.key)}
                      title={`Override rating to ${t.label}`}
                      className={`w-2.5 h-2.5 rounded-full ${t.dot} ${effectiveTier === t.key ? "ring-2 ring-offset-1 ring-[var(--clr-ring-solid)]" : ""} cursor-pointer`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Period tabs */}
        <div className="px-6 py-2.5 border-b border-[var(--clr-border)] flex items-center gap-1.5 overflow-x-auto">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                period === p.key ? "bg-[var(--clr-bg-accent)] text-white" : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)]"
              }`}>
              {p.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono text-[var(--clr-text-muted)]">
            {rows.length} entries · {yesCount} YES · {excusedCount} excused · {unexcusedCount} unexcused
          </span>
        </div>

        {/* ───────────── INTERACTIVE GRID ───────────── */}
        {tasks.loading ? (
          <div className="p-10 text-center text-[var(--clr-text-muted)] font-mono text-sm">Loading duties…</div>
        ) : rows.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-3xl mb-2">🧾</div>
            <p className="text-sm text-[var(--clr-text-muted)] font-mono mb-3">No duties for this period.</p>
            <a href="/duties" className="text-sm font-bold text-[var(--clr-text-accent-gold)] hover:underline">Dispatch an order from Chief Engineer Orders →</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="[&>th]:border-b [&>th]:border-[var(--clr-border)]">
                <tr>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">Date</th>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest min-w-[180px]">Duties / Orders</th>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest min-w-[110px]">Completed</th>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest min-w-[130px]">Justification</th>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-center py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest min-w-[120px]">C/E Approval</th>
                  <th className="sticky top-0 z-10 bg-[var(--clr-bg-subtle)] text-left py-3 px-4 font-mono text-[10px] font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest min-w-[220px]">Warnings / Remarks</th>
                </tr>
              </thead>
              <tbody className="[&>tr>td]:border-b [&>tr>td]:border-[var(--clr-border)]">
                {rows.map((r) => {
                  const no = r.completed === "NO";
                  const excused = r.justification === "EXCUSED";
                  const unexcused = r.justification === "UNEXCUSED";
                  const remarksOpen = unexcused;
                  return (
                    <tr key={r.id} className={`transition ${unexcused ? "bg-[var(--clr-bg-red)]" : no ? "bg-amber-50/40" : "hover:bg-[var(--clr-bg-card-hover)]"}`}>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--clr-text-secondary)] whitespace-nowrap">{shortDate(r.dueDate)}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[var(--clr-text-primary)]">{r.title}</p>
                        {r.frequency && <p className="text-[10px] font-mono text-[var(--clr-text-muted)]">{FREQ_LABEL(r.frequency)}</p>}
                      </td>

                      {/* COMPLETED */}
                      <td className="py-3 px-4 text-center">
                        <select value={r.completed} onChange={(e) => changeCompleted(r, e.target.value as "" | "YES" | "NO")}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none focus:ring-2 ${
                            r.completed === "YES" ? "bg-green-100 text-green-700 border-green-200 focus:ring-green-200"
                            : r.completed === "NO" ? "bg-red-50 text-red-700 border-red-200 focus:ring-red-200"
                            : "bg-[var(--clr-bg-input)] text-[var(--clr-text-secondary)] border-[var(--clr-border)] focus:ring-[var(--clr-ring)]"
                          }`}>
                          <option value="">—</option>
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      </td>

                      {/* JUSTIFICATION — conditional */}
                      <td className="py-3 px-4 text-center">
                        {no ? (
                          <select value={r.justification} onChange={(e) => changeJustification(r, e.target.value as "" | "EXCUSED" | "UNEXCUSED")}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none focus:ring-2 ${
                              excused ? "bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-200"
                              : unexcused ? "bg-red-100 text-red-700 border-red-200 focus:ring-red-200"
                              : "bg-[var(--clr-bg-input)] text-[var(--clr-text-secondary)] border-[var(--clr-border)] focus:ring-[var(--clr-ring)]"
                            }`}>
                            <option value="">Select</option>
                            <option value="EXCUSED">EXCUSED</option>
                            <option value="UNEXCUSED">UNEXCUSED</option>
                          </select>
                        ) : (
                          <span className="text-xs text-[var(--clr-text-muted)]">—</span>
                        )}
                      </td>

                      {/* C/E APPROVAL */}
                      <td className="py-3 px-4 text-center">
                        {no ? (
                          <select value={r.approval} onChange={(e) => savePatch(r.id!, { approval: e.target.value as "" | "YES" | "NO" })}
                            className="px-2 py-1.5 rounded-lg text-xs font-bold border border-[var(--clr-border)] bg-[var(--clr-bg-input)] text-[var(--clr-text-primary)] cursor-pointer outline-none focus:ring-2 focus:ring-[var(--clr-ring)]">
                            <option value="">—</option>
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                          </select>
                        ) : (
                          <span className="text-xs text-[var(--clr-text-muted)]">—</span>
                        )}
                      </td>

                      {/* REMARKS — locked unless finalized UNEXCUSED */}
                      <td className="py-3 px-4">
                        <input type="text" value={r.remarks} disabled={!remarksOpen}
                          onChange={(e) => savePatch(r.id!, { remarks: e.target.value })}
                          placeholder={remarksOpen ? "Log official verbal warning / disciplinary note…" : "—"}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs border transition ${
                            remarksOpen ? "bg-white border-red-200 text-red-900 placeholder:text-red-300 focus:ring-2 focus:ring-red-200 font-medium" : "bg-[var(--clr-bg-subtle)] text-[var(--clr-text-muted)] border-transparent cursor-not-allowed"
                          }`} />
                        {unexcused && r.completed === "NO" && (
                          <p className="mt-0.5 text-[9px] font-mono text-red-500">
                            {r.approval === "NO" ? "⚠ Warning logged — disciplinary note on record" : "Unexcused — set C/E approval"}
                          </p>
                        )}
                        {no && excused && r.approval === "YES" && (
                          <p className="mt-0.5 text-[9px] font-mono text-amber-600">Excused delay · accepted by C/E</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-3 border-t border-[var(--clr-border)] flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-mono text-[var(--clr-text-muted)]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Excused delay</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Unexcused / warning</span>
        </div>
          </>
        )}
      </section>

      {/* Print document — mounting it triggers the browser print dialog */}
      {printJob && (
        <CrewPerformancePrint
          members={printJob}
          filterSummary={filterSummary}
          periodLabel={periodLabel}
          onClose={() => setPrintJob(null)}
        />
      )}
    </div>
  );
}

const FREQ_LABEL = (f: string) =>
  f === "DAILY" ? "Daily" : f === "WEEKLY" ? "Weekly" : f === "MONTHLY" ? "Monthly" : "One-off";
