"use client";

import { useState, useMemo, useCallback } from "react";
import { useWorkLog } from "../../lib/hooks/useWorkLog";
import { useAllDropdowns } from "../../lib/hooks/useAllDropdowns";

function calcDays(createdAt: any): number {
  if (!createdAt) return 0;
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return Math.max(Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)), 0);
}

export default function ExportControlDeck() {
  const [exporting, setExporting] = useState<string | null>(null);
  const { data: workLogs, loading } = useWorkLog();
  const { getOptions } = useAllDropdowns();

  const reportData = useMemo(() => {
    if (loading) return null;

    const total = workLogs.length;
    const isOpen = (s: string | undefined) => s?.toLowerCase().includes('open') ?? false;
    const isClosed = (s: string | undefined) => !!(s?.toLowerCase().includes('closed') || s?.toLowerCase().includes('complete'));
    const open = workLogs.filter((w) => isOpen(w.status)).length;
    const closed = workLogs.filter((w) => isClosed(w.status)).length;
    const high = workLogs.filter((w) => isOpen(w.status) && w.priority === 'HIGH').length;
    const medium = workLogs.filter((w) => isOpen(w.status) && w.priority === 'MEDIUM').length;
    const low = workLogs.filter((w) => isOpen(w.status) && w.priority === 'LOW').length;

    // Department breakdown (active jobs)
    const deptMap: Record<string, number> = {};
    workLogs.filter((w) => isOpen(w.status)).forEach((w) => {
      const d = w.department || 'Unspecified';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const allDepts = getOptions('department');
    const departments = allDepts.length > 0
      ? allDepts.map((name) => ({ name, jobs: deptMap[name] || 0 })).sort((a, b) => b.jobs - a.jobs)
      : Object.entries(deptMap).map(([name, jobs]) => ({ name, jobs })).sort((a, b) => b.jobs - a.jobs);

    // Distribution
    const distribution = [
      { status: "High Priority", count: high, share: total > 0 ? Math.round((high / total) * 100) : 0 },
      { status: "Medium Priority", count: medium, share: total > 0 ? Math.round((medium / total) * 100) : 0 },
      { status: "Low Priority", count: low, share: total > 0 ? Math.round((low / total) * 100) : 0 },
      { status: "Completed / Closed", count: closed, share: total > 0 ? Math.round((closed / total) * 100) : 0 },
    ];

    // Spares tracking
    const spares = workLogs
      .filter((w) => {
        if (!w.sparesUsed) return false;
        const arr = Array.isArray(w.sparesUsed) ? w.sparesUsed : [w.sparesUsed];
        return arr.some((s: any) => s && String(s).trim());
      })
      .map((w) => {
        const arr = Array.isArray(w.sparesUsed) ? w.sparesUsed : [w.sparesUsed];
        return {
          id: w.poReference || w.jobId || "-",
          name: arr.filter((s: any) => s && String(s).trim()).join(", "),
          qty: arr.length,
          eta: w.orderStatus || "Pending",
          days: calcDays(w.createdAt),
          priority: w.priority,
        };
      });

    // Monthly counts (current year)
    const currentYear = new Date().getFullYear();
    const monthCounts = new Array(12).fill(0);
    const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    workLogs.forEach((w) => {
      if (!w.createdAt) return;
      const date = w.createdAt.toDate ? w.createdAt.toDate() : new Date(w.createdAt);
      if (date.getFullYear() === currentYear) {
        monthCounts[date.getMonth()] += 1;
      }
    });
    const monthly = MONTHS_SHORT.map((m, i) => ({ month: m, jobs: monthCounts[i] }));
    const maxMonth = Math.max(...monthCounts, 1);

    return {
      generatedAt: new Date().toLocaleString(),
      total,
      open,
      closed,
      high,
      medium,
      low,
      departments,
      distribution,
      spares,
      monthly,
      maxMonth,
    };
  }, [workLogs, loading, getOptions]);

  // === EXCEL CSV ===
  const handleExcelExport = useCallback(() => {
    if (!reportData) return;
    let csv = "﻿CHIEF ENGINEER STATUS REPORT\n";
    csv += `Generated,${reportData.generatedAt}\n`;
    csv += `Total Records,${reportData.total}\n\n`;

    csv += `KEY PERFORMANCE INDICATORS\nMetric,Value\n`;
    csv += `Total Open Jobs,${reportData.open}\n`;
    csv += `High Priority Faults,${reportData.high}\n`;
    csv += `In-Progress Worklines,${reportData.open}\n\n`;

    csv += `MAINTENANCE DISTRIBUTION\nStatus Tier,Count,Share(%)\n`;
    reportData.distribution.forEach((d: any) => csv += `"${d.status}",${d.count},${d.share}\n`);
    csv += "\n";

    csv += `DEPARTMENTAL BREAKDOWN\nDepartment Sector,Active Open Jobs\n`;
    reportData.departments.forEach((d: any) => csv += `"${d.name}",${d.jobs}\n`);
    csv += "\n";

    csv += `CRITICAL PENDING SPARES\nID,Description,Qty,Status,Days,Priority\n`;
    reportData.spares.forEach((s: any) => csv += `"${s.id}","${s.name}",${s.qty},"${s.eta}",${s.days},"${s.priority}"\n`);
    csv += "\n";

    csv += `MONTHLY TREND (Year)\nMonth,Jobs\n`;
    reportData.monthly.forEach((m: any) => csv += `${m.month},${m.jobs}\n`);

    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "Engineer_Report.csv");
  }, [reportData]);

  // === PDF (prints a full visual dashboard copy with real data) ===
  const handlePdfExport = useCallback(() => {
    if (!reportData) return;

    const bar = (pct: number, color: string) =>
      `<div style="height:12px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin:4px 0;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:6px;"></div>
      </div>`;

    const maxDept = Math.max(...reportData.departments.map((d: any) => d.jobs), 1);
    const deptBars = reportData.departments.map((d: any) =>
      `<tr><td style="padding:5px 8px;font-weight:600;font-size:9pt">${d.name}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;font-weight:700;font-size:9pt">${d.jobs}</td>
        <td style="padding:5px 8px;width:50%">${bar(Math.round((d.jobs / maxDept) * 100), '#734934')}</td></tr>`
    ).join("");

    const distRows = reportData.distribution.map((d: any) =>
      `<tr><td style="padding:5px 8px;font-size:9pt">${d.status}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;font-size:9pt">${d.count}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;font-size:9pt">${d.share}%</td></tr>`
    ).join("");

    const sparesRows = reportData.spares.map((s: any) =>
      `<tr>
        <td style="padding:5px 8px;font-family:monospace;font-size:8pt">${s.id}</td>
        <td style="padding:5px 8px;font-weight:500;font-size:9pt">${s.name}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;font-size:9pt">${s.qty}</td>
        <td style="padding:5px 8px;font-size:9pt">${s.eta}</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;font-size:9pt">${s.days}d</td>
        <td style="padding:5px 8px;text-align:center"><span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:7pt;font-weight:700;${s.priority === 'HIGH' ? 'background:#fef2f2;color:#991b1b' : s.priority === 'MEDIUM' ? 'background:#fffbeb;color:#92400e' : 'background:#f0fdf4;color:#166534'}">${s.priority}</span></td>
      </tr>`
    ).join("");

    const maxMonth = Math.max(...reportData.monthly.map((m: any) => m.jobs), 1);
    const monthBars = reportData.monthly.map((m: any) =>
      `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
        <span style="font-family:monospace;font-weight:700;font-size:8pt">${m.jobs}</span>
        <div style="width:100%;height:50px;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${Math.max(Math.round((m.jobs / maxMonth) * 100), 3)}%;background:#734934;border-radius:3px 3px 0 0;border-top:2px solid #C9A253;"></div>
        </div>
        <span style="font-family:monospace;font-size:6pt;font-weight:600;color:#64748b">${m.month}</span>
      </div>`
    ).join("");

    const html = `<!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <title>Engineer Dashboard Report</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 0; max-width: 1100px; margin: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      h1 { font-size: 18pt; font-weight: 900; text-transform: uppercase; border-bottom: 3px solid #0f172a; padding-bottom: 8px; margin: 0 0 4px; }
      .meta { font-family: monospace; font-size: 8pt; color: #64748b; margin-bottom: 16px; }
      .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 16px 0; }
      .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; background: #f8fafc; }
      .card-num { font-size: 26pt; font-weight: 900; font-family: monospace; }
      .card-label { font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 3px; letter-spacing: 0.5px; }
      h2 { font-size: 10pt; font-weight: 800; text-transform: uppercase; border-left: 4px solid #0284c7; padding-left: 8px; margin: 20px 0 10px; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 9pt; }
      th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 7pt; text-transform: uppercase; border: 1px solid #e2e8f0; color: #334155; }
      td { padding: 5px 8px; border: 1px solid #e2e8f0; }
      .flex-row { display: flex; gap: 16px; }
      .flex-1 { flex: 1; }
      .page-break { page-break-before: always; }
      .mt-4 { margin-top: 16px; }
      .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 6pt; font-family: monospace; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    </style>
    </head>
    <body>
      <h1>Engineer Control Center &mdash; Status Report</h1>
      <div class="meta">Generated: ${reportData.generatedAt} &nbsp;|&nbsp; Total Records: ${reportData.total}</div>

      <div class="card-grid">
        <div class="card"><div class="card-num">${String(reportData.open).padStart(2, '0')}</div><div class="card-label">Total Open Jobs</div></div>
        <div class="card"><div class="card-num">${String(reportData.high).padStart(2, '0')}</div><div class="card-label">High Priority Faults</div></div>
        <div class="card"><div class="card-num">${String(reportData.open).padStart(2, '0')}</div><div class="card-label">In-Progress Worklines</div></div>
      </div>

      <div class="flex-row">
        <div class="flex-1">
          <h2>Status Distribution</h2>
          <table><thead><tr><th>Status</th><th style="text-align:right">Count</th><th style="text-align:right">Share</th></tr></thead>
          <tbody>${distRows}</tbody></table>
        </div>
        <div class="flex-1">
          <h2>Jobs by Department</h2>
          <table><thead><tr><th>Department</th><th style="text-align:right">Jobs</th><th></th></tr></thead>
          <tbody>${deptBars}</tbody></table>
        </div>
      </div>

      <h2>Monthly Trend</h2>
      <div style="display:flex;align-items:flex-end;gap:6px;height:100px;padding:8px 0;border-bottom:1px solid #e2e8f0;margin-bottom:10px;">
        ${monthBars}
      </div>

      <h2>Critical Pending Spares Inventory</h2>
      <table>
        <thead><tr><th>ID / PO Ref</th><th>Description</th><th style="text-align:right">Qty</th><th>Status</th><th style="text-align:right">Days</th><th style="text-align:center">Priority</th></tr></thead>
        <tbody>${sparesRows || '<tr><td colspan="6" style="text-align:center;color:#94a3b8">No spare parts orders found</td></tr>'}</tbody>
      </table>

      <div class="footer">
        <div>Command Deck Automated Manifest</div>
        <div>System Archive Copy</div>
      </div>
    </body>
    </html>`;

    // Open in iframe and print
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }

    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 500);
    }, 500);
  }, [reportData]);

  // === WORD .DOC ===
  const handleWordExport = useCallback(() => {
    if (!reportData) return;

    const bar = (pct: number, color: string) =>
      `<div style="height:12px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin:4px 0;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:6px;"></div>
      </div>`;

    const maxDept = Math.max(...reportData.departments.map((d: any) => d.jobs), 1);
    const deptBars = reportData.departments.map((d: any) =>
      `<tr><td style="padding:6px 10px;font-weight:600">${d.name}</td>
        <td style="padding:6px 10px;text-align:right;font-family:monospace;font-weight:700">${d.jobs}</td>
        <td style="padding:6px 10px;width:60%">${bar(Math.round((d.jobs / maxDept) * 100), '#734934')}</td></tr>`
    ).join("");

    const distRows = reportData.distribution.map((d: any) =>
      `<tr><td style="padding:6px 10px">${d.status}</td><td style="padding:6px 10px;text-align:right;font-family:monospace">${d.count}</td><td style="padding:6px 10px;text-align:right;font-family:monospace">${d.share}%</td></tr>`
    ).join("");

    const sparesRows = reportData.spares.map((s: any) =>
      `<tr>
        <td style="padding:6px 10px;font-family:monospace;font-size:9pt">${s.id}</td>
        <td style="padding:6px 10px;font-weight:500">${s.name}</td>
        <td style="padding:6px 10px;text-align:right;font-family:monospace">${s.qty}</td>
        <td style="padding:6px 10px">${s.eta}</td>
        <td style="padding:6px 10px;text-align:right;font-family:monospace">${s.days}d</td>
        <td style="padding:6px 10px;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:8pt;font-weight:700;${s.priority === 'HIGH' ? 'background:#fef2f2;color:#991b1b' : s.priority === 'MEDIUM' ? 'background:#fffbeb;color:#92400e' : 'background:#f0fdf4;color:#166534'}">${s.priority}</span></td>
      </tr>`
    ).join("");

    const maxMonth = Math.max(...reportData.monthly.map((m: any) => m.jobs), 1);
    const monthBars = reportData.monthly.map((m: any) =>
      `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-family:monospace;font-weight:700;font-size:9pt">${m.jobs}</span>
        <div style="width:100%;height:60px;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${Math.max(Math.round((m.jobs / maxMonth) * 100), 3)}%;background:#734934;border-radius:4px 4px 0 0;border-top:2px solid #C9A253;"></div>
        </div>
        <span style="font-family:monospace;font-size:7pt;font-weight:600;color:#64748b">${m.month}</span>
      </div>`
    ).join("");

    const html = `<!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <title>Engineer Dashboard Report</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 20px; max-width: 1100px; margin: auto; }
      h1 { font-size: 18pt; font-weight: 900; text-transform: uppercase; border-bottom: 3px solid #0f172a; padding-bottom: 8px; }
      .meta { font-family: monospace; font-size: 8pt; color: #64748b; margin-bottom: 20px; }
      .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
      .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
      .card-num { font-size: 28pt; font-weight: 900; font-family: monospace; }
      .card-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 4px; }
      h2 { font-size: 11pt; font-weight: 800; text-transform: uppercase; border-left: 4px solid #0284c7; padding-left: 8px; margin: 24px 0 12px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
      th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 7.5pt; text-transform: uppercase; border: 1px solid #e2e8f0; }
      td { padding: 6px 10px; border: 1px solid #e2e8f0; }
      .flex-row { display: flex; gap: 16px; }
      .flex-1 { flex: 1; }
      .page-break { page-break-before: always; }
      .mt-4 { margin-top: 16px; }
    </style>
    </head>
    <body>
      <h1>Engineer Control Center — Status Report</h1>
      <div class="meta">Generated: ${reportData.generatedAt} &nbsp;|&nbsp; Total Records: ${reportData.total}</div>

      <div class="card-grid">
        <div class="card"><div class="card-num">${String(reportData.open).padStart(2, '0')}</div><div class="card-label">Total Open Jobs</div></div>
        <div class="card"><div class="card-num">${String(reportData.high).padStart(2, '0')}</div><div class="card-label">High Priority Faults</div></div>
        <div class="card"><div class="card-num">${String(reportData.open).padStart(2, '0')}</div><div class="card-label">In-Progress Worklines</div></div>
      </div>

      <div class="flex-row">
        <div class="flex-1">
          <h2>Status Distribution</h2>
          <table><thead><tr><th>Status</th><th style="text-align:right">Count</th><th style="text-align:right">Share</th></tr></thead>
          <tbody>${distRows}</tbody></table>
        </div>
        <div class="flex-1">
          <h2>Jobs by Department</h2>
          <table><thead><tr><th>Department</th><th style="text-align:right">Jobs</th><th></th></tr></thead>
          <tbody>${deptBars}</tbody></table>
        </div>
      </div>

      <div class="page-break"></div>
      <h2>Monthly Trend</h2>
      <div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding:10px 0;border-bottom:1px solid #e2e8f0;">
        ${monthBars}
      </div>

      <h2 class="mt-4">Critical Pending Spares Inventory</h2>
      <table>
        <thead><tr><th>ID / PO Ref</th><th>Description</th><th style="text-align:right">Qty</th><th>Status</th><th style="text-align:right">Days</th><th style="text-align:center">Priority</th></tr></thead>
        <tbody>${sparesRows || '<tr><td colspan="6" style="text-align:center;color:#94a3b8">No spare parts orders found</td></tr>'}</tbody>
      </table>

      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;font-size:7pt;font-family:monospace;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">
        <div>Command Deck Automated Manifest</div>
        <div>System Archive Copy</div>
      </div>
    </body>
    </html>`;

    triggerDownload(
      new Blob(["﻿" + html], { type: "application/msword" }),
      "Engineer_Dashboard_Report.doc"
    );
  }, [reportData]);

  function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const executeExport = (format: string) => {
    setExporting(format);
    setTimeout(() => {
      if (format === "EXCEL") handleExcelExport();
      if (format === "WORD") handleWordExport();
      if (format === "PDF") handlePdfExport();
      setExporting(null);
    }, 600);
  };

  const actions = [
    { format: "EXCEL", color: "hover:bg- hover:text-red-700 hover:border-red-200" },
    { format: "PDF", color: "hover:bg- hover:text-red-700 hover:border-red-200" },
    { format: "WORD", color: "hover:bg- hover:text-red-700 hover:border-red-200" },
  ];

  if (loading || !reportData) {
    return (
      <div className="flex items-center gap-2 no-print">
        {["EXCEL", "PDF", "WORD"].map((fmt) => (
          <button key={fmt} type="button" disabled
            className="px-4 py-2 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] text-[var(--clr-text-muted)] text-xs font-mono font-bold rounded-lg opacity-50 cursor-not-allowed"
          >{fmt}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 no-print">
      {/* Hidden printable area — wraps the entire dashboard for PDF print capture */}
      <div id="printable-dashboard" className="hidden">
        {/* This div is populated by the actual page content via @media print CSS */}
      </div>

      {/* Control Deck Action Buttons */}
      <div className="flex items-center justify-end w-full">
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          {actions.map((act) => (
            <button
              key={act.format}
              type="button"
              disabled={exporting !== null}
              onClick={() => executeExport(act.format)}
              className={`px-4 py-2 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] text-[var(--clr-text-body)] text-xs font-mono font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 group select-none ${act.color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {exporting === act.format ? (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              <span>{exporting === act.format ? "EXPORTING..." : act.format}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
