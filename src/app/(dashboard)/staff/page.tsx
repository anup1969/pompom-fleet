'use client';

import { useState, useRef, useEffect } from 'react';

/* ──────────────── Types ──────────────── */
type StaffRole = 'Driver' | 'Assistant' | 'Lady Attendant';
type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  assignedBus: string;
  phone: string;
  licenseExpiry: string | null; // ISO date, null for non-drivers
  salary: number;
  status: StaffStatus;
  aadharNo: string;
  joinDate: string;
}

/* ──────────────── Demo Data ──────────────── */
const DEMO_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Ramesh Solanki',
    role: 'Driver',
    assignedBus: 'GJ-01-AB-1234',
    phone: '98765 43210',
    licenseExpiry: '2026-05-15',
    salary: 18000,
    status: 'Active',
    aadharNo: '4567 8901 2345',
    joinDate: '2019-06-01',
  },
  {
    id: '2',
    name: 'Mukesh Khatri',
    role: 'Driver',
    assignedBus: 'GJ-01-CD-5678',
    phone: '98765 12340',
    licenseExpiry: '2026-04-02',
    salary: 18000,
    status: 'Active',
    aadharNo: '5678 9012 3456',
    joinDate: '2020-03-15',
  },
  {
    id: '3',
    name: 'Jayesh Patel',
    role: 'Driver',
    assignedBus: 'GJ-01-EF-9012',
    phone: '98765 67890',
    licenseExpiry: '2027-11-30',
    salary: 17000,
    status: 'Active',
    aadharNo: '6789 0123 4567',
    joinDate: '2021-01-10',
  },
  {
    id: '4',
    name: 'Arjun Sharma',
    role: 'Assistant',
    assignedBus: 'GJ-01-AB-1234',
    phone: '99887 65432',
    licenseExpiry: null,
    salary: 12000,
    status: 'Active',
    aadharNo: '7890 1234 5678',
    joinDate: '2022-07-20',
  },
  {
    id: '5',
    name: 'Vijay Desai',
    role: 'Assistant',
    assignedBus: 'GJ-01-EF-9012',
    phone: '99887 11223',
    licenseExpiry: null,
    salary: 12000,
    status: 'On Leave',
    aadharNo: '8901 2345 6789',
    joinDate: '2023-02-01',
  },
  {
    id: '6',
    name: 'Savita Mehta',
    role: 'Lady Attendant',
    assignedBus: 'GJ-01-AB-1234',
    phone: '99001 22334',
    licenseExpiry: null,
    salary: 10000,
    status: 'Active',
    aadharNo: '9012 3456 7890',
    joinDate: '2023-08-15',
  },
];

const TABS: { label: string; filter: StaffRole | 'All' }[] = [
  { label: 'All', filter: 'All' },
  { label: 'Drivers', filter: 'Driver' },
  { label: 'Assistants', filter: 'Assistant' },
  { label: 'Lady Attendants', filter: 'Lady Attendant' },
];

/* ──────────────── Helpers ──────────────── */
function formatCurrency(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getRoleIcon(role: StaffRole) {
  if (role === 'Driver') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v9l6 3" strokeLinecap="round" />
      </svg>
    );
  }
  if (role === 'Assistant') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" />
        <circle cx="10" cy="7" r="4" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M12 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
      <circle cx="8" cy="7" r="4" />
    </svg>
  );
}

function getRoleBgClass(role: StaffRole): string {
  if (role === 'Driver') return 'bg-primary/10 text-primary';
  if (role === 'Assistant') return 'bg-accent/10 text-accent';
  return 'bg-success/10 text-success';
}

function getStatusBadge(status: StaffStatus) {
  const map: Record<StaffStatus, string> = {
    Active: 'bg-success/10 text-success',
    'On Leave': 'bg-warning/10 text-warning',
    Inactive: 'bg-bodytext/10 text-bodytext',
  };
  return map[status];
}

/* ──────────────── Dropdown ──────────────── */
function ActionDropdown({
  staffId,
  onAction,
}: {
  staffId: string;
  onAction: (action: string, id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-lightgray transition-colors text-bodytext hover:text-dark"
        aria-label="Actions"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-[10px] shadow-lg border border-border z-20 py-1">
          {['View', 'Edit', 'Delete'].map((action) => (
            <button
              key={action}
              onClick={() => {
                onAction(action, staffId);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-lightgray transition-colors ${
                action === 'Delete' ? 'text-error hover:bg-red-50' : 'text-dark'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── Staff Card ──────────────── */
function StaffCard({
  member,
  onAction,
  onSelect,
}: {
  member: StaffMember;
  onAction: (action: string, id: string) => void;
  onSelect: (id: string) => void;
}) {
  const expiryDays = member.licenseExpiry ? daysUntil(member.licenseExpiry) : null;
  const isNearExpiry = expiryDays !== null && expiryDays <= 60;
  const isExpired = expiryDays !== null && expiryDays <= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${getRoleBgClass(member.role)}`}>
            {getRoleIcon(member.role)}
          </div>
          <div>
            <button
              onClick={() => onSelect(member.id)}
              className="text-[15px] font-semibold text-dark hover:text-primary transition-colors cursor-pointer text-left"
            >
              {member.name}
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-bodytext">{member.role}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusBadge(member.status)}`}>
                {member.status}
              </span>
            </div>
          </div>
        </div>
        <ActionDropdown staffId={member.id} onAction={onAction} />
      </div>

      {/* Divider */}
      <div className="border-t border-border mx-5" />

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Assigned Bus */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-bodytext flex-shrink-0">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M3 12h18M7 20h10M9 16v4M15 16v4" />
          </svg>
          <span className="text-sm text-dark font-medium">{member.assignedBus}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-bodytext flex-shrink-0">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span className="text-sm text-bodytext">{member.phone}</span>
        </div>

        {/* License Expiry (drivers only) */}
        {member.licenseExpiry && (
          <div className="flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={`flex-shrink-0 ${isNearExpiry ? 'text-error' : 'text-bodytext'}`}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className={`text-sm font-medium ${isExpired ? 'text-error' : isNearExpiry ? 'text-error' : 'text-bodytext'}`}>
              License: {formatDate(member.licenseExpiry)}
              {isExpired && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error">
                  EXPIRED
                </span>
              )}
              {!isExpired && isNearExpiry && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error/10 text-error">
                  {expiryDays}d left
                </span>
              )}
            </span>
          </div>
        )}

        {/* Salary */}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
          <span className="text-[11px] text-bodytext uppercase tracking-wider font-medium">Salary</span>
          <span className="text-sm font-bold text-dark">{formatCurrency(member.salary)}/mo</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Staff Profile Placeholder ──────────────── */
function StaffProfile({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-dark">Staff Profile</h2>
          <button onClick={onClose} className="text-bodytext hover:text-dark transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-[10px] flex items-center justify-center ${getRoleBgClass(member.role)}`}>
              <span className="text-xl font-bold">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-dark">{member.name}</p>
              <p className="text-sm text-bodytext">{member.role} &middot; {member.assignedBus}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-lightgray rounded-[10px] p-4">
            {[
              ['Phone', member.phone],
              ['Aadhar', member.aadharNo],
              ['Joined', formatDate(member.joinDate)],
              ['Salary', formatCurrency(member.salary) + '/mo'],
              ...(member.licenseExpiry ? [['License Expiry', formatDate(member.licenseExpiry)]] : []),
              ['Status', member.status],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-[11px] text-bodytext uppercase tracking-wider font-medium">{String(label)}</p>
                <p className="text-sm font-semibold text-dark mt-0.5">{String(value)}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-bodytext text-center py-2 italic">
            Full profile with Documents tab, Attendance history, and Salary log coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Page ──────────────── */
export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<StaffRole | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = activeTab === 'All'
    ? DEMO_STAFF
    : DEMO_STAFF.filter((s) => s.role === activeTab);

  const tabCounts: Record<string, number> = {
    All: DEMO_STAFF.length,
    Driver: DEMO_STAFF.filter((s) => s.role === 'Driver').length,
    Assistant: DEMO_STAFF.filter((s) => s.role === 'Assistant').length,
    'Lady Attendant': DEMO_STAFF.filter((s) => s.role === 'Lady Attendant').length,
  };

  function handleAction(action: string, id: string) {
    if (action === 'View') setSelectedId(id);
  }

  const selectedMember = DEMO_STAFF.find((s) => s.id === selectedId);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Staff Management</h1>
          <p className="text-sm text-bodytext mt-1">
            Manage drivers, assistants &amp; lady attendants
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-[10px] hover:bg-primary/90 transition-colors shadow-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* Tab Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.filter;
          const count = tabCounts[tab.filter];
          return (
            <button
              key={tab.filter}
              onClick={() => setActiveTab(tab.filter)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-bodytext border border-border hover:bg-lightgray hover:text-dark'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-lightgray text-bodytext'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((member) => (
          <StaffCard
            key={member.id}
            member={member}
            onAction={handleAction}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-lightgray flex items-center justify-center mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-bodytext">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="text-sm text-bodytext">No staff found in this category.</p>
        </div>
      )}

      {/* Profile Modal */}
      {selectedMember && (
        <StaffProfile member={selectedMember} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
