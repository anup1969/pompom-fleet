'use client'

import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AttendanceStatus = 'P' | 'HD' | 'L' | 'CL' | 'A' | 'WO'
type Role = 'Driver' | 'Assistant' | 'Lady Attendant'
type RoleFilter = 'All' | 'Drivers' | 'Assistants' | 'Lady Attendants'
type Tab = 'mark' | 'report'
type Period = 'This Month' | 'Last Month' | 'Custom'

interface StaffMember {
  id: string
  name: string
  role: Role
  avatar: string
}

interface ReportRow {
  name: string
  role: Role
  p: number
  hd: number
  l: number
  cl: number
  a: number
  wo: number
  workingDays: number
  pct: number
}

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const STAFF: StaffMember[] = [
  { id: '1', name: 'Rajesh Kumar', role: 'Driver', avatar: 'RK' },
  { id: '2', name: 'Sunil Patil', role: 'Driver', avatar: 'SP' },
  { id: '3', name: 'Manoj Sharma', role: 'Driver', avatar: 'MS' },
  { id: '4', name: 'Deepak Verma', role: 'Assistant', avatar: 'DV' },
  { id: '5', name: 'Amit Yadav', role: 'Assistant', avatar: 'AY' },
  { id: '6', name: 'Sunita Devi', role: 'Lady Attendant', avatar: 'SD' },
]

const REPORT_DATA: ReportRow[] = [
  { name: 'Rajesh Kumar', role: 'Driver', p: 22, hd: 1, l: 2, cl: 1, a: 0, wo: 4, workingDays: 26, pct: 96 },
  { name: 'Sunil Patil', role: 'Driver', p: 20, hd: 2, l: 1, cl: 1, a: 2, wo: 4, workingDays: 26, pct: 85 },
  { name: 'Manoj Sharma', role: 'Driver', p: 18, hd: 3, l: 2, cl: 1, a: 2, wo: 4, workingDays: 26, pct: 75 },
  { name: 'Deepak Verma', role: 'Assistant', p: 21, hd: 1, l: 2, cl: 0, a: 2, wo: 4, workingDays: 26, pct: 88 },
  { name: 'Amit Yadav', role: 'Assistant', p: 23, hd: 0, l: 1, cl: 1, a: 1, wo: 4, workingDays: 26, pct: 92 },
  { name: 'Sunita Devi', role: 'Lady Attendant', p: 24, hd: 1, l: 0, cl: 0, a: 1, wo: 4, workingDays: 26, pct: 96 },
]

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; activeBg: string; activeText: string }> = {
  P:  { label: 'Present',      color: '#2EA95C', bg: '#f0fdf4', activeBg: '#2EA95C', activeText: '#fff' },
  HD: { label: 'Half Day',     color: '#f8c20a', bg: '#fefce8', activeBg: '#f8c20a', activeText: '#1F2A3D' },
  L:  { label: 'Leave',        color: '#FF6692', bg: '#fff1f2', activeBg: '#FF6692', activeText: '#fff' },
  CL: { label: 'Casual Leave', color: '#8b5cf6', bg: '#f5f3ff', activeBg: '#8b5cf6', activeText: '#fff' },
  A:  { label: 'Absent',       color: '#ef4444', bg: '#fef2f2', activeBg: '#ef4444', activeText: '#fff' },
  WO: { label: 'Week Off',     color: '#6b7280', bg: '#f3f4f6', activeBg: '#6b7280', activeText: '#fff' },
}

const ROLE_COUNTS: Record<RoleFilter, number> = {
  All: 6,
  Drivers: 3,
  Assistants: 2,
  'Lady Attendants': 1,
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function pctBadge(pct: number) {
  if (pct >= 90) return { bg: '#dcfce7', text: '#166534' }
  if (pct >= 80) return { bg: '#fef9c3', text: '#854d0e' }
  return { bg: '#fee2e2', text: '#991b1b' }
}

function filterStaff(staff: StaffMember[], filter: RoleFilter): StaffMember[] {
  if (filter === 'All') return staff
  if (filter === 'Drivers') return staff.filter((s) => s.role === 'Driver')
  if (filter === 'Assistants') return staff.filter((s) => s.role === 'Assistant')
  return staff.filter((s) => s.role === 'Lady Attendant')
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AttendancePage() {
  const [tab, setTab] = useState<Tab>('mark')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All')
  const [date, setDate] = useState(todayISO())
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [period, setPeriod] = useState<Period>('This Month')

  function toggleStatus(staffId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [staffId]: status }))
  }

  const visible = filterStaff(STAFF, roleFilter)

  return (
    <div className="min-h-screen" style={{ background: '#F4F7FB' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Page title */}
        <h1 className="mb-6 text-2xl font-bold" style={{ color: '#1F2A3D' }}>
          Attendance
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg p-1" style={{ background: '#e5e5e5' }}>
          {(['mark', 'report'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#635BFF' : '#98A4AE',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              }}
            >
              {t === 'mark' ? 'Mark Attendance' : 'Attendance Report'}
            </button>
          ))}
        </div>

        {/* ===== MARK ATTENDANCE TAB ===== */}
        {tab === 'mark' && (
          <>
            {/* Header row: date + save */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium" style={{ color: '#1F2A3D' }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }}
                />
              </div>
              <button
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#635BFF' }}
              >
                Save Attendance
              </button>
            </div>

            {/* Role filter pills */}
            <div className="mb-4 flex flex-wrap gap-2">
              {(Object.keys(ROLE_COUNTS) as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
                  style={{
                    background: roleFilter === r ? '#635BFF' : '#fff',
                    color: roleFilter === r ? '#fff' : '#98A4AE',
                    border: roleFilter === r ? '1px solid #635BFF' : '1px solid #e5e5e5',
                  }}
                >
                  {r} ({ROLE_COUNTS[r]})
                </button>
              ))}
            </div>

            {/* Legend bar */}
            <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl bg-white px-4 py-3 shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
              {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG['P']][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className="inline-flex h-5 w-7 items-center justify-center rounded text-[10px] font-bold"
                    style={{ background: cfg.activeBg, color: cfg.activeText }}
                  >
                    {key}
                  </span>
                  <span style={{ color: '#98A4AE' }}>{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Attendance cards grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #e5e5e5' }}
                >
                  {/* Avatar + info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: '#635BFF' }}
                    >
                      {s.avatar}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="cursor-pointer truncate text-sm font-semibold hover:underline"
                        style={{ color: '#1F2A3D' }}
                      >
                        {s.name}
                      </p>
                      <p className="text-xs" style={{ color: '#98A4AE' }}>{s.role}</p>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="flex flex-shrink-0 gap-1">
                    {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((st) => {
                      const active = attendance[s.id] === st
                      const cfg = STATUS_CONFIG[st]
                      return (
                        <button
                          key={st}
                          onClick={() => toggleStatus(s.id, st)}
                          className="h-8 w-8 rounded-md text-[10px] font-bold transition-all"
                          style={{
                            background: active ? cfg.activeBg : cfg.bg,
                            color: active ? cfg.activeText : cfg.color,
                            border: active ? `2px solid ${cfg.color}` : '1px solid transparent',
                          }}
                        >
                          {st}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== ATTENDANCE REPORT TAB ===== */}
        {tab === 'report' && (
          <>
            {/* Filter panel */}
            <div className="mb-6 rounded-xl p-4 shadow-sm" style={{ background: '#fff', border: '1px solid #e5e5e5' }}>
              <div className="flex flex-wrap items-end gap-4">
                {/* Period toggle */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#98A4AE' }}>Period</label>
                  <div className="flex gap-1 rounded-lg p-0.5" style={{ background: '#F4F7FB' }}>
                    {(['This Month', 'Last Month', 'Custom'] as Period[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: period === p ? '#635BFF' : 'transparent',
                          color: period === p ? '#fff' : '#98A4AE',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date pickers (shown for Custom) */}
                {period === 'Custom' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium" style={{ color: '#98A4AE' }}>From</label>
                      <input type="date" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium" style={{ color: '#98A4AE' }}>To</label>
                      <input type="date" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }} />
                    </div>
                  </>
                )}

                {/* Staff Group */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#98A4AE' }}>Staff Group</label>
                  <select className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }}>
                    <option>All Staff</option>
                    <option>Drivers</option>
                    <option>Assistants</option>
                    <option>Lady Attendants</option>
                  </select>
                </div>

                {/* Individual */}
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#98A4AE' }}>Individual</label>
                  <select className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }}>
                    <option>All</option>
                    {STAFF.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Apply */}
                <button
                  className="rounded-lg px-5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#635BFF' }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {([
                { key: 'P', val: 312, color: '#2EA95C', bg: '#f0fdf4' },
                { key: 'HD', val: 18, color: '#f8c20a', bg: '#fefce8' },
                { key: 'L', val: 24, color: '#FF6692', bg: '#fff1f2' },
                { key: 'CL', val: 12, color: '#8b5cf6', bg: '#f5f3ff' },
                { key: 'A', val: 8, color: '#ef4444', bg: '#fef2f2' },
                { key: 'WO', val: 30, color: '#6b7280', bg: '#f3f4f6' },
              ] as const).map((c) => (
                <div
                  key={c.key}
                  className="flex flex-col items-center rounded-xl p-4 shadow-sm"
                  style={{ background: c.bg, border: '1px solid #e5e5e5' }}
                >
                  <span className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</span>
                  <span className="mt-1 text-xs font-medium" style={{ color: '#98A4AE' }}>
                    {STATUS_CONFIG[c.key].label}
                  </span>
                </div>
              ))}
            </div>

            {/* Report table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm" style={{ border: '1px solid #e5e5e5' }}>
              {/* Table header with export buttons */}
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#e5e5e5' }}>
                <h3 className="text-sm font-semibold" style={{ color: '#1F2A3D' }}>Staff Attendance Report</h3>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }}
                  >
                    Export PDF
                  </button>
                  <button
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#e5e5e5', color: '#1F2A3D' }}
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#F4F7FB' }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#98A4AE' }}>Staff Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#98A4AE' }}>Role</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#2EA95C' }}>P</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#f8c20a' }}>HD</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#FF6692' }}>L</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#8b5cf6' }}>CL</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#ef4444' }}>A</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6b7280' }}>WO</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#98A4AE' }}>Working Days</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#98A4AE' }}>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REPORT_DATA.map((r) => {
                      const badge = pctBadge(r.pct)
                      return (
                        <tr key={r.name} className="border-t transition-colors hover:bg-gray-50/60" style={{ borderColor: '#f0f0f0' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: '#1F2A3D' }}>{r.name}</td>
                          <td className="px-4 py-3" style={{ color: '#98A4AE' }}>{r.role}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#2EA95C' }}>{r.p}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#f8c20a' }}>{r.hd}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#FF6692' }}>{r.l}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#8b5cf6' }}>{r.cl}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#ef4444' }}>{r.a}</td>
                          <td className="px-4 py-3 text-center font-medium" style={{ color: '#6b7280' }}>{r.wo}</td>
                          <td className="px-4 py-3 text-center" style={{ color: '#1F2A3D' }}>{r.workingDays}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                              style={{ background: badge.bg, color: badge.text }}
                            >
                              {r.pct}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
