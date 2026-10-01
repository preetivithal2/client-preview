"use client";

import { useRef } from 'react';
import { WorkLogEntry } from '../../lib/types';
import { formatDate, getStatusBadgeClasses } from '../../lib/utils';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

interface WorkLogViewModalProps {
  entry: WorkLogEntry;
  onClose: () => void;
}

export default function WorkLogViewModal({ entry, onClose }: WorkLogViewModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

//   const handleDownloadPDF = async () => {
//     if (!reportRef.current) return;
//     try {
//       const canvas = await html2canvas(reportRef.current, { scale: 2 });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`WorkLog_${entry.id}.pdf`);
//     } catch (error) {
//       console.error('PDF generation failed:', error);
//       alert('Failed to generate PDF. Please try again.');
//     }
//   };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--clr-bg-card)] backdrop-blur-sm z-10 flex items-center justify-between border-b border-[var(--clr-border)] px-6 py-4">
          <h3 className="text-xl font-bold text-[var(--clr-text-primary)]">Work Log Details</h3>
          <div className="flex items-center gap-3">
            <button
            //   onClick={handleDownloadPDF}
              className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Download PDF
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

        <div ref={reportRef} className="p-6 space-y-6">
          {/* Two-column summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Job ID</p>
              <p className="text-sm font-mono font-bold text-[var(--clr-text-primary)]">{entry.jobId || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Reported Date</p>
              <p className="text-sm font-medium text-[var(--clr-text-primary)]">{formatDate(entry.reportedDate)}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Equipment</p>
              <p className="text-sm font-medium text-[var(--clr-text-primary)]">{entry.equipmentSpecs?.maker} {entry.equipmentSpecs?.model}</p>
              <p className="text-xs text-[var(--clr-text-secondary)]">SN: {entry.equipmentSpecs?.serial} | {entry.equipmentSpecs?.specs}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Priority</p>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${entry.priority === 'HIGH' ? 'bg-[var(--clr-bg-red)] text-[var(--clr-text-red)]' : entry.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                {entry.priority}
              </span>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Status</p>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClasses(entry.status || 'OPEN')}`}>
                {entry.status}
              </span>
              <span className="ml-2 text-sm text-[var(--clr-text-primary)]">Days Open: {entry.daysOpen}</span>
            </div>
          </div>

          <hr className="border-[var(--clr-border)]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Reported By</p>
              <p className="text-sm text-[var(--clr-text-primary)]">{entry.reportedBy}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Office Notified</p>
              <p className="text-sm text-[var(--clr-text-primary)]">{entry.officeNotified}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Order Status</p>
              <p className="text-sm text-[var(--clr-text-primary)]">{entry.orderStatus} {entry.poReference && `(Ref: ${entry.poReference})`}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Requisition Status</p>
              <p className="text-sm text-[var(--clr-text-primary)]">{entry.requisitionStatus || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Reason for Delay</p>
              <p className="text-sm text-[var(--clr-text-primary)]">{entry.reasonDelay || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Job Description</p>
            <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)]">{entry.jobDescription}</p>
          </div>

          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Actions Taken</p>
            <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)]">{entry.actionsTaken || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Spares Used</p>
            <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)]">{entry.sparesUsed || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Media Attachments</p>
            {entry.mediaAttachments ? (
              <a href={entry.mediaAttachments} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {entry.mediaAttachments}
              </a>
            ) : (
              <p className="text-sm text-[var(--clr-text-secondary)]">N/A</p>
            )}
          </div>

          {entry.dateCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Date Completed</p>
                <p className="text-sm text-[var(--clr-text-primary)]">{formatDate(entry.dateCompleted)}</p>
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Completed By</p>
                <p className="text-sm text-[var(--clr-text-primary)]">{entry.completedBy || 'N/A'}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-mono font-semibold text-[var(--clr-text-secondary)] uppercase tracking-widest">Final Resolution / Root Cause</p>
            <p className="text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-page)] p-3 rounded-xl border border-[var(--clr-border)]">{entry.resolution || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


