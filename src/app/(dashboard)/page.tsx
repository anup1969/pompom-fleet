'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import AddBusModal from '@/components/modals/AddBusModal';
import AddStaffModal from '@/components/modals/AddStaffModal';
import AddExpenseModal from '@/components/modals/AddExpenseModal';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AlertItem {
  id: string;
  text: string;
  meta: string;
  dot: 'red' | 'amber' | 'blue';
}

function formatCurrency(n: number): string {
  if (n >= 100000) return `\u20B9${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `\u20B9${(n / 1000).toFixed(1)}K`;
  return `\u20B9${n.toLocaleString('en-IN')}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayDisplay(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { tenant, loading: sessionLoading } = useSession();

  // Data state
  const [busCount, setBusCount] = useState(0);
  const [staffPresent, setStaffPresent] = useState<string>('0');
  const [totalStaff, setTotalStaff] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(true);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [addBusOpen, setAddBusOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    const tid = tenant.id;
    const today = todayISO();
    const monthStart = today.slice(0, 8) + '01';

    try {
      const [busRes, staffRes, attRes, expRes, docRes, insRes] = await Promise.all([
        fetch(`/api/buses?tenant_id=${tid}`),
        fetch(`/api/staff?tenant_id=${tid}`),
        fetch(`/api/attendance?tenant_id=${tid}&date=${today}`),
        fetch(`/api/expenses?tenant_id=${tid}`),
        fetch(`/api/documents?tenant_id=${tid}`),
        fetch(`/api/insurance?tenant_id=${tid}`),
      ]);

      const buses: any[] = busRes.ok ? await busRes.json() : [];
      const staff: any[] = staffRes.ok ? await staffRes.json() : [];
      const attendance: any[] = attRes.ok ? await attRes.json() : [];
      const expenses: any[] = expRes.ok ? await expRes.json() : [];
      const documents: any[] = docRes.ok ? await docRes.json() : [];
      const insurance: any[] = insRes.ok ? await insRes.json() : [];

      // Stat cards
      setBusCount(buses.length);
      setTotalStaff(staff.length);

      // Attendance
      const presentCount = attendance.filter(
        (a: any) => a.status === 'P' || a.status === 'HD'
      ).length;
      setStaffPresent(attendance.length > 0 ? `${presentCount}/${staff.length}` : '0');
      setAttendanceMarked(attendance.length > 0);

      // Month expenses
      const thisMonthTotal = expenses
        .filter((e: any) => e.expense_date && e.expense_date >= monthStart)
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
      setMonthExpense(thisMonthTotal);

      // Recent 5 expenses
      setRecentExpenses(expenses.slice(0, 5));

      // Build alerts from documents + insurance expiry
      const alertList: AlertItem[] = [];
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 86400000);

      // Bus document alerts (passing_due, puc_due)
      for (const bus of buses) {
        if (bus.puc_due) {
          const d = new Date(bus.puc_due);
          if (d < now) {
            alertList.push({ id: `puc-${bus.id}`, text: `${bus.vehicle_no} \u2014 PUC expired`, meta: `Due: ${bus.puc_due}`, dot: 'red' });
          } else if (d < in30) {
            alertList.push({ id: `puc-${bus.id}`, text: `${bus.vehicle_no} \u2014 PUC due soon`, meta: `Due: ${bus.puc_due}`, dot: 'amber' });
          }
        }
        if (bus.passing_due) {
          const d = new Date(bus.passing_due);
          if (d < now) {
            alertList.push({ id: `pass-${bus.id}`, text: `${bus.vehicle_no} \u2014 Passing expired`, meta: `Due: ${bus.passing_due}`, dot: 'red' });
          } else if (d < in30) {
            alertList.push({ id: `pass-${bus.id}`, text: `${bus.vehicle_no} \u2014 Passing due soon`, meta: `Due: ${bus.passing_due}`, dot: 'amber' });
          }
        }
      }

      // Document expiry alerts
      for (const doc of documents) {
        if (doc.expiry_date) {
          const d = new Date(doc.expiry_date);
          if (d < now) {
            alertList.push({ id: `doc-${doc.id}`, text: `${doc.doc_type || 'Document'} expired`, meta: `Exp: ${doc.expiry_date}`, dot: 'red' });
          } else if (d < in30) {
            alertList.push({ id: `doc-${doc.id}`, text: `${doc.doc_type || 'Document'} expiring soon`, meta: `Exp: ${doc.expiry_date}`, dot: 'amber' });
          }
        }
      }

      // Insurance expiry alerts
      for (const ins of insurance) {
        if (ins.expiry_date) {
          const d = new Date(ins.expiry_date);
          if (d < now) {
            alertList.push({ id: `ins-${ins.id}`, text: `Insurance expired`, meta: `Exp: ${ins.expiry_date}`, dot: 'red' });
          } else if (d < in30) {
            alertList.push({ id: `ins-${ins.id}`, text: `Insurance renewal due`, meta: `Exp: ${ins.expiry_date}`, dot: 'amber' });
          }
        }
      }

      // Staff license expiry alerts
      for (const s of staff) {
        if (s.license_expiry) {
          const d = new Date(s.license_expiry);
          if (d < now) {
            alertList.push({ id: `lic-${s.id}`, text: `${s.name} \u2014 License expired`, meta: `Exp: ${s.license_expiry}`, dot: 'red' });
          } else if (d < in30) {
            alertList.push({ id: `lic-${s.id}`, text: `${s.name} \u2014 License expiring soon`, meta: `Exp: ${s.license_expiry}`, dot: 'amber' });
          }
        }
      }

      setAlerts(alertList);
    } catch {
      // Fail silently — show 0s
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (sessionLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--bodytext)' }}>
        Loading dashboard...
      </div>
    );
  }

  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });

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
          <div className="stat-value">{busCount}</div>
          <div className="stat-label">Total Buses</div>
        </div>
        <div
          className="stat-card bg-success"
          onClick={() => router.push('/attendance')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">&#128100;</div>
          <div className="stat-value">{staffPresent}</div>
          <div className="stat-label">Staff Present Today</div>
        </div>
        <div
          className="stat-card bg-accent"
          onClick={() => router.push('/expenses')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">&#8377;</div>
          <div className="stat-value">{formatCurrency(monthExpense)}</div>
          <div className="stat-label">Expenses ({currentMonth})</div>
        </div>
      </div>

      {/* Attendance Alert Banner */}
      {!attendanceMarked && totalStaff > 0 && (
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
                {todayDisplay()} &middot; {totalStaff} staff members pending
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
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => setAddBusOpen(true)}>
          &#128652; Add Bus
        </button>
        <button className="btn btn-primary" onClick={() => setAddStaffOpen(true)}>
          &#128100; Add Staff
        </button>
        <button className="btn btn-primary" onClick={() => setAddExpenseOpen(true)}>
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
            <span className="badge badge-error">{alerts.length}</span>
          </div>
          <div className="card-body">
            {alerts.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
                No active alerts. All clear!
              </div>
            ) : (
              alerts.map((alert) => (
                <div className="alert-item" key={alert.id}>
                  <div className={`alert-dot ${alert.dot}`}></div>
                  <div>
                    <div className="alert-text">{alert.text}</div>
                    <div className="alert-meta">{alert.meta}</div>
                  </div>
                </div>
              ))
            )}
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
            {recentExpenses.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--bodytext)' }}>
                No expenses recorded yet. Add your first expense.
              </div>
            ) : (
              recentExpenses.map((exp: any) => (
                <div className="exp-item" key={exp.id}>
                  <div>
                    <div className="exp-label">
                      {exp.head_name || 'Expense'} {exp.vehicle_no ? `\u2014 ${exp.vehicle_no}` : ''}
                    </div>
                    <div className="exp-sub">
                      {exp.expense_date || '\u2014'} {exp.vendor ? `\u00B7 ${exp.vendor}` : ''}
                    </div>
                  </div>
                  <div className="exp-amt" style={{ color: 'var(--error)' }}>
                    &#8377;{Number(exp.amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddBusModal
        isOpen={addBusOpen}
        onClose={() => setAddBusOpen(false)}
        onSaved={fetchData}
        tenantId={tenant?.id}
      />
      <AddStaffModal
        isOpen={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        onSaved={fetchData}
        tenantId={tenant?.id}
      />
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onSaved={fetchData}
      />
    </>
  );
}
