"use client";

// Manage Crew Roster — frontend UI preview (mock data, no database yet).
import CrewRosterManager from "../../components/crew/CrewRosterManager";

export default function CrewRosterPage() {
  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3 flex-wrap">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
              Manage Crew Roster
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
              Engine Room
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Who is on board in the engine room — feeds orders & performance cards.
          </p>
        </header>

        <CrewRosterManager />
      </div>
    </div>
  );
}
