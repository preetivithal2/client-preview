"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BilgeWaterLog, IncineratorLog, FuelChangeoverLog } from "../../lib/types";

interface Props {
  type: "bilge" | "incinerator" | "fuel";
  entries: (BilgeWaterLog | IncineratorLog | FuelChangeoverLog)[];
  onClose: () => void;
}

function formatDT(v: string | undefined): string {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString("en-GB");
}

const Field = ({ label, value }: { label: string; value: any }) => (
  <div style={{ padding: "1px 4px" }}>
    <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", color: "#64748b", margin: 0, marginBottom: "0.5px" }}>{label}</p>
    <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: 0, fontWeight: 500 }}>{value ?? "-"}</p>
  </div>
);

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: "6px" }}>
    {title && (
      <div style={{ background: "#0B1120", color: "white", padding: "3px 8px", fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", borderRadius: "2px", marginBottom: "4px", borderLeft: "3px solid #C9A253" }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

function BilgeReport({ e }: { e: BilgeWaterLog }) {
  return (
    <>
      <Section title="Operation Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Regulation" value={e.regulation} />
          <Field label="Start Date/Time" value={formatDT(e.startDateTime)} />
          <Field label="End Date/Time" value={formatDT(e.endDateTime)} />
          <Field label="15ppm Alarm OK" value={e.alarmOk ? "Yes" : "No"} />
          <Field label="Volume (m³)" value={e.volumeM3} />
          <Field label="Running HRS" value={e.totalRunningHrs} />
          <Field label="Pump Rate (m³/h)" value={e.pumpRate} />
        </div>
      </Section>
      <Section title="Position">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Start Lat" value={e.startLat} />
          <Field label="Start Lon" value={e.startLong} />
          <Field label="End Lat" value={e.endLat} />
          <Field label="End Lon" value={e.endLong} />
        </div>
      </Section>
      <Section title="Valves & Seals">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Overboard Valve" value={e.overboardValveNo} />
          <Field label="Seal (Unsealed)" value={e.sealNoUnsealed} />
          <Field label="Overboard Valve (Sealed)" value={e.overboardValveNoSealed} />
          <Field label="Seal (Sealed)" value={e.sealNoSealed} />
        </div>
      </Section>
    </>
  );
}

function IncineratorReport({ e }: { e: IncineratorLog }) {
  return (
    <>
      <Section title="Operation Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Regulation" value={e.regulation} />
          <Field label="Waste Type" value={e.wasteType} />
          <Field label="Start Date/Time" value={formatDT(e.startDateTime)} />
          <Field label="End Date/Time" value={formatDT(e.endDateTime)} />
          <Field label="Oil Tank (m³)" value={e.incWasteOilTankM3} />
          <Field label="Running (hrs)" value={e.totalRunning} />
          <Field label="Quantity" value={e.quantity} />
          <Field label="Unit" value={e.quantityUnit} />
        </div>
      </Section>
      <Section title="Position & Notes">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Latitude" value={e.lat} />
          <Field label="Longitude" value={e.long} />
          <Field label="Remark" value={e.remark} />
        </div>
      </Section>
    </>
  );
}

function FuelReport({ e }: { e: FuelChangeoverLog }) {
  return (
    <>
      <Section title="Commence Change Over">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Regulation" value={e.regulation} />
          <Field label="Date/Time" value={formatDT(e.commenceDateTime)} />
          <Field label="Latitude" value={e.commenceLat} />
          <Field label="Longitude" value={e.commenceLong} />
          <Field label="From Fuel" value={e.fromFuel} />
          <Field label="From Sulphur %" value={e.fromSulphur} />
          <Field label="To Fuel" value={e.toFuel} />
          <Field label="To Sulphur %" value={e.toSulphur} />
        </div>
      </Section>
      <Section title="ROB at Commence (MT)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="HSFO" value={e.robHsfoCommence} />
          <Field label="LSFO" value={e.robLsfoCommence} />
          <Field label="MGO" value={e.robMgoCommence} />
        </div>
      </Section>
      <Section title="Completed Change Over">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Date/Time" value={formatDT(e.completeDateTime)} />
          <Field label="Latitude" value={e.completeLat} />
          <Field label="Longitude" value={e.completeLong} />
          <Field label="Regulation" value={e.regulation} />
        </div>
      </Section>
      <Section title="ROB at Complete (MT)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="HSFO" value={e.robHsfoComplete} />
          <Field label="LSFO" value={e.robLsfoComplete} />
          <Field label="MGO" value={e.robMgoComplete} />
        </div>
      </Section>
      <Section title="Results (Auto-calculated)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Running HRS" value={e.totalRunningHrs} />
          <Field label="Consumption HSFO" value={e.consumptionHsfo} />
          <Field label="Consumption LSFO" value={e.consumptionLsfo} />
          <Field label="Consumption MGO" value={e.consumptionMgo} />
        </div>
      </Section>
    </>
  );
}

function EntryReport({ type, entry }: { type: string; entry: any }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const labels = {
    bilge: "BILGE WATER SEPARATOR (15ppm)",
    incinerator: "INCINERATOR MANAGEMENT",
    fuel: "FUEL CHANGEOVER SYSTEM",
  };

  return (
    <div style={{ pageBreakAfter: "always", padding: "8px 12px" }}>
      <div style={{ background: "#0B1120", color: "white", padding: "10px 14px", borderRadius: "4px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Environmental Log</p>
          <p style={{ fontSize: "13pt", fontWeight: 900, margin: 0, letterSpacing: "0.5px", color: "white" }}>{labels[type as keyof typeof labels]}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Entry</p>
          <p style={{ fontSize: "13pt", fontWeight: 700, fontFamily: "monospace", margin: 0, color: "white" }}>#{entry.id?.slice(-6) || "-"}</p>
        </div>
      </div>

      {type === "bilge" && <BilgeReport e={entry} />}
      {type === "incinerator" && <IncineratorReport e={entry} />}
      {type === "fuel" && <FuelReport e={entry} />}

      <div style={{ marginTop: "8px", paddingTop: "5px", borderTop: "2px solid #C9A253", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "7pt", color: "#0B1120", margin: 0, fontWeight: 600 }}>Report By Saroukos Michail</p>
          <p style={{ fontSize: "6pt", color: "#734934", margin: 0 }}>SM Engineer Portal — Environmental Log System</p>
        </div>
        <p style={{ fontSize: "7pt", color: "#734934", margin: 0, fontFamily: "monospace" }}>{today}</p>
      </div>
    </div>
  );
}

export default function EnvironmentalLogPrint({ type, entries, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.print();
      const handleAfterPrint = () => {
        onClose();
        window.removeEventListener("afterprint", handleAfterPrint);
      };
      window.addEventListener("afterprint", handleAfterPrint);
      const fallback = setTimeout(() => {
        onClose();
        window.removeEventListener("afterprint", handleAfterPrint);
      }, 1000);
      return () => {
        clearTimeout(fallback);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
    }, 100);
    return () => clearTimeout(timeout);
  }, [onClose]);

  if (!containerRef.current) {
    containerRef.current = document.createElement("div");
    containerRef.current.id = "print-root";
    document.body.appendChild(containerRef.current);
  }

  return createPortal(
    <div style={{ background: "white", color: "#0f172a", fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", maxWidth: "210mm", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "12px 12px 6px" }}>
        <p style={{ fontSize: "12pt", fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: "1px", color: "#0B1120" }}>
          Environmental Log Report — {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
        </p>
        <p style={{ fontSize: "7pt", color: "#64748b", margin: "2px 0 0", fontFamily: "monospace" }}>
          Generated {new Date().toLocaleString()}
        </p>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #C9A253", margin: "0 12px 8px" }} />

      {entries.map((entry, idx) => (
        <EntryReport key={entry.id || idx} type={type} entry={entry} />
      ))}

      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 0.3cm; }
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; position: static !important; background: white !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </div>,
    containerRef.current
  );
}
