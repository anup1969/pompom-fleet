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
  "/documents": "Document Expiry",
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
      <div className="header-left">
        <button className="hamburger" onClick={onMenuClick}>
          &#9776;
        </button>
        <div className="header-title">{pageTitle}</div>
      </div>
      <div className="header-right">
        <button
          className="btn-icon"
          title="Notifications"
          style={{ position: "relative" }}
        >
          &#128276;
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              background: "var(--error)",
              borderRadius: "50%",
              border: "2px solid var(--white)",
            }}
          />
        </button>
        <div className="header-avatar">TM</div>
      </div>
    </header>
  );
}
