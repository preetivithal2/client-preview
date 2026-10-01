"use client";

import { useState } from "react";

interface DropdownCardProps {
  title: string;
  subtitle: string;
  placeholder: string;
  initialValues: string[];
}

export default function DropdownCard({ title, subtitle, placeholder, initialValues }: DropdownCardProps) {
  const [items, setItems] = useState<string[]>(initialValues);
  const [inputValue, setInputValue] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Prevent duplicated items in dropdown lists
    if (items.some(item => item.toLowerCase() === inputValue.trim().toLowerCase())) {
      alert("This option record specification already exists.");
      return;
    }

    setItems([...items, inputValue.trim()]);
    setInputValue("");
  };

  const handleDeleteItem = (indexToRemove: number) => {
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl p-5 lg:p-6 shadow-xs flex flex-col h-[480px]">
      
      {/* Header Info */}
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--clr-text-body)]">{title}</h3>
        <p className="text-xs text-[var(--clr-text-secondary)] mt-0.5">{subtitle}</p>
      </div>

      {/* Inline Form Entry Block */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-[var(--clr-border-light)] rounded-lg bg-[var(--clr-bg-card)] text-sm text-[var(--clr-text-body)] placeholder-[var(--clr-text-muted)] font-medium focus:outline-none focus:border-[var(--clr-ring-solid)] focus:ring-1 focus:ring-[var(--clr-ring)] transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-xs font-bold rounded-lg transition-colors shrink-0 uppercase tracking-wide"
        >
          Add
        </button>
      </form>

      {/* Active Array List Output Node */}
      <div className="flex-1 overflow-y-auto border border-[var(--clr-border-light)] rounded-lg divide-y divide-[var(--clr-border-light)] bg-[var(--clr-bg-card-hover)]/40 adaptive-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--clr-text-muted)] p-4 text-center">
            No dataset records available. Add parameters above.
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between px-3 py-2.5 hover:bg-[var(--clr-bg-card)] transition-colors group">
              <span className="text-sm font-semibold text-[var(--clr-text-body)] tracking-wide">{item}</span>
              
              {/* Contextual Delete Execution Button */}
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                className="p-1 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-red)] rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={`Delete ${item}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}