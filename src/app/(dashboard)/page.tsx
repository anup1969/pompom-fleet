'use client';

import { useRouter } from 'next/navigation';

/* ─── Alert Data ─── */
const alerts = [
  { id: 1, text: 'GJ-01-TX-5502 — PUC expired 2 days ago', meta: 'Bus #3 · Due: 10 Mar 2026', dot: 'red' },
  { id: 2, text: 'Ramesh Solanki — License expires in 5 days', meta: 'Driver · Exp: 17 Mar 2026', dot: 'red' },
  { id: 3, text: 'GJ-01-TX-5507 — Service due in 800 km', meta: 'Bus #6 · Next service: 45,000 km', dot: 'amber' },
  { id: 4, text: 'GJ-01-TX-5504 — Insurance renewal in 15 days', meta: 'Bus #4 · Exp: 27 Mar 2026', dot: 'amber' },
  { id: 5, text: 'GJ-01-TX-5501 — Passing due in 30 days', meta: 'Bus #1 · Due: 11 Apr 2026', dot: 'blue' },
];

/* ─── Recent Expenses Data ─── */
const recentExpenses = [
  { id: 1, label: 'Diesel — GJ-01-TX-5501', sub: '12 Mar 2026 · HP Petrol Pump', amt: '\u20B94,200' },
  { id: 2, label: 'Tyre Replacement — GJ-01-TX-5503', sub: '10 Mar 2026 · Sharma Tyres', amt: '\u20B912,500' },
  { id: 3, label: 'Engine Oil — GJ-01-TX-5506', sub: '9 Mar 2026 · HP Petrol Pump', amt: '\u20B93,800' },
  { id: 4, label: 'Washing — GJ-01-TX-5502', sub: '8 Mar 2026 · In-house', amt: '\u20B9600' },
  { id: 5, label: 'Diesel — GJ-01-TX-5505', sub: '7 Mar 2026 · Indian Oil', amt: '\u20B93,950' },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <>
      {/* Stat Cards */}
      <div className="stat-grid">
        <div
          className="stat-card bg-primary"
          onClick={() => router.push('/buses')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">&#128652;</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Total Buses</div>
        </div>
        <div
          className="stat-card bg-success"
          onClick={() => router.push('/attendance')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">&#128100;</div>
          <div className="stat-value">25/28</div>
          <div className="stat-label">Staff Present Today</div>
        </div>
        <div
          className="stat-card bg-accent"
          onClick={() => router.push('/expenses')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">&#8377;</div>
          <div className="stat-value">&#8377;1.48L</div>
          <div className="stat-label">Expenses (Mar)</div>
        </div>
      </div>

      {/* Attendance Alert Banner */}
      <div
        style={{
          background: 'color-mix(in srgb, #FF6692 8%, #fff)',
          border: '1px solid color-mix(in srgb, #FF6692 20%, #fff)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'color-mix(in srgb, #FF6692 15%, #fff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            &#9888;
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
              Today&apos;s attendance is not marked yet
            </div>
            <div style={{ fontSize: '12px', color: 'var(--bodytext)', marginTop: '2px' }}>
              19 Mar 2026 &middot; 28 staff members pending
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => router.push('/attendance')}
          style={{ flexShrink: 0 }}
        >
          Mark Now
        </button>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => router.push('/buses')}>
          &#128652; Add Bus
        </button>
        <button className="btn btn-primary" onClick={() => router.push('/staff')}>
          &#128100; Add Staff
        </button>
        <button className="btn btn-primary" onClick={() => router.push('/expenses')}>
          &#8377; Add Expense
        </button>
        <button className="btn btn-primary" onClick={() => router.push('/attendance')}>
          &#9745; Mark Attendance
        </button>
      </div>

      {/* Two Column: Alerts + Expenses */}
      <div className="two-col">
        {/* Active Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>&#9888; Active Alerts</h3>
            <span className="badge badge-error">5</span>
          </div>
          <div className="card-body">
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <div className={`alert-dot ${alert.dot}`}></div>
                <div>
                  <div className="alert-text">{alert.text}</div>
                  <div className="alert-meta">{alert.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h3>&#8377; Recent Expenses</h3>
            <a onClick={() => router.push('/expenses')} style={{ fontSize: '13px', cursor: 'pointer' }}>
              View All &rarr;
            </a>
          </div>
          <div className="card-body">
            {recentExpenses.map((exp) => (
              <div className="exp-item" key={exp.id}>
                <div>
                  <div className="exp-label">{exp.label}</div>
                  <div className="exp-sub">{exp.sub}</div>
                </div>
                <div className="exp-amt" style={{ color: 'var(--error)' }}>
                  {exp.amt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
