"use client";


import MasterEquipmentManager from "../../components/equipment/MasterEquipmentManager";

export default function EquipmentPage() {
  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10 animate-fadeIn">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
              Manage Equipment
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
              Master List
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Manage all ship machinery details – one entry per equipment.
          </p>
        </header>

        {/* Manager Component */}
        <MasterEquipmentManager />
      </div>
    </div>
  );
}