
import KpiStats from "../components/dashboard/KpiStats";
import DepartmentGrid from "../components/dashboard/DepartmentGrid";
import StatusDistribution from "../components/dashboard/StatusDistribution";
import SparePartsTable from "../components/dashboard/SparePartsTable";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import ExportControlDeck from "../components/dashboard/ExportControlDeck";
import CrewPerformance from "../components/dashboard/crewperformance";

export default function ChiefEngineerDashboard() {
  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10 animate-fadeIn">

      <div className="space-y-6 w-full max-w-[2000px] mx-auto animate-fadeIn pb-12">

        {/* Top Header Deck & Report Generation Utilities */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-5 border-b border-[var(--clr-border-light)]">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--clr-text-body)] uppercase">
              Engineer Control Center
            </h1>
            <p className="text-xs text-[#8B8276] font-mono mt-0.5 uppercase tracking-widest">
              Real-Time Equipment Status & Operational Performance
            </p>
          </div>

          {/* Export Panel Integration */}
          <ExportControlDeck />
        </div>

        {/* Row 1: High Level KPI Stat Cards */}
        <KpiStats />

        {/* Row 2: Analytics Breakdown Grid (Adapts automatically up to 2K/4K monitors) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-12 gap-6">

          {/* Workload Status Distribution Map */}
          <div className="lg:col-span-1 2xl:col-span-4 flex flex-col">
            <StatusDistribution />
          </div>

          {/* Department Operational Load Metrics */}
          <div className="lg:col-span-2 2xl:col-span-4 flex flex-col">
            <DepartmentGrid />
          </div>

        </div>

        {/* TEMP-HIDDEN: "Spare Parts Tracker" widget hidden per client request — it displays PO/Requisition Ref + Order Status fields. Uncomment to restore. */}
        {/* <div className="w-full">
          <SparePartsTable />
        </div> */}
        <div className="w-full">
          <CrewPerformance />
        </div>
        {/* Workload Trend Analytical Vector Chart */}
        <div className="w-full">
          <MonthlyTrendChart />
        </div>
      </div>
    </div>
  );
}

