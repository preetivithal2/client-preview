"use client";

import DropdownAccordionCard from "../../components/dropdowns/DropdownAccordionCard";
import { useAllDropdowns } from "../../lib/hooks/useAllDropdowns";
import { exportToCsv } from "../../lib/utils";

const systemFormDropdownManifest = [
  { label: "Vessel Name", placeholder: "e.g. Oceanic Explorer", documentKey: "vesselName" },
  { label: "Components", placeholder: "e.g. Fuel Injector Valving", documentKey: "componentSpec" },
  { label: "Department", placeholder: "e.g. Navigation Bridge", documentKey: "department" },
  { label: "Assistants Required", placeholder: "e.g. 2 Crew Engineers", documentKey: "assistant" },
  // TEMP-HIDDEN: { label: "Requisition Status", placeholder: "e.g. Pending Clearance", documentKey: "requisitionStatus" },
  { label: "No. of Spares Used", placeholder: "e.g. 4 units", documentKey: "sparesUsed" },
  { label: "Completed By", placeholder: "e.g. Chief Engineer", documentKey: "completedBy" },
  { label: "Reported By", placeholder: "e.g. 3rd Engineer", documentKey: "reportedBy" },
  // TEMP-HIDDEN: { label: "Tested Criteria", placeholder: "e.g. Load Testing Certified", documentKey: "testedCriteria" },
  { label: "Condition", placeholder: "e.g. Operational Grade", documentKey: "conditionMatrix" },
  { label: "Reason for Job Performed", placeholder: "e.g. Planned Overhaul", documentKey: "reasonClassifications" },
  { label: "Waste Type", placeholder: "e.g. Sludge Oil", documentKey: "wasteType" },
  { label: "Fuel Type", placeholder: "e.g. VLSFO", documentKey: "fuelType" },
  { label: "Priority", placeholder: "e.g. HIGH", documentKey: "priority" },
  { label: "Office Notified", placeholder: "e.g. YES", documentKey: "officeNotified" },
  // TEMP-HIDDEN: { label: "Order Status", placeholder: "e.g. PO Issued", documentKey: "orderStatus" },
  { label: "Job Status", placeholder: "e.g. OPEN", documentKey: "jobStatus" },
];

export default function ConfigurationDeck() {
  const { getOptions } = useAllDropdowns();

  const handleExportCsv = () => {
    const data = systemFormDropdownManifest.map((item) => ({
      Category: item.label,
      Values: (getOptions(item.documentKey) || []).join(", "),
    }));
    exportToCsv(data, `dropdowns-${new Date().toISOString().slice(0, 10)}`, {
      Category: "Category",
      Values: "Values",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--clr-bg-page-alt)] p-6 md:p-10 animate-fadeIn">
      {/* Premium Header */}
      <header className="max-w-[2000px] mx-auto mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--clr-border-light)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--clr-text-primary)] flex items-center gap-3">
              <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
                Form Dropdown Parameter Editor
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
                v2.0
              </span>
            </h1>
            <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
              Configuration Command Area // Modify Core Select Field Parameters Instantly
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-mono font-bold bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)] rounded-full shadow-sm hover:opacity-90 transition cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Grid of Dropdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[2000px] mx-auto">
        {systemFormDropdownManifest.map((item, index) => (
          <DropdownAccordionCard
            key={index}
            documentKey={item.documentKey}
            defaultLabel={item.label}
            defaultPlaceholder={item.placeholder}
          />
        ))}
      </div>
    </div>
  );
}
