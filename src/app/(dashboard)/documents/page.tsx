'use client';

import { useState } from 'react';

/* ──────────────── Types ──────────────── */
type StatusFilter = 'All' | 'Expired' | 'Due Soon' | 'Valid';
type DocStatus = 'Expired' | 'Due Soon' | 'Valid';
type DocOwnerType = 'Bus' | 'Staff';

interface TrackedDocument {
  id: string;
  document: string;
  owner: string;
  ownerType: DocOwnerType;
  type: string;
  expiryDate: string;
  status: DocStatus;
}

/* ──────────────── Helpers ──────────────── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* ──────────────── Demo Data ──────────────── */
const DEMO_DOCUMENTS: TrackedDocument[] = [
  // Bus documents
  {
    id: '1',
    document: 'Registration Certificate (RC)',
    owner: 'GJ-01-AB-1234',
    ownerType: 'Bus',
    type: 'RC Book',
    expiryDate: '2025-08-15',
    status: 'Expired',
  },
  {
    id: '2',
    document: 'PUC Certificate',
    owner: 'GJ-01-AB-1234',
    ownerType: 'Bus',
    type: 'PUC',
    expiryDate: '2026-04-10',
    status: 'Due Soon',
  },
  {
    id: '3',
    document: 'Fitness Certificate',
    owner: 'GJ-01-CD-5678',
    ownerType: 'Bus',
    type: 'Fitness',
    expiryDate: '2027-06-30',
    status: 'Valid',
  },
  {
    id: '4',
    document: 'Route Permit',
    owner: 'GJ-01-CD-5678',
    ownerType: 'Bus',
    type: 'Permit',
    expiryDate: '2026-01-20',
    status: 'Expired',
  },
  {
    id: '5',
    document: 'PUC Certificate',
    owner: 'GJ-01-EF-9012',
    ownerType: 'Bus',
    type: 'PUC',
    expiryDate: '2026-05-05',
    status: 'Due Soon',
  },
  {
    id: '6',
    document: 'Fitness Certificate',
    owner: 'GJ-01-GH-3456',
    ownerType: 'Bus',
    type: 'Fitness',
    expiryDate: '2028-03-15',
    status: 'Valid',
  },
  {
    id: '7',
    document: 'Registration Certificate (RC)',
    owner: 'GJ-01-IJ-7890',
    ownerType: 'Bus',
    type: 'RC Book',
    expiryDate: '2027-11-22',
    status: 'Valid',
  },
  {
    id: '8',
    document: 'Route Permit',
    owner: 'GJ-01-KL-2345',
    ownerType: 'Bus',
    type: 'Permit',
    expiryDate: '2026-04-28',
    status: 'Due Soon',
  },
  // Staff documents
  {
    id: '9',
    document: 'Driving License',
    owner: 'Ramesh Patel',
    ownerType: 'Staff',
    type: 'License',
    expiryDate: '2025-12-31',
    status: 'Expired',
  },
  {
    id: '10',
    document: 'Driving License',
    owner: 'Suresh Sharma',
    ownerType: 'Staff',
    type: 'License',
    expiryDate: '2028-09-15',
    status: 'Valid',
  },
  {
    id: '11',
    document: 'Driving License',
    owner: 'Vikram Singh',
    ownerType: 'Staff',
    type: 'License',
    expiryDate: '2026-04-18',
    status: 'Due Soon',
  },
  {
    id: '12',
    document: 'Aadhar Card',
    owner: 'Manoj Joshi',
    ownerType: 'Staff',
    type: 'Aadhar',
    expiryDate: '2030-01-01',
    status: 'Valid',
  },
  {
    id: '13',
    document: 'Police Verification',
    owner: 'Dinesh Kumar',
    ownerType: 'Staff',
    type: 'Police Verification',
    expiryDate: '2025-06-30',
    status: 'Expired',
  },
  {
    id: '14',
    document: 'Police Verification',
    owner: 'Sunita Devi',
    ownerType: 'Staff',
    type: 'Police Verification',
    expiryDate: '2026-08-20',
    status: 'Valid',
  },
  {
    id: '15',
    document: 'Aadhar Card',
    owner: 'Kavita Rani',
    ownerType: 'Staff',
    type: 'Aadhar',
    expiryDate: '2030-01-01',
    status: 'Valid',
  },
];

const STATUS_TABS: StatusFilter[] = ['All', 'Expired', 'Due Soon', 'Valid'];

/* ──────────────── Status Badge ──────────────── */
function StatusBadge({ status, expiryDate }: { status: DocStatus; expiryDate: string }) {
  const days = daysUntil(expiryDate);
  const config: Record<DocStatus, { className: string; label: string }> = {
    Expired: { className: 'badge-error', label: `Expired${days < 0 ? ` (${Math.abs(days)}d ago)` : ''}` },
    'Due Soon': { className: 'badge-warning', label: `Due in ${days}d` },
    Valid: { className: 'badge-success', label: 'Valid' },
  };
  const { className, label } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
}

/* ──────────────── Page ──────────────── */
export default function DocumentExpiryPage() {
  const [activeTab, setActiveTab] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');

  const filtered = DEMO_DOCUMENTS.filter((doc) => {
    const matchesTab = activeTab === 'All' || doc.status === activeTab;
    const matchesSearch =
      search === '' ||
      doc.document.toLowerCase().includes(search.toLowerCase()) ||
      doc.owner.toLowerCase().includes(search.toLowerCase()) ||
      doc.type.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const expiredCount = DEMO_DOCUMENTS.filter((d) => d.status === 'Expired').length;
  const dueSoonCount = DEMO_DOCUMENTS.filter((d) => d.status === 'Due Soon').length;
  const validCount = DEMO_DOCUMENTS.filter((d) => d.status === 'Valid').length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Alert Banner */}
      {expiredCount > 0 && (
        <div className="alert-banner alert-banner-error mb-5">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v4M12 17h.01M10.29 3.86l-8.6 14.86A2 2 0 003.41 21h17.18a2 2 0 001.72-2.28l-8.6-14.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium">
              {expiredCount} document{expiredCount > 1 ? 's' : ''} expired! Immediate action required.
            </span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Document Expiry Tracker</h1>
          <p className="text-sm text-bodytext mt-1">
            {DEMO_DOCUMENTS.length} documents &middot;{' '}
            <span className="text-error font-medium">{expiredCount} Expired</span> &middot;{' '}
            <span className="font-medium" style={{ color: '#b58a00' }}>{dueSoonCount} Due Soon</span> &middot;{' '}
            <span className="text-success font-medium">{validCount} Valid</span>
          </p>
        </div>
      </div>

      {/* Card wrapper */}
      <div className="bg-white rounded-xl shadow-card border border-border">
        {/* Toolbar: Search + Tabs */}
        <div className="px-5 pt-5 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-bodytext"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search document, owner, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-[10px] bg-lightgray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-dark placeholder:text-bodytext"
            />
          </div>

          {/* Pill Tabs */}
          <div className="pill-tabs flex-shrink-0">
            {STATUS_TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? DEMO_DOCUMENTS.length
                  : DEMO_DOCUMENTS.filter((d) => d.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pill-tab whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab === 'Expired' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-error mr-1.5" />
                  )}
                  {tab === 'Due Soon' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-warning mr-1.5" />
                  )}
                  {tab === 'Valid' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-success mr-1.5" />
                  )}
                  {tab}
                  <span className="ml-1.5 text-[11px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-border bg-lightgray/60">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Document</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Owner (Bus/Staff)</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Type</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Expiry Date</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-bodytext">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-bodytext text-sm">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`border-t border-border hover:bg-lightgray/40 transition-colors ${
                      doc.status === 'Expired' ? 'bg-error/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            doc.ownerType === 'Bus' ? 'bg-primary/10' : 'bg-accent/10'
                          }`}
                        >
                          {doc.ownerType === 'Bus' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-primary">
                              <rect x="3" y="4" width="18" height="12" rx="2" />
                              <path d="M3 12h18M7 20h10M9 16v4M15 16v4" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-accent">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-dark">{doc.document}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-dark">{doc.owner}</p>
                        <p className="text-[11px] text-bodytext">{doc.ownerType}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-dark">{doc.type}</td>
                    <td className="px-5 py-3.5 text-sm text-dark">{formatDate(doc.expiryDate)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={doc.status} expiryDate={doc.expiryDate} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-md hover:bg-primary/15 transition-colors"
                          onClick={() => alert(`View: ${doc.document} — ${doc.owner}`)}
                        >
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-dark bg-lightgray rounded-md hover:bg-border transition-colors"
                          onClick={() => alert(`Upload new: ${doc.document} — ${doc.owner}`)}
                        >
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Upload
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-bodytext">
            Showing {filtered.length} of {DEMO_DOCUMENTS.length} documents
          </p>
        </div>
      </div>
    </div>
  );
}
