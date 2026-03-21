'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/session-context';

/* ──────────────── Types ──────────────── */
interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
}

interface AttendanceRecord {
  id?: string;
  staff_id: string;
  date: string;
  status: string;
  remark?: string | null;
}

const ATT_BUTTONS = ['P', 'HD', 'L', 'CL', 'A', 'WO'];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  driver: { bg: 'var(--lightprimary)', color: 'var(--primary)' },
  assistant: { bg: 'var(--lightsecondary)', color: '#0e7490' },
  'lady-attendant': { bg: 'var(--lightaccent)', color: '#92400e' },
};

const AVATAR_PALETTE = [
  { bg: 'var(--lightprimary)', color: 'var(--primary)' },
  { bg: 'var(--lightsuccess)', color: 'var(--success)' },
  { bg: 'var(--lightwarning)', color: '#b45309' },
  { bg: 'var(--lightsecondary)', color: '#0e7490' },
  { bg: 'var(--lighterror)', color: 'var(--error)' },
  { bg: 'var(--lightaccent)', color: '#92400e' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(idx: number) {
  return AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
}

function getRoleLabel(staff: StaffMember, allStaff: StaffMember[]) {
  const roleMap: Record<string, string> = {
    driver: 'Driver',
    assistant: 'Assistant',
    'lady-attendant': 'Lady Attendant',
  };
  const roleLabel = roleMap[staff.role] ?? staff.role;
  const sameRole = allStaff.filter((s) => s.role === staff.role);
  const idx = sameRole.findIndex((s) => s.id === staff.id);
  return `${roleLabel} \u2014 Bus #${idx + 1}`;
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getMonthRange(offset: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = formatDate(d);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  // Don't go past today
  const to = offset === 0 ? formatDate(now) : formatDate(last);
  return { from, to };
}

function getPctColor(pct: number) {
  if (pct >= 90) return { bg: 'color-mix(in srgb, #2EA95C 12%, #fff)', color: '#2EA95C' };
  if (pct >= 75) return { bg: 'color-mix(in srgb, #f8c20a 12%, #fff)', color: '#b45309' };
  return { bg: 'color-mix(in srgb, #FF6692 12%, #fff)', color: '#FF6692' };
}

export default function AttendancePage() {
  const { tenant, user } = useSession();

  const [activeView, setActiveView] = useState<'mark' | 'report'>('mark');
  const [roleFilter, setRoleFilter] = useState('all');

  /* ── Staff list ── */
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Mark Attendance state ── */
  const [markDate, setMarkDate] = useState(formatDate(new Date()));
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /* ── Report state ── */
  const [reportPeriod, setReportPeriod] = useState('current');
  const [fromDate, setFromDate] = useState(getMonthRange(0).from);
  const [toDate, setToDate] = useState(getMonthRange(0).to);
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
  const [reportStaffFilter, setReportStaffFilter] = useState('all');
  const [reportIndividual, setReportIndividual] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  /* ── Fetch staff ── */
  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    fetch(`/api/staff?tenant_id=${tenant.id}`)
      .then((r) => r.json())
      .then((data) => setStaff(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  /* ── Fetch today's attendance for mark tab ── */
  const fetchTodayAttendance = useCallback(async () => {
    if (!tenant?.id || !markDate) return;
    try {
      const res = await fetch(`/api/attendance?tenant_id=${tenant.id}&date=${markDate}`);
      if (res.ok) {
        const records: AttendanceRecord[] = await res.json();
        const map: Record<string, string> = {};
        records.forEach((r) => {
          map[r.staff_id] = r.status;
        });
        setAttendance(map);
      }
    } catch {
      // silent
    }
  }, [tenant?.id, markDate]);

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  /* ── Fetch report data ── */
  const fetchReport = useCallback(async () => {
    if (!tenant?.id || !fromDate || !toDate) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/attendance?tenant_id=${tenant.id}&from=${fromDate}&to=${toDate}`);
      if (res.ok) {
        setReportData(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoadingReport(false);
    }
  }, [tenant?.id, fromDate, toDate]);

  useEffect(() => {
    if (activeView === 'report') fetchReport();
  }, [activeView, fetchReport]);

  /* ── Derived: role tabs with counts ── */
  const driverCount = staff.filter((s) => s.role === 'driver').length;
  const assistantCount = staff.filter((s) => s.role === 'assistant').length;
  const ladyAttendantCount = staff.filter((s) => s.role === 'lady-attendant').length;

  const roleTabs = [
    { key: 'all', label: `All (${staff.length})` },
    { key: 'driver', label: `Drivers (${driverCount})` },
    { key: 'assistant', label: `Assistants (${assistantCount})` },
    { key: 'lady-attendant', label: `Lady Attendants (${ladyAttendantCount})` },
  ];

  const filteredStaff = staff.filter(
    (s) => roleFilter === 'all' || s.role === roleFilter
  );

  /* ── Mark attendance handlers ── */
  function handleAttSelect(staffId: string, status: string) {
    setAttendance((prev) => ({ ...prev, [staffId]: status }));
  }

  async function handleSaveAttendance() {
    if (!tenant?.id) return;
    setSaving(true);
    const records = staff.map((s) => ({
      staff_id: s.id,
      status: attendance[s.id] ?? 'P',
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant.id,
          date: markDate,
          marked_by: user?.id ?? null,
          records,
        }),
      });
      if (res.ok) {
        alert('Attendance saved successfully!');
      } else {
        const err = await res.json();
        alert(err.error ?? 'Failed to save');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  }

  /* ── Report: period buttons ── */
  function handlePeriodChange(period: string) {
    setReportPeriod(period);
    if (period === 'current') {
      const r = getMonthRange(0);
      setFromDate(r.from);
      setToDate(r.to);
    } else if (period === 'last') {
      const r = getMonthRange(-1);
      setFromDate(r.from);
      setToDate(r.to);
    }
    // 'custom' leaves dates as-is for user to edit
  }

  /* ── Report: computed summary ── */
  const roleMap: Record<string, string> = {
    driver: 'Driver',
    assistant: 'Assistant',
    'lady-attendant': 'Lady Attendant',
  };

  // Filter staff for report
  const reportFilteredStaff = staff.filter((s) => {
    if (reportStaffFilter !== 'all') {
      const groupMap: Record<string, string> = {
        Drivers: 'driver',
        Assistants: 'assistant',
        'Lady Attendants': 'lady-attendant',
      };
      if (s.role !== groupMap[reportStaffFilter]) return false;
    }
    if (reportIndividual && s.id !== reportIndividual) return false;
    return true;
  });

  // Compute per-staff breakdown from reportData
  const staffBreakdown = reportFilteredStaff.map((s) => {
    const records = reportData.filter((r) => r.staff_id === s.id);
    const counts = { P: 0, HD: 0, L: 0, CL: 0, A: 0, WO: 0 };
    records.forEach((r) => {
      if (r.status in counts) counts[r.status as keyof typeof counts]++;
    });
    const workingDays = counts.P + counts.HD + counts.L + counts.CL + counts.A;
    const effectivePresent = counts.P + counts.HD * 0.5;
    const pct = workingDays > 0 ? Math.round((effectivePresent / workingDays) * 100) : 0;
    return {
      id: s.id,
      name: s.name,
      role: roleMap[s.role] ?? s.role,
      ...counts,
      working: workingDays,
      pct,
    };
  });

  // Summary totals
  const summaryTotals = staffBreakdown.reduce(
    (acc, row) => ({
      P: acc.P + row.P,
      HD: acc.HD + row.HD,
      L: acc.L + row.L,
      CL: acc.CL + row.CL,
      A: acc.A + row.A,
      WO: acc.WO + row.WO,
    }),
    { P: 0, HD: 0, L: 0, CL: 0, A: 0, WO: 0 }
  );

  if (loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--bodytext)' }}>
          Loading staff...
        </div>
      </div>
    );
  }

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
              <input
                type="date"
                className="form-input"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                style={{ width: 170, height: 38 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveAttendance}
                disabled={saving}
              >
                {saving ? 'Saving...' : '\u2713 Save Attendance'}
              </button>
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
            {filteredStaff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
                No staff members found. Add staff from the Staff page first.
              </div>
            ) : (
              <div className="att-grid">
                {filteredStaff.map((s, idx) => {
                  const avatarColors = ROLE_COLORS[s.role] ?? getAvatarColor(idx);
                  return (
                    <div key={s.id} className="att-card">
                      <div className="att-left">
                        <div className="avatar" style={{ background: avatarColors.bg, color: avatarColors.color }}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div className="att-name">
                            <a>{s.name}</a>
                          </div>
                          <div className="att-role">{getRoleLabel(s, staff)}</div>
                        </div>
                      </div>
                      <div className="att-buttons">
                        {ATT_BUTTONS.map((btn) => (
                          <button
                            key={btn}
                            className={`att-btn${attendance[s.id] === btn ? ` sel-${btn}` : ''}`}
                            onClick={() => handleAttSelect(s.id, btn)}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TAB 2: Attendance Report */}
      <div className={`att-view${activeView === 'report' ? ' active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>Attendance Report</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => alert('PDF export coming soon')}>
                {'\uD83D\uDCC4'} Export PDF
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => alert('Excel export coming soon')}>
                {'\uD83D\uDCCA'} Export Excel
              </button>
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
                          onClick={() => handlePeriodChange(keys[i])}
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
                  <input
                    type="date"
                    className="form-input"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setReportPeriod('custom'); }}
                    style={{ height: 38, width: '100%' }}
                  />
                </div>
                <div style={{ minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>To</label>
                  <input
                    type="date"
                    className="form-input"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setReportPeriod('custom'); }}
                    style={{ height: 38, width: '100%' }}
                  />
                </div>
                {/* Staff Group */}
                <div style={{ minWidth: 150 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>Staff Group</label>
                  <select
                    className="form-select"
                    style={{ height: 38, width: '100%' }}
                    value={reportStaffFilter}
                    onChange={(e) => setReportStaffFilter(e.target.value)}
                  >
                    <option value="all">All Staff</option>
                    <option>Drivers</option>
                    <option>Assistants</option>
                    <option>Lady Attendants</option>
                  </select>
                </div>
                {/* Individual */}
                <div style={{ minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--bodytext)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 6 }}>Individual</label>
                  <select
                    className="form-select"
                    style={{ height: 38, width: '100%' }}
                    value={reportIndividual}
                    onChange={(e) => setReportIndividual(e.target.value)}
                  >
                    <option value="">All</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {/* Apply */}
                <div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ height: 38, padding: '0 20px' }}
                    onClick={fetchReport}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { value: summaryTotals.P, label: 'Present', bg: 'color-mix(in srgb, #2EA95C 8%, #fff)', color: '#2EA95C' },
                { value: summaryTotals.HD, label: 'Half Day', bg: 'color-mix(in srgb, #f8c20a 8%, #fff)', color: '#b45309' },
                { value: summaryTotals.L, label: 'Leave', bg: 'color-mix(in srgb, #FF6692 8%, #fff)', color: '#FF6692' },
                { value: summaryTotals.CL, label: 'CL', bg: 'color-mix(in srgb, #635BFF 8%, #fff)', color: '#635BFF' },
                { value: summaryTotals.A, label: 'Absent', bg: 'color-mix(in srgb, #FF6692 15%, #fff)', color: '#d32f2f' },
                { value: summaryTotals.WO, label: 'Week Off', bg: 'var(--lightgray)', color: 'var(--bodytext)' },
              ].map((c) => (
                <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--bodytext)', marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Report Table */}
            {loadingReport ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
                Loading report...
              </div>
            ) : staffBreakdown.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--bodytext)' }}>
                No attendance data for the selected period.
              </div>
            ) : (
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
                    {staffBreakdown.map((r) => {
                      const pctStyle = getPctColor(r.pct);
                      return (
                        <tr key={r.id}>
                          <td><a className="clickable-link">{r.name}</a></td>
                          <td>{r.role}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ background: 'color-mix(in srgb, #2EA95C 12%, #fff)', color: '#2EA95C', padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 13 }}>{r.P}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{r.HD}</td>
                          <td style={{ textAlign: 'center' }}>{r.L}</td>
                          <td style={{ textAlign: 'center' }}>{r.CL}</td>
                          <td style={{ textAlign: 'center' }}>{r.A}</td>
                          <td style={{ textAlign: 'center' }}>{r.WO}</td>
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
