"use client";

import RegulationsManager from "../../components/regulations/RegulationsManager";

// import RegulationsManager from "@/app/components/regulations/RegulationsManager";


export default function RegulationsPage() {
  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10 animate-fadeIn">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
              Regulations Master
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
              Compliance
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Manage international regulations (MARPOL, SOLAS, etc.) for work log tagging.
          </p>
        </header>

        {/* Manager Component */}
        <RegulationsManager  />
      </div>
    </div>
  );
}