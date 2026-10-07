"use client";

// CREW LIST FILTERS — the left-hand filter stack on Crew Performance Cards.
//
// Unlike the records SearchFilters (which only emits on form submit), this panel
// is fully controlled: every change calls onChange immediately so the crew list
// re-renders as the user picks. All six filters are combined with AND logic by
// the parent; this component only owns the presentation.

export interface CrewFilterState {
  keyword: string;       // 1. search crew member by name
  rank: string;          // 2. filter by role / rank
  rating: string;        // 3. filter by performance rating
  crewMemberId: string;  // 4. filter by crew member
  orderId: string;       // 5. filter by dispatched order
}

export const EMPTY_CREW_FILTERS: CrewFilterState = {
  keyword: "",
  rank: "",
  rating: "",
  crewMemberId: "",
  orderId: "",
};

/** The card's four KPI tiers, in the order they are offered in the dropdown. */
export const RATING_OPTIONS = ["VERY GOOD", "GOOD", "SATISFACTORY", "POOR"] as const;
export type RatingLabel = (typeof RATING_OPTIONS)[number];

export const isFiltered = (f: CrewFilterState): boolean =>
  Object.values(f).some((v) => v !== "");

interface Props {
  filters: CrewFilterState;
  onChange: (next: CrewFilterState) => void;
  crewOptions: { id: string; name: string; rank: string }[];
  rankOptions: string[];
  /** Ratings actually present among the crew the other filters allow, in
   *  RATING_OPTIONS order. Supplied by the parent so the list stays in step
   *  with the current period and filters. */
  ratingOptions: RatingLabel[];
  orderOptions: { id: string; title: string }[];
}

const SELECT_CLS =
  "w-full px-2.5 py-1.5 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-xs text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition cursor-pointer";

const LABEL_CLS =
  "block text-[10px] font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest mb-1";

export default function CrewListFilters({ filters, onChange, crewOptions, rankOptions, ratingOptions, orderOptions }: Props) {
  const set = <K extends keyof CrewFilterState>(key: K, value: CrewFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const clear = () => onChange({ ...EMPTY_CREW_FILTERS });

  return (
    <div className="bg-[var(--clr-bg-card)] rounded-2xl border border-[var(--clr-border)] p-3 space-y-2.5">
      {/* 1. Search by name */}
      <div>
        <label className={LABEL_CLS} htmlFor="cf-keyword">Search</label>
        <input
          id="cf-keyword"
          type="text"
          value={filters.keyword}
          onChange={(e) => set("keyword", e.target.value)}
          placeholder="Crew name…"
          className="w-full px-2.5 py-1.5 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-input)] text-xs text-[var(--clr-text-primary)] placeholder:text-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        />
      </div>

      {/* 2. Role / rank */}
      <div>
        <label className={LABEL_CLS} htmlFor="cf-rank">Role</label>
        <select id="cf-rank" value={filters.rank} onChange={(e) => set("rank", e.target.value)} className={SELECT_CLS}>
          <option value="">All roles</option>
          {rankOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* 3. Performance rating */}
      <div>
        <label className={LABEL_CLS} htmlFor="cf-rating">Rating</label>
        <select id="cf-rating" value={filters.rating} onChange={(e) => set("rating", e.target.value)} className={SELECT_CLS}>
          <option value="">All ratings</option>
          {ratingOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* 4. Crew member */}
      <div>
        <label className={LABEL_CLS} htmlFor="cf-crew">Crew Member</label>
        <select id="cf-crew" value={filters.crewMemberId} onChange={(e) => set("crewMemberId", e.target.value)} className={SELECT_CLS}>
          <option value="">All crew members</option>
          {crewOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* 5. Orders */}
      <div>
        <label className={LABEL_CLS} htmlFor="cf-order">Orders</label>
        <select id="cf-order" value={filters.orderId} onChange={(e) => set("orderId", e.target.value)} className={SELECT_CLS}>
          <option value="">Chief Engineer Orders (all)</option>
          {orderOptions.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={clear}
        disabled={!isFiltered(filters)}
        className="w-full px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold border border-[var(--clr-border)] bg-[var(--clr-bg-subtle)] text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Clear Filters
      </button>
    </div>
  );
}
