"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";

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
  "/masters": "Masters",
  "/admissions": "Admissions",
};

interface HeaderProps {
  onMenuClick: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "PomPom Fleet";
  const { user, tenant, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const initials = user ? getInitials(user.name) : "??";

  // Check if user came via PomPom token
  const [isFromPomPom, setIsFromPomPom] = useState(false);
  useEffect(() => {
    setIsFromPomPom(document.cookie.includes("fleet_auth_source=pompom"));
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={onMenuClick}>
          &#9776;
        </button>
        <div className="header-title">{pageTitle}</div>
      </div>
      <div className="header-right">
        {isFromPomPom && (
          <a
            href="https://login.pompombus.com"
            className="btn btn-outline btn-sm"
            style={{ gap: "6px", textDecoration: "none" }}
          >
            &#8592; Back to PomPom
          </a>
        )}
        {tenant && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--bodytext)",
              marginRight: "4px",
            }}
          >
            {tenant.client_name}
          </span>
        )}
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

        {/* User avatar with dropdown */}
        <div className="action-wrap" ref={menuRef}>
          <div
            className="header-avatar"
            style={{ cursor: "pointer" }}
            onClick={() => setMenuOpen(!menuOpen)}
            title={user?.name || "User"}
          >
            {initials}
          </div>
          <div className={`action-menu${menuOpen ? " show" : ""}`}>
            {user && (
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--bodytext)" }}>
                  {user.role}
                  {user.email ? ` \u00B7 ${user.email}` : ""}
                </div>
              </div>
            )}
            <button
              className="danger"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
