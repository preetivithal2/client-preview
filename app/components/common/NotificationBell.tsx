"use client";

import { useState, useEffect, useRef } from "react";
import { getNotifications, dismissNotification, addNotification } from "../../lib/notificationService";
import type { AppNotification } from "../../lib/notificationService";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => setNotifications(getNotifications());

  useEffect(() => {
    refresh();

    // Poll every 5s for cross-tab changes
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes (same tab dispatches custom event)
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("notification-update", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("notification-update", onStorage);
    };
  }, []);

  // Internet offline detection
  useEffect(() => {
    const goOffline = () => {
      const existing = getNotifications();
      if (!existing.some((n) => n.type === "offline")) {
        addNotification("offline", "Internet connection lost. Some features may not work.");
        refresh();
      }
    };
    const goOnline = () => {
      const kept = getNotifications().filter((n) => n.type !== "offline");
      localStorage.setItem("app_notifications", JSON.stringify(kept));
      refresh();
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    // Check initial state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      goOffline();
    }
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    refresh();
  };

  const handleClearAll = () => {
    notifications.forEach((n) => dismissNotification(n.id));
    refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition-colors rounded-lg relative cursor-pointer"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--clr-text-red)] ring-2 ring-[var(--clr-bg-card)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--clr-border)] bg-[var(--clr-bg-subtle)]">
            <span className="text-xs font-mono font-bold text-[var(--clr-text-secondary)] uppercase tracking-widest">
              {notifications.length > 0 ? `${notifications.length} Notification${notifications.length > 1 ? 's' : ''}` : "Notifications"}
            </span>
            {notifications.length > 0 && (
              <button onClick={handleClearAll}
                className="text-[10px] font-mono text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] transition cursor-pointer">
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--clr-text-muted)] font-mono">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-[var(--clr-border)] last:border-b-0 hover:bg-[var(--clr-bg-subtle)] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {n.type === "offline" ? (
                        <span className="text-amber-600 shrink-0 mt-0.5">⚠️</span>
                      ) : (
                        <span className="text-red-500 shrink-0 mt-0.5">🗑️</span>
                      )}
                      <p className="text-sm text-[var(--clr-text-primary)] leading-relaxed">{n.message}</p>
                    </div>
                    <button onClick={() => handleDismiss(n.id)}
                      className="p-0.5 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] transition shrink-0 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--clr-text-muted)] mt-1">
                    {timeAgo(n.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-[var(--clr-border)] bg-[var(--clr-bg-subtle)] text-center">
            <span className="text-[10px] font-mono text-[var(--clr-text-muted)]">
              Notifications auto-clear after 24 hours
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
