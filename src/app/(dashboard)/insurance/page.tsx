'use client';

import { useState } from 'react';

/* ──────────────── Types ──────────────── */
type StatusFilter = 'All' | 'Expired' | 'Due Soon' | 'Active';
type InsuranceStatus = 'Expired' | 'Due Soon' | 'Active';

interface InsuranceRecord {
  id: string;
  bus: string;
  policyNo: string;
  provider: string;
  type: string;
  startDate: string;
  endDate: string;
  premium: number;
  status: InsuranceStatus;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

/* ──────────────── Demo Data ──────────────── */
const DEMO_INSURANCE: InsuranceRecord[] = [
  {
    id: '1', bus: 'GJ-01-AB-1234', policyNo: 'NIA-2024-88001',
    provider: 'New India Assurance', type: 'Comprehensive',
    startDate: '2024-04-01', endDate: '2025-03-31', premium: 28000, status: 'Expired',
  },
  {
    id: '2', bus: 'GJ-01-CD-5678', policyNo: 'ICICI-2025-44021',
    provider: 'ICICI Lombard', type: 'Comprehensive',
    startDate: '2025-06-15', endDate: '2026-06-14', premium: 32000, status: 'Active',
  },
  {
    id: '3', bus: 'GJ-01-EF-9012', policyNo: 'BAJA-2025-70033',
    provider: 'Bajaj Allianz', type: 'Third Party',
    startDate: '2025-10-01', endDate: '2026-04-10', premium: 12500, status: 'Due Soon',
  },
  {
    id: '4', bus: 'GJ-01-GH-3456', policyNo: 'NIA-2025-88045',
    provider: 'New India Assurance', type: 'Comprehensive',
    startDate: '2025-08-01', endDate: '2026-07-31', premium: 30000, status: 'Active',
  },
  {
    id: '5', bus: 'GJ-01-IJ-7890', policyNo: 'HDFC-2024-22010',
    provider: 'HDFC Ergo', type: 'Third Party',
    startDate: '2024-09-01', endDate: '2025-08-31', premium: 11000, status: 'Expired',
  },
  {
    id: '6', bus: 'GJ-01-KL-2345', policyNo: 'ICICI-2025-44055',
    provider: 'ICICI Lombard', type: 'Comprehensive',
    startDate: '2025-11-01', endDate: '2026-04-15', premium: 29500, status: 'Due Soon',
  },
  {
    id: '7', bus: 'GJ-01-MN-6789', policyNo: 'BAJA-2025-70066',
    provider: 'Bajaj Allianz', type: 'Comprehensive',
    startDate: '2025-05-01', endDate: '2026-04-30', premium: 31000, status: 'Active',
  },
  {
    id: '8', bus: 'GJ-01-OP-0123', policyNo: 'NIA-2025-88078',
    provider: 'New India Assurance', type: 'Third Party',
    startDate: '2025-07-15', endDate: '2026-07-14', premium: 13500, status: 'Active',
  },
];

const STATUS_FILTERS: StatusFilter[] = ['All', 'Expired', 'Due Soon', 'Active'];

/* ──────────────── Component ──────────────── */
export default function InsurancePage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  const filtered = activeFilter === 'All'
    ? DEMO_INSURANCE
    : DEMO_INSURANCE.filter(i => i.status === activeFilter);

  const counts = {
    All: DEMO_INSURANCE.length,
    Expired: DEMO_INSURANCE.filter(i => i.status === 'Expired').length,
    'Due Soon': DEMO_INSURANCE.filter(i => i.status === 'Due Soon').length,
    Active: DEMO_INSURANCE.filter(i => i.status === 'Active').length,
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Policies', value: DEMO_INSURANCE.length, color: 'primary' },
          { label: 'Active', value: counts.Active, color: 'success' },
          { label: 'Due Soon', value: counts['Due Soon'], color: 'warning' },
          { label: 'Expired', value: counts.Expired, color: 'error' },
        ].map(card => (
          <div key={card.label} className="stat-card" onClick={() => setActiveFilter(card.label === 'Total Policies' ? 'All' : card.label as StatusFilter)}>
            <div className={`stat-card-icon bg-${card.color}/10 text-${card.color}`} style={{ fontSize: 22 }}>
              {card.color === 'primary' ? '🛡️' : card.color === 'success' ? '✓' : card.color === 'warning' ? '⏰' : '✗'}
            </div>
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm text-bodytext">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Insurance Register</h2>
          <button className="px-4 py-2 bg-primary text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity">
            + Add Policy
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="pill-tabs mb-5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`pill-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Bus</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Policy No</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Provider</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Type</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Start</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">End</th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Premium</th>
                <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Status</th>
                <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-bodytext font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ins => {
                const days = daysUntil(ins.endDate);
                const statusClass = ins.status === 'Expired' ? 'badge-error'
                  : ins.status === 'Due Soon' ? 'badge-warning'
                  : 'badge-success';
                const statusLabel = ins.status === 'Expired'
                  ? `Expired ${Math.abs(days)}d ago`
                  : ins.status === 'Due Soon'
                  ? `${days}d left`
                  : 'Active';

                return (
                  <tr key={ins.id} className="border-b border-border hover:bg-lightgray/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary cursor-pointer hover:underline">{ins.bus}</td>
                    <td className="py-3 px-3 text-dark">{ins.policyNo}</td>
                    <td className="py-3 px-3 text-bodytext">{ins.provider}</td>
                    <td className="py-3 px-3">
                      <span className={`badge ${ins.type === 'Comprehensive' ? 'badge-success' : 'badge-warning'}`}>
                        {ins.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-bodytext">{formatDate(ins.startDate)}</td>
                    <td className="py-3 px-3 text-bodytext">{formatDate(ins.endDate)}</td>
                    <td className="py-3 px-3 text-right font-semibold">{formatCurrency(ins.premium)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${statusClass}`}>{statusLabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button className="text-bodytext hover:text-primary transition-colors text-lg" title="Actions">⋮</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-bodytext">No insurance records found for this filter.</div>
        )}
      </div>
    </div>
  );
}
