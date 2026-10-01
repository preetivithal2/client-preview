
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import NotificationBell from "../common/NotificationBell";

interface HeaderProps {
  setIsOpen: (val: boolean) => void;
}

export default function Header({ setIsOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter(); // 2. Initialize router instances engine

  // Function to derive a human-readable title from the path
  const getPageTitle = (path: string): string => {
    const segments = path.replace(/^\/+|\/+$/g, "").split("/");
    if (segments.length === 0 || (segments.length === 1 && segments[0] === "")) {
      return "Dashboard";
    }
    let last = segments[segments.length - 1];
    const formatted = last
      .replace(/-/g, " ")
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
    return formatted || "Engine Room";
  };

  const pageTitle = getPageTitle(pathname);

  // User display name from Firebase Auth
  const [userName, setUserName] = useState("");
  const [userFull, setUserFull] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        const parts = user.displayName.trim().split(/\s+/);
        setUserName(parts[0]);
        setUserFull(parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0]);
      } else if (user?.email) {
        const name = user.email.split("@")[0];
        setUserName(name);
        setUserFull(name);
      }
    });
    return () => unsub();
  }, []);

  // Theme toggle state
  const [isDark, setIsDark] = useState(false);
  // Dropdown visibility state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // 3. New Logout Sequence Handler
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const { signOut } = await import("../../lib/auth");
    await signOut();
    document.cookie = "session=; path=/; max-age=0";
    router.replace("/signin");
  };

  return (
    <header className="h-16 w-full bg-[var(--clr-bg-card)] shadow-sm border-b border-[var(--clr-border-light)] flex items-center justify-between relative z-30 shrink-0">
      {/* Left Area: Mobile Menu & Page Title */}
      <div className="h-full flex items-center px-4 md:px-6 md:w-64 md:border-r md:border-[var(--clr-border-light)] shrink-0 gap-3">
        {/* Hamburger for mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 -ml-2 text-[var(--clr-text-body)] hover:bg-[var(--clr-bg-card-hover)] active:bg-[var(--clr-bg-subtle)] transition-colors rounded-lg"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Dynamic Page Title (all screens) */}
        <span className="font-bold text-sm text-[var(--clr-text-primary)] uppercase tracking-wide truncate">
          Section: {pageTitle}
        </span>
      </div>

      {/* Right Area: Controls */}
      <div className="flex-1 h-full flex items-center justify-end px-4 sm:px-6 gap-2 md:gap-3">

        {/* ================= DESKTOP CONTROLS ONLY ================= */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition-colors rounded-lg cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 21v-2.25m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {/* Language / Translation Icon */}
          <button
            type="button"
            className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition-colors rounded-lg"
            aria-label="Language options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
            </svg>
          </button>

          {/* Internet Sync / Connectivity */}
          <button
            type="button"
            className="p-2 text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] transition-colors rounded-lg"
            aria-label="Sync connectivity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a2.25 2.25 0 0 0-1.456-1.456L15.75 6.75l1.035-.259a2.25 2.25 0 0 0 1.456-1.456L18 3.75l.259 1.035a2.25 2.25 0 0 0 1.456 1.456L20.25 6.75l-1.035.259a2.25 2.25 0 0 0-1.456 1.456ZM16.5 14.25 16.5 18.75M16.5 18.75 18 17.25M16.5 18.75 15 17.25" />
            </svg>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--clr-bg-subtle)]" />
        </div>

        {/* ================= ADMIN PROFILE BUTTON ================= */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--clr-bg-card-hover)] active:bg-[var(--clr-bg-card-hover)] transition-colors"
            aria-label="Admin menu"
          >
            <span className="text-xs font-bold text-[var(--clr-text-body)] uppercase tracking-wide hidden min-[450px]:inline cursor-pointer">
              {userName || "User"}
            </span>
            <div className="h-8 w-8 bg-[var(--clr-bg-accent)] rounded-lg flex items-center justify-center text-white shrink-0 relative cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--clr-text-red)] ring-2 ring-[var(--clr-bg-card)] md:hidden" />
            </div>
          </button>

          {/* Dropdown Menu Overlay */}
          {isDropdownOpen && (
            <>
              {/* Invisible click handler background to close when clicking outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-56 bg-[var(--clr-bg-card)] border border-[var(--clr-border-light)] rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                {/* CONSOLIDATED UTILITY ROW - Mobile Viewports */}
                <div className="flex md:hidden items-center justify-around border-b border-[var(--clr-border-light)] pb-2 mb-1 px-2 pt-1 text-[var(--clr-text-secondary)]">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 cursor-pointer hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] rounded-lg transition-colors flex-1 flex justify-center"
                    title="Toggle Theme"
                  >
                    {isDark ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 21v-2.25m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="p-2 hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] rounded-lg transition-colors flex-1 flex justify-center"
                    title="Languages"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="p-2 hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] rounded-lg transition-colors flex-1 flex justify-center"
                    title="Connectivity Sync"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a2.25 2.25 0 0 0-1.456-1.456L15.75 6.75l1.035-.259a2.25 2.25 0 0 0 1.456-1.456L18 3.75l.259 1.035a2.25 2.25 0 0 0 1.456 1.456L20.25 6.75l-1.035.259a2.25 2.25 0 0 0-1.456 1.456ZM16.5 14.25 16.5 18.75M16.5 18.75 18 17.25M16.5 18.75 15 17.25" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="p-2 hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-card-hover)] rounded-lg transition-colors relative flex-1 flex justify-center"
                    title="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <span className="absolute top-2 right-5 h-1.5 w-1.5 rounded-full bg-[var(--clr-text-red)] ring-2 ring-[var(--clr-bg-card)]" />
                  </button>
                </div>

                {/* Greeting */}
                <div className="px-4 py-3 border-b border-[var(--clr-border-light)]">
                  <p className="text-sm font-bold text-[var(--clr-text-primary)]">Hi {userFull || "User"}</p>
                </div>

                {/* Account Dropdown Links */}
                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(false); }}
                  className="w-full cursor-pointer text-left px-4 py-2.5 text-sm text-[var(--clr-text-body)] hover:bg-[var(--clr-bg-card-hover)] flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--clr-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(false); }}
                  className="w-full cursor-pointer text-left px-4 py-2.5 text-sm text-[var(--clr-text-body)] hover:bg-[var(--clr-bg-card-hover)] flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--clr-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.29.222-.434.59-.38.955.004.029.006.057.006.086 0 .03-.002.057-.006.086-.054.365.09.733.38.955l1.003.768a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.29-.222.434-.59.38-.956a.483.483 0 0 1-.006-.086c0-.03.002-.057.006-.086.054-.365-.09-.733-.38-.955l-1.004-.768a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Settings
                </button>

                <hr className="border-[var(--clr-border-light)] my-1" />

                {/* 4. Connected custom logout handler callback trigger */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full cursor-pointer text-left px-4 py-2.5 text-sm text-[var(--clr-text-red)] hover:bg-[var(--clr-bg-red)] flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                  </svg>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}