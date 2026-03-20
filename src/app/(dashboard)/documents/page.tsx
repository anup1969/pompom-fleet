'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface DocEntry {
  id: number;
  docType: string;
  owner: string;
  refNo: string;
  expiry: string;
  status: 'expired' | 'due-soon' | 'valid';
  statusLabel: string;
  statusBadge: string;
  days: string;
  daysColor: string;
  rowBg: string;
  isBus: boolean;
}

const DEMO_DOCS: DocEntry[] = [
  { id: 1, docType: 'PUC Certificate', owner: 'GJ-01-TX-5502', refNo: 'PUC-2025-5502', expiry: '10 Mar 2026', status: 'expired', statusLabel: 'Expired', statusBadge: 'badge-error', days: '-2 days', daysColor: 'var(--error)', rowBg: 'rgba(255,102,146,.06)', isBus: true },
  { id: 2, docType: 'Driving License', owner: 'Ramesh Solanki', refNo: 'GJ01-2019-005501', expiry: '17 Mar 2026', status: 'expired', statusLabel: 'Expired', statusBadge: 'badge-error', days: '-5 days *', daysColor: 'var(--error)', rowBg: 'rgba(255,102,146,.06)', isBus: false },
  { id: 3, docType: 'Insurance Policy', owner: 'GJ-01-TX-5504', refNo: 'NIA-2026-441', expiry: '27 Mar 2026', status: 'due-soon', statusLabel: 'Due Soon', statusBadge: 'badge-warning', days: '15 days', daysColor: '#b45309', rowBg: 'rgba(248,194,10,.06)', isBus: true },
  { id: 4, docType: 'Road Tax', owner: 'GJ-01-TX-5501', refNo: 'RT-GJ-2024-5501', expiry: '11 Apr 2026', status: 'due-soon', statusLabel: 'Due Soon', statusBadge: 'badge-warning', days: '30 days', daysColor: '#b45309', rowBg: 'rgba(248,194,10,.06)', isBus: true },
  { id: 5, docType: 'Fitness Certificate', owner: 'GJ-01-TX-5503', refNo: 'FC-GJ-2025-5503', expiry: '18 Apr 2026', status: 'due-soon', statusLabel: 'Due Soon', statusBadge: 'badge-warning', days: '37 days', daysColor: '#b45309', rowBg: 'rgba(248,194,10,.06)', isBus: true },
  { id: 6, docType: 'PUC Certificate', owner: 'GJ-01-TX-5501', refNo: 'PUC-2026-5501', expiry: '15 Jun 2026', status: 'valid', statusLabel: 'Valid', statusBadge: 'badge-success', days: '95 days', daysColor: 'var(--success)', rowBg: '', isBus: true },
  { id: 7, docType: 'Insurance Policy', owner: 'GJ-01-TX-5501', refNo: 'NIA-2026-501', expiry: '20 Sep 2026', status: 'valid', statusLabel: 'Valid', statusBadge: 'badge-success', days: '192 days', daysColor: 'var(--success)', rowBg: '', isBus: true },
  { id: 8, docType: 'Driving License', owner: 'Mukesh Khatri', refNo: 'GJ01-2020-005502', expiry: '14 Nov 2026', status: 'valid', statusLabel: 'Valid', statusBadge: 'badge-success', days: '247 days', daysColor: 'var(--success)', rowBg: '', isBus: false },
];

const STATUS_TABS = [
  { key: 'all', label: 'All (8)', style: {} },
  { key: 'expired', label: 'Expired (2)', style: { borderColor: 'var(--error)', color: 'var(--error)' } },
  { key: 'due-soon', label: 'Due Soon (3)', style: { borderColor: 'var(--warning)', color: '#b45309' } },
  { key: 'valid', label: 'Valid (3)', style: { borderColor: 'var(--success)', color: 'var(--success)' } },
];

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = DEMO_DOCS.filter(
    (d) => statusFilter === 'all' || d.status === statusFilter
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>Document Expiry Tracker</h3>
        <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Export</button>
      </div>
      <div className="card-body">
        {/* Tab Pill Filters */}
        <div className="tab-pills">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-pill${statusFilter === t.key ? ' active' : ''}`}
              style={statusFilter !== t.key ? t.style : undefined}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Document Type</th>
                <th>Vehicle / Person</th>
                <th>Reference No</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={d.rowBg ? { background: d.rowBg } : undefined}>
                  <td>{d.id}</td>
                  <td>{d.docType}</td>
                  <td>
                    <a className="clickable-link">{d.owner}</a>
                  </td>
                  <td>{d.refNo}</td>
                  <td>{d.expiry}</td>
                  <td>
                    <span className={`badge ${d.statusBadge}`}>{d.statusLabel}</span>
                  </td>
                  <td style={{ color: d.daysColor, fontWeight: 600 }}>{d.days}</td>
                  <td>
                    <button className="btn btn-outline btn-sm">{'\uD83D\uDC41'} View</button>{' '}
                    {d.status === 'expired' ? (
                      <button className="btn btn-outline btn-sm">{'\uD83D\uDCE4'} Upload</button>
                    ) : (
                      <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Download</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
