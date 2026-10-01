

"use client";
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AiFloatingWidget from "../components/ai/AiFloatingWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // This state controls the mobile menu drawer visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[var(--clr-bg-page)] overflow-hidden selection:bg-[var(--clr-bg-accent)] selection:text-[var(--clr-text-on-accent)]">
      
      {/* 1. Sidebar receives both the open state and the close function */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* 2. Main content area wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        
        {/* Header receives the open function to trigger the drawer */}
        <Header setIsOpen={setSidebarOpen} />
        
        {/* Dynamic Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 text-[var(--clr-text-body)] bg-[var(--clr-bg-main)]">
          {children}
        </main>
      </div>
      <AiFloatingWidget />
    </div>
  );
}