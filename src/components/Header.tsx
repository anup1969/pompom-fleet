"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/buses": "Buses",
  "/staff": "Staff",
  "/expenses": "Expenses",
  "/attendance": "Attendance",
  "/fuel": "Fuel Log",
  "/vendors": "Vendors",
  "/directory": "Phone Directory",
  "/document-expiry": "Document Expiry",
  "/insurance": "Insurance",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "PomPom Fleet";

  return (
    <header className="header">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-lightgray transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-dark">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-lightgray transition-colors"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a5 5 0 00-5 5v3l-1.5 2.5a.5.5 0 00.43.75h12.14a.5.5 0 00.43-.75L15 10V7a5 5 0 00-5-5z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 14a2 2 0 004 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
            TM
          </div>
        </div>
      </div>
    </header>
  );
}
