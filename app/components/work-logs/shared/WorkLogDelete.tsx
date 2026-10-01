// components/shared/WorkLogDelete.tsx
"use client";

import { useState } from 'react';
import { WorkLogEntry } from '../../../lib/types';

interface WorkLogDeleteProps {
  entry: WorkLogEntry;
  onConfirm: (id: string) => Promise<void>;
  onCancel: () => void;
}

export default function WorkLogDelete({ entry, onConfirm, onCancel }: WorkLogDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(entry.id);
      onCancel(); // close modal after delete
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--clr-bg-card)] rounded-3xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-[var(--clr-bg-red)] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--clr-text-red)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--clr-text-primary)] mb-2">Delete Work Log</h3>
          <p className="text-sm text-[var(--clr-text-secondary)] mb-1">
            Are you sure you want to delete this entry?
          </p>
          <p className="text-sm font-mono font-semibold text-[var(--clr-text-primary)]">
            Job ID: {entry.jobId || entry.id}
          </p>
          <p className="text-xs text-[var(--clr-text-muted)] mt-2">This action cannot be undone.</p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-6 py-2.5 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`
                px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm
                ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}