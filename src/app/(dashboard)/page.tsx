import Link from "next/link";

/* ─── Stat Cards Data ─── */
const stats = [
  {
    label: "Total Buses",
    value: "12",
    href: "/buses",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7.5" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.5" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Staff Present",
    value: "25/28",
    href: "/staff",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Expenses Mar",
    value: "\u20B91.48L",
    href: "/expenses",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

/* ─── Quick Actions ─── */
const quickActions = [
  {
    label: "Add Bus",
    href: "/buses",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7.5" y1="8.5" x2="12.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Add Staff",
    href: "/staff",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 17c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="7" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Add Expense",
    href: "/expenses",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="7" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Mark Attendance",
    href: "/attendance",
    iconBg: "bg-info/10",
    iconColor: "text-info",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Recent Expenses ─── */
const recentExpenses = [
  { id: 1, description: "Diesel — Bus GJ01AB1234", amount: "\u20B94,200", date: "19 Mar", category: "Fuel" },
  { id: 2, description: "Tyre replacement — Bus GJ01CD5678", amount: "\u20B912,500", date: "18 Mar", category: "Maintenance" },
  { id: 3, description: "Driver salary — Ramesh K.", amount: "\u20B918,000", date: "15 Mar", category: "Salary" },
  { id: 4, description: "Insurance renewal — Bus GJ01EF9012", amount: "\u20B98,400", date: "14 Mar", category: "Insurance" },
  { id: 5, description: "Diesel — Bus GJ01GH3456", amount: "\u20B93,800", date: "13 Mar", category: "Fuel" },
];

/* ─── Document Expiry Alerts ─── */
const expiryAlerts = [
  { id: 1, document: "PUC Certificate", bus: "GJ01AB1234", daysLeft: 3, severity: "error" as const },
  { id: 2, document: "Fitness Certificate", bus: "GJ01CD5678", daysLeft: 12, severity: "warning" as const },
  { id: 3, document: "Road Tax", bus: "GJ01EF9012", daysLeft: 25, severity: "warning" as const },
  { id: 4, document: "Insurance", bus: "GJ01GH3456", daysLeft: 45, severity: "success" as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Attendance Alert Banner */}
      <div className="alert-banner alert-banner-error">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.75" fill="currentColor" />
          </svg>
          <span className="text-sm font-medium">
            Today&apos;s attendance is not marked yet
          </span>
        </div>
        <Link
          href="/attendance"
          className="px-4 py-1.5 bg-error text-white rounded-md text-sm font-medium hover:bg-error/90 transition-colors whitespace-nowrap"
        >
          Mark Now
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href} className="stat-card">
            <div className={`stat-card-icon ${stat.iconBg} ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-bodytext font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-dark mt-0.5">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-bodytext uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="quick-action-btn">
              <div className={`quick-action-btn-icon ${action.iconBg} ${action.iconColor}`}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout: Recent Expenses + Document Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-dark">Recent Expenses</h3>
            <Link href="/expenses" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div>
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="list-item">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-bodytext mt-0.5">
                    {expense.category} &middot; {expense.date}
                  </p>
                </div>
                <span className="text-sm font-semibold text-dark whitespace-nowrap">
                  {expense.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Expiry Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-dark">Document Expiry Alerts</h3>
            <Link href="/document-expiry" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div>
            {expiryAlerts.map((alert) => (
              <div key={alert.id} className="list-item">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark">{alert.document}</p>
                  <p className="text-xs text-bodytext mt-0.5">Bus {alert.bus}</p>
                </div>
                <span
                  className={`badge ${
                    alert.severity === "error"
                      ? "badge-error"
                      : alert.severity === "warning"
                      ? "badge-warning"
                      : "badge-success"
                  }`}
                >
                  {alert.daysLeft}d left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
