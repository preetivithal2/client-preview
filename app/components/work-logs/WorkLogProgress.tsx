// components/work-logs/WorkLogProgress.tsx

"use client";

interface WorkLogProgressProps {
  currentSection: number;
  setCurrentSection: (index: number) => void;
  sections: { id: number; label: string; icon: string }[];
}

export default function WorkLogProgress({ currentSection, setCurrentSection, sections }: WorkLogProgressProps) {
  return (
    <>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[var(--clr-text-secondary)]">
            Step {currentSection + 1} of {sections.length}
          </span>
          <span className="text-[var(--clr-text-secondary)] font-mono">
            {Math.round(((currentSection + 1) / sections.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--clr-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--clr-text-primary)] rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--clr-border)] pb-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              if (index <= currentSection) setCurrentSection(index);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${index === currentSection
                ? 'bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)]'
                : index < currentSection
                ? 'bg-[var(--clr-bg-success)] text-[var(--clr-text-success)] cursor-pointer hover:opacity-80'
                : 'bg-[var(--clr-bg-muted)] text-[var(--clr-text-muted)] cursor-not-allowed opacity-50'
              }
            `}
          >
            <span>{section.icon}</span>
            <span className="hidden sm:inline">{section.label}</span>
            {index < currentSection && <span className="text-[10px]">✓</span>}
          </button>
        ))}
      </div>
    </>
  );
}