'use client';

import { useState } from 'react';

/* ──────────────── Demo Data ──────────────── */
interface StaffMember {
  name: string;
  initials: string;
  role: 'driver' | 'assistant' | 'lady-attendant';
  roleLabel: string;
  avatarBg: string;
  avatarColor: string;
  defaultStatus: string;
}

const STAFF: StaffMember[] = [
  { name: 'Ramesh Solanki', initials: 'RS', role: 'driver', roleLabel: 'Driver — Bus #1', avatarBg: 'var(--lightprimary)', avatarColor: 'var(--primary)', defaultStatus: 'P' },
  { name: 'Mukesh Khatri', initials: 'MK', role: 'driver', roleLabel: 'Driver — Bus #2', avatarBg: 'var(--lightsuccess)', avatarColor: 'var(--success)', defaultStatus: 'P' },
  { name: 'Jayesh Patel', initials: 'JP', role: 'driver', roleLabel: 'Driver — Bus #3', avatarBg: 'var(--lightwarning)', avatarColor: '#b45309', defaultStatus: 'P' },
  { name: 'Arjun Sharma', initials: 'AS', role: 'assistant', roleLabel: 'Assistant — Bus #1', avatarBg: 'var(--lightsecondary)', avatarColor: '#0e7490', defaultStatus: 'P' },
  { name: 'Vijay Desai', initials: 'VD', role: 'assistant', roleLabel: 'Assistant — Bus #3', avatarBg: 'var(--lighterror)', avatarColor: 'var(--error)', defaultStatus: 'L' },
  { name: 'Savita Mehta', initials: 'SM', role: 'lady-attendant', roleLabel: 'Lady Attendant — Bus #1', avatarBg: 'var(--lightaccent)', avatarColor: '#92400e', defaultStatus: 'P' },
  { name: 'Kavita Joshi', initials: 'KJ', role: 'lady-attendant', roleLabel: 'Lady Attendant — Bus #2', avatarBg: 'var(--lightprimary)', avatarColor: 'var(--primary)', defaultStatus: 'P' },
];

const ATT_BUTTONS = ['P', 'HD', 'L', 'CL', 'A', 'WO'];

interface ReportRow {
  name: string;
  role: string;
  p: number;
  hd: number;
  l: number;
  cl: number;
  a: number;
  wo: number;
  working: number;
  pct: number;
}

const REPORT_DATA: ReportRow[] = [
  { name: 'Ramesh Solanki', role: 'Driver', p: 14, hd: 1, l: 1, cl: 0, a: 0, wo: 2, working: 16, pct: 96 },
  { name: 'Mukesh Khatri', role: 'Driver', p: 13, hd: 0, l: 2, cl: 1, a: 0, wo: 2, working: 16, pct: 88 },
  { name: 'Jayesh Patel', role: 'Driver', p: 12, hd: 2, l: 1, cl: 1, a: 0, wo: 2, working: 16, pct: 81 },
  { name: 'Arjun Sharma', role: 'Assistant', p: 15, hd: 0, l: 0, cl: 1, a: 0, wo: 2, working: 16, pct: 97 },
  { name: 'Vijay Desai', role: 'Assistant', p: 10, hd: 1, l: 3, cl: 1, a: 1, wo: 2, working: 16, pct: 69 },
  { name: 'Savita Mehta', role: 'Lady Attendant', p: 14, hd: 1, l: 0, cl: 1, a: 0, wo: 2, working: 16, pct: 94 },
  { name: 'Kavita Joshi', role: 'Lady Attendant', p: 13, hd: 1, l: 1, cl: 0, a: 1, wo: 2, working: 16, pct: 84 },
];

function getPctColor(pct: number) {
  if (pct >= 90) return { bg: 'color-mix(in srgb, #2EA95C 12%, #fff)', color: '#2EA95C' };
  if (pct >= 75) return { bg: 'color-mix(in srgb, #f8c20a 12%, #fff)', color: '#b45309' };
  return { bg: 'color-mix(in srgb, #FF6692 12%, #fff)', color: '#FF6692' };
}

export default function AttendancePage() {
  const [activeView, setActiveView] = useState<'mark' | 'report'>('mark');
  const [roleFilter, setRoleFilter] = useState('all');
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    STAFF.forEach((s) => { init[s.name] = s.defaultStatus; });
    return init;
  });
  const [reportPeriod, setReportPeriod] = useState('current');

  const filteredStaff = STAFF.filter(
    (s) => roleFilter === 'all' || s.role === roleFilter
  );

  const handleAttSelect = (name: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [name]: status }));
  };

  const roleTabs = [
    { key: 'all', label: 'All (28)' },
    { key: 'driver', label: 'Drivers (12)' },
    { key: 'assistant', label: 'Assistants (10)' },
    { key: 'lady-attendant', label: 'Lady Attendants (6)' },
  ];

  return (
    <>
      {/* Attendance Page Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border)' }}>
        <button
          className={`att-page-tab${activeView === 'mark' ? ' active' : ''}`}
          onClick={() => setActiveView('mark')}
        >
          Mark Attendance
        </button>
        <button
          className={`att-page-tab${activeView === 'report' ? ' active' : ''}`}
          onClick={() => setActiveView('report')}
        >
          Attendance Report
        </button>
      </div>

      {/* TAB 1: Mark Attendance */}
      <div className={`att-view${activeView === 'mark' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Staff Attendance</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="date" className="form-input" defaultValue="2026-03-12" style={{ width: 170, height: 38 }} />
              <button className="btn btn-primary btn-sm">{'\u2713'} Save Attendance</button>
            </div>
          </div>
          <div className="card-body">
            {/* Role Tab Filters */}
            <div className="tab-pills">
              {roleTabs.map((t) => (
                <button
                  key={t.key}
                  className={`tab-pill${roleFilter === t.key ? ' active' : ''}`}
                  onClick={() => setRoleFilter(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lightsuccess)', border: '1px solid var(--success)' }} /> P = Present
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lightwarning)', border: '1px solid var(--warning)' }} /> HD = Half Day
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lighterror)', border: '1px solid var(--error)' }} /> L = Leave
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lightprimary)', border: '1px solid var(--primary)' }} /> CL = Casual Leave
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lighterror)', border: '1px solid var(--error)' }} /> A = Absent
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--lightgray)', border: '1px solid var(--bodytext)' }} /> WO = Week Off
              </div>
            </div>

            {/* Attendance Cards */}
            <div className="att-grid">
              {filteredStaff.map((s) => (
                <div key={s.name} className="att-card">
                  <div className="att-left">
                    <div className="avatar" style={{ background: s.avatarBg, color: s.avatarColor }}>
                      {s.initials}
                    </div>
                    <div>
                      <div className="att-name">
                        <a>{s.name}</a>
                      </div>
                      <div className="att-role">{s.roleLabel}</div>
                    </div>
                  </div>
                  <div className="att-buttons">
                    {ATT_BUTTONS.map((btn) => (
                      <button
                        key={btn}
                        className={`att-btn${attendance[s.name] === btn ? ` sel-${btn}` : ''}`}
                        onClick={() => handleAttSelect(s.name, btn)}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TAB 2: Attendance Report */}
      <div className={`att-view${activeView === 'report' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Attendance Report</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm">{'\uD83D\uDCC4'} Export PDF</button>
              <button className="btn btn-outline btn-sm">{'\uD83D\uDCCA'} Export Excel</button>
            </div>
          </div>
          <div className="card-body">
            {/* Filters Row */}
            <div style={{ background: 'var(--lightgray)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
                {/* Period */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>Period</label>
                  <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#fff', width: '100%' }}>
                    {(['This Month', 'Last Month', 'Custom'] as const).map((p, i) => {
                      const keys = ['current', 'last', 'custom'];
                      return (
                        <button
                          key={p}
                          className={`bus-exp-btn${reportPeriod === keys[i] ? ' active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setReportPeriod(keys[i])}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Date Range */}
                <div style={{ minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>From</label>
                  <input type="date" className="form-input" defaultValue="2026-03-01" style={{ height: 38, width: '100%' }} />
                </div>
                <div style={{ minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>To</label>
                  <input type="date" className="form-input" defaultValue="2026-03-18" style={{ height: 38, width: '100%' }} />
                </div>
                {/* Staff Group */}
                <div style={{ minWidth: 150 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>Staff Group</label>
                  <select className="form-select" style={{ height: 38, width: '100%' }}>
                    <option>All Staff</option>
                    <option>Drivers</option>
                    <option>Assistants</option>
                    <option>Lady Attendants</option>
                  </select>
                </div>
                {/* Individual */}
                <div style={{ minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>Individual</label>
                  <select className="form-select" style={{ height: 38, width: '100%' }}>
                    <option>All</option>
                    {STAFF.map((s) => (
                      <option key={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {/* Apply */}
                <div>
                  <button className="btn btn-primary btn-sm" style={{ height: 38, padding: '0 20px' }}>Apply</button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { value: 312, label: 'Present', bg: 'color-mix(in srgb, #2EA95C 8%, #fff)', color: '#2EA95C' },
                { value: 18, label: 'Half Day', bg: 'color-mix(in srgb, #f8c20a 8%, #fff)', color: '#b45309' },
                { value: 24, label: 'Leave', bg: 'color-mix(in srgb, #FF6692 8%, #fff)', color: '#FF6692' },
                { value: 12, label: 'CL', bg: 'color-mix(in srgb, #635BFF 8%, #fff)', color: '#635BFF' },
                { value: 8, label: 'Absent', bg: 'color-mix(in srgb, #FF6692 15%, #fff)', color: '#d32f2f' },
                { value: 30, label: 'Week Off', bg: 'var(--lightgray)', color: 'var(--bodytext)' },
              ].map((c) => (
                <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Report Table */}
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'center' }}>P</th>
                    <th style={{ textAlign: 'center' }}>HD</th>
                    <th style={{ textAlign: 'center' }}>L</th>
                    <th style={{ textAlign: 'center' }}>CL</th>
                    <th style={{ textAlign: 'center' }}>A</th>
                    <th style={{ textAlign: 'center' }}>WO</th>
                    <th style={{ textAlign: 'center' }}>Working Days</th>
                    <th style={{ textAlign: 'center' }}>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT_DATA.map((r) => {
                    const pctStyle = getPctColor(r.pct);
                    return (
                      <tr key={r.name}>
                        <td><a className="clickable-link">{r.name}</a></td>
                        <td>{r.role}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: 'color-mix(in srgb, #2EA95C 12%, #fff)', color: '#2EA95C', padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 13 }}>{r.p}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{r.hd}</td>
                        <td style={{ textAlign: 'center' }}>{r.l}</td>
                        <td style={{ textAlign: 'center' }}>{r.cl}</td>
                        <td style={{ textAlign: 'center' }}>{r.a}</td>
                        <td style={{ textAlign: 'center' }}>{r.wo}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.working}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: pctStyle.bg, color: pctStyle.color, padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: 13 }}>{r.pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
