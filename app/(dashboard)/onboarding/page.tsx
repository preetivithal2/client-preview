// components/onboarding/SystemOverview.tsx
"use client";

import { useState, useEffect } from "react";

export default function SystemOverview({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  // This could also fetch real stats from Firestore
  const stats = {
    equipment: 4,
    regulations: 8,
    dropdowns: 10,
    workLogs: 0,
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--clr-bg-accent)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.jpg" alt="NS Logo" className="h-20 w-auto" />
        </div>

        <h1 className="text-4xl font-extrabold text-[var(--clr-text-on-accent)] mb-2 tracking-tight">
          SM Engineer Portal
        </h1>
        <p className="text-[var(--clr-text-accent-gold)] font-mono text-sm uppercase tracking-widest mb-6">
          System Ready • All Systems Nominal
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Equipment" value={stats.equipment} />
          <StatCard label="Regulations" value={stats.regulations} />
          <StatCard label="Dropdowns" value={stats.dropdowns} />
          <StatCard label="Work Logs" value={stats.workLogs} />
        </div>

        <p className="text-[var(--clr-text-muted)] text-sm max-w-md mx-auto mb-8">
          Your ship management system is fully configured and ready to use.
          Start logging maintenance work and tracking defects today. working fine bro
        </p>

        <button
          onClick={onComplete}
          className="px-8 py-3 bg-[var(--clr-text-accent-gold)] hover:bg-[#B8923F] text-[#0B1120] font-bold rounded-xl transition shadow-lg hover:shadow-xl"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--clr-text-on-accent)]/5 backdrop-blur rounded-xl p-4 border border-[var(--clr-text-on-accent)]/10">
      <div className="text-2xl font-black text-[var(--clr-text-on-accent)]">{value}</div>
      <div className="text-xs text-[var(--clr-text-muted)] uppercase tracking-wider">{label}</div>
    </div>
  );
}