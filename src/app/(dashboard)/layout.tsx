"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area — offset by sidebar width */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin] duration-250 ease-in-out lg:ml-sidebar-expanded"
        style={{
          marginLeft: undefined, // handled by className on lg
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .lg\\:ml-sidebar-expanded {
              margin-left: ${collapsed ? "60px" : "250px"};
              transition: margin-left 0.25s ease;
            }
          }
        `}</style>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
