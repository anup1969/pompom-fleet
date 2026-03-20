"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Buses",
    href: "/buses",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Staff",
    href: "/staff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="3" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const managementNav: NavItem[] = [
  {
    label: "Fuel Log",
    href: "/fuel",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 17V5a2 2 0 012-2h4a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 17h8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 8l2-1v5a1 1 0 001 1h0a1 1 0 001-1V7l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7" y="5" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10l1.5-6h11L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="10" width="14" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Phone Directory",
    href: "/directory",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="4" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    label: "Document Expiry",
    href: "/documents",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6 2h8l3 3v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 2v3h3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="10" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="11.5" x2="11.5" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Insurance",
    href: "/insurance",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L4 5v5c0 4 3 7 6 8 3-1 6-4 6-8V5l-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.5 10l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
      onClick={onMobileClose}
      title={collapsed ? item.label : undefined}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2" />
                <circle cx="9" cy="9" r="3" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              PomPom
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2" />
              <circle cx="9" cy="9" r="3" fill="white" />
            </svg>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors text-bodytext hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          >
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Section */}
        {!collapsed && <div className="sidebar-section-label">Main</div>}
        {mainNav.map(renderNavItem)}

        {/* Management Section */}
        {!collapsed && <div className="sidebar-section-label">Management</div>}
        {collapsed && <div className="my-3 mx-4 border-t border-white/10" />}
        {managementNav.map(renderNavItem)}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10 text-xs text-bodytext">
          PomPom Fleet v1.0
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`sidebar sidebar-expanded lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sidebar hidden lg:flex ${
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
