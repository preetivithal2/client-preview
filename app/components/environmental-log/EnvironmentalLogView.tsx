"use client";

import { useEffect, useState } from "react";
import { BilgeWaterLog, IncineratorLog, FuelChangeoverLog } from "../../lib/types";
import EnvironmentalLogPrint from "./EnvironmentalLogPrint";

interface Props {
  type: "bilge" | "incinerator" | "fuel";
  entry: BilgeWaterLog | IncineratorLog | FuelChangeoverLog;
  onClose: () => void;
}

function FieldRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 bg-[var(--clr-bg-subtle)] rounded-lg">
      <p className="text-[10px] font-mono font-semibold text-[var(--clr-text-muted)] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-medium text-[var(--clr-text-primary)]">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest border-b border-[var(--clr-border)] pb-1.5 mb-3">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">{children}</div>
    </div>
  );
}

function formatDT(v: string | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString();
}

export default function EnvironmentalLogView({ type, entry, onClose }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const titles = {
    bilge: "Bilge Water Separator — Entry Details",
    incinerator: "Incinerator — Entry Details",
    fuel: "Fuel Changeover — Entry Details",
  };

  return (
    <>
      {isPrinting && (
        <EnvironmentalLogPrint
          type={type}
          entries={[entry]}
          onClose={() => setIsPrinting(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--clr-bg-card)] backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
            <h3 className="text-xl font-bold text-[var(--clr-text-primary)]">{titles[type]}</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPrinting(true)}
                className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print / Save PDF
              </button>
              <button onClick={onClose} className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

        <div className="p-6 space-y-6">
          {type === "bilge" && (() => {
            const e = entry as BilgeWaterLog;
            return (
              <>
                <Section title="Operation Details">
                  <FieldRow label="Regulation" value={e.regulation} />
                  <FieldRow label="Start Date/Time" value={formatDT(e.startDateTime)} />
                  <FieldRow label="End Date/Time" value={formatDT(e.endDateTime)} />
                  <FieldRow label="15ppm Alarm OK" value={e.alarmOk ? "Yes ✓" : "No ✗"} />
                  <FieldRow label="Volume Discharged (m³)" value={e.volumeM3} />
                  <FieldRow label="Total Running HRS" value={e.totalRunningHrs} />
                  <FieldRow label="Pump Rate (m³/h)" value={e.pumpRate} />
                </Section>
                <Section title="Position">
                  <FieldRow label="Start Latitude" value={e.startLat} />
                  <FieldRow label="Start Longitude" value={e.startLong} />
                  <FieldRow label="End Latitude" value={e.endLat} />
                  <FieldRow label="End Longitude" value={e.endLong} />
                </Section>
                <Section title="Valves & Seals">
                  <FieldRow label="Overboard Valve No" value={e.overboardValveNo} />
                  <FieldRow label="Seal No (Unsealed)" value={e.sealNoUnsealed} />
                  <FieldRow label="Overboard Valve No (Sealed)" value={e.overboardValveNoSealed} />
                  <FieldRow label="Seal No (Sealed)" value={e.sealNoSealed} />
                </Section>
              </>
            );
          })()}

          {type === "incinerator" && (() => {
            const e = entry as IncineratorLog;
            return (
              <>
                <Section title="Operation Details">
                  <FieldRow label="Regulation" value={e.regulation} />
                  <FieldRow label="Waste Type" value={e.wasteType} />
                  <FieldRow label="Start Date/Time" value={formatDT(e.startDateTime)} />
                  <FieldRow label="End Date/Time" value={formatDT(e.endDateTime)} />
                  <FieldRow label="Inc Waste Oil Tank (m³)" value={e.incWasteOilTankM3} />
                  <FieldRow label="Total Running (hrs)" value={e.totalRunning} />
                  <FieldRow label="Quantity" value={e.quantity} />
                  <FieldRow label="Unit" value={e.quantityUnit} />
                </Section>
                <Section title="Position & Notes">
                  <FieldRow label="Latitude" value={e.lat} />
                  <FieldRow label="Longitude" value={e.long} />
                  <FieldRow label="Remark" value={e.remark} />
                </Section>
              </>
            );
          })()}

          {type === "fuel" && (() => {
            const e = entry as FuelChangeoverLog;
            return (
              <>
                <Section title="Commence Change Over">
                  <FieldRow label="Regulation" value={e.regulation} />
                  <FieldRow label="Date/Time" value={formatDT(e.commenceDateTime)} />
                  <FieldRow label="Latitude" value={e.commenceLat} />
                  <FieldRow label="Longitude" value={e.commenceLong} />
                  <FieldRow label="From Fuel" value={e.fromFuel} />
                  <FieldRow label="From Sulphur %" value={e.fromSulphur} />
                  <FieldRow label="To Fuel" value={e.toFuel} />
                  <FieldRow label="To Sulphur %" value={e.toSulphur} />
                </Section>
                <Section title="ROB at Commence (MT)">
                  <FieldRow label="HSFO" value={e.robHsfoCommence} />
                  <FieldRow label="LSFO" value={e.robLsfoCommence} />
                  <FieldRow label="MGO" value={e.robMgoCommence} />
                </Section>
                <Section title="Completed Change Over">
                  <FieldRow label="Date/Time" value={formatDT(e.completeDateTime)} />
                  <FieldRow label="Latitude" value={e.completeLat} />
                  <FieldRow label="Longitude" value={e.completeLong} />
                </Section>
                <Section title="ROB at Complete (MT)">
                  <FieldRow label="HSFO" value={e.robHsfoComplete} />
                  <FieldRow label="LSFO" value={e.robLsfoComplete} />
                  <FieldRow label="MGO" value={e.robMgoComplete} />
                </Section>
                <Section title="Results (Auto-calculated)">
                  <FieldRow label="Total Running HRS" value={e.totalRunningHrs} />
                  <FieldRow label="Consumption HSFO" value={e.consumptionHsfo} />
                  <FieldRow label="Consumption LSFO" value={e.consumptionLsfo} />
                  <FieldRow label="Consumption MGO" value={e.consumptionMgo} />
                </Section>
              </>
            );
          })()}
        </div>
      </div>
    </div>
    </>
  );
}
