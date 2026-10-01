// "use client";

// import { useState, useEffect } from "react";
// import { FilterState } from "./types";

// interface SearchFiltersProps {
//   onSearch: (filters: FilterState) => void;
//   initialFilters: FilterState;
//   /** Dropdown options provided by parent for Firestore-powered fields */
//   componentOptions?: string[];
//   vesselOptions?: string[];
//   departmentOptions?: string[];
//   reasonOptions?: string[];
//   crewRankOptions?: string[];
// }

// export default function SearchFilters({ onSearch, initialFilters, componentOptions, vesselOptions, departmentOptions, reasonOptions, crewRankOptions }: SearchFiltersProps) {
//   const [filters, setFilters] = useState<FilterState>(initialFilters);

//   const handleFilterChange = (key: keyof FilterState, value: string) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSearch(filters);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-[var(--clr-bg-card)] rounded-2xl shadow-sm border border-[var(--clr-border)] p-6 transition-all hover:shadow-md"
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-5">

//         {/* Vessel Name */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Vessel Name
//           </label>
//           <select
//             value={filters.vesselName}
//             onChange={(e) => handleFilterChange("vesselName", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//                         <option value="">Select Vessel Name</option>
//             {(vesselOptions?.length ? vesselOptions : ['Oceanic Explorer', 'Vessel Alpha', 'Vessel Horizon']).map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         </div>

//         {/* Component */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Component
//           </label>
//           <select
//             value={filters.component}
//             onChange={(e) => handleFilterChange("component", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//                         <option value="">Select Component</option>
//             {(componentOptions?.length ? componentOptions : ['Main Engine', 'Aux Generator', 'Boiler', 'Purifier']).map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         </div>

//         {/* Department */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Department
//           </label>
//           <select
//             value={filters.department}
//             onChange={(e) => handleFilterChange("department", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//                         <option value="">Select Department</option>
//             {(departmentOptions?.length ? departmentOptions : ['Engine Room', 'Electrical', 'Deck', 'Galley']).map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         </div>

//         {/* Reported Date */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Reported Date
//           </label>
//           <input
//             type="date"
//             value={filters.reportedDate}
//             onChange={(e) => handleFilterChange("reportedDate", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           />
//         </div>

//         {/* Priority */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Priority
//           </label>
//           <select
//             value={filters.priority}
//             onChange={(e) => handleFilterChange("priority", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Priority</option>
//             <option value="high">High</option>
//             <option value="medium">Medium</option>
//             <option value="low">Low</option>
//           </select>
//         </div>

//         {/* Reason */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Reason
//           </label>
//           <select
//             value={filters.reason}
//             onChange={(e) => handleFilterChange("reason", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//                         <option value="">Select Reason</option>
//             {(reasonOptions?.length ? reasonOptions : ['Overhaul', 'Routine check', 'Breakdown', 'Inspection']).map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         </div>

//         {/* Office Informed - checkboxes inline */}
//         <div className="flex items-center gap-4 md:col-span-2 2xl:col-span-1">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Office Informed
//           </label>
//           <div className="flex items-center gap-6">
//             <label className="flex items-center gap-2 text-sm font-medium text-[var(--clr-text-primary)] cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={filters.officeInformed === "yes"}
//                 onChange={() =>
//                   handleFilterChange(
//                     "officeInformed",
//                     filters.officeInformed === "yes" ? "" : "yes"
//                   )
//                 }
//                 className="w-4 h-4 accent-[var(--clr-bg-accent)] border-[var(--clr-border)] rounded focus:ring-0"
//               />
//               Yes
//             </label>
//             <label className="flex items-center gap-2 text-sm font-medium text-[var(--clr-text-primary)] cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={filters.officeInformed === "no"}
//                 onChange={() =>
//                   handleFilterChange(
//                     "officeInformed",
//                     filters.officeInformed === "no" ? "" : "no"
//                   )
//                 }
//                 className="w-4 h-4 accent-[var(--clr-bg-accent)] border-[var(--clr-border)] rounded focus:ring-0"
//               />
//               No
//             </label>
//           </div>
//         </div>

//         {/* Assistants Required? */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Assistants Required?
//           </label>
//           <select
//             value={filters.assistant}
//             onChange={(e) => handleFilterChange("assistant", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Assistance</option>
//             <option value="yes">Yes</option>
//             <option value="no">No</option>
//           </select>
//         </div>

//         {/* Requisition No */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Requisition No
//           </label>
//           <select
//             value={filters.requisitionNo}
//             onChange={(e) => handleFilterChange("requisitionNo", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Job Status</option>
//             <option value="REQ-001">REQ-001</option>
//             <option value="REQ-002">REQ-002</option>
//             <option value="REQ-003">REQ-003</option>
//           </select>
//         </div>

//         {/* No of Spares Used? */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             No of Spares Used?
//           </label>
//           <select
//             value={filters.spareUsed}
//             onChange={(e) => handleFilterChange("spareUsed", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Spare</option>
//             <option value="0">None</option>
//             <option value="1">1</option>
//             <option value="2">2</option>
//             <option value="3+">3+</option>
//           </select>
//         </div>

//         {/* Completed By */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Completed By
//           </label>
//           <select
//             value={filters.completedBy}
//             onChange={(e) => handleFilterChange("completedBy", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//                         <option value="">Select User</option>
//             {(crewRankOptions?.length ? crewRankOptions : ['Chief Engineer', 'Electrical Officer', 'Deck Master']).map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         </div>

//         {/* Tested */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Tested
//           </label>
//           <select
//             value={filters.tested}
//             onChange={(e) => handleFilterChange("tested", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Option</option>
//             <option value="yes">Yes</option>
//             <option value="no">No</option>
//           </select>
//         </div>

//         {/* Condition */}
//         <div className="flex items-center gap-4">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Condition
//           </label>
//           <select
//             value={filters.condition}
//             onChange={(e) => handleFilterChange("condition", e.target.value)}
//             className="flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           >
//             <option value="">Select Option</option>
//             <option value="good">Good</option>
//             <option value="fair">Fair</option>
//             <option value="poor">Poor</option>
//           </select>
//         </div>

//         {/* Keyword Search - full width */}
//         <div className="flex items-center gap-4 md:col-span-2 2xl:col-span-3">
//           <label className="w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
//             Keyword Search
//           </label>
//           <input
//             type="text"
//             value={filters.keyword}
//             onChange={(e) => handleFilterChange("keyword", e.target.value)}
//             placeholder="Search query keywords..."
//             className="flex-1 px-4 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] placeholder-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
//           />
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div className="mt-6 pt-4 border-t border-[var(--clr-border)] flex justify-end">
//         <button
//           type="submit"
//           className="px-8 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
//         >
//           Search
//         </button>
//       </div>
//     </form>
//   );
// }









/// WORKED FOR RESPONSIVE


"use client";

import { useState, useEffect } from "react";
import { FilterState } from "./types";

interface SearchFiltersProps {
  onSearch: (filters: FilterState) => void;
  initialFilters: FilterState;
  /** Dropdown options provided by parent for Firestore-powered fields */
  equipmentOptions?: string[];
  componentOptions?: string[];
  vesselOptions?: string[];
  departmentOptions?: string[];
  reasonOptions?: string[];
  crewRankOptions?: string[];
  priorityOptions?: string[];
  officeNotifiedOptions?: string[];
  assistantOptions?: string[];
  requisitionOptions?: string[];
  sparesOptions?: string[];
  testedOptions?: string[];
  conditionOptions?: string[];
  jobStatusOptions?: string[];
}

export default function SearchFilters({
  onSearch,
  initialFilters,
  equipmentOptions,
  componentOptions,
  vesselOptions,
  departmentOptions,
  reasonOptions,
  crewRankOptions,
  priorityOptions,
  officeNotifiedOptions,
  assistantOptions,
  requisitionOptions,
  sparesOptions,
  testedOptions,
  conditionOptions,
  jobStatusOptions,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--clr-bg-card)] rounded-2xl shadow-sm border border-[var(--clr-border)] p-4 sm:p-6 transition-all hover:shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-x-6 sm:gap-y-5">

        {/* Equipment */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Equipment
          </label>
          <select
            value={filters.equipment}
            onChange={(e) => handleFilterChange("equipment", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Equipment</option>
            {equipmentOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Vessel Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Vessel Name
          </label>
          <select
            value={filters.vesselName}
            onChange={(e) => handleFilterChange("vesselName", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Vessel Name</option>
            {vesselOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Component */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Component
          </label>
          <select
            value={filters.component}
            onChange={(e) => handleFilterChange("component", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Component</option>
            {componentOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Department</option>
            {departmentOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Reported Date */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Reported Date
          </label>
          <input
            type="date"
            value={filters.reportedDate}
            onChange={(e) => handleFilterChange("reportedDate", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          />
        </div>

        {/* Priority */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Priority</option>
            {priorityOptions?.map(opt => (
              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Reason
          </label>
          <select
            value={filters.reason}
            onChange={(e) => handleFilterChange("reason", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Reason</option>
            {reasonOptions?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Office Informed */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
            Office Informed
          </label>
          <select
            value={filters.officeInformed}
            onChange={(e) => handleFilterChange("officeInformed", e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
          >
            <option value="">Select Option</option>
            {officeNotifiedOptions?.map(opt => (
              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
            ))}
          </select>
        </div>

      {/* Assistants Required? */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Assistants Required?
        </label>
        <select
          value={filters.assistant}
          onChange={(e) => handleFilterChange("assistant", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Assistance</option>
          {assistantOptions?.map(opt => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      </div>

      {/* TEMP-HIDDEN FILTER: "Requisition Status" — hidden per client request. Uncomment the block below to restore. */}
      {/* Requisition Status
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Requisition Status
        </label>
        <select
          value={filters.requisitionNo}
          onChange={(e) => handleFilterChange("requisitionNo", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Status</option>
          {requisitionOptions?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      */}

      {/* Spares Used */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Spares Used
        </label>
        <select
          value={filters.spareUsed}
          onChange={(e) => handleFilterChange("spareUsed", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Spare</option>
          {sparesOptions?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Completed By */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Completed By
        </label>
        <select
          value={filters.completedBy}
          onChange={(e) => handleFilterChange("completedBy", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select User</option>
          {crewRankOptions?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* TEMP-HIDDEN FILTER: "Tested" — hidden per client request. Uncomment the block below to restore. */}
      {/* Tested
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Tested
        </label>
        <select
          value={filters.tested}
          onChange={(e) => handleFilterChange("tested", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Option</option>
          {testedOptions?.map(opt => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      </div>
      */}

      {/* Condition */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Condition
        </label>
        <select
          value={filters.condition}
          onChange={(e) => handleFilterChange("condition", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Option</option>
          {conditionOptions?.map(opt => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Job Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Job Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        >
          <option value="">Select Status</option>
          {jobStatusOptions?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Keyword Search - full width */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 md:col-span-2 2xl:col-span-3">
        <label className="w-full sm:w-28 text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest shrink-0">
          Keyword Search
        </label>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          placeholder="Search query keywords..."
          className="w-full px-4 py-2 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-primary)] placeholder-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
        />
      </div>
    </div>

      {/* Submit Button */ }
  <div className="mt-6 pt-4 border-t border-[var(--clr-border)] flex flex-col sm:flex-row justify-end">
    <button
      type="submit"
      className="w-full sm:w-auto px-8 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
    >
      Search
    </button>
  </div>
    </form >
  );
}