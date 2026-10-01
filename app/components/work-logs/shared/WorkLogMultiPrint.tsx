"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { WorkLogEntry } from "../../../lib/types";
import { formatDate } from "../../../lib/utils";

interface WorkLogMultiPrintProps {
  entries: WorkLogEntry[];
  onClose: () => void;
}

function displaySpares(spares: any): string {
  if (!spares) return "-";
  if (Array.isArray(spares)) return spares.join(", ") || "-";
  return spares;
}

function parseStatusStyle(status: string): Record<string, string> {
  const s = (status || "").toLowerCase();
  if (s.includes("open")) return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (s.includes("progress")) return { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" };
  if (s.includes("cancel")) return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
  if (s.includes("close") || s.includes("complete")) return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
  return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
}

function parsePrioStyle(priority?: string): Record<string, string> {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH") return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (p === "MEDIUM") return { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" };
  if (p === "LOW") return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
  return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
}

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

const Field = ({ label, value }: { label: string; value: any }) => (
  <div style={{ padding: "1px 4px" }}>
    <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", color: "#64748b", margin: 0, marginBottom: "0.5px" }}>{label}</p>
    <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: 0, fontWeight: 500, fontFamily: label === "Job ID" ? "monospace" : "inherit" }}>{value ?? "-"}</p>
  </div>
);

function EntryReport({ entry }: { entry: WorkLogEntry }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ pageBreakAfter: "always", padding: "8px 12px" }}>
      {/* Top Header Bar */}
      <div style={{ background: "#0B1120", color: "white", padding: "10px 14px", borderRadius: "4px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Vessel</p>
          <p style={{ fontSize: "13pt", fontWeight: 900, margin: 0, letterSpacing: "0.5px", color: "white" }}>{entry.vesselName || "N/A"}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Job ID</p>
          <p style={{ fontSize: "13pt", fontWeight: 700, fontFamily: "monospace", margin: 0, color: "white" }}>{entry.jobId || "-"}</p>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
        <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</span>
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "8pt", fontWeight: 700, border: "1px solid", ...parseStatusStyle(entry.status || "OPEN") }}>{entry.status || "OPEN"}</span>
        </div>
        <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Priority</span>
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "8pt", fontWeight: 700, border: "1px solid", ...parsePrioStyle(entry.priority) }}>{entry.priority || "-"}</span>
        </div>
        <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Days Open</span>
          <span style={{ fontSize: "9pt", fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{entry.daysOpen ?? "-"}</span>
        </div>
      </div>

      {/* Basic Information */}
      <Section title="Basic Information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
          <Field label="Reported Date" value={formatDate(entry.reportedDate)} />
          <Field label="Reported By" value={entry.reportedBy || "-"} />
          <Field label="Equipment" value={entry.equipmentName || entry.equipmentSpecs?.maker || "-"} />
          <Field label="Department" value={entry.department || "-"} />
          <Field label="Component" value={entry.component || "-"} />
          {/* TEMP-HIDDEN FIELD: "Regulation" — hidden per client request. Uncomment to restore. */}
          {/* <Field label="Regulation" value={entry.regulation || "-"} /> */}
          <Field label="Office Notified" value={entry.officeNotified || "-"} />
          <Field label="Assistants Required" value={entry.assistantsRequired || "-"} />
        </div>
      </Section>

      {/* Description */}
      <Section title="Job Description">
        <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: "1px 6px", lineHeight: "1.45" }}>{entry.jobDescription}</p>
      </Section>

      {/* Troubleshooting */}
      <Section title="Troubleshooting & Actions">
        <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: "1px 6px 4px", lineHeight: "1.45" }}>{entry.actionsTaken || "N/A"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          <Field label="Spares Used" value={displaySpares(entry.sparesUsed)} />
          <Field label="Reason for Job Performed" value={entry.reasonDelay || "N/A"} />
          {/* TEMP-HIDDEN FIELDS: "Order Status", "Requisition Status", "Tested Criteria" — hidden per client request. Uncomment to restore. */}
          {/* <Field label="Order Status" value={entry.orderStatus + (entry.poReference ? ` (${entry.poReference})` : "")} />
          <Field label="Requisition Status" value={entry.requisitionStatus || "-"} />
          <Field label="Tested Criteria" value={entry.testedCriteria || "-"} /> */}
          <Field label="Condition" value={entry.conditionMatrix || "-"} />
        </div>
      </Section>

      {/* Resolution */}
      {(entry.dateCompleted || entry.completedBy || entry.resolution) && (
        <Section title="Resolution & Completion">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
            {entry.dateCompleted && <Field label="Date Completed" value={formatDate(entry.dateCompleted)} />}
            {entry.completedBy && <Field label="Completed By" value={entry.completedBy} />}
          </div>
          {entry.resolution && <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: "3px 6px 0", lineHeight: "1.45" }}>{entry.resolution}</p>}
        </Section>
      )}

      {/* Footer */}
      <div style={{ marginTop: "8px", paddingTop: "5px", borderTop: "2px solid #C9A253", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "7pt", color: "#0B1120", margin: 0, fontWeight: 600 }}>Report By Saroukos Michail</p>
          <p style={{ fontSize: "6pt", color: "#734934", margin: 0 }}>SM Engineer Portal — Work Log System</p>
        </div>
        <p style={{ fontSize: "7pt", color: "#734934", margin: 0, fontFamily: "monospace" }}>{today}</p>
      </div>
    </div>
  );
}

export default function WorkLogMultiPrint({ entries, onClose }: WorkLogMultiPrintProps) {
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
      {/* Cover summary header */}
      <div style={{ textAlign: "center", padding: "12px 12px 6px" }}>
        <p style={{ fontSize: "12pt", fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: "1px", color: "#0B1120" }}>
          Work Log Report — {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
        </p>
        <p style={{ fontSize: "7pt", color: "#64748b", margin: "2px 0 0", fontFamily: "monospace" }}>
          Generated {new Date().toLocaleString()}
        </p>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #C9A253", margin: "0 12px 8px" }} />

      {entries.map((entry, idx) => (
        <EntryReport key={entry.id || idx} entry={entry} />
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
