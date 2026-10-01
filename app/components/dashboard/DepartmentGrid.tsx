"use client";

import { useMemo } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";
import { useAllDropdowns } from "../../lib/hooks/useAllDropdowns";

const DEPARTMENT_COLORS = [
  "bg-[var(--clr-bg-accent)]",
  "bg-[#734934]",
  "bg-[#E8EAB2]",
  "bg-[#BE6830]",
  "bg-[#EBCC62]",
];

export default function DepartmentGrid() {
  const { data: workLogs, loading: logsLoading } = useWorkLog();
  const { getOptions, loading: ddLoading } = useAllDropdowns();

  const departments = useMemo(() => {
    const allDepartments = getOptions('department');
    if (logsLoading || ddLoading || allDepartments.length === 0) return [];

    // Count active (non-closed) jobs per department
    const activeJobs = workLogs.filter((w) => !w.status?.toLowerCase().includes('closed'));
    const counts: Record<string, number> = {};
    activeJobs.forEach((w) => {
      const dept = w.department || 'Unspecified';
      counts[dept] = (counts[dept] || 0) + 1;
    });

    // Build the list — all departments from the dropdown, each with its count (0 if no jobs)
    const deptList = allDepartments.map((name) => ({
      name,
      activeJobs: counts[name] || 0,
    }));

    // Sort by count descending
    deptList.sort((a, b) => b.activeJobs - a.activeJobs);

    // Compute bar widths as percentage of max
    const maxCount = deptList.length > 0 ? deptList[0].activeJobs : 1;

    return deptList.map((dept, idx) => ({
      ...dept,
      color: DEPARTMENT_COLORS[idx % DEPARTMENT_COLORS.length],
      capacity: Math.max(Math.round((dept.activeJobs / maxCount) * 100), 5),
    }));
  }, [workLogs, logsLoading, ddLoading, getOptions]);

  return (
    <div className="w-full bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl p-5 lg:p-6 shadow-xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-body)]">
            Jobs by Departments
          </h3>
          <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)]">SECTOR SPECS</span>
        </div>

        <div className="space-y-4">
          {departments.map((dept, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs lg:text-sm">
                <span className="font-bold text-[var(--clr-text-body)]">{dept.name}</span>
                <span className="font-mono font-black text-[var(--clr-text-body)]">
                  {dept.activeJobs} <span className="text-[var(--clr-text-muted)] font-normal text-xs">jobs</span>
                </span>
              </div>

              {/* Dynamic Line Level Track Indicator */}
              <div className="w-full h-2 bg-[var(--clr-bg-subtle)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                  style={{ width: `${dept.capacity}%` }}
                />
              </div>
            </div>
          ))}
          {!logsLoading && !ddLoading && departments.length === 0 && (
            <div className="text-center py-6 text-sm text-[var(--clr-text-muted)]">
              No departments configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
