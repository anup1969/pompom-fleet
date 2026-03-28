"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "\u25A0" },
  { label: "Buses", href: "/buses", icon: "\uD83D\uDE8C" },
  { label: "Staff", href: "/staff", icon: "\uD83D\uDC64" },
  { label: "Expenses", href: "/expenses", icon: "\u20B9" },
  { label: "Attendance", href: "/attendance", icon: "\u2611" },
  { label: "Admissions", href: "/admissions", icon: "\uD83C\uDF93" },
];

const managementNav: NavItem[] = [
  { label: "Fuel Log", href: "/fuel", icon: "\u26FD" },
  { label: "Vendors", href: "/vendors", icon: "\uD83D\uDCBC" },
  { label: "Phone Directory", href: "/directory", icon: "\uD83D\uDCDE" },
  { label: "Document Expiry", href: "/documents", icon: "\uD83D\uDCC4" },
  { label: "Insurance", href: "/insurance", icon: "\uD83D\uDCCB" },
  { label: "Masters", href: "/masters", icon: "\u2699" },
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

  const sidebarClasses = [
    "sidebar",
    collapsed ? "collapsed" : "",
    mobileOpen ? "mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClasses} id="sidebar">
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "\u00BB" : "\u00AB"}
      </button>

      <div className="sidebar-brand">
        <div className="logo">P</div>
        <div>
          <div className="brand-text">PomPom</div>
          <div className="brand-sub">Transport Manager</div>
        </div>
      </div>

      <div className="sidebar-section">Main</div>
      <ul className="sidebar-nav">
        {mainNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={onMobileClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="badge-nav">{item.badge}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-section">Management</div>
      <ul className="sidebar-nav">
        {managementNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={onMobileClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="badge-nav">{item.badge}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
