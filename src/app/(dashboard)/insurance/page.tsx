'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface InsuranceEntry {
  id: number;
  vehicle: string;
  vehicleSub: string;
  insurer: string;
  policyNo: string;
  type: string;
  idv: string;
  premium: string;
  start: string;
  expiry: string;
  expiryDanger: boolean;
  status: 'expired' | 'active';
  statusLabel: string;
  statusBadge: string;
  agent: string;
  agentPhone: string;
  rowBg: string;
}

const DEMO_INSURANCE: InsuranceEntry[] = [
  {
    id: 1,
    vehicle: 'GJ-01-TX-5504',
    vehicleSub: 'Force Traveller',
    insurer: 'New India Assurance',
    policyNo: 'NIA-2025-404',
    type: 'Comprehensive',
    idv: '\u20B98,50,000',
    premium: '\u20B918,200',
    start: '27 Mar 2025',
    expiry: '27 Mar 2026',
    expiryDanger: true,
    status: 'expired',
    statusLabel: 'Expired',
    statusBadge: 'badge-error',
    agent: 'Hemant Joshi',
    agentPhone: '98250 34504',
    rowBg: 'rgba(255,102,146,.06)',
  },
  {
    id: 2,
    vehicle: 'GJ-01-TX-5501',
    vehicleSub: 'Tata Starbus',
    insurer: 'ICICI Lombard',
    policyNo: 'IL-2026-5501',
    type: 'Comprehensive',
    idv: '\u20B912,00,000',
    premium: '\u20B924,500',
    start: '20 Sep 2025',
    expiry: '20 Sep 2026',
    expiryDanger: false,
    status: 'active',
    statusLabel: 'Active',
    statusBadge: 'badge-success',
    agent: 'Hemant Joshi',
    agentPhone: '98250 34504',
    rowBg: '',
  },
  {
    id: 3,
    vehicle: 'GJ-01-TX-5503',
    vehicleSub: 'Eicher Skyline',
    insurer: 'Bajaj Allianz',
    policyNo: 'BA-2026-5503',
    type: 'Third Party',
    idv: '\u20B910,50,000',
    premium: '\u20B915,800',
    start: '1 Jan 2026',
    expiry: '1 Jan 2027',
    expiryDanger: false,
    status: 'active',
    statusLabel: 'Active',
    statusBadge: 'badge-success',
    agent: 'Hemant Joshi',
    agentPhone: '98250 34504',
    rowBg: '',
  },
];

const STATUS_TABS = [
  { key: 'all', label: 'All (3)', style: {} },
  { key: 'expired', label: 'Expired (1)', style: { borderColor: 'var(--error)', color: 'var(--error)' } },
  { key: 'active', label: 'Active (2)', style: { borderColor: 'var(--success)', color: 'var(--success)' } },
];

export default function InsurancePage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = DEMO_INSURANCE.filter(
    (ins) => statusFilter === 'all' || ins.status === statusFilter
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>Insurance Register</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'} Export</button>
          <button className="btn btn-primary btn-sm">+ Add Insurance</button>
        </div>
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
                <th>Vehicle</th>
                <th>Insurer</th>
                <th>Policy No</th>
                <th>Type</th>
                <th>IDV ({'\u20B9'})</th>
                <th>Premium ({'\u20B9'})</th>
                <th>Start</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ins) => (
                <tr key={ins.id} style={ins.rowBg ? { background: ins.rowBg } : undefined}>
                  <td>
                    <a className="clickable-link">{ins.vehicle}</a>
                    <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>{ins.vehicleSub}</div>
                  </td>
                  <td>{ins.insurer}</td>
                  <td>{ins.policyNo}</td>
                  <td>{ins.type}</td>
                  <td>{ins.idv}</td>
                  <td>{ins.premium}</td>
                  <td>{ins.start}</td>
                  <td style={ins.expiryDanger ? { color: 'var(--error)', fontWeight: 600 } : undefined}>
                    {ins.expiry}
                  </td>
                  <td>
                    <span className={`badge ${ins.statusBadge}`}>{ins.statusLabel}</span>
                  </td>
                  <td>
                    {ins.agent}
                    <div style={{ fontSize: 11, color: 'var(--bodytext)' }}>{ins.agentPhone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ins.status === 'expired' && (
                        <button className="btn btn-error btn-sm">{'\uD83D\uDD00'} Renew</button>
                      )}
                      <button className="btn btn-outline btn-sm">{'\uD83D\uDC41'} View</button>
                      <button className="btn btn-outline btn-sm">{'\uD83D\uDCE5'}</button>
                    </div>
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
