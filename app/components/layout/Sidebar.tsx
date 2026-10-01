"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isEnvLogOpen, setIsEnvLogOpen] = useState(false);
  const [isDutiesOpen, setIsDutiesOpen] = useState(true);

  // Helper to check active route (exact match)
  const isActive = (href: string) => pathname === href;

  // Navigation items (main)
  const mainNavItems = [
    {
      category: "Management",
      items: [
        {
          name: "Records",
          href: "/records",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          ),
        },
        {
          name: "Work Log",
          href: "/work-logs",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="m2.25 12 8.954-4.477a1.125 1.125 0 0 1 1.007 0L21.25 12l-8.954 4.477a1.125 1.125 0 0 1-1.007 0L2.25 12Z" />
              <path strokeLinecap="square" strokeLinejoin="miter" d="M2.25 5.25 11.204 9.73a1.125 1.125 0 0 0 1.007 0L21.25 5.25M2.25 18.75l8.954 4.477a1.125 1.125 0 0 0 1.007 0l8.954-4.477" />
            </svg>
          ),
        },
      ],
    },
  ];

  // Configuration sub‑items (collapsible)
  const configItems = [
    { name: "Manage Equipments", href: "/equipment" },
    // TEMP-HIDDEN: { name: "Manage Regulations", href: "/regulations" },
    { name: "Manage Crew Roster", href: "/crew-roster" },
    { name: "Manage Dropdowns", href: "/dropdowns" },
  ];

  // Engine Room Duties sub‑items (collapsible)
  const dutiesItems = [
    { name: "Chief Engineer Orders", href: "/duties" },
    { name: "Crew Performance", href: "/duties/crew" },
  ];

  // Environmental Log sub‑items (collapsible)
  const envLogItems = [
    { name: "Bilge Water Separator", href: "/environmental-log/bilge-water" },
    { name: "Incinerator Management", href: "/environmental-log/incinerator" },
    { name: "Fuel Changeover System", href: "/environmental-log/fuel-changeover" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/30 z-40 md:hidden transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[var(--clr-bg-card)] border-r border-[var(--clr-border-light)] flex flex-col p-5 transform transition-transform duration-200 ease-in-out shrink-0
          md:relative md:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="mb-7 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="SM Engineer Logo" className="h-10 w-auto" />
              <span className="font-extrabold text-lg tracking-tight text-[var(--clr-text-body)]">
                SM Engineer Portal
              </span>
            </div>

            {/* Close button (mobile) */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-body)] hover:bg-[var(--clr-bg-card-hover)] rounded-md transition-colors"
              aria-label="Close Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Dashboard */}
          <div className="mb-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between w-full px-4 py-3.5 font-semibold text-sm transition-colors rounded-xl shadow-xs ${
                isActive("/")
                  ? "bg-[var(--clr-bg-accent)] text-[var(--clr-text-on-accent)]"
                  : "bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                <span>Dashboard</span>
              </div>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="square" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {/* Main Navigation */}
          {mainNavItems.map((group, idx) => (
            <div key={idx} className="mt-4">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-secondary)] mb-2">
                {group.category}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all rounded-lg ${
                      isActive(item.href)
                        ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                        : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
                    }`}
                  >
                    <span className={isActive(item.href) ? "text-[var(--clr-text-body)]" : "text-[var(--clr-text-muted)]"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {/* TEMP-HIDDEN: "Regulatory Library" nav item hidden per client request. Uncomment the block below to restore. */}
          {/* Regulatory Library
          <div className="mt-4">
            <Link
              href="/regulatory-library"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all rounded-lg ${
                isActive("/regulatory-library")
                  ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                  : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <span>Regulatory Library</span>
            </Link>
          </div>
          */}

          

          {/* Engine Room Duties (Collapsible) */}
          <div className="mt-2">
            <button
              onClick={() => setIsDutiesOpen(!isDutiesOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)] transition-all rounded-lg"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Engine Room Duties
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDutiesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isDutiesOpen && (
              <div className="mt-1 ml-6 border-l-2 border-[var(--clr-border-light)] pl-3 space-y-1">
                {dutiesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.href)
                        ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                        : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Environmental Log (Collapsible) */}
          <div className="mt-2">
            <button
              onClick={() => setIsEnvLogOpen(!isEnvLogOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)] transition-all rounded-lg"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>
                Environmental Log
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isEnvLogOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isEnvLogOpen && (
              <div className="mt-1 ml-6 border-l-2 border-[var(--clr-border-light)] pl-3 space-y-1">
                {envLogItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.href)
                        ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                        : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Dropdown */}
          <div className="mt-4">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)] transition-all rounded-lg"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Configuration
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isConfigOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isConfigOpen && (
              <div className="mt-1 ml-6 border-l-2 border-[var(--clr-border-light)] pl-3 space-y-1">
                {configItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.href)
                        ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                        : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

{/* AI Assistant */}
          <div className="mt-4">
            <Link
              href="/ai"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all rounded-lg ${
                isActive("/ai")
                  ? "text-[var(--clr-text-body)] bg-[var(--clr-bg-card-hover)]"
                  : "text-[var(--clr-text-secondary)] hover:bg-[var(--clr-bg-card-hover)] hover:text-[var(--clr-text-body)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.5" />
                <circle cx="17" cy="16" r="2.5" />
                <circle cx="7" cy="16" r="2.5" />
                <path strokeLinecap="round" d="M12 11.5v1.5m-3.5 2.5l-1.5 1m8.5-1l1.5 1" />
              </svg>
              <span>AI Assistant</span>
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--clr-bg-accent)] text-white uppercase tracking-wider">
                New
              </span>
            </Link>
          </div>
          {/* Spacer to ensure footer stays at bottom */}
          <div className="h-4" />
        </div>

        

        {/* Footer – fixed at bottom */}
        <div className="pt-4 border-t border-[var(--clr-border-light)] px-2 text-[10px] font-mono text-[var(--clr-text-secondary)] shrink-0">
          <span>v2.0 • SM Engineer Portal</span>
        </div>
      </aside>
    </>
  );
}


