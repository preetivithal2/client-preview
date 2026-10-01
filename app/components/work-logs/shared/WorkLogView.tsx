

// components/shared/WorkLogView.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { WorkLogEntry } from "../../../lib/types";
import { formatDate, getStatusBadgeClasses } from "../../../lib/utils";

interface WorkLogViewProps {
  entry: WorkLogEntry;
  onClose: () => void;
}

export default function WorkLogView({ entry, onClose }: WorkLogViewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  const displaySpares = (spares: any) => {
    if (!spares) return "-";
    if (Array.isArray(spares)) return spares.join(", ") || "-";
    return spares;
  };

  const handlePrint = () => {
    setIsPrinting(true);
  };

  useEffect(() => {
    return () => {
      if (printContainerRef.current) {
        document.body.removeChild(printContainerRef.current);
        printContainerRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Modal UI (hidden during print) */}
      {!isPrinting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--clr-bg-card)] backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
              <h3 className="text-xl font-bold text-[var(--clr-text-primary)]">
                Work Log Details
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                    />
                  </svg>
                  Print / Save PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content (visible on screen only) */}
            <div className="p-6 space-y-6">
              <ReportContent entry={entry} displaySpares={displaySpares} />
            </div>
          </div>
        </div>
      )}

      {/* Print portal – rendered only when isPrinting is true */}
      {isPrinting &&
        createPortal(
          <PrintReport
            entry={entry}
            displaySpares={displaySpares}
            onPrinted={() => {
              setIsPrinting(false);
              if (printContainerRef.current) {
                document.body.removeChild(printContainerRef.current);
                printContainerRef.current = null;
              }
            }}
            ref={printContainerRef}
          />,
          (() => {
            if (!printContainerRef.current) {
              const el = document.createElement("div");
              el.id = "print-root";
              document.body.appendChild(el);
              printContainerRef.current = el;
            }
            return printContainerRef.current;
          })()
        )}
    </>
  );
}

// ---------- Reusable report content (used both on screen and in print) ----------
function ReportContent({
  entry,
  displaySpares,
}: {
  entry: WorkLogEntry;
  displaySpares: (spares: any) => string;
}) {
  return (
    <>
      {/* Header: Job ID & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[var(--clr-border)] print:border-gray-300 print:pb-1">
        <div>
          <span className="text-xs font-mono text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-500 print:tracking-normal">
            Job ID
          </span>
          <p className="text-lg font-bold font-mono text-[var(--clr-text-primary)] print:text-sm print:text-black">
            {entry.jobId || "-"}
          </p>
        </div>
        <div className="flex items-center gap-2 print:gap-1">
          <div>
            <span className="text-xs font-mono text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-500 print:tracking-normal">
              Status
            </span>
            <p>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClasses(entry.status || 'OPEN')} print:bg-transparent print:border print:border-current print:text-black print:rounded-md print:px-1 print:text-[10px]`}
              >
                {entry.status}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-500 print:tracking-normal">
              Days Open
            </span>
            <p className="font-mono font-bold text-[var(--clr-text-primary)] print:text-xs print:text-black">
              {entry.daysOpen ?? "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2 print:gap-1">
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Reported Date
          </p>
          <p className="text-sm font-medium text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {formatDate(entry.reportedDate)}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Equipment
          </p>
          <p className="text-sm font-bold text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.equipmentName || entry.equipmentSpecs?.maker || "-"}
          </p>
          {(entry.equipmentSpecs?.maker || entry.equipmentSpecs?.model) && (
            <p className="text-xs text-[var(--clr-text-muted)] print:text-[9px] print:text-gray-500 mt-0.5">
              {entry.equipmentSpecs?.maker} {entry.equipmentSpecs?.model}
              {entry.equipmentSpecs?.serial && ` · SN: ${entry.equipmentSpecs.serial}`}
              {entry.equipmentSpecs?.specs && ` · ${entry.equipmentSpecs.specs}`}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Priority
          </p>
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
              entry.priority === "HIGH"
                ? "bg-[var(--clr-bg-red)] text-[var(--clr-text-red)]"
                : entry.priority === "MEDIUM"
                ? "bg-[var(--clr-bg-subtle)] text-[var(--clr-text-body)]"
                : "bg-[var(--clr-bg-subtle)] text-[var(--clr-text-secondary)]"
            } print:bg-transparent print:border print:border-current print:text-black print:rounded-md print:px-1 print:text-[10px]`}
          >
            {entry.priority}
          </span>
        </div>
        {/* TEMP-HIDDEN FIELD: "Regulation" — hidden per client request. Uncomment to restore. */}
        {/* <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Regulation
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.regulation || "-"}
          </p>
        </div> */}
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Component
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.component || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Vessel Name
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.vesselName || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Department
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.department || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Reported By
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.reportedBy}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Office Notified
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.officeNotified}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Assistants Required
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.assistantsRequired || "-"}
          </p>
        </div>
      </div>

      <hr className="border-[var(--clr-border)] print:border-gray-300 print:my-1" />

      {/* Description */}
      <div>
        <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
          Job / Defect Description
        </p>
        <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)] print:bg-white print:text-xs print:text-black print:border-gray-300 print:rounded-none print:p-1.5">
          {entry.jobDescription}
        </p>
      </div>

      {/* Actions & Troubleshooting */}
      <div>
        <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
          Actions Taken
        </p>
        <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)] print:bg-white print:text-xs print:text-black print:border-gray-300 print:rounded-none print:p-1.5">
          {entry.actionsTaken || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2 print:gap-1">
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Spares Used
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {displaySpares(entry.sparesUsed)}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Reason for Job Performed
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.reasonDelay || "N/A"}
          </p>
        </div>
        {/* TEMP-HIDDEN FIELDS: "Order Status", "Requisition Status", "Tested Criteria" — hidden per client request. Uncomment to restore. */}
        {/* <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Order Status
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.orderStatus}{" "}
            {entry.poReference && `(Ref: ${entry.poReference})`}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Requisition Status
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.requisitionStatus || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Tested Criteria
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.testedCriteria || "-"}
          </p>
        </div> */}
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Condition
          </p>
          <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
            {entry.conditionMatrix || "-"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
          Media Attachments
        </p>
        {/* Legacy mediaAttachments — try to show as image, fall back to file icon */}
        {entry.mediaAttachments && !entry.files?.length ? (
          <div className="group block border border-[var(--clr-border)] rounded-xl overflow-hidden hover:shadow-md transition-all print:border-gray-300 max-w-[200px]">
            <div className="aspect-[4/3] bg-[var(--clr-bg-subtle)] flex items-center justify-center overflow-hidden print:bg-gray-100 relative">
              <img
                src={entry.mediaAttachments}
                alt="Attachment"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, show file icon instead
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 flex-col items-center justify-center text-[var(--clr-text-muted)]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider mt-1">FILE</span>
              </div>
              <a href={entry.mediaAttachments} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
            </div>
            <div className="p-2.5 bg-[var(--clr-bg-card)] print:bg-white">
              <p className="text-xs font-medium text-[var(--clr-text-primary)] truncate">Attachment</p>
            </div>
          </div>
        ) : !entry.mediaAttachments && (!entry.files || entry.files.length === 0) ? (
          <p className="text-sm text-[var(--clr-text-secondary)] print:text-xs print:text-gray-600">N/A</p>
        ) : null}

        {/* Uploaded files from Firestore — visual file preview cards */}
        {entry.files && entry.files.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {entry.files.map((file) => (
              <div
                key={file.id}
                className="group block border border-[var(--clr-border)] rounded-xl overflow-hidden hover:shadow-md transition-all print:border-gray-300"
              >
                {/* Preview area — actual content thumbnail */}
                <div className="aspect-[4/3] bg-[var(--clr-bg-subtle)] flex items-center justify-center overflow-hidden print:bg-gray-100 relative">
                  {file.type?.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : file.type?.startsWith('video/') ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      Your browser does not support video.
                    </video>
                  ) : file.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-2 text-[var(--clr-text-muted)]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--clr-bg-card)] px-2 py-0.5 rounded border border-[var(--clr-border)]">
                        PDF
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[var(--clr-text-muted)]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--clr-bg-card)] px-2 py-0.5 rounded border border-[var(--clr-border)]">
                        {(file.type || 'file').split('/').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  )}
                  {/* Click overlay */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    title="Open file"
                  />
                </div>
                {/* File info */}
                <div className="p-3 bg-[var(--clr-bg-card)] print:bg-white">
                  <p className="text-xs font-medium text-[var(--clr-text-primary)] truncate">
                    {file.fileName}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-[var(--clr-border)] print:border-gray-300 print:my-1" />

      {/* Resolution */}
      {entry.dateCompleted && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2 print:gap-1">
          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
              Date Completed
            </p>
            <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
              {formatDate(entry.dateCompleted)}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
              Completed By
            </p>
            <p className="text-sm text-[var(--clr-text-primary)] print:text-xs print:text-black">
              {entry.completedBy || "N/A"}
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
          Final Resolution / Root Cause
        </p>
        <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)] print:bg-white print:text-xs print:text-black print:border-gray-300 print:rounded-none print:p-1.5">
          {entry.resolution || "N/A"}
        </p>
      </div>

      {/* Attachments for print */}
      {(entry.mediaAttachments || (entry.files && entry.files.length > 0)) && (
        <div>
          <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest print:text-[10px] print:text-gray-600 print:font-normal print:tracking-normal">
            Attachments
          </p>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Legacy mediaAttachments */}
            {entry.mediaAttachments && (
              <div className="border border-gray-300 rounded overflow-hidden print:border-gray-400">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={entry.mediaAttachments}
                    alt="Attachment"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="p-1.5 bg-white">
                  <p className="text-[9px] font-medium text-black truncate">Attachment</p>
                </div>
              </div>
            )}
            {/* files array */}
            {entry.files && entry.files.map((file) => (
              <div key={file.id} className="border border-gray-300 rounded overflow-hidden print:border-gray-400 break-inside-avoid">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                  ) : file.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold">PDF</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-[7px] font-mono font-bold uppercase">{(file.type || 'file').split('/').pop()}</span>
                    </div>
                  )}
                </div>
                <div className="p-1.5 bg-white">
                  <p className="text-[9px] font-medium text-black truncate">{file.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Print‑only component (uses a portal) ----------
import React from "react";

interface PrintReportProps {
  entry: WorkLogEntry;
  displaySpares: (spares: any) => string;
  onPrinted: () => void;
}

const PrintReport = React.forwardRef<HTMLDivElement, PrintReportProps>(
  ({ entry, displaySpares, onPrinted }, ref) => {
    const vesselName = entry.vesselName || "N/A";
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    useEffect(() => {
      const timeout = setTimeout(() => {
        window.print();
        const handleAfterPrint = () => {
          onPrinted();
          window.removeEventListener("afterprint", handleAfterPrint);
        };
        window.addEventListener("afterprint", handleAfterPrint);
        const fallbackTimeout = setTimeout(() => {
          onPrinted();
          window.removeEventListener("afterprint", handleAfterPrint);
        }, 1000);
        return () => {
          clearTimeout(fallbackTimeout);
          window.removeEventListener("afterprint", handleAfterPrint);
        };
      }, 100);
      return () => clearTimeout(timeout);
    }, [onPrinted]);

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

    const Field = ({ label, value, color }: { label: string; value: any; color?: string }) => (
      <div style={{ padding: "1px 4px" }}>
        <p style={{ fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", color: "#64748b", margin: 0, marginBottom: "0.5px" }}>{label}</p>
        <p style={{ fontSize: "8.5pt", color: color || "#0f172a", margin: 0, fontWeight: 500, fontFamily: label === "Job ID" || label === "Days Open" ? "monospace" : "inherit" }}>
          {value ?? "-"}
        </p>
      </div>
    );

    const Divider = () => <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "5px 0" }} />;

    return (
      <div
        ref={ref}
        style={{
          background: "white",
          color: "#0f172a",
          fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "8px 12px",
        }}
      >
        {/* ═══════ TOP HEADER BAR ═══════ */}
        <div style={{ background: "#0B1120", color: "white", padding: "10px 14px", borderRadius: "4px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Vessel</p>
            <p style={{ fontSize: "13pt", fontWeight: 900, margin: 0, letterSpacing: "0.5px", color: "white" }}>{vesselName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "6.5pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, margin: 0 }}>Job ID</p>
            <p style={{ fontSize: "13pt", fontWeight: 700, fontFamily: "monospace", margin: 0, color: "white" }}>{entry.jobId || "-"}</p>
          </div>
        </div>

        {/* ═══════ STATUS BAR ═══════ */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</span>
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "8pt", fontWeight: 700, border: "1px solid", ...parseStatusStyle(entry.status || "OPEN") }}>
              {entry.status || "OPEN"}
            </span>
          </div>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Priority</span>
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "8pt", fontWeight: 700, border: "1px solid", ...parsePrioStyle(entry.priority) }}>
              {entry.priority}
            </span>
          </div>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Days Open</span>
            <span style={{ fontSize: "9pt", fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{entry.daysOpen ?? "-"}</span>
          </div>
        </div>

        {/* ═══════ MAIN INFO GRID ═══════ */}
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

        <Divider />

        {/* ═══════ DESCRIPTION ═══════ */}
        <Section title="Job Description">
          <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: "1px 6px", lineHeight: "1.45" }}>{entry.jobDescription}</p>
        </Section>

        <Divider />

        {/* ═══════ TROUBLESHOOTING ═══════ */}
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

        <Divider />

        {/* ═══════ RESOLUTION ═══════ */}
        {(entry.dateCompleted || entry.completedBy || entry.resolution) && (
          <Section title="Resolution & Completion">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
              {entry.dateCompleted && <Field label="Date Completed" value={formatDate(entry.dateCompleted)} />}
              {entry.completedBy && <Field label="Completed By" value={entry.completedBy} />}
            </div>
            {entry.resolution && <p style={{ fontSize: "8.5pt", color: "#0f172a", margin: "3px 6px 0", lineHeight: "1.45" }}>{entry.resolution}</p>}
          </Section>
        )}

        {/* ═══════ FOOTER ═══════ */}
        <div style={{ marginTop: "8px", paddingTop: "5px", borderTop: "2px solid #C9A253", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "7pt", color: "#0B1120", margin: 0, fontWeight: 600 }}>Report By Saroukos Michail</p>
            <p style={{ fontSize: "6pt", color: "#734934", margin: 0 }}>SM Engineer Portal — Work Log System</p>
          </div>
          <p style={{ fontSize: "7pt", color: "#734934", margin: 0, fontFamily: "monospace" }}>{today}</p>
        </div>

        {/* ═══════ PRINT STYLES ═══════ */}
        <style>{`
          @media print {
            html, body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            @page { size: A4; margin: 0.3cm; }
            body > *:not(#print-root) { display: none !important; }
            #print-root { display: block !important; position: static !important; background: white !important; margin: 0 !important; padding: 0 !important; }
          }
        `}</style>
      </div>
    );
  }
);

PrintReport.displayName = "PrintReport";

/* ─── Helpers ─── */
function parseStatusStyle(status: string): Record<string, string> {
  const s = status.toLowerCase();
  if (s.includes("open"))       return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (s.includes("progress"))   return { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" };
  if (s.includes("cancel"))     return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
  if (s.includes("close") || s.includes("complete")) return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
  return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
}

function parsePrioStyle(priority?: string): Record<string, string> {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH")   return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  if (p === "MEDIUM") return { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" };
  if (p === "LOW")    return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
  return { background: "#f8fafc", color: "#475569", borderColor: "#cbd5e1" };
}