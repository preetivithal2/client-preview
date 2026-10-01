"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: "alert" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

export default function AlertDialog({
  open,
  title,
  message,
  type = "alert",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  onClose,
}: AlertDialogProps) {
  const [mounted, setMounted] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Portal target only exists in the browser.
  useEffect(() => { setMounted(true); }, []);

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open || !mounted) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // Rendered into document.body so the overlay is positioned against the
  // VIEWPORT, never against a transformed/animated ancestor — keeps the dialog
  // perfectly centred regardless of scroll position.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn p-4">
      <div
        className="bg-[var(--clr-bg-card)] rounded-2xl shadow-2xl max-w-sm w-full border border-[var(--clr-border)] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="pt-6 pb-2 flex justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            type === "confirm" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
          }`}>
            {type === "confirm" ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 text-center">
          <h3 className="text-lg font-bold text-[var(--clr-text-primary)] mb-1">{title}</h3>
          <p className="text-sm text-[var(--clr-text-secondary)] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className={`px-6 pb-6 flex ${type === "confirm" ? "gap-3" : "justify-center"}`}>
          {type === "confirm" && (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] border border-[var(--clr-border)] hover:bg-[var(--clr-bg-subtle)] rounded-xl transition cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer text-white ${
              type === "confirm"
                ? "bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)]"
                : "bg-red-600 hover:bg-red-700 px-8"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
