"use client";

// CREW PERFORMANCE PRINT — one A4 page per crew member.
//
// Follows the repo's print pattern (see
// components/environmental-log/EnvironmentalLogPrint.tsx): a portal into a
// body-level #print-root div, an inline @media print block that hides every
// other top-level node (sidebar, header, buttons), and inline pt/mm styles.
// Mounting this component prints; callers gate it behind state.
//
// Two deliberate departures from that pattern, both to fix reported faults:
//   1. No trailing page break on the last member, and the footer is pinned to
//      the bottom of each report page — the document used to spill a blank
//      second page that carried only the footer.
//   2. The print-root container is created in an effect and removed on unmount,
//      and the close is driven by `afterprint` rather than a 1s timer, so the
//      DOM is never torn down while the browser is still writing the PDF.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DutyTask } from "../../lib/types";

export interface CrewPrintMember {
  name: string;
  rank: string;
  ratingLabel: "VERY GOOD" | "GOOD" | "SATISFACTORY" | "POOR";
  pct: number;
  total: number;
  yes: number;
  excused: number;
  unexcused: number;
  rows: DutyTask[];
}

interface Props {
  members: CrewPrintMember[];
  filterSummary: string[];
  periodLabel: string;
  onClose: () => void;
}

// Matches the TIERS dot/badge colours used on the card itself.
const RATING_COLOR: Record<CrewPrintMember["ratingLabel"], { bg: string; border: string; fg: string }> = {
  "VERY GOOD": { bg: "#F0FDF4", border: "#86EFAC", fg: "#15803D" },
  GOOD: { bg: "#EFF6FF", border: "#93C5FD", fg: "#1D4ED8" },
  SATISFACTORY: { bg: "#FFFBEB", border: "#FCD34D", fg: "#B45309" },
  POOR: { bg: "#FEF2F2", border: "#FCA5A5", fg: "#B91C1C" },
};

const FREQ_LABEL = (f: string): string =>
  f === "DAILY" ? "Daily" : f === "WEEKLY" ? "Weekly" : f === "MONTHLY" ? "Monthly" : "One-off";

const shortDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ border: "1px solid #e2e8f0", borderRadius: "3px", padding: "4px 6px", background: "#f8fafc" }}>
    <p style={{ fontSize: "6pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "#64748b", margin: 0 }}>{label}</p>
    <p style={{ fontSize: "10pt", fontWeight: 800, color: "#0B1120", margin: "1px 0 0" }}>{value}</p>
  </div>
);

const TH = ({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" }) => (
  <th style={{ background: "#0B1120", color: "white", fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: align, padding: "4px 6px", border: "1px solid #0B1120" }}>
    {children}
  </th>
);

const TD = ({ children, align = "left", muted = false }: { children: React.ReactNode; align?: "left" | "center"; muted?: boolean }) => (
  <td style={{ fontSize: "7.5pt", textAlign: align, padding: "3px 6px", border: "1px solid #e2e8f0", color: muted ? "#94a3b8" : "#0f172a", verticalAlign: "top" }}>
    {children}
  </td>
);

/** The document footer — report title, author and date, ruled off at the very
 *  bottom of every report page rather than sitting in a header. */
function PageFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <div style={{ marginTop: "auto", paddingTop: "5px", borderTop: "2px solid #C9A253", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", breakInside: "avoid", pageBreakInside: "avoid" }}>
      <div>
        <p style={{ fontSize: "8pt", color: "#0B1120", margin: 0, fontWeight: 800, letterSpacing: "0.4px" }}>CREW PERFORMANCE REPORT</p>
        <p style={{ fontSize: "6.5pt", color: "#734934", margin: "1px 0 0" }}>Report By Saroukos Michail · SM Engineer Portal</p>
      </div>
      <p style={{ fontSize: "7pt", color: "#734934", margin: 0, fontFamily: "monospace", textAlign: "right", whiteSpace: "nowrap" }}>{generatedAt}</p>
    </div>
  );
}

function MemberReport({ m, isLast, generatedAt, header }: { m: CrewPrintMember; isLast: boolean; generatedAt: string; header?: React.ReactNode }) {
  const rc = RATING_COLOR[m.ratingLabel];

  return (
    // The break sits on this outer element and is omitted for the final member,
    // which is what previously produced a trailing blank page.
    <div style={{ pageBreakAfter: isLast ? "auto" : "always", breakAfter: isLast ? "auto" : "page" }}>
      {/* Column that fills the printable A4 height so the footer lands at the
          bottom of the page even when a member has few duties. */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "245mm" }}>
        <div>
          {header}

          {/* Member identity */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div>
              <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: 0 }}>{m.rank}</p>
              <p style={{ fontSize: "14pt", fontWeight: 900, color: "#0B1120", margin: 0, letterSpacing: "0.3px" }}>{m.name}</p>
            </div>
            <div style={{ background: rc.bg, border: `1.5px solid ${rc.border}`, borderRadius: "4px", padding: "5px 14px", textAlign: "center" }}>
              <p style={{ fontSize: "6pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: rc.fg, margin: 0, opacity: 0.85 }}>Rating</p>
              <p style={{ fontSize: "12pt", fontWeight: 900, color: rc.fg, margin: 0, textTransform: "uppercase" }}>{m.ratingLabel}</p>
            </div>
          </div>

          {/* Duty statistics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px", marginBottom: "7px" }}>
            <Stat label="Duties" value={m.total} />
            <Stat label="Completed" value={m.yes} />
            <Stat label="Excused" value={m.excused} />
            <Stat label="Unexcused" value={m.unexcused} />
            <Stat label="Completion" value={`${m.pct}%`} />
            <Stat label="Period" value={m.rows.length} />
          </div>

          {/* Duty table */}
          {m.rows.length === 0 ? (
            <p style={{ fontSize: "8pt", color: "#94a3b8", fontStyle: "italic", padding: "8px 0" }}>No duties recorded for this period.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <TH>Date</TH>
                  <TH>Duties / Orders</TH>
                  <TH align="center">Completed</TH>
                  <TH align="center">Justification</TH>
                  <TH align="center">C/E Approval</TH>
                  <TH>Warnings / Remarks</TH>
                </tr>
              </thead>
              <tbody>
                {m.rows.map((r, i) => (
                  <tr key={r.id || i}>
                    <TD>{shortDate(r.dueDate)}</TD>
                    <TD>
                      {r.title}
                      {r.frequency ? <span style={{ display: "block", fontSize: "6pt", color: "#94a3b8" }}>{FREQ_LABEL(r.frequency)}</span> : null}
                    </TD>
                    <TD align="center">{r.completed || "—"}</TD>
                    <TD align="center">{r.justification || "—"}</TD>
                    <TD align="center">{r.approval || "—"}</TD>
                    <TD muted={!r.remarks}>{r.remarks || "—"}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <PageFooter generatedAt={generatedAt} />
      </div>
    </div>
  );
}

export default function CrewPerformancePrint({ members, filterSummary, periodLabel, onClose }: Props) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterPrintRef = useRef<(() => void) | null>(null);

  // Hold onClose in a ref so the print effect below depends only on the
  // container. Callers pass an inline arrow, and a fresh identity would
  // otherwise re-run the effect and fire a second print dialog.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Create the print root on mount and remove it on unmount. The original
  // pattern left the div in the body forever, so a second print produced a
  // duplicate #print-root and two nodes matched the print CSS rule.
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "print-root";
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (!container) return;

    const done = () => {
      if (afterPrintRef.current) {
        window.removeEventListener("afterprint", afterPrintRef.current);
        afterPrintRef.current = null;
      }
      if (safetyRef.current) {
        clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }
      onCloseRef.current();
    };

    const start = setTimeout(() => {
      afterPrintRef.current = done;
      window.addEventListener("afterprint", done);
      // `afterprint` is what tells us the print/save dialog has finished. The
      // safety timer is deliberately long: closing sooner tears the print DOM
      // down while the browser is still writing the file, which is what
      // produces an unopenable PDF.
      safetyRef.current = setTimeout(done, 120000);
      window.print();
    }, 100);

    return () => {
      clearTimeout(start);
      if (afterPrintRef.current) window.removeEventListener("afterprint", afterPrintRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
      afterPrintRef.current = null;
      safetyRef.current = null;
    };
  }, [container]);

  if (!container) return null;

  const now = new Date();
  const generatedAt = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${now.toLocaleTimeString("en-GB")}`;

  // Filter summary sits at the top of the first report page only, inside that
  // page's height-bounded column so it can never push content onto a new page.
  const header = (
    <div style={{ border: "1px solid #e2e8f0", borderLeft: "3px solid #C9A253", borderRadius: "3px", padding: "5px 8px", background: "#f8fafc", marginBottom: "8px" }}>
      <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#64748b", margin: 0 }}>
        Filters Applied · Period: {periodLabel} · Crew Listed: {members.length}
      </p>
      <p style={{ fontSize: "8pt", color: "#0f172a", margin: "2px 0 0", fontWeight: 500 }}>
        {filterSummary.length ? filterSummary.join("  ·  ") : "No filters applied — all on-board crew"}
      </p>
    </div>
  );

  return createPortal(
    <div style={{ background: "white", color: "#0f172a", fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", maxWidth: "210mm", margin: "0 auto" }}>
      {members.map((m, i) => (
        <MemberReport
          key={m.name + i}
          m={m}
          isLast={i === members.length - 1}
          generatedAt={generatedAt}
          header={i === 0 ? header : undefined}
        />
      ))}

      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 10mm; }
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; position: static !important; background: white !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </div>,
    container
  );
}
