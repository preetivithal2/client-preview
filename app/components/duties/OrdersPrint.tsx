"use client";

// ORDERS PRINT — the printable register of dispatched Chief Engineer orders.
//
// Follows the repo's proven print pattern (CrewPerformancePrint.tsx /
// EnvironmentalLogPrint.tsx): portal into a body-level #print-root, an inline
// @media print block that hides every other top-level node (sidebar, header,
// buttons, the dispatch form), and window.print() driven after mount. The close
// is driven by `afterprint` rather than a short timer so the DOM is never torn
// down while the browser is still writing the PDF.
//
// It prints exactly the rows it is given — the caller passes the visible,
// filtered orders — and states the applied filters at the top of the page.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CrewMember, DutyDefinition, DutyFrequency } from "../../lib/types";

interface Props {
  orders: DutyDefinition[];
  crew: CrewMember[];
  filterSummary: string[];
  onClose: () => void;
}

const FREQ_LABEL = (f: DutyFrequency): string =>
  f === "DAILY" ? "Daily" : f === "WEEKLY" ? "Weekly" : f === "MONTHLY" ? "Monthly" : "One-off";

const shortDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TH = ({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" }) => (
  <th style={{ background: "#0B1120", color: "white", fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: align, padding: "4px 6px", border: "1px solid #0B1120" }}>
    {children}
  </th>
);

const TD = ({ children, align = "left", muted = false }: { children: React.ReactNode; align?: "left" | "center"; muted?: boolean }) => (
  <td style={{ fontSize: "7.5pt", textAlign: align, padding: "4px 6px", border: "1px solid #e2e8f0", color: muted ? "#94a3b8" : "#0f172a", verticalAlign: "top" }}>
    {children}
  </td>
);

const StatusBadge = ({ status }: { status: DutyDefinition["status"] }) => {
  const active = status === "ACTIVE";
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 5px",
      borderRadius: "3px",
      fontSize: "6.5pt",
      fontWeight: 700,
      letterSpacing: "0.3px",
      border: `1px solid ${active ? "#86EFAC" : "#e2e8f0"}`,
      background: active ? "#F0FDF4" : "#f8fafc",
      color: active ? "#15803D" : "#64748b",
    }}>
      {status}
    </span>
  );
};

export default function OrdersPrint({ orders, crew, filterSummary, onClose }: Props) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterPrintRef = useRef<(() => void) | null>(null);

  // Hold onClose in a ref so the print effect depends only on the container.
  // Callers pass an inline arrow; a fresh identity would otherwise re-run the
  // effect and fire a second print dialog.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Create the print root on mount and remove it on unmount, so repeat prints
  // never leave a duplicate #print-root in the body.
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "print-root";
    document.body.appendChild(el);
    // Mount-only: the portal target must exist in the DOM before we print.
    // Same pattern as CrewPerformancePrint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // `afterprint` signals the dialog is finished. The safety timer is long
      // on purpose: closing sooner tears the print DOM down mid-write and can
      // produce an unopenable PDF.
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

  const crewMap = useMemo(() => new Map(crew.map((c) => [c.id!, c])), [crew]);

  if (!container) return null;

  const now = new Date();
  const generatedAt = `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${now.toLocaleTimeString("en-GB")}`;

  const namesOf = (o: DutyDefinition): string => {
    const ids = o.recipientIds ?? [];
    if (ids.length === 0) return "No crew assigned";
    return ids.map((id) => crewMap.get(id)?.name ?? "Unknown crew").join(", ");
  };

  return createPortal(
    <div style={{ background: "white", color: "#0f172a", fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", maxWidth: "210mm", margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "245mm" }}>
        <div>
          {/* Title block */}
          <div style={{ borderBottom: "2px solid #C9A253", paddingBottom: "7px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px" }}>
            <div>
              <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: 0 }}>
                SM Engineer Portal · Engine Room
              </p>
              <h1 style={{ fontSize: "17pt", fontWeight: 900, color: "#0B1120", margin: "1px 0 0", letterSpacing: "0.3px" }}>
                CHIEF ENGINEER ORDERS
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "6pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", margin: 0 }}>Generated</p>
              <p style={{ fontSize: "7pt", color: "#734934", margin: "1px 0 0", fontFamily: "monospace", whiteSpace: "nowrap" }}>{generatedAt}</p>
            </div>
          </div>

          {/* Applied filter summary — e.g. "Orders for: OILER A" */}
          <div style={{ border: "1px solid #e2e8f0", borderLeft: "3px solid #C9A253", borderRadius: "3px", padding: "5px 8px", background: "#f8fafc", marginBottom: "8px" }}>
            <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#64748b", margin: 0 }}>
              Filters Applied · Orders Listed: {orders.length}
            </p>
            <p style={{ fontSize: "8pt", color: "#0f172a", margin: "2px 0 0", fontWeight: 500 }}>
              {filterSummary.length ? filterSummary.join("  ·  ") : "No filters applied — all dispatched orders"}
            </p>
          </div>

          {/* Orders table */}
          {orders.length === 0 ? (
            <p style={{ fontSize: "8pt", color: "#94a3b8", fontStyle: "italic", padding: "8px 0" }}>No orders match the selected filters.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ display: "table-header-group" }}>
                <tr>
                  <TH>Date</TH>
                  <TH>Order / Task</TH>
                  <TH>Frequency</TH>
                  <TH>Assigned To</TH>
                  <TH align="center">Status</TH>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id || i} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <TD>{shortDate(o.startDate)}</TD>
                    <TD>
                      <span style={{ fontWeight: 700 }}>{o.title}</span>
                      {o.description ? (
                        <span style={{ display: "block", fontSize: "6.5pt", color: "#64748b", marginTop: "1px" }}>{o.description}</span>
                      ) : null}
                    </TD>
                    <TD>{FREQ_LABEL(o.frequency)}</TD>
                    <TD>{namesOf(o)}</TD>
                    <TD align="center"><StatusBadge status={o.status} /></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Document footer */}
        <div style={{ marginTop: "auto", paddingTop: "5px", borderTop: "2px solid #C9A253", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div>
            <p style={{ fontSize: "8pt", color: "#0B1120", margin: 0, fontWeight: 800, letterSpacing: "0.4px" }}>CHIEF ENGINEER ORDERS</p>
            <p style={{ fontSize: "6.5pt", color: "#734934", margin: "1px 0 0" }}>Dispatched Order Register · SM Engineer Portal</p>
          </div>
          <p style={{ fontSize: "7pt", color: "#734934", margin: 0, fontFamily: "monospace", textAlign: "right", whiteSpace: "nowrap" }}>{generatedAt}</p>
        </div>
      </div>

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
