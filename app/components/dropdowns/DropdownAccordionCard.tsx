"use client";

import { useState, useEffect } from "react";
import { getDropdown, updateDropdownOptions } from "../../lib/firestore";

interface DropdownAccordionCardProps {
  documentKey: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
  defaultOptions?: string[];
}

export default function DropdownAccordionCard({
  documentKey,
  defaultLabel,
  defaultPlaceholder,
  defaultOptions,
}: DropdownAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldLabel, setFieldLabel] = useState(defaultLabel ?? "");
  const [placeholder, setPlaceholder] = useState(defaultPlaceholder ?? "");
  const [options, setOptions] = useState<string[]>(defaultOptions ?? []);
  const [newOption, setNewOption] = useState("");
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Always fetch from Firestore on mount — Firestore is the single source of truth
  useEffect(() => {
    getDropdown(documentKey)
      .then((doc) => {
        if (doc) {
          setFieldLabel(doc.label);
          setPlaceholder(doc.placeholder);
          setOptions(doc.options ?? []);
        }
        // If no Firestore doc exists, keep the provided defaults as fallback
      })
      .catch(console.error);
  }, [documentKey]);

  const persistOptions = async (newOptions: string[]) => {
    try {
      await updateDropdownOptions(documentKey, newOptions, fieldLabel || defaultLabel, placeholder || defaultPlaceholder);
    } catch (err) {
      console.error("Failed to save dropdown options:", err);
    }
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newOption.trim();
    if (!trimmed) {
      setError("Please enter a value.");
      return;
    }
    if (options.some((opt) => opt.toLowerCase() === trimmed.toLowerCase())) {
      setError("This option already exists.");
      return;
    }
    const newOptions = [...options, trimmed];
    setOptions(newOptions);
    void persistOptions(newOptions);
    setNewOption("");
    setError(null);
    setConfirmDeleteIndex(null);
    setEditingIndex(null);
  };

  const handleDeleteClick = (index: number) => {
    if (confirmDeleteIndex === index) {
      // Second click – confirm deletion
      const newOptions = options.filter((_, idx) => idx !== index);
      setOptions(newOptions);
      void persistOptions(newOptions);
      setConfirmDeleteIndex(null);
      if (editingIndex === index) setEditingIndex(null);
    } else {
      // First click – arm confirmation
      setConfirmDeleteIndex(index);
      // If currently editing, cancel edit
      if (editingIndex !== null) setEditingIndex(null);
    }
  };

  const handleEditClick = (index: number) => {
    // If already editing this item, cancel (toggle off)
    if (editingIndex === index) {
      setEditingIndex(null);
      return;
    }
    // Start editing
    setEditingIndex(index);
    setEditValue(options[index]);
    setConfirmDeleteIndex(null); // clear any delete confirmation
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      alert("Value cannot be empty.");
      return;
    }
    // Check for duplicates (excluding itself)
    if (options.some((opt, idx) => idx !== index && opt.toLowerCase() === trimmed.toLowerCase())) {
      alert("This option already exists.");
      return;
    }
    const updated = [...options];
    updated[index] = trimmed;
    setOptions(updated);
    void persistOptions(updated);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setConfirmDeleteIndex(null);
    setError(null);
    setEditingIndex(null);
  };

  return (
    <div
      className={`bg-[var(--clr-bg-card)] backdrop-blur-sm border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${
        isOpen
          ? "border-[var(--clr-bg-accent)] shadow-lg ring-1 ring-[var(--clr-bg-tag)]"
          : "border-[var(--clr-border)] hover:border-[var(--clr-border)]"
      }`}
    >
      {/* Header – clickable */}
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-[var(--clr-bg-card)] hover:bg-[var(--clr-bg-page)] transition-colors group cursor-pointer"
      >
        <div className="space-y-1 min-w-0 flex-1 mr-2">
          <span className="text-[10px] font-mono font-semibold text-[var(--clr-text-muted)] uppercase tracking-widest">
            Form Target
          </span>
          <h3 className="text-sm font-extrabold text-[var(--clr-text-primary)] tracking-tight leading-tight truncate">
            {fieldLabel}
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold border border-[var(--clr-bg-tag-border)]">
            {options.length}
          </span>
          <svg
            className={`w-5 h-5 text-[var(--clr-text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
          isOpen ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[var(--clr-border)] p-4 sm:p-5 space-y-4 bg-[var(--clr-bg-card)]">
          {/* Options List */}
          <div className="max-h-48 overflow-y-auto pr-1 custom-scroll">
            {options.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-[var(--clr-text-muted)] italic">
                No entries yet. Add one below.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {options.map((option, idx) => {
                  const isConfirming = confirmDeleteIndex === idx;
                  const isEditing = editingIndex === idx;

                  return (
                    <li
                      key={idx}
                      className={`flex flex-wrap items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                        isConfirming
                          ? "bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)]"
                          : isEditing
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-[var(--clr-bg-subtle)]"
                      } group`}
                    >
                      {isEditing ? (
                        // Edit mode: input + save/cancel
                        <div className="flex-1 flex flex-wrap items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 min-w-[120px] px-3 py-1.5 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition bg-[var(--clr-bg-card)]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(idx);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(idx)}
                              className="px-2.5 py-1 text-xs font-bold bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] rounded-lg transition cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-xs font-bold bg-[var(--clr-bg-subtle)] hover:bg-[var(--clr-border)] text-[var(--clr-text-body)] rounded-lg transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal display
                        <>
                          <span
                            className={`text-sm font-medium tracking-wide transition-all ${
                              isConfirming
                                ? "text-red-700 line-through"
                                : "text-[var(--clr-text-primary)]"
                            }`}
                          >
                            {option}
                          </span>

                          <div className="flex items-center gap-1 flex-wrap">
                            {isConfirming && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteIndex(null)}
                                className="text-[10px] font-mono font-bold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] uppercase tracking-widest px-2 py-0.5 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            {/* Edit button (pencil) - hidden when confirming delete */}
                            {!isConfirming && (
                              <button
                                type="button"
                                onClick={() => handleEditClick(idx)}
                                className="p-1.5 text-[var(--clr-text-muted)] hover:text-blue-600 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                                title="Edit option"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                            )}
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(idx)}
                              className={`flex items-center gap-1 transition-all duration-150 cursor-pointer ${
                                isConfirming
                                  ? "bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest shadow-sm hover:bg-red-700 animate-pulse"
                                  : "p-1.5 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-red)] rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                              }`}
                              title={isConfirming ? "Click again to delete" : "Delete option"}
                            >
                              {isConfirming ? (
                                "Confirm?"
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add Option Form */}
          <form onSubmit={handleAddOption} className="space-y-3 pt-1">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[var(--clr-text-muted)] uppercase tracking-widest mb-1">
                Option Label Entry
              </label>
              <input
                type="text"
                value={newOption}
                onChange={(e) => {
                  setNewOption(e.target.value);
                  setError(null);
                  setConfirmDeleteIndex(null);
                  setEditingIndex(null);
                }}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-card)] font-medium text-[var(--clr-text-primary)] placeholder:text-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition-all"
              />
              {error && <p className="mt-1 text-xs text-[var(--clr-text-red)] font-medium">{error}</p>}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={toggleOpen}
                className="px-4 py-2 text-xs font-bold text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] uppercase tracking-widest transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md uppercase tracking-widest cursor-pointer"
              >
                ADD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
